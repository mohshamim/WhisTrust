import { EventEmitter } from 'events';
import { TestConfig } from './test-runner';
import { runTests } from './test-runner';

export interface QueuedTest {
  id: string;
  config: TestConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export class TestQueue extends EventEmitter {
  private queue: QueuedTest[] = [];
  private running: QueuedTest[] = [];
  private maxConcurrent: number;
  private completed: QueuedTest[] = [];

  constructor(maxConcurrent: number = 3) {
    super();
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add test to queue
   */
  enqueue(config: TestConfig): string {
    const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queuedTest: QueuedTest = {
      id,
      config,
      status: 'pending',
      createdAt: new Date(),
    };
    
    this.queue.push(queuedTest);
    this.emit('queued', queuedTest);
    this.processQueue();
    
    return id;
  }

  /**
   * Process queue - start tests up to maxConcurrent
   */
  private async processQueue() {
    while (this.running.length < this.maxConcurrent && this.queue.length > 0) {
      const test = this.queue.shift()!;
      this.running.push(test);
      this.startTest(test);
    }
  }

  /**
   * Start test execution
   */
  private async startTest(test: QueuedTest) {
    test.status = 'running';
    test.startedAt = new Date();
    this.emit('started', test);

    try {
      const result = await runTests(test.config);
      test.status = result.success ? 'completed' : 'failed';
      test.result = result;
      test.completedAt = new Date();
      
      if (result.success) {
        this.emit('completed', test);
      } else {
        this.emit('failed', test);
      }
    } catch (error: any) {
      test.status = 'failed';
      test.error = error.message;
      test.completedAt = new Date();
      this.emit('failed', test);
    } finally {
      // Remove from running, add to completed
      this.running = this.running.filter(t => t.id !== test.id);
      this.completed.push(test);
      
      // Process next in queue
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      pending: this.queue.length,
      running: this.running.length,
      completed: this.completed.length,
      queue: this.queue,
      runningTests: this.running,
      completedTests: this.completed.slice(-10), // Last 10 completed
    };
  }

  /**
   * Cancel a queued test
   */
  cancel(testId: string): boolean {
    const index = this.queue.findIndex(t => t.id === testId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.emit('cancelled', testId);
      return true;
    }
    return false;
  }

  /**
   * Clear completed tests
   */
  clearCompleted() {
    this.completed = [];
    this.emit('cleared');
  }
}

// Global queue instance
let globalQueue: TestQueue | null = null;

export function getTestQueue(maxConcurrent?: number): TestQueue {
  if (!globalQueue) {
    globalQueue = new TestQueue(maxConcurrent);
  }
  return globalQueue;
}

