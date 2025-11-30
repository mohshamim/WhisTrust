import { NextRequest, NextResponse } from 'next/server';
import {
  loadTestDataSets,
  saveTestDataSet,
  updateTestDataSet,
  deleteTestDataSet,
  getTestDataSet,
  importFromCSV,
  importFromJSON,
} from '@/lib/test-data-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      const dataSet = getTestDataSet(id);
      if (!dataSet) {
        return NextResponse.json({ error: 'Data set not found' }, { status: 404 });
      }
      return NextResponse.json({ dataSet });
    }
    
    const dataSets = loadTestDataSets();
    return NextResponse.json({ dataSets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dataSet, id, updates, importType, content, name } = body;
    
    if (action === 'create') {
      if (!dataSet) {
        return NextResponse.json({ error: 'Data set required' }, { status: 400 });
      }
      
      const dataSetId = saveTestDataSet(dataSet);
      return NextResponse.json({ id: dataSetId });
    }
    
    if (action === 'update') {
      if (!id || !updates) {
        return NextResponse.json({ error: 'ID and updates required' }, { status: 400 });
      }
      
      const success = updateTestDataSet(id, updates);
      return NextResponse.json({ success });
    }
    
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
      }
      
      const success = deleteTestDataSet(id);
      return NextResponse.json({ success });
    }
    
    if (action === 'import') {
      if (!content || !name || !importType) {
        return NextResponse.json({ error: 'Content, name, and import type required' }, { status: 400 });
      }
      
      let dataSetId: string;
      if (importType === 'csv') {
        dataSetId = importFromCSV(content, name);
      } else if (importType === 'json') {
        dataSetId = importFromJSON(content, name);
      } else {
        return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
      }
      
      return NextResponse.json({ id: dataSetId });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

