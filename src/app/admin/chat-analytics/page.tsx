import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatAnalyticsClient from './ChatAnalyticsClient';

export default async function ChatAnalyticsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ChatAnalyticsClient />;
}
