import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start date and end date required' },
        { status: 400 }
      );
    }

    // Get all leave records for the period
    const { data: leaves, error } = await supabase
      .from('leave_records')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .gte('leave_date', start_date)
      .lte('leave_date', end_date);

    if (error) throw error;

    if (!leaves || leaves.length === 0) {
      return NextResponse.json({
        top_leave: [],
        low_leave: [],
        total_leaves: 0,
      });
    }

    // Count leaves by employee
    const leaveCountMap = new Map<string, { name: string; count: number }>();

    leaves.forEach(l => {
      const empId = l.employee_id;
      const empName = l.employees?.name || 'Unknown';
      const current = leaveCountMap.get(empId) || { name: empName, count: 0 };
      leaveCountMap.set(empId, { name: empName, count: current.count + 1 });
    });

    const leaveCounts = Array.from(leaveCountMap.entries()).map(([empId, data]) => ({
      employee_id: empId,
      name: data.name,
      leave_count: data.count,
    }));

    // Top 5 most leaves
    const top_leave = [...leaveCounts]
      .sort((a, b) => b.leave_count - a.leave_count)
      .slice(0, 5);

    // Low 5 least leaves (only employees who have taken leave)
    const low_leave = [...leaveCounts]
      .sort((a, b) => a.leave_count - b.leave_count)
      .slice(0, 5);

    return NextResponse.json({
      top_leave,
      low_leave,
      total_leaves: leaves.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
