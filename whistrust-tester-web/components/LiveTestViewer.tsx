'use client';

import { useState, useEffect, useRef } from 'react';

interface TestEvent {
  type: 'step' | 'screenshot' | 'log' | 'error' | 'complete' | 'start' | 'connected';
  data: any;
  timestamp: string;
}

interface LiveTestViewerProps {
  sessionId: string | null;
  onClose: () => void;
}

export default function LiveTestViewer({ sessionId, onClose }: LiveTestViewerProps) {
  const [events, setEvents] = useState<TestEvent[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('Waiting for test to start...');
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Connect to SSE stream
    const eventSource = new EventSource(`/api/test-stream?sessionId=${sessionId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setCurrentStep('Connected to test stream...');
    };

    eventSource.onmessage = (e) => {
      try {
        const event: TestEvent = JSON.parse(e.data);
        
        setEvents(prev => [...prev, event]);
        
        // Handle different event types
        if (event.type === 'screenshot') {
          setCurrentScreenshot(event.data.base64);
          setCurrentStep(`Screenshot captured: ${event.data.filename}`);
        } else if (event.type === 'log') {
          const message = event.data.message?.trim();
          if (message) {
            setCurrentStep(`Executing: ${message.substring(0, 100)}...`);
          }
        } else if (event.type === 'step') {
          setCurrentStep(event.data.stepName || 'Processing step...');
        } else if (event.type === 'start') {
          setCurrentStep('Test execution started');
        } else if (event.type === 'complete') {
          setCurrentStep(event.data.success ? 'Test completed successfully!' : 'Test failed');
          eventSource.close();
          setIsConnected(false);
        } else if (event.type === 'error') {
          setCurrentStep(`Error: ${event.data.message}`);
        }
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setCurrentStep('Connection lost');
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [events]);

  const handleStop = async () => {
    if (sessionId) {
      await fetch('/api/test-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', sessionId }),
      });
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Live Test Execution</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">{currentStep}</span>
            </div>
          </div>
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop & Close
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Screenshot Viewer */}
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            {currentScreenshot ? (
              <img
                src={currentScreenshot}
                alt="Live test screenshot"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-500 text-center">
                <div className="text-4xl mb-4">📸</div>
                <p>Waiting for screenshots...</p>
              </div>
            )}
          </div>

          {/* Logs Panel */}
          <div className="w-96 bg-gray-900 rounded-lg flex flex-col">
            <div className="p-2 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300">Test Logs</h3>
            </div>
            <div
              ref={logsRef}
              className="flex-1 overflow-y-auto p-2 font-mono text-xs text-green-400"
            >
              {events.map((event, index) => (
                <div key={index} className="mb-1">
                  {event.type === 'log' && (
                    <div className="text-gray-400">{event.data.message}</div>
                  )}
                  {event.type === 'screenshot' && (
                    <div className="text-blue-400">📸 {event.data.filename}</div>
                  )}
                  {event.type === 'error' && (
                    <div className="text-red-400">❌ {event.data.message}</div>
                  )}
                  {event.type === 'complete' && (
                    <div className={`font-bold ${event.data.success ? 'text-green-400' : 'text-red-400'}`}>
                      {event.data.success ? '✅ Test completed' : '❌ Test failed'}
                    </div>
                  )}
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-gray-500">No events yet...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t bg-gray-50 flex justify-between text-sm">
          <div>
            <span className="text-gray-600">Events: </span>
            <span className="font-semibold">{events.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Screenshots: </span>
            <span className="font-semibold">
              {events.filter(e => e.type === 'screenshot').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status: </span>
            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

