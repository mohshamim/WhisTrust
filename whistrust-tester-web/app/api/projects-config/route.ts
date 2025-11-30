import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'projects.json');
    
    if (!fs.existsSync(configPath)) {
      // Return default config
      return NextResponse.json({
        projects: [
          {
            id: 'whistrust',
            name: 'WhisTrust',
            description: 'Multi-tenant anonymous reporting platform',
            config: {
              local: 'http://localhost:3000',
              demo: 'https://demo.whistrust.com',
              production: 'https://www.whistrust.com',
            },
          },
        ],
        testTypes: [
          {
            id: 'all',
            name: 'All Tests',
            description: 'Run all available tests',
            testFiles: [],
          },
        ],
      });
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load config' },
      { status: 500 }
    );
  }
}

