import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Calculate payroll for a specific period
 */
export async function POST(request: NextRequest) {
  try {
    const { period_id, start_date, end_date } = await request.json();

    if (!period_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'period_id, start_date and end_date required' },
        { status: 400 }
      );
    }

    // 1. คำนวณ daily attendance ก่อน
    const dailyAttendanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/daily-attendance/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_id }),
    });

    if (!dailyAttendanceResponse.ok) {
      console.error('Failed to calculate daily attendance');
    }

    // 2. Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*');

    if (empError) throw empError;

    const payrollRecords = [];

    for (const employee of employees!) {
      // 3. Get daily attendance summary from daily_attendance table
      const { data: dailyAtt, error: attError } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('period_id', period_id)
        .single();

      if (attError) {
        console.error(`Error getting daily attendance for ${employee.employee_id}:`, attError);
        continue;
      }

      // Calculate totals from daily_attendance
      let total_days = dailyAtt?.total_work_days || 0;
      let regular_ot_hours = dailyAtt?.regular_ot_hours || 0;
      let holiday_ot_hours = dailyAtt?.sunday_ot_calculated || 0;
      let total_ot_hours = dailyAtt?.total_ot_hours || 0;
      const base_salary = employee.base_salary;
      const ot_amount = total_ot_hours * employee.ot_rate;
      const gross_salary = base_salary + ot_amount;

      // Calculate tax (simplified progressive tax)
      const tax_amount = calculateTax(gross_salary * 12); // Annual income

      // Calculate social security (5% of salary, max 750 baht)
      const social_security = Math.min(gross_salary * 0.05, 750);

      const net_salary = gross_salary - tax_amount - social_security;

      payrollRecords.push({
        employee_id: employee.employee_id,
        payroll_period_id: period_id,
        total_days,
        total_hours: 0, // Not tracking total hours anymore
        regular_ot_hours,
        holiday_ot_hours,
        total_ot_hours,
        base_salary,
        ot_amount,
        gross_salary,
        tax_amount,
        social_security,
        net_salary,
      });
    }

    // Insert payroll calculations
    const { data: inserted, error: insertError } = await supabase
      .from('payroll_calculations')
      .upsert(payrollRecords)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      records_created: inserted?.length || 0,
      records: inserted,
    });
  } catch (error: any) {
    console.error('Payroll calculation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate annual tax based on Thai tax brackets
 */
function calculateTax(annualIncome: number): number {
  // Monthly tax (simplified)
  const monthlyIncome = annualIncome / 12;

  if (annualIncome <= 150000) return 0;
  if (annualIncome <= 300000) return (annualIncome - 150000) * 0.05 / 12;
  if (annualIncome <= 500000) return (150000 * 0.05 + (annualIncome - 300000) * 0.10) / 12;
  if (annualIncome <= 750000) return (150000 * 0.05 + 200000 * 0.10 + (annualIncome - 500000) * 0.15) / 12;
  if (annualIncome <= 1000000) return (150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + (annualIncome - 750000) * 0.20) / 12;
  if (annualIncome <= 2000000) return (150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + (annualIncome - 1000000) * 0.25) / 12;
  if (annualIncome <= 5000000) return (150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + 1000000 * 0.25 + (annualIncome - 2000000) * 0.30) / 12;

  return (150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + 1000000 * 0.25 + 3000000 * 0.30 + (annualIncome - 5000000) * 0.35) / 12;
}
