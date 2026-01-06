/**
 * Supabase Client Service
 *
 * Provides centralized Supabase client for:
 * - Database access (PostgreSQL)
 * - Authentication
 * - Storage
 * - Realtime subscriptions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseClient: SupabaseClient | null = null;
let _supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get Supabase client configuration from environment
 */
function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
  };
}

/**
 * Get the Supabase client (uses anon key - respects RLS)
 * Use this for client-side operations that should respect Row Level Security
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const config = getSupabaseConfig();

  if (!config.url || !config.anonKey) {
    console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return null;
  }

  try {
    _supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    console.log('[Supabase] Client initialized successfully');
    return _supabaseClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

/**
 * Get the Supabase admin client (uses service role key - bypasses RLS)
 * Use this for server-side operations that need full database access
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdminClient) {
    return _supabaseAdminClient;
  }

  const config = getSupabaseConfig();

  if (!config.url || !config.serviceKey) {
    console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  try {
    _supabaseAdminClient = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Supabase] Admin client initialized successfully');
    return _supabaseAdminClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize admin client:', error);
    return null;
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseAdmin() || getSupabaseClient();
    if (!client) {
      console.error('[Supabase] No client available for connection test');
      return false;
    }

    // Test connection by querying the health endpoint
    const { data, error } = await client.from('users').select('count').limit(1);

    if (error) {
      // Table might not exist yet, but connection works if we get a specific error
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.log('[Supabase] Connection successful (table not found, but connected)');
        return true;
      }
      console.error('[Supabase] Connection test failed:', error.message);
      return false;
    }

    console.log('[Supabase] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Connection test error:', error);
    return false;
  }
}

/**
 * Get the database URL for Drizzle ORM
 * Supabase provides a direct PostgreSQL connection string
 */
export function getSupabaseDatabaseUrl(): string | null {
  // Supabase direct connection (for Drizzle ORM)
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('[Supabase] DATABASE_URL not set');
    return null;
  }

  return databaseUrl;
}

/**
 * Supabase Storage helpers
 */
export const SupabaseStorage = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob | Buffer,
    options?: { contentType?: string; upsert?: boolean }
  ) {
    const client = getSupabaseAdmin() || getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, paths: string[]) {
    const client = getSupabaseAdmin() || getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await client.storage.from(bucket).remove(paths);
    if (error) throw error;
    return data;
  },

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, path?: string, options?: { limit?: number; offset?: number }) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await client.storage.from(bucket).list(path, options);
    if (error) throw error;
    return data;
  },
};

/**
 * Supabase Realtime helpers
 */
export const SupabaseRealtime = {
  /**
   * Subscribe to database changes
   */
  subscribeToTable(
    table: string,
    callback: (payload: { eventType: string; new: unknown; old: unknown }) => void,
    options?: { event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; filter?: string }
  ) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const channel = client
      .channel(`public:${table}`)
      .on(
        'postgres_changes' as any,
        {
          event: options?.event || '*',
          schema: 'public',
          table: table,
          filter: options?.filter,
        } as any,
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: any) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    await client.removeChannel(channel);
  },
};

export default {
  getClient: getSupabaseClient,
  getAdmin: getSupabaseAdmin,
  testConnection: testSupabaseConnection,
  getDatabaseUrl: getSupabaseDatabaseUrl,
  storage: SupabaseStorage,
  realtime: SupabaseRealtime,
};
