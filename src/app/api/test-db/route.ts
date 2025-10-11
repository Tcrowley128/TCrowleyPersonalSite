import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Log the DATABASE_URL (hiding password)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');

    return NextResponse.json({
      success: true,
      databaseUrl: maskedUrl,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
