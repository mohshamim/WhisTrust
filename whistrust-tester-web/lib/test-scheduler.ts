import * as fs from 'fs';
import * as path from 'path';
import { TestConfig } from './test-runner';
import { getTestQueue } from './test-queue';

export interface ScheduledTest {
  id: string;
  name: string;
  config: TestConfig;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'cron';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    cronExpression?: string; // Custom cron expression
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  createdAt: Date;
}

const SCHEDULES_FILE = path.join(process.cwd(), 'data', 'schedules.json');

/**
 * Load schedules from file
 */
export function loadSchedules(): ScheduledTest[] {
  const dataDir = path.dirname(SCHEDULES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(SCHEDULES_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
    const schedules = JSON.parse(content);
    // Convert date strings back to Date objects
    return schedules.map((s: any) => ({
      ...s,
      lastRun: s.lastRun ? new Date(s.lastRun) : undefined,
      nextRun: s.nextRun ? new Date(s.nextRun) : undefined,
      createdAt: new Date(s.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save schedules to file
 */
export function saveSchedules(schedules: ScheduledTest[]): void {
  const dataDir = path.dirname(SCHEDULES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
}

/**
 * Add a new scheduled test
 */
export function addScheduledTest(schedule: Omit<ScheduledTest, 'id' | 'createdAt' | 'runCount'>): string {
  const schedules = loadSchedules();
  const id = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newSchedule: ScheduledTest = {
    ...schedule,
    id,
    createdAt: new Date(),
    runCount: 0,
  };
  
  // Calculate next run time
  newSchedule.nextRun = calculateNextRun(newSchedule);
  
  schedules.push(newSchedule);
  saveSchedules(schedules);
  
  return id;
}

/**
 * Update a scheduled test
 */
export function updateScheduledTest(id: string, updates: Partial<ScheduledTest>): boolean {
  const schedules = loadSchedules();
  const index = schedules.findIndex(s => s.id === id);
  
  if (index === -1) return false;
  
  schedules[index] = { ...schedules[index], ...updates };
  
  // Recalculate next run if schedule changed
  if (updates.schedule || updates.enabled !== undefined) {
    schedules[index].nextRun = calculateNextRun(schedules[index]);
  }
  
  saveSchedules(schedules);
  return true;
}

/**
 * Delete a scheduled test
 */
export function deleteScheduledTest(id: string): boolean {
  const schedules = loadSchedules();
  const filtered = schedules.filter(s => s.id !== id);
  
  if (filtered.length === schedules.length) return false;
  
  saveSchedules(filtered);
  return true;
}

/**
 * Calculate next run time based on schedule
 */
export function calculateNextRun(schedule: ScheduledTest): Date {
  const now = new Date();
  const next = new Date(now);
  
  if (schedule.schedule.type === 'daily') {
    const [hours, minutes] = (schedule.schedule.time || '00:00').split(':').map(Number);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (schedule.schedule.type === 'weekly') {
    const [hours, minutes] = (schedule.schedule.time || '00:00').split(':').map(Number);
    const dayOfWeek = schedule.schedule.dayOfWeek || 0;
    next.setHours(hours, minutes, 0, 0);
    
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext < 0 || (daysUntilNext === 0 && next <= now)) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (schedule.schedule.type === 'monthly') {
    const [hours, minutes] = (schedule.schedule.time || '00:00').split(':').map(Number);
    const dayOfMonth = schedule.schedule.dayOfMonth || 1;
    next.setHours(hours, minutes, 0, 0);
    next.setDate(dayOfMonth);
    
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next;
}

/**
 * Check and execute due schedules
 */
export async function checkAndExecuteSchedules(): Promise<void> {
  const schedules = loadSchedules();
  const now = new Date();
  
  for (const schedule of schedules) {
    if (!schedule.enabled) continue;
    if (!schedule.nextRun) continue;
    
    if (schedule.nextRun <= now) {
      // Execute the test
      const queue = getTestQueue();
      queue.enqueue(schedule.config);
      
      // Update schedule
      schedule.lastRun = new Date();
      schedule.runCount++;
      schedule.nextRun = calculateNextRun(schedule);
      
      updateScheduledTest(schedule.id, {
        lastRun: schedule.lastRun,
        nextRun: schedule.nextRun,
        runCount: schedule.runCount,
      });
    }
  }
}

// Start scheduler if running as a service
if (typeof process !== 'undefined' && process.env.RUN_SCHEDULER === 'true') {
  // Check every minute
  setInterval(() => {
    checkAndExecuteSchedules().catch(console.error);
  }, 60 * 1000);
  
  // Initial check
  checkAndExecuteSchedules().catch(console.error);
}

