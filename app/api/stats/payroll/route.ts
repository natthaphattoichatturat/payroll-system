import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period_id = searchParams.get('period_id');

    if (!period_id) {
      return NextResponse.json(
        { error: 'Period ID required' },
        { status: 400 }
      );
    }

    // Get all payroll calculations for the period
    const { data: calculations, error } = await supabase
      .from('payroll_calculations')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .eq('payroll_period_id', period_id);

    if (error) throw error;

    if (!calculations || calculations.length === 0) {
      return NextResponse.json({
        top_ot: [],
        low_ot: [],
        department_avg: [],
        financial_summary: {
          total_ot_amount: 0,
          total_base_salary: 0,
          total_gross: 0,
          total_net: 0,
        },
      });
    }

    // Top 5 OT workers
    const top_ot = [...calculations]
      .sort((a, b) => b.total_ot_hours - a.total_ot_hours)
      .slice(0, 5)
      .map(c => ({
        employee_id: c.employee_id,
        name: c.employees?.name,
        ot_hours: c.total_ot_hours,
        ot_amount: c.ot_amount,
      }));

    // Low 5 OT workers
    const low_ot = [...calculations]
      .sort((a, b) => a.total_ot_hours - b.total_ot_hours)
      .slice(0, 5)
      .map(c => ({
        employee_id: c.employee_id,
        name: c.employees?.name,
        ot_hours: c.total_ot_hours,
        ot_amount: c.ot_amount,
      }));

    // Department averages
    const deptMap = new Map<string, { total: number; count: number }>();

    calculations.forEach(c => {
      const dept = c.employees?.department || 'Unknown';
      const current = deptMap.get(dept) || { total: 0, count: 0 };
      deptMap.set(dept, {
        total: current.total + c.total_ot_hours,
        count: current.count + 1,
      });
    });

    const department_avg = Array.from(deptMap.entries())
      .map(([department, data]) => ({
        department,
        avg_ot_hours: data.total / data.count,
        employee_count: data.count,
      }))
      .sort((a, b) => b.avg_ot_hours - a.avg_ot_hours);

    // Financial summary
    const financial_summary = {
      total_ot_amount: calculations.reduce((sum, c) => sum + c.ot_amount, 0),
      total_base_salary: calculations.reduce((sum, c) => sum + c.base_salary, 0),
      total_gross: calculations.reduce((sum, c) => sum + c.gross_salary, 0),
      total_net: calculations.reduce((sum, c) => sum + c.net_salary, 0),
      total_tax: calculations.reduce((sum, c) => sum + c.tax_amount, 0),
      total_social_security: calculations.reduce((sum, c) => sum + c.social_security, 0),
    };

    return NextResponse.json({
      top_ot,
      low_ot,
      department_avg,
      financial_summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
