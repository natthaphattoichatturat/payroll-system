/**
 * OT Calculator - Calculates overtime hours based on business rules
 */

export interface ScheduledTime {
  in_time: string; // HH:MM:SS
  out_time: string; // HH:MM:SS
}

/**
 * Calculate scheduled IN and OUT times based on department and check-in time
 *
 * Rules:
 * - 00:00:00 – 05:00:59: IN 00:30, OUT 05:30
 * - 05:01:00 – 07:30:59:
 *   - Department = "ขนส่ง": IN 08:00, OUT 17:00
 *   - Others: IN 06:00, OUT 17:00
 * - 05:01:00 – 08:00:59:
 *   - Department = "ขนส่ง": IN 08:00, OUT 17:30
 *   - Others: IN 06:00, OUT 17:30
 * - 08:01:00 – 12:00:59: IN 08:00, OUT 17:30
 * - 12:01:00 – 17:30:59: IN 13:00, OUT 17:30
 * - 17:31:00 – 23:59:59: IN 20:00, OUT 05:30
 * - No check-in: IN 08:00, OUT 17:30
 */
export function calculateScheduledTimes(
  department: string,
  checkInTime?: string
): ScheduledTime {
  if (!checkInTime) {
    return { in_time: '08:00:00', out_time: '17:30:00' };
  }

  const [hours, minutes] = checkInTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  // 00:00:00 – 05:00:59
  if (totalMinutes >= 0 && totalMinutes <= 5 * 60 + 59) {
    return { in_time: '00:30:00', out_time: '05:30:00' };
  }

  // 05:01:00 – 07:30:59
  if (totalMinutes >= 5 * 60 + 1 && totalMinutes <= 7 * 60 + 30) {
    if (department === 'ขนส่ง') {
      return { in_time: '08:00:00', out_time: '17:00:00' };
    }
    return { in_time: '06:00:00', out_time: '17:00:00' };
  }

  // 07:31:00 – 08:00:59
  if (totalMinutes >= 7 * 60 + 31 && totalMinutes <= 8 * 60 + 59) {
    if (department === 'ขนส่ง') {
      return { in_time: '08:00:00', out_time: '17:30:00' };
    }
    return { in_time: '06:00:00', out_time: '17:30:00' };
  }

  // 08:01:00 – 12:00:59
  if (totalMinutes >= 8 * 60 + 1 && totalMinutes <= 12 * 60 + 59) {
    return { in_time: '08:00:00', out_time: '17:30:00' };
  }

  // 12:01:00 – 17:30:59
  if (totalMinutes >= 12 * 60 + 1 && totalMinutes <= 17 * 60 + 30) {
    return { in_time: '13:00:00', out_time: '17:30:00' };
  }

  // 17:31:00 – 23:59:59
  return { in_time: '20:00:00', out_time: '05:30:00' };
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Round minutes to nearest 0.5 hour
 * - < 30 minutes: round to 0
 * - >= 30 minutes: round to 0.5
 */
function roundToHalfHour(minutes: number): number {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes < 30) {
    return hours;
  } else {
    return hours + 0.5;
  }
}

/**
 * Calculate OT hours for early arrival (before scheduled IN time)
 */
function calculateEarlyOT(checkInTime: string, scheduledInTime: string): number {
  const checkIn = timeToMinutes(checkInTime);
  const scheduledIn = timeToMinutes(scheduledInTime);

  if (checkIn >= scheduledIn) {
    return 0; // No early OT
  }

  const diffMinutes = scheduledIn - checkIn;
  return roundToHalfHour(diffMinutes);
}

/**
 * Calculate OT hours for late departure (after scheduled OUT time)
 * Handles overnight shifts
 */
function calculateLateOT(
  checkOutTime: string,
  scheduledOutTime: string,
  isOvernightShift: boolean
): number {
  let checkOut = timeToMinutes(checkOutTime);
  let scheduledOut = timeToMinutes(scheduledOutTime);

  // Handle overnight shift (e.g., OUT time is 05:30, which is next day)
  if (isOvernightShift && scheduledOut < 12 * 60) {
    scheduledOut += 24 * 60; // Add 24 hours
  }

  if (isOvernightShift && checkOut < 12 * 60) {
    checkOut += 24 * 60; // Add 24 hours
  }

  if (checkOut <= scheduledOut) {
    return 0; // No late OT
  }

  const diffMinutes = checkOut - scheduledOut;
  return roundToHalfHour(diffMinutes);
}

/**
 * Check if it's an overnight shift based on scheduled times
 */
function isOvernightShift(scheduledOutTime: string): boolean {
  const outHour = parseInt(scheduledOutTime.split(':')[0]);
  return outHour < 12; // OUT time before noon indicates overnight shift
}

/**
 * Calculate total OT hours for a work day
 */
export interface OTCalculation {
  early_ot: number;
  late_ot: number;
  total_ot: number;
  scheduled_in: string;
  scheduled_out: string;
}

export function calculateDailyOT(
  department: string,
  checkInTime?: string,
  checkOutTime?: string
): OTCalculation {
  const scheduled = calculateScheduledTimes(department, checkInTime);

  let early_ot = 0;
  let late_ot = 0;

  if (checkInTime) {
    early_ot = calculateEarlyOT(checkInTime, scheduled.in_time);
  }

  if (checkOutTime) {
    const overnight = isOvernightShift(scheduled.out_time);
    late_ot = calculateLateOT(checkOutTime, scheduled.out_time, overnight);
  }

  return {
    early_ot,
    late_ot,
    total_ot: early_ot + late_ot,
    scheduled_in: scheduled.in_time,
    scheduled_out: scheduled.out_time,
  };
}

/**
 * Check if a date is Sunday (holiday)
 */
export function isSunday(date: string): boolean {
  const d = new Date(date);
  return d.getDay() === 0;
}

/**
 * Calculate OT summary for a period
 */
export interface OTSummary {
  total_work_days: number;
  regular_ot_hours: number; // Mon-Sat
  holiday_ot_hours: number; // Sunday (multiplied by 3)
  total_ot_hours: number;
}

export interface DailyOTRecord {
  date: string;
  ot_hours: number;
  is_holiday: boolean;
}

export function calculateOTSummary(dailyRecords: DailyOTRecord[]): OTSummary {
  let regular_ot_hours = 0;
  let holiday_ot_hours = 0;

  for (const record of dailyRecords) {
    if (record.is_holiday) {
      // Sunday OT is multiplied by 3
      holiday_ot_hours += record.ot_hours * 3;
    } else {
      regular_ot_hours += record.ot_hours;
    }
  }

  return {
    total_work_days: dailyRecords.length,
    regular_ot_hours,
    holiday_ot_hours,
    total_ot_hours: regular_ot_hours + holiday_ot_hours,
  };
}

/**
 * Calculate actual working hours (excluding OT)
 */
export function calculateActualHours(
  checkInTime?: string,
  checkOutTime?: string,
  scheduledInTime?: string,
  scheduledOutTime?: string
): number {
  if (!checkInTime || !checkOutTime || !scheduledInTime || !scheduledOutTime) {
    return 0;
  }

  const checkIn = timeToMinutes(checkInTime);
  let checkOut = timeToMinutes(checkOutTime);
  const scheduledIn = timeToMinutes(scheduledInTime);
  let scheduledOut = timeToMinutes(scheduledOutTime);

  // Handle overnight shift
  if (isOvernightShift(scheduledOutTime)) {
    scheduledOut += 24 * 60;
    if (checkOut < 12 * 60) {
      checkOut += 24 * 60;
    }
  }

  // Use scheduled times as bounds
  const actualIn = Math.max(checkIn, scheduledIn);
  const actualOut = Math.min(checkOut, scheduledOut);

  if (actualOut <= actualIn) {
    return 0;
  }

  const minutes = actualOut - actualIn;
  return Math.round((minutes / 60) * 10) / 10; // Round to 1 decimal
}
