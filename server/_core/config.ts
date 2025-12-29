import dotenv from "dotenv";
// Don't override existing env vars (allows Vercel env vars to take precedence)
dotenv.config();

// Disable pino-pretty transport to prevent bundling issues in production/serverless
// This must be set BEFORE any Stagehand imports happen
process.env.PINO_DISABLE_PRETTY = 'true';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';

// Additional pino configuration for serverless environments
// Force pino to use stdout stream instead of worker thread transports
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // In serverless, prevent pino from using worker threads
  process.env.PINO_WORKER = 'false';
}

console.log("[Config] Environment variables loaded");

// ========================================
// STARTUP VALIDATION
// ========================================

interface EnvValidation {
  name: string;
  required: boolean;
  category: 'auth' | 'database' | 'browser' | 'ai' | 'payment' | 'other';
  description: string;
}

const ENV_VALIDATIONS: EnvValidation[] = [
  // Critical - Application won't function without these
  { name: 'DATABASE_URL', required: true, category: 'database', description: 'PostgreSQL database connection string' },
  { name: 'JWT_SECRET', required: true, category: 'auth', description: 'Secret key for JWT token signing' },
  
  // Authentication - At least one OAuth method should be configured
  { name: 'GOOGLE_CLIENT_ID', required: false, category: 'auth', description: 'Google OAuth client ID for sign-in' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, category: 'auth', description: 'Google OAuth client secret' },
  { name: 'GOOGLE_REDIRECT_URI', required: false, category: 'auth', description: 'Google OAuth callback URL' },
  
  // Browser Automation
  { name: 'BROWSERBASE_API_KEY', required: false, category: 'browser', description: 'Browserbase API key for browser automation' },
  { name: 'BROWSERBASE_PROJECT_ID', required: false, category: 'browser', description: 'Browserbase project ID' },
  
  // AI Models
  { name: 'GEMINI_API_KEY', required: false, category: 'ai', description: 'Google Gemini API key' },
  { name: 'OPENAI_API_KEY', required: false, category: 'ai', description: 'OpenAI API key' },
  { name: 'ANTHROPIC_API_KEY', required: false, category: 'ai', description: 'Anthropic Claude API key' },
  
  // Payment
  { name: 'STRIPE_SECRET_KEY', required: false, category: 'payment', description: 'Stripe secret key for payments' },
  
  // Token Encryption
  { name: 'ENCRYPTION_KEY', required: false, category: 'auth', description: 'AES-256 key for encrypting OAuth tokens' },
];

/**
 * Validate environment variables on startup
 * Logs warnings for missing optional variables
 * Throws error for missing required variables (only in production)
 */
function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];
  const configured: string[] = [];
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  for (const validation of ENV_VALIDATIONS) {
    const value = process.env[validation.name];
    
    if (!value || value.trim() === '') {
      if (validation.required) {
        errors.push(`❌ ${validation.name} - ${validation.description} (REQUIRED)`);
      } else {
        warnings.push(`⚠️  ${validation.name} - ${validation.description}`);
      }
    } else {
      configured.push(`✓  ${validation.name}`);
    }
  }
  
  // Check for OAuth configuration
  const hasGoogleOAuth = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const hasManusOAuth = !!process.env.OAUTH_SERVER_URL;
  const hasEmailAuth = true; // Email/password auth is always available
  
  if (!hasGoogleOAuth && !hasManusOAuth) {
    warnings.push('⚠️  No OAuth provider configured (GOOGLE_CLIENT_ID or OAUTH_SERVER_URL). Only email/password login will be available.');
  }
  
  // Check for AI provider
  const hasAiProvider = !!process.env.GEMINI_API_KEY || !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY;
  if (!hasAiProvider) {
    warnings.push('⚠️  No AI provider API key configured (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY). AI features will not work.');
  }
  
  // Check for browser automation
  const hasBrowserbase = !!process.env.BROWSERBASE_API_KEY && !!process.env.BROWSERBASE_PROJECT_ID;
  if (!hasBrowserbase) {
    warnings.push('⚠️  Browserbase not configured (BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID). Browser automation will not work.');
  }
  
  // Log summary
  console.log('\n========================================');
  console.log('[Config] Environment Validation');
  console.log('========================================');
  
  if (configured.length > 0) {
    console.log('\n✅ Configured:');
    configured.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings (optional features):');
    warnings.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors (required):');
    errors.forEach(msg => console.log(`   ${msg}`));
    
    if (isProduction) {
      console.log('\n🛑 CRITICAL: Required environment variables missing in production!');
      console.log('   Please configure these variables before deploying.\n');
      // In production, throw an error to prevent startup with missing required vars
      throw new Error(`Missing required environment variables: ${errors.map(e => e.split(' - ')[0].replace('❌ ', '')).join(', ')}`);
    } else {
      console.log('\n⚠️  Development mode: Continuing with missing required variables.');
      console.log('   Some features may not work correctly.\n');
    }
  }
  
  console.log('========================================\n');
}

// Run validation on startup
validateEnvironment();

// Export validation function for testing
export { validateEnvironment, ENV_VALIDATIONS };
