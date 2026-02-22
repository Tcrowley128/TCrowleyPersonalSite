import { NextRequest, NextResponse } from 'next/server';
import { runBankingMonitor } from '@/lib/banking-monitor';

// POST /api/banking-monitor — trigger a monitor run
// Protected by BANKING_MONITOR_API_KEY if set in environment
export async function POST(request: NextRequest) {
  const expectedKey = process.env.BANKING_MONITOR_API_KEY;
  if (expectedKey) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[BankingMonitor] API trigger received');
    const result = await runBankingMonitor();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BankingMonitor] Run failed:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// GET /api/banking-monitor — health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Banking Monitor — POST to trigger a run',
    sources: [
      'U.S. Treasury',
      'OCC',
      'FDIC',
      'Federal Reserve',
      'CFPB',
      'Indiana DFI',
    ],
  });
}
