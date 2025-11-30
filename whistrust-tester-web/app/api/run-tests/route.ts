import { NextRequest, NextResponse } from 'next/server';
import { runTests } from '@/lib/test-runner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, testType, environment, selectedTests, baseUrl } = body;
    
    if (!projectId || !testType || !environment || !baseUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const result = await runTests({
      projectId,
      testType,
      environment,
      selectedTests: selectedTests || [],
      baseUrl,
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to run tests' },
      { status: 500 }
    );
  }
}

