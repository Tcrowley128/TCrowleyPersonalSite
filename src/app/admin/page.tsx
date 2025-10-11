import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminPageClient from './AdminPageClient';

export default async function AdminPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AdminPageClient />;
}
