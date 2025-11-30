import { NextRequest, NextResponse } from 'next/server';
import { compareTestRun, generateVisualRegressionReport, updateBaseline } from '@/lib/visual-regression';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resultsDir, threshold, screenshotPath, baselinePath } = body;
    
    if (action === 'compare') {
      if (!resultsDir) {
        return NextResponse.json({ error: 'Results directory required' }, { status: 400 });
      }
      
      const comparisonResult = await compareTestRun(resultsDir, threshold || 0.1);
      const reportPath = generateVisualRegressionReport(comparisonResult, resultsDir);
      
      return NextResponse.json({
        success: true,
        comparison: comparisonResult,
        reportPath,
      });
    }
    
    if (action === 'update-baseline') {
      if (!screenshotPath || !baselinePath) {
        return NextResponse.json({ error: 'Screenshot and baseline paths required' }, { status: 400 });
      }
      
      updateBaseline(screenshotPath, baselinePath);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

