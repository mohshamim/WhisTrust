'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as path from 'path';

interface TestRun {
  id: string;
  projectId: string;
  testType: string;
  environment: string;
  datetime: string;
  timestamp: string;
  resultsDir: string;
  success: boolean;
  duration?: number;
  testCount?: number;
  passedCount?: number;
  failedCount?: number;
}

interface TestHistoryStats {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  totalTests: number;
  runsByDate: { date: string; count: number }[];
  runsByProject: { project: string; count: number }[];
  runsByEnvironment: { environment: string; count: number }[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [stats, setStats] = useState<TestHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    projectId: '',
    testType: '',
    environment: '',
    success: '',
  });

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.testType) params.append('testType', filters.testType);
      if (filters.environment) params.append('environment', filters.environment);
      if (filters.success) params.append('success', filters.success);
      
      const response = await fetch(`/api/test-history?${params.toString()}`);
      const data = await response.json();
      
      setRuns(data.runs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test History & Analytics</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Tester
          </Link>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Runs</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRuns}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.successRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Avg Duration</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatDuration(stats.averageDuration)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Tests</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTests}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <input
                type="text"
                value={filters.projectId}
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Filter by project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Type
              </label>
              <input
                type="text"
                value={filters.testType}
                onChange={(e) => setFilters({ ...filters, testType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Filter by type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <select
                value={filters.environment}
                onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="local">Local</option>
                <option value="demo">Demo</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Runs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Test Runs</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No test runs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Test Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Environment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runs.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(run.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.projectId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.testType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.environment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            run.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {run.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(run.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.passedCount !== undefined && run.failedCount !== undefined
                          ? `${run.passedCount}/${run.testCount} passed`
                          : run.testCount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <a
                            href={`${run.resultsDir}/html-report/index.html`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Report
                          </a>
                          <a
                            href={`/api/view-video?path=${encodeURIComponent(path.join(run.resultsDir, 'videos'))}`}
                            target="_blank"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            🎥 Video
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

