/**
 * Supabase Client Configuration
 *
 * This module provides Supabase client instances for backend operations.
 * It works alongside the existing Drizzle ORM setup - Drizzle continues
 * to handle PostgreSQL queries while Supabase client provides access to
 * additional Supabase features (auth, storage, realtime, edge functions).
 *
 * Usage:
 *   import { supabaseAdmin, supabase, getSupabaseClient } from './supabase';
 *
 *   // For server-side operations with full access (service role)
 *   const { data, error } = await supabaseAdmin.storage.from('bucket').upload(...);
 *
 *   // For operations respecting RLS policies (anon key)
 *   const { data, error } = await supabase.from('table').select();
 *
 *   // For lazy initialization (safer for environments without env vars)
 *   const client = getSupabaseClient('admin');
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables with validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cached client instances
let _supabaseAdmin: SupabaseClient | null = null;
let _supabase: SupabaseClient | null = null;

/**
 * Validates that required Supabase environment variables are present
 */
function validateSupabaseConfig(): { url: string; anonKey: string; serviceKey: string } {
  if (!supabaseUrl) {
    throw new Error('[Supabase] SUPABASE_URL environment variable is not set');
  }
  if (!supabaseAnonKey) {
    throw new Error('[Supabase] SUPABASE_ANON_KEY environment variable is not set');
  }
  if (!supabaseServiceKey) {
    throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
  };
}

/**
 * Server-side Supabase client with service role key (full access)
 *
 * Use this for:
 * - Backend operations that bypass RLS
 * - Storage operations
 * - Admin functions
 * - Scheduled tasks and workers
 *
 * WARNING: This client has full database access. Never expose to client-side.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const config = validateSupabaseConfig();

    _supabaseAdmin = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Supabase] Admin client initialized');
  }

  return _supabaseAdmin;
}

/**
 * Supabase client with anon key (respects RLS policies)
 *
 * Use this for:
 * - Operations that should respect Row Level Security
 * - Public/anonymous operations
 * - Testing RLS policies
 */
export function getSupabaseAnon(): SupabaseClient {
  if (!_supabase) {
    const config = validateSupabaseConfig();

    _supabase = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Supabase] Anon client initialized');
  }

  return _supabase;
}

/**
 * Get Supabase client by type
 *
 * @param type - 'admin' for service role, 'anon' for public client
 */
export function getSupabaseClient(type: 'admin' | 'anon' = 'admin'): SupabaseClient {
  return type === 'admin' ? getSupabaseAdmin() : getSupabaseAnon();
}

/**
 * Check if Supabase is configured (environment variables are present)
 * Useful for conditional feature enabling
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
}

/**
 * Eager-initialized admin client (throws if env vars missing)
 * Only use in modules that definitely require Supabase
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

/**
 * Eager-initialized anon client (throws if env vars missing)
 * Only use in modules that definitely require Supabase
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAnon()[prop as keyof SupabaseClient];
  },
});

// Re-export types for convenience
export type { SupabaseClient } from '@supabase/supabase-js';
