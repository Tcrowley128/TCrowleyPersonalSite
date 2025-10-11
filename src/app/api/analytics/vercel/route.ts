import { NextRequest, NextResponse } from 'next/server';

// Get Vercel Analytics data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    // Vercel Analytics API requires a team/project token
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken || !vercelProjectId) {
      return NextResponse.json(
        { error: 'Vercel Analytics not configured. Add VERCEL_TOKEN and VERCEL_PROJECT_ID to environment variables.' },
        { status: 500 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch analytics from Vercel API
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/views?projectId=${vercelProjectId}&from=${startDate.getTime()}&to=${endDate.getTime()}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Vercel data to match your dashboard format
    const viewsByPage = data.pageviews?.reduce((acc: any[], view: any) => {
      const existing = acc.find(item => item.path === view.path);
      if (existing) {
        existing.views += view.count;
      } else {
        acc.push({ path: view.path, views: view.count });
      }
      return acc;
    }, []) || [];

    // Sort by views and get top 10
    const topPages = viewsByPage
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10);

    return NextResponse.json({
      totalViews: data.total || 0,
      viewsByPage: topPages,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      source: 'vercel',
    });
  } catch (error) {
    console.error('Error fetching Vercel analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
