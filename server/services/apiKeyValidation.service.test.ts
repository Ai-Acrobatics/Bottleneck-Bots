/**
 * API Key Validation Service Tests
 * Example test file showing how to use the validation service
 *
 * To run these tests, use a testing framework like Jest or Vitest
 */

import { apiKeyValidationService } from "./apiKeyValidation.service";

/**
 * Example: Test OpenAI API key validation
 */
async function testOpenAIValidation() {
  console.log("Testing OpenAI API key validation...");

  // Test with a valid key (replace with your actual key for testing)
  const result = await apiKeyValidationService.validateOpenAI("sk-test-your-key-here");

  console.log("OpenAI Validation Result:", result);
  console.log("Valid:", result.valid);
  console.log("Message:", result.message);
  if (result.details) {
    console.log("Details:", result.details);
  }
}

/**
 * Example: Test Anthropic API key validation
 */
async function testAnthropicValidation() {
  console.log("\nTesting Anthropic API key validation...");

  const result = await apiKeyValidationService.validateAnthropic("sk-ant-test-your-key-here");

  console.log("Anthropic Validation Result:", result);
  console.log("Valid:", result.valid);
  console.log("Message:", result.message);
}

/**
 * Example: Test Stripe API key validation
 */
async function testStripeValidation() {
  console.log("\nTesting Stripe API key validation...");

  const result = await apiKeyValidationService.validateStripe("sk_test_your-key-here");

  console.log("Stripe Validation Result:", result);
  console.log("Valid:", result.valid);
  console.log("Message:", result.message);
  if (result.details) {
    console.log("Plan:", result.details.plan);
    console.log("Credits:", result.details.credits);
  }
}

/**
 * Example: Test Twilio credentials validation
 */
async function testTwilioValidation() {
  console.log("\nTesting Twilio credentials validation...");

  const result = await apiKeyValidationService.validateTwilio(
    "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Account SID
    "your-auth-token-here" // Auth Token
  );

  console.log("Twilio Validation Result:", result);
  console.log("Valid:", result.valid);
  console.log("Message:", result.message);
  if (result.details) {
    console.log("Account Name:", result.details.accountName);
  }
}

/**
 * Example: Test validation using the main validate method
 */
async function testMainValidateMethod() {
  console.log("\nTesting main validate method...");

  // Test OpenAI
  const openaiResult = await apiKeyValidationService.validate("openai", {
    apiKey: "sk-test-your-key-here",
  });
  console.log("OpenAI:", openaiResult.message);

  // Test Twilio (requires multiple credentials)
  const twilioResult = await apiKeyValidationService.validate("twilio", {
    accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authToken: "your-auth-token-here",
  });
  console.log("Twilio:", twilioResult.message);
}

/**
 * Example: Test invalid API key
 */
async function testInvalidKey() {
  console.log("\nTesting invalid API key...");

  const result = await apiKeyValidationService.validateOpenAI("invalid-key");

  console.log("Invalid Key Result:", result);
  console.log("Valid:", result.valid); // Should be false
  console.log("Message:", result.message); // Should explain the error
}

/**
 * Example: Test all validators
 */
async function testAllValidators() {
  console.log("\n=== Testing All API Key Validators ===\n");

  const providers = [
    { name: "OpenAI", validator: () => apiKeyValidationService.validateOpenAI("sk-test-key") },
    { name: "Anthropic", validator: () => apiKeyValidationService.validateAnthropic("sk-ant-test-key") },
    { name: "Stripe", validator: () => apiKeyValidationService.validateStripe("sk_test_key") },
    { name: "Vapi", validator: () => apiKeyValidationService.validateVapi("test-key") },
    { name: "Apify", validator: () => apiKeyValidationService.validateApify("test-key") },
    { name: "Browserbase", validator: () => apiKeyValidationService.validateBrowserbase("test-key") },
    { name: "SendGrid", validator: () => apiKeyValidationService.validateSendgrid("test-key") },
    { name: "Google", validator: () => apiKeyValidationService.validateGoogle("test-key") },
    { name: "GoHighLevel", validator: () => apiKeyValidationService.validateGohighlevel("test-key") },
    { name: "Twilio", validator: () => apiKeyValidationService.validateTwilio("AC123", "token123") },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.validator();
      console.log(`${provider.name}:`);
      console.log(`  Valid: ${result.valid}`);
      console.log(`  Message: ${result.message}`);
      if (result.details) {
        console.log(`  Details:`, result.details);
      }
      console.log();
    } catch (error) {
      console.error(`${provider.name}: ERROR -`, error);
      console.log();
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    // Uncomment the tests you want to run
    // await testOpenAIValidation();
    // await testAnthropicValidation();
    // await testStripeValidation();
    // await testTwilioValidation();
    // await testMainValidateMethod();
    // await testInvalidKey();

    // Run all validators with invalid keys to see error messages
    await testAllValidators();
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Uncomment to run tests
// runAllTests();

export {
  testOpenAIValidation,
  testAnthropicValidation,
  testStripeValidation,
  testTwilioValidation,
  testMainValidateMethod,
  testInvalidKey,
  testAllValidators,
  runAllTests,
};
