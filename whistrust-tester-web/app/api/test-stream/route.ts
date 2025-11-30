import { NextRequest } from 'next/server';
import { StreamingTestRunner } from '@/lib/test-runner-stream';

// Store active runners
const activeRunners = new Map<string, StreamingTestRunner>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, config } = body;
    
    if (action === 'start') {
      if (!config) {
        return new Response(JSON.stringify({ error: 'Config required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const runner = new StreamingTestRunner();
      const id = sessionId || `session-${Date.now()}`;
      activeRunners.set(id, runner);
      
      // Start test execution in background
      runner.runTests(config).catch((error) => {
        console.error('Test execution error:', error);
      });
      
      return new Response(JSON.stringify({ sessionId: id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'stop') {
      const runner = activeRunners.get(sessionId);
      if (runner) {
        runner.stop();
        activeRunners.delete(sessionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// SSE endpoint for streaming events
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response('Session ID required', { status: 400 });
  }
  
  const runner = activeRunners.get(sessionId);
  if (!runner) {
    return new Response('Session not found', { status: 404 });
  }
  
  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));
      
      // Listen for events
      const handler = (event: any) => {
        try {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error('Error encoding event:', error);
        }
      };
      
      runner.on('event', handler);
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        runner.removeListener('event', handler);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

