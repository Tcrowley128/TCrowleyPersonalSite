import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

// Admin client with service role - bypasses RLS for server-side operations
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    url: supabaseUrl?.substring(0, 20) + '...',
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseServiceKey}`);
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Check if a user has admin privileges
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.app_metadata?.is_admin === true;
}
