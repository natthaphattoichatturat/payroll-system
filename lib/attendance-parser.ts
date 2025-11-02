/**
 * Parse attendance scan data from text format
 * Format: machine_id  date  time  employee_id  scan_type
 * Example: 01  11-10-2025  00:27:19  '20056402  1
 */

export interface ParsedScan {
  machine_id: string;
  scan_date: string; // YYYY-MM-DD format
  scan_time: string; // HH:MM:SS format
  employee_id: string;
  scan_type: 1 | 2; // 1 = IN, 2 = OUT
}

export function parseAttendanceText(text: string): ParsedScan[] {
  const lines = text.trim().split('\n');
  const scans: ParsedScan[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Split by tabs or multiple spaces
    const parts = line.split(/\s+/).filter(part => part.length > 0);

    if (parts.length < 5) {
      console.warn('Invalid line format:', line);
      continue;
    }

    const [machine_id, date, time, employee_id_raw, scan_type_raw] = parts;

    // Parse date from DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = date.split('-');
    const scan_date = `${year}-${month}-${day}`;

    // Remove leading apostrophe from employee_id if present
    const employee_id = employee_id_raw.replace(/^'/, '');

    // Parse scan type
    const scan_type = parseInt(scan_type_raw) as 1 | 2;

    if (![1, 2].includes(scan_type)) {
      console.warn('Invalid scan type:', line);
      continue;
    }

    scans.push({
      machine_id,
      scan_date,
      scan_time: time,
      employee_id,
      scan_type,
    });
  }

  return scans;
}

/**
 * Group scans by employee and date
 */
export interface DailyScans {
  employee_id: string;
  date: string;
  check_in?: { time: string; machine_id: string };
  check_out?: { time: string; machine_id: string };
  all_scans: ParsedScan[];
}

export function groupScansByEmployeeAndDate(scans: ParsedScan[]): DailyScans[] {
  const grouped = new Map<string, DailyScans>();

  for (const scan of scans) {
    const key = `${scan.employee_id}_${scan.scan_date}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        employee_id: scan.employee_id,
        date: scan.scan_date,
        all_scans: [],
      });
    }

    const entry = grouped.get(key)!;
    entry.all_scans.push(scan);

    if (scan.scan_type === 1) {
      // Check-in: use earliest time
      if (!entry.check_in || scan.scan_time < entry.check_in.time) {
        entry.check_in = { time: scan.scan_time, machine_id: scan.machine_id };
      }
    } else if (scan.scan_type === 2) {
      // Check-out: use latest time
      if (!entry.check_out || scan.scan_time > entry.check_out.time) {
        entry.check_out = { time: scan.scan_time, machine_id: scan.machine_id };
      }
    }
  }

  return Array.from(grouped.values());
}

/**
 * Handle overnight shifts
 * If check-out is before check-in (time-wise), it means the shift crossed midnight
 */
export function handleOvernightShifts(dailyScans: DailyScans[]): DailyScans[] {
  // Sort by employee and date
  const sorted = [...dailyScans].sort((a, b) => {
    if (a.employee_id !== b.employee_id) {
      return a.employee_id.localeCompare(b.employee_id);
    }
    return a.date.localeCompare(b.date);
  });

  const result: DailyScans[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // If current has check-in but no check-out, look for check-out on next day
    if (current.check_in && !current.check_out) {
      const nextDay = new Date(current.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      // Find next day's scans for same employee
      const nextDayScan = sorted.find(
        s => s.employee_id === current.employee_id && s.date === nextDayStr
      );

      if (nextDayScan?.check_out && !nextDayScan.check_in) {
        // Move check-out to current day
        current.check_out = nextDayScan.check_out;
        // Mark next day scan as processed (we'll skip it)
        nextDayScan.all_scans = [];
      }
    }

    // Only add if there are scans (not processed)
    if (current.all_scans.length > 0 || current.check_in || current.check_out) {
      result.push(current);
    }
  }

  return result;
}
