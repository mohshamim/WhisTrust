import { NextRequest, NextResponse } from 'next/server';
import {
  loadSchedules,
  addScheduledTest,
  updateScheduledTest,
  deleteScheduledTest,
  checkAndExecuteSchedules,
} from '@/lib/test-scheduler';

export async function GET(request: NextRequest) {
  try {
    const schedules = loadSchedules();
    return NextResponse.json({ schedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, schedule, id, updates } = body;
    
    if (action === 'create') {
      if (!schedule) {
        return NextResponse.json({ error: 'Schedule required' }, { status: 400 });
      }
      
      const scheduleId = addScheduledTest(schedule);
      return NextResponse.json({ id: scheduleId });
    }
    
    if (action === 'update') {
      if (!id || !updates) {
        return NextResponse.json({ error: 'ID and updates required' }, { status: 400 });
      }
      
      const success = updateScheduledTest(id, updates);
      return NextResponse.json({ success });
    }
    
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
      }
      
      const success = deleteScheduledTest(id);
      return NextResponse.json({ success });
    }
    
    if (action === 'check') {
      await checkAndExecuteSchedules();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

