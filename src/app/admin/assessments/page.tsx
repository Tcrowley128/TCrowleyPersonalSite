import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminAssessmentsClient from './AdminAssessmentsClient';

export default async function AdminAssessmentsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AdminAssessmentsClient />;
}
