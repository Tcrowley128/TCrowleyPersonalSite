import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = await createClient();

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Manually delete all Supabase cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Delete all cookies that start with 'sb-'
  allCookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  });

  return NextResponse.json({ success: true });
}
