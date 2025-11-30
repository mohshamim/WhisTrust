import { NextRequest, NextResponse } from 'next/server';
import { getAllTestRuns } from '@/lib/test-history';
import { generateHTMLReport, saveHTMLReport, generateJSONReport } from '@/lib/report-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, format, options } = body;
    
    if (!runId) {
      return NextResponse.json({ error: 'Run ID required' }, { status: 400 });
    }
    
    const runs = getAllTestRuns();
    const run = runs.find(r => r.id === runId);
    
    if (!run) {
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }
    
    const reportOptions = {
      includeScreenshots: options?.includeScreenshots !== false,
      includeVideos: options?.includeVideos !== false,
      includeMetrics: options?.includeMetrics !== false,
      format: format || 'html',
    };
    
    if (format === 'html') {
      const reportPath = saveHTMLReport(run, reportOptions);
      return NextResponse.json({
        success: true,
        reportPath,
        url: `/api/view-report?path=${encodeURIComponent(reportPath)}`,
      });
    } else if (format === 'json') {
      const jsonReport = generateJSONReport(run, reportOptions);
      return NextResponse.json({
        success: true,
        report: jsonReport,
      });
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

