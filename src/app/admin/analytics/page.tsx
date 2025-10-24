import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AIAnalyticsClient from './AIAnalyticsClient';

export default async function AIAnalyticsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AIAnalyticsClient />;
}
