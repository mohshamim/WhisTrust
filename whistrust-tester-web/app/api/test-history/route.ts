import { NextRequest, NextResponse } from 'next/server';
import { getAllTestRuns, getTestHistoryStats, filterTestRuns } from '@/lib/test-history';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const testType = searchParams.get('testType');
    const environment = searchParams.get('environment');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const success = searchParams.get('success');
    const statsOnly = searchParams.get('statsOnly') === 'true';
    
    let runs = getAllTestRuns();
    
    // Apply filters
    if (projectId || testType || environment || startDate || endDate || success !== null) {
      runs = filterTestRuns(runs, {
        projectId: projectId || undefined,
        testType: testType || undefined,
        environment: environment || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        success: success !== null ? success === 'true' : undefined,
      });
    }
    
    if (statsOnly) {
      const stats = getTestHistoryStats(runs);
      return NextResponse.json({ stats });
    }
    
    const stats = getTestHistoryStats(runs);
    
    return NextResponse.json({
      runs,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get test history' },
      { status: 500 }
    );
  }
}

