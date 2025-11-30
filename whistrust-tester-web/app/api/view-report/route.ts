import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportPath = searchParams.get('path');
    
    if (!reportPath) {
      return new NextResponse('Report path required', { status: 400 });
    }
    
    // Security: Ensure path is within results directory
    const resultsBase = path.join(process.cwd(), 'results');
    const fullPath = path.resolve(reportPath);
    const resultsBaseResolved = path.resolve(resultsBase);
    
    if (!fullPath.startsWith(resultsBaseResolved)) {
      return new NextResponse('Invalid report path', { status: 403 });
    }
    
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Report not found', { status: 404 });
    }
    
    const html = fs.readFileSync(fullPath, 'utf-8');
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

