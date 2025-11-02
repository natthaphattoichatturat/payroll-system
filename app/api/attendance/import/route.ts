import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  parseAttendanceText,
  groupScansByEmployeeAndDate,
  handleOvernightShifts,
} from '@/lib/attendance-parser';
import { calculateDailyOT, isSunday } from '@/lib/ot-calculator';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No attendance data provided' },
        { status: 400 }
      );
    }

    // Parse attendance text
    const scans = parseAttendanceText(text);

    if (scans.length === 0) {
      return NextResponse.json(
        { error: 'No valid attendance records found' },
        { status: 400 }
      );
    }

    // Get all employee IDs from database to validate
    const { data: existingEmployees } = await supabase
      .from('employees')
      .select('employee_id');

    const validEmployeeIds = new Set(
      existingEmployees?.map(e => e.employee_id) || []
    );

    // Filter scans to only include employees that exist in the system
    const validScans = scans.filter(scan => {
      if (!validEmployeeIds.has(scan.employee_id)) {
        console.warn(`Skipping employee ${scan.employee_id} - not found in employees table`);
        return false;
      }
      return true;
    });

    if (validScans.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid employees found in the attendance data',
          message: 'Please import employee data first'
        },
        { status: 400 }
      );
    }

    // Insert raw scans into database (only valid employees)
    const { error: scanError } = await supabase
      .from('attendance_scans')
      .insert(validScans.map(s => ({
        machine_id: s.machine_id,
        scan_date: s.scan_date,
        scan_time: s.scan_time,
        employee_id: s.employee_id,
        scan_type: s.scan_type,
      })));

    if (scanError) {
      console.error('Error inserting scans:', scanError);
    }

    // Group by employee and date (only valid scans)
    let dailyScans = groupScansByEmployeeAndDate(validScans);

    // Handle overnight shifts
    dailyScans = handleOvernightShifts(dailyScans);

    // Get all employee departments at once (PERFORMANCE IMPROVEMENT)
    const uniqueEmployeeIds = [...new Set(dailyScans.map(s => s.employee_id))];
    const { data: employeesData } = await supabase
      .from('employees')
      .select('employee_id, department')
      .in('employee_id', uniqueEmployeeIds);

    const employeeMap = new Map(
      employeesData?.map(e => [e.employee_id, e.department]) || []
    );

    // Get all leave records at once (PERFORMANCE IMPROVEMENT)
    const { data: leaveRecords } = await supabase
      .from('leave_records')
      .select('employee_id, leave_date')
      .in('employee_id', uniqueEmployeeIds);

    const leaveMap = new Set(
      leaveRecords?.map(l => `${l.employee_id}_${l.leave_date}`) || []
    );

    // Process each day's attendance (NO DATABASE QUERIES IN LOOP)
    const dailyAttendanceRecords = [];

    for (const scan of dailyScans) {
      const department = employeeMap.get(scan.employee_id);

      if (!department) {
        console.warn(`Employee ${scan.employee_id} not found in employee map`);
        continue;
      }

      const checkInTime = scan.check_in?.time;
      const checkOutTime = scan.check_out?.time;

      // Calculate OT
      const otCalc = calculateDailyOT(department, checkInTime, checkOutTime);

      // Check if it's a holiday (Sunday)
      const is_holiday = isSunday(scan.date);

      // Check if there's a leave record
      const leaveKey = `${scan.employee_id}_${scan.date}`;
      const is_leave = leaveMap.has(leaveKey);

      dailyAttendanceRecords.push({
        employee_id: scan.employee_id,
        work_date: scan.date,
        check_in_time: checkInTime || null,
        check_out_time: checkOutTime || null,
        scheduled_in_time: otCalc.scheduled_in,
        scheduled_out_time: otCalc.scheduled_out,
        actual_hours: 0, // Will be calculated
        ot_hours: otCalc.total_ot,
        is_holiday,
        is_leave,
        notes: null,
      });
    }

    // Upsert daily attendance records
    const { data: insertedRecords, error: dailyError } = await supabase
      .from('daily_attendance')
      .upsert(dailyAttendanceRecords, {
        onConflict: 'employee_id,work_date',
      })
      .select();

    if (dailyError) {
      console.error('Error inserting daily attendance:', dailyError);
      throw dailyError;
    }

    const skippedCount = scans.length - validScans.length;

    return NextResponse.json({
      success: true,
      scans_imported: validScans.length,
      scans_skipped: skippedCount,
      daily_records_created: insertedRecords?.length || 0,
      records: insertedRecords,
      message: skippedCount > 0
        ? `นำเข้า ${validScans.length} รายการ, ข้าม ${skippedCount} รายการ (ไม่มีรหัสพนักงานในระบบ)`
        : undefined
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
