import { NextResponse } from 'next/server';
import { getTestFiles } from '@/lib/test-runner';

export async function GET() {
  try {
    const testFiles = getTestFiles();
    return NextResponse.json({ testFiles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get test files' },
      { status: 500 }
    );
  }
}

