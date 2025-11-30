import * as fs from 'fs';
import * as path from 'path';

export interface TestRun {
  id: string;
  projectId: string;
  testType: string;
  environment: string;
  datetime: string;
  timestamp: Date;
  resultsDir: string;
  success: boolean;
  duration?: number;
  testCount?: number;
  passedCount?: number;
  failedCount?: number;
}

export interface TestHistoryStats {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  totalTests: number;
  runsByDate: { date: string; count: number }[];
  runsByProject: { project: string; count: number }[];
  runsByEnvironment: { environment: string; count: number }[];
}

/**
 * Get all test runs from results directory
 */
export function getAllTestRuns(): TestRun[] {
  const resultsBase = path.join(process.cwd(), 'results');
  
  if (!fs.existsSync(resultsBase)) {
    return [];
  }
  
  const runs: TestRun[] = [];
  
  // Walk through results directory structure: results/{project}/{testType}/{env}/{datetime}/
    const projects = fs.readdirSync(resultsBase);
    
    for (const project of projects) {
      const projectPath = path.join(resultsBase, project);
      const projectStat = fs.statSync(projectPath);
      if (!projectStat.isDirectory()) continue;
      
      const testTypes = fs.readdirSync(projectPath);
      for (const testType of testTypes) {
        const testTypePath = path.join(projectPath, testType);
        const testTypeStat = fs.statSync(testTypePath);
        if (!testTypeStat.isDirectory()) continue;
        
        const environments = fs.readdirSync(testTypePath);
        for (const env of environments) {
          const envPath = path.join(testTypePath, env);
          const envStat = fs.statSync(envPath);
          if (!envStat.isDirectory()) continue;
          
          const runDirs = fs.readdirSync(envPath);
          for (const runDir of runDirs) {
            const runPath = path.join(envPath, runDir);
            const runStat = fs.statSync(runPath);
            if (!runStat.isDirectory()) continue;
          
          // Parse datetime from directory name
          const datetimeMatch = runDir.match(/^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})$/);
          if (!datetimeMatch) continue;
          
          const datetimeStr = datetimeMatch[1];
          const [datePart, timePart] = datetimeStr.split('_');
          const [year, month, day] = datePart.split('-');
          const [hour, minute, second] = timePart.split('-');
          const timestamp = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
          
          // Check for success and read test results from JSON report
          let success = false;
          let duration: number | undefined;
          let testCount: number | undefined;
          let passedCount: number | undefined;
          let failedCount: number | undefined;
          
          const jsonFiles = fs.readdirSync(runPath).filter(f => f.endsWith('.json'));
          for (const jsonFile of jsonFiles) {
            try {
              const jsonPath = path.join(runPath, jsonFile);
              const content = fs.readFileSync(jsonPath, 'utf-8');
              const data = JSON.parse(content);
              
              if (data.stats) {
                // Check if there are unexpected failures
                success = (data.stats.unexpected || 0) === 0 && (data.stats.expected || 0) > 0;
                duration = data.stats.duration;
                testCount = data.stats.expected || 0;
                passedCount = data.stats.expected - (data.stats.unexpected || 0);
                failedCount = data.stats.unexpected || 0;
                break; // Use first valid JSON report
              }
            } catch {
              // Ignore parse errors
            }
          }
          
          // Fallback: check for html-report and no errors if no JSON found
          if (jsonFiles.length === 0) {
            const errorsDir = path.join(runPath, 'errors');
            const htmlReportDir = path.join(runPath, 'html-report');
            const hasErrors = fs.existsSync(errorsDir) && fs.readdirSync(errorsDir).length > 0;
            const hasReport = fs.existsSync(htmlReportDir);
            success = hasReport && !hasErrors;
          }
          
          runs.push({
            id: `${project}-${testType}-${env}-${datetimeStr}`,
            projectId: project,
            testType,
            environment: env,
            datetime: datetimeStr,
            timestamp,
            resultsDir: runPath,
            success,
            duration,
            testCount,
            passedCount,
            failedCount,
          });
        }
      }
    }
  }
  
  // Sort by timestamp (newest first)
  return runs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get statistics from test history
 */
export function getTestHistoryStats(runs: TestRun[]): TestHistoryStats {
  if (runs.length === 0) {
    return {
      totalRuns: 0,
      successRate: 0,
      averageDuration: 0,
      totalTests: 0,
      runsByDate: [],
      runsByProject: [],
      runsByEnvironment: [],
    };
  }
  
  const successfulRuns = runs.filter(r => r.success).length;
  const successRate = (successfulRuns / runs.length) * 100;
  
  const durations = runs.filter(r => r.duration).map(r => r.duration!);
  const averageDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;
  
  const totalTests = runs.reduce((sum, r) => sum + (r.testCount || 0), 0);
  
  // Group by date
  const runsByDateMap = new Map<string, number>();
  runs.forEach(run => {
    const date = run.timestamp.toISOString().split('T')[0];
    runsByDateMap.set(date, (runsByDateMap.get(date) || 0) + 1);
  });
  const runsByDate = Array.from(runsByDateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Group by project
  const runsByProjectMap = new Map<string, number>();
  runs.forEach(run => {
    runsByProjectMap.set(run.projectId, (runsByProjectMap.get(run.projectId) || 0) + 1);
  });
  const runsByProject = Array.from(runsByProjectMap.entries())
    .map(([project, count]) => ({ project, count }));
  
  // Group by environment
  const runsByEnvironmentMap = new Map<string, number>();
  runs.forEach(run => {
    runsByEnvironmentMap.set(run.environment, (runsByEnvironmentMap.get(run.environment) || 0) + 1);
  });
  const runsByEnvironment = Array.from(runsByEnvironmentMap.entries())
    .map(([environment, count]) => ({ environment, count }));
  
  return {
    totalRuns: runs.length,
    successRate,
    averageDuration,
    totalTests,
    runsByDate,
    runsByProject,
    runsByEnvironment,
  };
}

/**
 * Filter test runs
 */
export function filterTestRuns(
  runs: TestRun[],
  filters: {
    projectId?: string;
    testType?: string;
    environment?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }
): TestRun[] {
  return runs.filter(run => {
    if (filters.projectId && run.projectId !== filters.projectId) return false;
    if (filters.testType && run.testType !== filters.testType) return false;
    if (filters.environment && run.environment !== filters.environment) return false;
    if (filters.startDate && run.timestamp < filters.startDate) return false;
    if (filters.endDate && run.timestamp > filters.endDate) return false;
    if (filters.success !== undefined && run.success !== filters.success) return false;
    return true;
  });
}

