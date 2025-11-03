import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface AttendanceScan {
  machine_id: string;
  scan_date: string;
  scan_time: string;
  employee_id: string;
  scan_type: number;
}

interface Employee {
  employee_id: string;
  department: string;
}

// แปลงเวลาเป็นนาที
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// ปัดเศษเวลาเป็น 0 หรือ 0.5 ชั่วโมง
function minutesToRoundedHours(minutes: number): number {
  if (minutes < 0) return 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const decimalPart = remainingMinutes >= 30 ? 0.5 : 0;
  return hours + decimalPart;
}

// คำนวณเวลาทำงานปกติ
function getScheduledTimes(checkInTime: string | null, department: string): { in: string; out: string } {
  if (!checkInTime) {
    return { in: '08:00:00', out: '17:30:00' };
  }

  const minutes = timeToMinutes(checkInTime);

  if (minutes >= 0 && minutes <= 300) return { in: '00:30:00', out: '05:30:00' };

  if (minutes >= 301 && minutes <= 450) {
    return department === 'ขนส่ง'
      ? { in: '08:00:00', out: '17:00:00' }
      : { in: '06:00:00', out: '17:00:00' };
  }

  if (minutes <= 480) {
    return department === 'ขนส่ง'
      ? { in: '08:00:00', out: '17:30:00' }
      : { in: '06:00:00', out: '17:30:00' };
  }

  if (minutes >= 481 && minutes <= 720) return { in: '08:00:00', out: '17:30:00' };
  if (minutes >= 721 && minutes <= 1050) return { in: '13:00:00', out: '17:30:00' };
  if (minutes >= 1051) return { in: '20:00:00', out: '05:30:00' };

  return { in: '08:00:00', out: '17:30:00' };
}

// คำนวณ OT เข้างานก่อนเวลา
function calculateOTBefore(checkIn: string, scheduledIn: string): number {
  const checkInMin = timeToMinutes(checkIn);
  const scheduledInMin = timeToMinutes(scheduledIn);

  if (checkInMin >= scheduledInMin) return 0;

  return minutesToRoundedHours(scheduledInMin - checkInMin);
}

// คำนวณ OT เลิกงานหลังเวลา (รองรับข้ามวัน)
function calculateOTAfter(
  checkOut: string,
  checkOutDate: string,
  checkInDate: string,
  scheduledOut: string
): number {
  let checkOutMin = timeToMinutes(checkOut);
  let scheduledOutMin = timeToMinutes(scheduledOut);

  // ตรวจสอบว่าเป็นกะดึกหรือไม่ (scheduled out < 12:00 หมายความว่าเป็นกะดึก)
  const isNightShift = scheduledOutMin < 720;

  // ถ้าออกงานข้ามวัน
  if (checkOutDate !== checkInDate) {
    // ถ้าเวลา check out เป็นช่วงเช้า (00:00 - 11:59)
    if (checkOutMin < 720) {
      checkOutMin += 1440; // เพิ่ม 24 ชม. เพื่อให้คำนวณได้ถูกต้อง
    }
  }

  // ถ้าเป็นกะดึก ต้อง adjust scheduled out time
  if (isNightShift) {
    scheduledOutMin += 1440; // เพิ่ม 24 ชม. สำหรับกะดึก

    // ถ้า checkout ยังไม่ถึง scheduled out
    if (checkOutMin < scheduledOutMin) return 0;

    return minutesToRoundedHours(checkOutMin - scheduledOutMin);
  }

  // กะปกติ
  if (checkOutMin <= scheduledOutMin) return 0;
  return minutesToRoundedHours(checkOutMin - scheduledOutMin);
}

// จับคู่ scan เข้า-ออก (ยึดวันที่เข้างานเป็นหลัก)
function pairScans(scans: AttendanceScan[]): Map<string, { in: AttendanceScan | null; out: AttendanceScan | null }> {
  const sorted = [...scans].sort((a, b) => {
    const dateCompare = a.scan_date.localeCompare(b.scan_date);
    if (dateCompare !== 0) return dateCompare;
    return a.scan_time.localeCompare(b.scan_time);
  });

  const pairs = new Map();
  let lastUnpairedIn: AttendanceScan | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const scan = sorted[i];

    if (scan.scan_type === 1) { // Scan เข้า
      // ถ้ามี scan เข้าค้างอยู่ ให้บันทึกโดยไม่มี scan ออก
      if (lastUnpairedIn) {
        const workDate = lastUnpairedIn.scan_date;
        if (!pairs.has(workDate)) {
          pairs.set(workDate, { in: lastUnpairedIn, out: null });
        }
      }
      lastUnpairedIn = scan;

    } else if (scan.scan_type === 2) { // Scan ออก
      if (lastUnpairedIn) {
        // ยึดวันที่ scan เข้าเป็นหลัก (ไม่ใช่วันที่ scan ออก)
        const workDate = lastUnpairedIn.scan_date;
        pairs.set(workDate, { in: lastUnpairedIn, out: scan });
        lastUnpairedIn = null;
      }
    }
  }

  // ถ้ายังมี scan เข้าค้างอยู่ (ไม่มี scan ออก)
  if (lastUnpairedIn) {
    const workDate = lastUnpairedIn.scan_date;
    pairs.set(workDate, { in: lastUnpairedIn, out: null });
  }

  return pairs;
}

// POST /api/daily-attendance/calculate
// คำนวณ OT รายวันและบันทึกลง daily_attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period_id } = body;

    if (!period_id) {
      return NextResponse.json({ error: 'period_id is required' }, { status: 400 });
    }

    // 1. ดึงข้อมูล period
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', period_id)
      .single();

    if (periodError || !period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 });
    }

    // 2. ดึงรายชื่อพนักงานทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, department');

    if (empError || !employees) {
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    // 3. ดึงข้อมูล attendance_scans ในช่วงเวลานี้
    const { data: scans, error: scansError } = await supabase
      .from('attendance_scans')
      .select('*')
      .gte('scan_date', period.start_date)
      .lte('scan_date', period.end_date)
      .order('scan_date')
      .order('scan_time');

    if (scansError) {
      return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
    }

    const results = [];

    // 4. คำนวณแต่ละพนักงาน
    for (const employee of employees) {
      const employeeScans = scans?.filter(s => s.employee_id === employee.employee_id) || [];
      const pairs = pairScans(employeeScans);

      const days = [];
      let regularOT = 0;
      let sundayOT = 0;
      let sundayOTCalculated = 0;

      // Generate วันที่ในรอบ
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const pair = pairs.get(dateStr);
        const isSunday = d.getDay() === 0;

        let otHours = 0;

        if (pair?.in) {
          const scheduled = getScheduledTimes(pair.in.scan_time, employee.department);
          const otBefore = calculateOTBefore(pair.in.scan_time, scheduled.in);

          let otAfter = 0;
          if (pair.out) {
            otAfter = calculateOTAfter(
              pair.out.scan_time,
              pair.out.scan_date,
              pair.in.scan_date,
              scheduled.out
            );
          }

          otHours = otBefore + otAfter;

          // Log สำหรับ debug (ถ้ามี OT)
          if (otHours > 0) {
            console.log(`[${employee.employee_id}] ${dateStr}: IN=${pair.in.scan_time} OUT=${pair.out?.scan_time || 'N/A'} | Scheduled=${scheduled.in}-${scheduled.out} | OT=${otHours.toFixed(2)}hrs (Before=${otBefore}, After=${otAfter})`);
          }
        }

        const actualOT = isSunday ? otHours * 3 : otHours;

        days.push({
          date: dateStr,
          ot_hours: parseFloat(otHours.toFixed(2)),
          is_sunday: isSunday,
          actual_ot: parseFloat(actualOT.toFixed(2)),
        });

        if (otHours > 0) {
          if (isSunday) {
            sundayOT += otHours;
            sundayOTCalculated += actualOT;
          } else {
            regularOT += otHours;
          }
        }
      }

      const totalOT = regularOT + sundayOTCalculated;
      const workDays = days.filter(d => d.ot_hours > 0).length;

      // 5. บันทึกลง daily_attendance
      const dayColumns: any = {};
      days.forEach((day, idx) => {
        dayColumns[`day${idx + 1}`] = day;
      });

      const { error: insertError } = await supabase
        .from('daily_attendance')
        .upsert({
          employee_id: employee.employee_id,
          period_id,
          period_start_date: period.start_date,
          period_end_date: period.end_date,
          ...dayColumns,
          total_work_days: workDays,
          regular_ot_hours: regularOT,
          sunday_ot_hours: sundayOT,
          sunday_ot_calculated: sundayOTCalculated,
          total_ot_hours: totalOT,
        }, {
          onConflict: 'employee_id,period_id'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      results.push({
        employee_id: employee.employee_id,
        total_ot_hours: totalOT,
        work_days: workDays,
      });
    }

    return NextResponse.json({
      success: true,
      period_id,
      employees_processed: results.length,
      results,
    });

  } catch (error: any) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
