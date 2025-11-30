'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ScheduledTest {
  id: string;
  name: string;
  config: any;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'cron';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    cronExpression?: string;
  };
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduledTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    projectId: 'whistrust',
    testType: 'all',
    environment: 'local',
    baseUrl: 'http://localhost:3001',
    selectedTests: [] as string[],
    scheduleType: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '00:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    enabled: true,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-schedule');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/test-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          schedule: {
            name: formData.name,
            config: {
              projectId: formData.projectId,
              testType: formData.testType,
              environment: formData.environment,
              baseUrl: formData.baseUrl,
              selectedTests: formData.selectedTests,
            },
            schedule: {
              type: formData.scheduleType,
              time: formData.time,
              dayOfWeek: formData.scheduleType === 'weekly' ? formData.dayOfWeek : undefined,
              dayOfMonth: formData.scheduleType === 'monthly' ? formData.dayOfMonth : undefined,
            },
            enabled: formData.enabled,
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setShowForm(false);
        setFormData({
          name: '',
          projectId: 'whistrust',
          testType: 'all',
          environment: 'local',
          baseUrl: 'http://localhost:3001',
          selectedTests: [],
          scheduleType: 'daily',
          time: '00:00',
          dayOfWeek: 0,
          dayOfMonth: 1,
          enabled: true,
        });
        loadSchedules();
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/test-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id,
          updates: { enabled },
        }),
      });
      loadSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await fetch('/api/test-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test Scheduling</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ New Schedule'}
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back to Tester
            </Link>
          </div>
        </div>

        {/* Create Schedule Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Scheduled Test</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={formData.scheduleType}
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {formData.scheduleType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {formData.scheduleType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">
                  Enable schedule
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Schedule
              </button>
            </form>
          </div>
        )}

        {/* Schedules List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Scheduled Tests</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No schedules found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Run Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {schedule.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.schedule.type} at {schedule.schedule.time}
                        {schedule.schedule.type === 'weekly' && ` (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.schedule.dayOfWeek || 0]})`}
                        {schedule.schedule.type === 'monthly' && ` (Day ${schedule.schedule.dayOfMonth})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.runCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleSchedule(schedule.id, !schedule.enabled)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {schedule.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
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

