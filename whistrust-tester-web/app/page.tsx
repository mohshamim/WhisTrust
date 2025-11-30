'use client';

import { useState, useEffect } from 'react';
import LiveTestViewer from '@/components/LiveTestViewer';

interface Project {
  id: string;
  name: string;
  description: string;
  config: {
    local: string;
    demo: string;
    production: string;
  };
}

interface TestType {
  id: string;
  name: string;
  description: string;
  testFiles: string[];
}

interface ProjectsConfig {
  projects: Project[];
  testTypes: TestType[];
}

export default function Home() {
  const [config, setConfig] = useState<ProjectsConfig | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('whistrust');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('local');
  const [baseUrl, setBaseUrl] = useState<string>('http://localhost:3000');
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [showLiveView, setShowLiveView] = useState(false);

  useEffect(() => {
    loadConfig();
    loadTestFiles();
  }, []);

  useEffect(() => {
    if (config && selectedProject) {
      const project = config.projects.find(p => p.id === selectedProject);
      if (project) {
        const url = project.config[selectedEnv as keyof typeof project.config] || '';
        setBaseUrl(url);
      }
    }
  }, [selectedEnv, selectedProject, config]);

  useEffect(() => {
    if (config && selectedTestType) {
      const testType = config.testTypes.find(t => t.id === selectedTestType);
      if (testType) {
        if (testType.id === 'all') {
          setSelectedTests(new Set(testFiles));
        } else {
          setSelectedTests(new Set(testType.testFiles));
        }
      }
    }
  }, [selectedTestType, config, testFiles]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/projects-config');
      const data = await response.json();
      setConfig(data);
      if (data.projects.length > 0) {
        setSelectedProject(data.projects[0].id);
        setBaseUrl(data.projects[0].config.local);
      }
    } catch (error) {
      addLog(`Error loading config: ${error}`);
    }
  };

  const loadTestFiles = async () => {
    try {
      const response = await fetch('/api/test-files');
      const data = await response.json();
      setTestFiles(data.testFiles || []);
      setSelectedTests(new Set(data.testFiles || []));
    } catch (error) {
      addLog(`Error loading test files: ${error}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const toggleTest = (testFile: string) => {
    setSelectedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testFile)) {
        newSet.delete(testFile);
      } else {
        newSet.add(testFile);
      }
      return newSet;
    });
  };

  const selectAllTests = () => {
    setSelectedTests(new Set(testFiles));
  };

  const deselectAllTests = () => {
    setSelectedTests(new Set());
  };

  const runTests = async (useLiveView: boolean = false) => {
    if (selectedTests.size === 0) {
      addLog('Please select at least one test to run.');
      return;
    }

    if (!baseUrl) {
      addLog('Please enter a base URL.');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setResults(null);
    addLog('Starting test execution...');
    addLog(`Project: ${selectedProject}`);
    addLog(`Test Type: ${selectedTestType}`);
    addLog(`Environment: ${selectedEnv}`);
    addLog(`Base URL: ${baseUrl}`);
    addLog(`Selected tests: ${Array.from(selectedTests).join(', ')}`);

    try {
      if (useLiveView) {
        // Start live streaming test
        const response = await fetch('/api/test-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            config: {
              projectId: selectedProject,
              testType: selectedTestType,
              environment: selectedEnv,
              selectedTests: Array.from(selectedTests),
              baseUrl,
            },
          }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setLiveSessionId(data.sessionId);
        setShowLiveView(true);
        // Don't set isRunning to false - live view handles it
      } else {
        // Regular test execution
        const response = await fetch('/api/run-tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProject,
            testType: selectedTestType,
            environment: selectedEnv,
            selectedTests: Array.from(selectedTests),
            baseUrl,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setResults(data);
        addLog(`Tests ${data.success ? 'completed successfully' : 'failed'}`);
        addLog(`Results saved to: ${data.resultsDir}`);
        
        if (data.output) {
          data.output.split('\n').forEach((line: string) => {
            if (line.trim()) addLog(line);
          });
        }
        setIsRunning(false);
      }
    } catch (error: any) {
      addLog(`Error running tests: ${error.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            WhisTrust Automation Tester
          </h1>
          <a
            href="/history"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            📊 View History
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>

              {/* Project Selection */}
              {config && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  >
                    {config.projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {config.projects.find(p => p.id === selectedProject) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {config.projects.find(p => p.id === selectedProject)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Test Type Selection */}
              {config && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type
                  </label>
                  <select
                    value={selectedTestType}
                    onChange={(e) => setSelectedTestType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  >
                    {config.testTypes.map(testType => (
                      <option key={testType.id} value={testType.id}>
                        {testType.name}
                      </option>
                    ))}
                  </select>
                  {config.testTypes.find(t => t.id === selectedTestType) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {config.testTypes.find(t => t.id === selectedTestType)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Environment Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isRunning}
                >
                  <option value="local">Local</option>
                  <option value="demo">Demo</option>
                  <option value="production">Production</option>
                </select>
              </div>

              {/* Base URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.whistrust.com"
                  disabled={isRunning}
                />
              </div>

              {/* Test Selection */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Test Suites
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={selectAllTests}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={isRunning}
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllTests}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={isRunning}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                  {testFiles.length === 0 ? (
                    <p className="text-sm text-gray-500">No test files found</p>
                  ) : (
                    testFiles.map(testFile => (
                      <label
                        key={testFile}
                        className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTests.has(testFile)}
                          onChange={() => toggleTest(testFile)}
                          disabled={isRunning}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{testFile}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Start Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => runTests(false)}
                  disabled={isRunning || selectedTests.size === 0}
                  className={`w-full py-3 px-4 rounded-md font-medium ${
                    isRunning || selectedTests.size === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRunning ? 'Running Tests...' : 'Start Testing'}
                </button>
                <button
                  onClick={() => runTests(true)}
                  disabled={isRunning || selectedTests.size === 0 || showLiveView}
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm ${
                    isRunning || selectedTests.size === 0 || showLiveView
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  🎥 Start with Live View
                </button>
              </div>
            </div>

            {/* Results Summary */}
            {results && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Results Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`font-medium ${results.success ? 'text-green-600' : 'text-red-600'}`}>
                      {results.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {results.resultsDir && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500 break-all">
                        Results: {results.resultsDir}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Click 'Start Testing' to begin.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Test Viewer Modal */}
      {showLiveView && liveSessionId && (
        <LiveTestViewer
          sessionId={liveSessionId}
          onClose={() => {
            setShowLiveView(false);
            setLiveSessionId(null);
            setIsRunning(false);
          }}
        />
      )}
    </div>
  );
}

