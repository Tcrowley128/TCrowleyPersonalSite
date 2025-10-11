import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title, referrer } = body;

    // Get client info
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] :
                     request.headers.get('x-real-ip') || undefined;

    const supabase = createAdminClient();

    const { data: pageView, error } = await supabase
      .from('page_views')
      .insert({
        path,
        title,
        referrer,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: pageView.id });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

// Get page view statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const supabase = createAdminClient();

    // Total views
    const { count: totalViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .match(path ? { path } : {});

    // Recent views (last X days)
    const { count: recentViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .match(path ? { path } : {});

    // Views by page - Supabase doesn't have direct groupBy, so we'll use RPC or manual grouping
    const { data: allViews } = await supabase
      .from('page_views')
      .select('path');

    // Manual grouping
    const pathCounts: Record<string, number> = {};
    allViews?.forEach(view => {
      pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
    });

    const viewsByPage = Object.entries(pathCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Views over time (daily) - simplified for now
    const viewsOverTime: { date: string; views: number }[] = [];

    return NextResponse.json({
      totalViews: totalViews || 0,
      recentViews: recentViews || 0,
      viewsByPage,
      viewsOverTime,
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page views' },
      { status: 500 }
    );
  }
}
