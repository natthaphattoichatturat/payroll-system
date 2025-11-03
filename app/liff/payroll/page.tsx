'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DailyData {
  date: string;
  ot_hours: number;
  is_sunday: boolean;
  actual_ot: number;
}

interface EmployeeOT {
  employee_id: string;
  employee_name: string;
  department: string;
  day1?: DailyData;
  day2?: DailyData;
  day3?: DailyData;
  day4?: DailyData;
  day5?: DailyData;
  day6?: DailyData;
  day7?: DailyData;
  day8?: DailyData;
  day9?: DailyData;
  day10?: DailyData;
  day11?: DailyData;
  day12?: DailyData;
  day13?: DailyData;
  day14?: DailyData;
  day15?: DailyData;
  total_ot_hours: number;
}

type SortField = 'employee_name' | 'department' | 'total_ot_hours';
type SortDirection = 'asc' | 'desc';

export default function LIFFPayrollPage() {
  const [employees, setEmployees] = useState<EmployeeOT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('employee_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const itemsPerPage = 10;

  useEffect(() => {
    // Initialize LIFF
    const initializeLiff = async () => {
      const liff = (await import('@line/liff')).default;

      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' });

        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          fetchEmployeeData();
        }
      } catch (err) {
        console.error('LIFF initialization failed', err);
        // Continue to fetch data even if LIFF init fails (for development)
        fetchEmployeeData();
      }
    };

    initializeLiff();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);

      // Get latest period
      const { data: periods, error: periodError } = await supabase
        .from('payroll_periods')
        .select('*')
        .order('start_date', { ascending: false })
        .limit(1);

      if (periodError) throw periodError;
      if (!periods || periods.length === 0) {
        setError('ไม่พบข้อมูลรอบเงินเดือน');
        setLoading(false);
        return;
      }

      const latestPeriod = periods[0];

      // Get daily attendance data
      const { data: attendance, error: attendanceError } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('period_id', latestPeriod.id);

      if (attendanceError) throw attendanceError;

      // Get employee details
      const employeeIds = attendance?.map((a) => a.employee_id) || [];
      const { data: employeeDetails, error: employeeError } = await supabase
        .from('employees')
        .select('employee_id, name, department')
        .in('employee_id', employeeIds);

      if (employeeError) throw employeeError;

      // Combine data
      const employeeMap = new Map(
        employeeDetails?.map((emp) => [emp.employee_id, emp]) || []
      );

      const combinedData: EmployeeOT[] =
        attendance?.map((att) => {
          const emp = employeeMap.get(att.employee_id);
          return {
            employee_id: att.employee_id,
            employee_name: emp?.name || att.employee_id,
            department: emp?.department || '-',
            day1: att.day1,
            day2: att.day2,
            day3: att.day3,
            day4: att.day4,
            day5: att.day5,
            day6: att.day6,
            day7: att.day7,
            day8: att.day8,
            day9: att.day9,
            day10: att.day10,
            day11: att.day11,
            day12: att.day12,
            day13: att.day13,
            day14: att.day14,
            day15: att.day15,
            total_ot_hours: att.total_ot_hours || 0,
          };
        }) || [];

      setEmployees(combinedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setLoading(false);
    }
  };

  // Sort employees
  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold text-center">รายงาน OT พนักงาน</h1>
        <p className="text-sm text-center mt-1 text-blue-100">
          ทั้งหมด {employees.length} คน
        </p>
      </div>

      {/* Sort Controls */}
      <div className="bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เรียงตาม:
            </label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="employee_name">ชื่อพนักงาน</option>
              <option value="department">แผนก</option>
              <option value="total_ot_hours">OT รวม</option>
            </select>
          </div>

          <button
            onClick={toggleSortDirection}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm font-medium">
              {sortDirection === 'asc' ? '↑ น้อย → มาก' : '↓ มาก → น้อย'}
            </span>
          </button>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="p-4 space-y-4">
        {currentEmployees.map((emp) => (
          <div
            key={emp.employee_id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Employee Info */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
              <h2 className="font-bold text-lg">{emp.employee_name}</h2>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-blue-100">{emp.employee_id}</span>
                <span className="text-sm bg-blue-700 px-2 py-1 rounded">
                  {emp.department}
                </span>
              </div>
            </div>

            {/* OT Grid */}
            <div className="p-4">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 15 }, (_, i) => {
                  const dayKey = `day${i + 1}` as keyof EmployeeOT;
                  const dayData = emp[dayKey] as DailyData | undefined;
                  const ot = dayData?.actual_ot || 0;
                  const isSunday = dayData?.is_sunday || false;

                  return (
                    <div
                      key={i}
                      className={`text-center p-2 rounded ${
                        ot > 0
                          ? isSunday
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-green-100 border border-green-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        วันที่ {i + 1}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isSunday && ot > 0 ? 'text-red-700' : 'text-gray-800'
                        }`}
                      >
                        {ot > 0 ? ot.toFixed(1) : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total OT */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">OT รวม:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {emp.total_ot_hours.toFixed(1)} ชม.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              ← ก่อนหน้า
            </button>

            <span className="text-sm font-medium text-gray-700">
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
