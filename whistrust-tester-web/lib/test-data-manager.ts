import * as fs from 'fs';
import * as path from 'path';

export interface TestDataSet {
  id: string;
  name: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'test-data');

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load all test data sets
 */
export function loadTestDataSets(): TestDataSet[] {
  ensureDataDir();
  
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const dataSets: TestDataSet[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      dataSets.push({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch {
      // Skip invalid files
    }
  }
  
  return dataSets;
}

/**
 * Save test data set
 */
export function saveTestDataSet(dataSet: Omit<TestDataSet, 'id' | 'createdAt' | 'updatedAt'>): string {
  ensureDataDir();
  
  const id = `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullDataSet: TestDataSet = {
    ...dataSet,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const filePath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fullDataSet, null, 2));
  
  return id;
}

/**
 * Update test data set
 */
export function updateTestDataSet(id: string, updates: Partial<TestDataSet>): boolean {
  ensureDataDir();
  
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dataSet = JSON.parse(content);
    const updated = {
      ...dataSet,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete test data set
 */
export function deleteTestDataSet(id: string): boolean {
  ensureDataDir();
  
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  
  return false;
}

/**
 * Get test data set by ID
 */
export function getTestDataSet(id: string): TestDataSet | null {
  ensureDataDir();
  
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch {
    return null;
  }
}

/**
 * Import test data from CSV
 */
export function importFromCSV(csvContent: string, name: string): string {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: Record<string, any>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return saveTestDataSet({
    name,
    description: `Imported from CSV with ${data.length} rows`,
    data: { rows: data, headers },
  });
}

/**
 * Import test data from JSON
 */
export function importFromJSON(jsonContent: string, name: string): string {
  try {
    const data = JSON.parse(jsonContent);
    return saveTestDataSet({
      name,
      description: 'Imported from JSON',
      data: Array.isArray(data) ? { rows: data } : data,
    });
  } catch (error: any) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

