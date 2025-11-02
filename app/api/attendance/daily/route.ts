import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET daily attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get('employee_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabase
      .from('daily_attendance')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .order('work_date', { ascending: false });

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    if (start_date) {
      query = query.gte('work_date', start_date);
    }

    if (end_date) {
      query = query.lte('work_date', end_date);
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
