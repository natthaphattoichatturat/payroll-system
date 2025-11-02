import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET payroll calculations for a specific period
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period_id: string }> }
) {
  try {
    const { period_id } = await params;

    const { data, error } = await supabase
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

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
