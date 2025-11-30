import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoPath = searchParams.get('path');
    
    if (!videoPath) {
      return new NextResponse('Video path required', { status: 400 });
    }
    
    // Security: Ensure path is within results directory
    const resultsBase = path.join(process.cwd(), 'results');
    const fullPath = path.resolve(videoPath);
    const resultsBaseResolved = path.resolve(resultsBase);
    
    if (!fullPath.startsWith(resultsBaseResolved)) {
      return new NextResponse('Invalid video path', { status: 403 });
    }
    
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Video not found', { status: 404 });
    }
    
    const videoBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = ext === '.mp4' ? 'video/mp4' : 'video/webm';
    
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

