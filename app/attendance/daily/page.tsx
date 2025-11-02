'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatTime } from '@/lib/utils';
import { Search, Calendar } from 'lucide-react';

interface DailyAttendance {
  id: number;
  employee_id: string;
  work_date: string;
  check_in_time?: string;
  check_out_time?: string;
  scheduled_in_time?: string;
  scheduled_out_time?: string;
  ot_hours: number;
  is_holiday: boolean;
  is_leave: boolean;
  employees?: {
    name: string;
    department: string;
  };
}

export default function DailyAttendancePage() {
  const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
  const [filteredData, setFilteredData] = useState<DailyAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    filterData();
  }, [attendance, searchTerm, startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/daily');
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...attendance];

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.employee_id.includes(searchTerm) ||
          a.employees?.name.includes(searchTerm)
      );
    }

    if (startDate) {
      filtered = filtered.filter((a) => a.work_date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((a) => a.work_date <= endDate);
    }

    setFilteredData(filtered);
  };

  const calculateTotals = () => {
    const totalOT = filteredData.reduce((sum, a) => sum + a.ot_hours, 0);
    const regularOT = filteredData
      .filter((a) => !a.is_holiday)
      .reduce((sum, a) => sum + a.ot_hours, 0);
    const holidayOT = filteredData
      .filter((a) => a.is_holiday)
      .reduce((sum, a) => sum + a.ot_hours * 3, 0);

    return {
      total: totalOT,
      regular: regularOT,
      holiday: holidayOT,
      combined: regularOT + holidayOT,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          รายละเอียดเวลาทำงานรายวัน
        </h1>
        <p className="mt-2 text-gray-600">
          ดูรายละเอียดการเข้า-ออกงาน และชั่วโมง OT ของแต่ละวัน
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหาพนักงาน
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ชื่อหรือรหัสพนักงาน"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-500">รวมวันทำงาน</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">OT ปกติ</p>
              <p className="text-2xl font-bold text-blue-600">
                {totals.regular.toFixed(1)} ชม.
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">OT วันหยุด (x3)</p>
              <p className="text-2xl font-bold text-purple-600">
                {totals.holiday.toFixed(1)} ชม.
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">รวมทั้งหมด</p>
              <p className="text-2xl font-bold text-green-600">
                {totals.combined.toFixed(1)} ชม.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการเวลาทำงาน</CardTitle>
          <CardDescription>
            แสดง {filteredData.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>รหัสพนักงาน</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>เวลาเข้า</TableHead>
                <TableHead>เวลาออก</TableHead>
                <TableHead>กำหนดเข้า</TableHead>
                <TableHead>กำหนดออก</TableHead>
                <TableHead className="text-right">OT (ชม.)</TableHead>
                <TableHead className="text-center">วันหยุด</TableHead>
                <TableHead className="text-center">ลา</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    กำลังโหลด...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {new Date(record.work_date).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>{record.employee_id}</TableCell>
                    <TableCell>{record.employees?.name}</TableCell>
                    <TableCell>{record.employees?.department}</TableCell>
                    <TableCell>
                      {record.check_in_time ? formatTime(record.check_in_time) : '-'}
                    </TableCell>
                    <TableCell>
                      {record.check_out_time ? formatTime(record.check_out_time) : '-'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {record.scheduled_in_time ? formatTime(record.scheduled_in_time) : '-'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {record.scheduled_out_time ? formatTime(record.scheduled_out_time) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {record.ot_hours.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.is_holiday && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                          วันอาทิตย์
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.is_leave && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                          ลา
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
