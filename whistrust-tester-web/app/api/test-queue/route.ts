import { NextRequest, NextResponse } from 'next/server';
import { getTestQueue } from '@/lib/test-queue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, testId, maxConcurrent } = body;
    
    const queue = getTestQueue(maxConcurrent);
    
    if (action === 'enqueue') {
      if (!config) {
        return NextResponse.json({ error: 'Config required' }, { status: 400 });
      }
      
      const testId = queue.enqueue(config);
      return NextResponse.json({ testId });
    }
    
    if (action === 'cancel') {
      if (!testId) {
        return NextResponse.json({ error: 'Test ID required' }, { status: 400 });
      }
      
      const cancelled = queue.cancel(testId);
      return NextResponse.json({ success: cancelled });
    }
    
    if (action === 'clear') {
      queue.clearCompleted();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxConcurrent = searchParams.get('maxConcurrent');
    
    const queue = getTestQueue(maxConcurrent ? parseInt(maxConcurrent) : undefined);
    const status = queue.getStatus();
    
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

