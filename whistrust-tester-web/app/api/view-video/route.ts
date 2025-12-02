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
    const resultsBaseResolved = path.resolve(resultsBase);

    // The incoming path may be a directory (e.g. .../resultsDir/videos) or an individual file.
    const resolvedInputPath = path.resolve(videoPath);

    if (!resolvedInputPath.startsWith(resultsBaseResolved)) {
      return new NextResponse('Invalid video path', { status: 403 });
    }

    let targetPath = resolvedInputPath;

    if (!fs.existsSync(targetPath)) {
      return new NextResponse('Video not found', { status: 404 });
    }

    const stat = fs.statSync(targetPath);

    // If a directory was provided (as the History page currently does),
    // pick the first available video file inside it (prefer MP4, then WEBM).
    if (stat.isDirectory()) {
      const entries = fs
        .readdirSync(targetPath)
        .filter(
          (name) =>
            name.toLowerCase().endsWith('.mp4') ||
            name.toLowerCase().endsWith('.webm')
        );

      if (!entries.length) {
        return new NextResponse('Video not found', { status: 404 });
      }

      const preferred =
        entries.find((e) => e.toLowerCase().endsWith('.mp4')) ?? entries[0];

      targetPath = path.join(targetPath, preferred);
    }

    // Final safety check
    if (!targetPath.startsWith(resultsBaseResolved)) {
      return new NextResponse('Invalid video path', { status: 403 });
    }

    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      return new NextResponse('Video not found', { status: 404 });
    }

    const videoBuffer = fs.readFileSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
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

