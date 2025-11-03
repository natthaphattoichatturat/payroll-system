import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET payroll calculations for a specific period WITH daily attendance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period_id: string }> }
) {
  try {
    const { period_id } = await params;

    // 1. Get payroll calculations
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll_calculations')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .eq('payroll_period_id', period_id)
      .order('employee_id', { ascending: true });

    if (payrollError) throw payrollError;

    // 2. Get daily attendance for all employees
    const { data: dailyAttendance, error: dailyError } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('period_id', period_id);

    if (dailyError) throw dailyError;

    // 3. Merge data
    const result = payrollData?.map(payroll => {
      const daily = dailyAttendance?.find(d => d.employee_id === payroll.employee_id);

      return {
        ...payroll,
        daily_attendance: daily || null,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
