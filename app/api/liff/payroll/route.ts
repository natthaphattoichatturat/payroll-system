import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {

    // Get latest period
    const { data: periods, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1);

    if (periodError) {
      console.error('Period error:', periodError);
      return NextResponse.json({ error: 'Failed to fetch period' }, { status: 500 });
    }

    if (!periods || periods.length === 0) {
      return NextResponse.json({ error: 'No payroll period found' }, { status: 404 });
    }

    const latestPeriod = periods[0];

    // Get daily attendance data
    const { data: attendance, error: attendanceError } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('period_id', latestPeriod.id);

    if (attendanceError) {
      console.error('Attendance error:', attendanceError);
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }

    // Get employee details
    const employeeIds = attendance?.map((a) => a.employee_id) || [];
    const { data: employeeDetails, error: employeeError } = await supabase
      .from('employees')
      .select('employee_id, name, department')
      .in('employee_id', employeeIds);

    if (employeeError) {
      console.error('Employee error:', employeeError);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    // Combine data
    const employeeMap = new Map(
      employeeDetails?.map((emp) => [emp.employee_id, emp]) || []
    );

    const combinedData = attendance?.map((att) => {
      const emp = employeeMap.get(att.employee_id);
      return {
        employee_id: att.employee_id,
        employee_name: emp?.name || att.employee_id,
        department: emp?.department || '-',
        day1: att.day1,
        day2: att.day2,
        day3: att.day3,
        day4: att.day4,
        day5: att.day5,
        day6: att.day6,
        day7: att.day7,
        day8: att.day8,
        day9: att.day9,
        day10: att.day10,
        day11: att.day11,
        day12: att.day12,
        day13: att.day13,
        day14: att.day14,
        day15: att.day15,
        total_ot_hours: att.total_ot_hours || 0,
      };
    });

    return NextResponse.json({
      period: latestPeriod,
      employees: combinedData,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
