import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET leave records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get('employee_id');

    let query = supabase
      .from('leave_records')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .order('leave_date', { ascending: false });

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST create leave record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('leave_records')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    // Update daily attendance if exists
    await supabase
      .from('daily_attendance')
      .update({ is_leave: true })
      .eq('employee_id', body.employee_id)
      .eq('work_date', body.leave_date);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE leave record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Leave record ID required' },
        { status: 400 }
      );
    }

    // Get leave record first
    const { data: leaveRecord } = await supabase
      .from('leave_records')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('leave_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update daily attendance
    if (leaveRecord) {
      await supabase
        .from('daily_attendance')
        .update({ is_leave: false })
        .eq('employee_id', leaveRecord.employee_id)
        .eq('work_date', leaveRecord.leave_date);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
