import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  certificate_type?: string;
  base_salary: number;
  ot_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceScan {
  id: number;
  machine_id: string;
  scan_date: string;
  scan_time: string;
  employee_id: string;
  scan_type: 1 | 2; // 1 = IN, 2 = OUT
  created_at?: string;
}

export interface LeaveRecord {
  id: number;
  employee_id: string;
  leave_date: string;
  leave_type?: string;
  reason?: string;
  created_by?: string;
  created_at?: string;
}

export interface DailyAttendance {
  id: number;
  employee_id: string;
  work_date: string;
  check_in_time?: string;
  check_out_time?: string;
  scheduled_in_time?: string;
  scheduled_out_time?: string;
  actual_hours: number;
  ot_hours: number;
  is_holiday: boolean;
  is_leave: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: 'draft' | 'calculated' | 'paid';
  created_at?: string;
}

export interface PayrollCalculation {
  id: number;
  employee_id: string;
  payroll_period_id: number;
  total_days: number;
  total_hours: number;
  regular_ot_hours: number;
  holiday_ot_hours: number;
  total_ot_hours: number;
  base_salary: number;
  ot_amount: number;
  gross_salary: number;
  tax_amount: number;
  social_security: number;
  net_salary: number;
  created_at?: string;
  updated_at?: string;
}
