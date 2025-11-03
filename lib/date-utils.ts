/**
 * Utility functions for date handling and day color coding
 */

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  return date.getDay();
}

/**
 * Get background color class based on day of week (very light colors)
 */
export function getDayColor(year: number, month: number, day: number): string {
  const dayOfWeek = getDayOfWeek(year, month, day);
  const colors: Record<number, string> = {
    0: 'bg-red-50',      // Sunday - light red
    1: 'bg-yellow-50',   // Monday - light yellow
    2: 'bg-pink-50',     // Tuesday - light pink
    3: 'bg-green-50',    // Wednesday - light green
    4: 'bg-orange-50',   // Thursday - light orange
    5: 'bg-blue-50',     // Friday - light blue
    6: 'bg-purple-50',   // Saturday - light purple
  };
  return colors[dayOfWeek] || 'bg-white';
}

/**
 * Get abbreviated day name in specified language
 */
export function getDayName(year: number, month: number, day: number, language: 'th' | 'en' | 'cn'): string {
  const dayOfWeek = getDayOfWeek(year, month, day);
  const dayNames = {
    th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cn: ['日', '一', '二', '三', '四', '五', '六'],
  };
  return dayNames[language][dayOfWeek];
}

/**
 * Parse date string (YYYY-MM-DD) to year, month, day
 */
export function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}
