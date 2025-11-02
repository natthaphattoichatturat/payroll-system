'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';
import { PeriodSelector } from '@/components/shared/period-selector';
import { EmployeeSearch } from '@/components/shared/employee-search';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Building2,
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useTableSort } from '@/hooks/use-table-sort';

interface PayrollPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: string;
}

interface PayrollCalculation {
  id: number;
  employee_id: string;
  total_ot_hours: number;
  ot_amount: number;
  base_salary: number;
  gross_salary: number;
  net_salary: number;
  employees?: {
    name: string;
    department: string;
  };
}

interface Stats {
  top_ot: Array<{ employee_id: string; name: string; ot_hours: number; ot_amount: number }>;
  low_ot: Array<{ employee_id: string; name: string; ot_hours: number; ot_amount: number }>;
  department_avg: Array<{ department: string; avg_ot_hours: number; employee_count: number }>;
  financial_summary: {
    total_ot_amount: number;
    total_base_salary: number;
    total_gross: number;
    total_net: number;
    total_tax: number;
    total_social_security: number;
  };
}

interface LeaveStats {
  top_leave: Array<{ employee_id: string; name: string; leave_count: number }>;
  low_leave: Array<{ employee_id: string; name: string; leave_count: number }>;
  total_leaves: number;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<PayrollCalculation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptSortAsc, setDeptSortAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPayrollData();
      fetchStats();
      fetchLeaveStats();
    }
  }, [selectedPeriod]);

  useEffect(() => {
    filterCalculations();
  }, [calculations, searchTerm]);

  const fetchPayrollData = async () => {
    if (!selectedPeriod) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/payroll/${selectedPeriod.id}`);
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedPeriod) return;

    try {
      const response = await fetch(`/api/stats/payroll?period_id=${selectedPeriod.id}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaveStats = async () => {
    if (!selectedPeriod) return;

    try {
      const response = await fetch(
        `/api/stats/leave?start_date=${selectedPeriod.start_date}&end_date=${selectedPeriod.end_date}`
      );
      const data = await response.json();
      setLeaveStats(data);
    } catch (error) {
      console.error('Error fetching leave stats:', error);
    }
  };

  const filterCalculations = () => {
    if (!searchTerm) {
      setFilteredCalculations(calculations);
      return;
    }

    const filtered = calculations.filter(
      c =>
        c.employee_id.includes(searchTerm) ||
        c.employees?.name.includes(searchTerm)
    );
    setFilteredCalculations(filtered);
  };

  // Use table sort hook
  const { sortedData, handleSort, getSortIcon, clearSort } = useTableSort(filteredCalculations);

  const toggleDeptSort = () => {
    setDeptSortAsc(!deptSortAsc);
  };

  const sortedDeptAvg = stats?.department_avg
    ? [...stats.department_avg].sort((a, b) =>
        deptSortAsc
          ? a.avg_ot_hours - b.avg_ot_hours
          : b.avg_ot_hours - a.avg_ot_hours
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Compact Header with Period Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">ระบบคำนวณเงินเดือน</h1>
            <p className="mt-1 text-sm text-blue-100">
              ภาพรวมข้อมูลเงินเดือนพนักงาน
            </p>
          </div>
          <div className="w-80">
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <>
          {/* Payroll Table - MOVED TO TOP */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Users className="h-5 w-5" />
                    รายการเงินเดือนพนักงาน
                  </CardTitle>
                  <CardDescription>
                    รอบ: {selectedPeriod.period_name} | พนักงาน {filteredCalculations.length} คน
                  </CardDescription>
                </div>
                <Link href={`/payroll?period_id=${selectedPeriod.id}`}>
                  <Button variant="outline" className="gap-2">
                    ดูรายละเอียดเต็ม
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <EmployeeSearch onSearch={setSearchTerm} />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto relative">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                      <TableRow className="group">
                      <SortableTableHeader
                        columnKey="employee_id"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        รหัส
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="employees.name"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        ชื่อ-นามสกุล
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="employees.department"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        แผนก
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="total_ot_hours"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                        align="right"
                      >
                        OT (ชม.)
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="ot_amount"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                        align="right"
                      >
                        ค่า OT
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="gross_salary"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                        align="right"
                      >
                        Gross
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="net_salary"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                        align="right"
                      >
                        Net
                      </SortableTableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          กำลังโหลดข้อมูล...
                        </TableCell>
                      </TableRow>
                    ) : sortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedData.map((calc) => (
                        <TableRow key={calc.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium">{calc.employee_id}</TableCell>
                          <TableCell className="font-medium">{calc.employees?.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {calc.employees?.department}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {calc.total_ot_hours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {formatCurrency(calc.ot_amount)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(calc.gross_salary)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {formatCurrency(calc.net_salary)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary - MOVED BELOW TABLE */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    เงินเดือนฐาน (ทั้งหมด)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.financial_summary.total_base_salary)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ไม่รวมค่า OT
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    ค่า OT (ทั้งหมด)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.financial_summary.total_ot_amount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ค่าล่วงเวลาทั้งหมด
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    รวม (ก่อนหัก)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.financial_summary.total_gross)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Gross Salary
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    รวม (สุทธิ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.financial_summary.total_net)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    หลังหักภาษี + ประกันสังคม
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Top OT */}
            {stats && stats.top_ot.length > 0 && (
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                    Top 5 OT สูงสุด
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {stats.top_ot.map((emp, idx) => (
                      <div key={emp.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-500">{emp.employee_id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{emp.ot_hours.toFixed(1)} ชม.</div>
                          <div className="text-xs text-gray-500">{formatCurrency(emp.ot_amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low OT */}
            {stats && stats.low_ot.length > 0 && (
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <TrendingDown className="h-5 w-5" />
                    Top 5 OT ต่ำสุด
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {stats.low_ot.map((emp, idx) => (
                      <div key={emp.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-500">{emp.employee_id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{emp.ot_hours.toFixed(1)} ชม.</div>
                          <div className="text-xs text-gray-500">{formatCurrency(emp.ot_amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Department Average */}
            {stats && sortedDeptAvg.length > 0 && (
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Building2 className="h-5 w-5" />
                      OT เฉลี่ยแต่ละแผนก
                    </CardTitle>
                    <button
                      onClick={toggleDeptSort}
                      className="p-1 hover:bg-purple-100 rounded transition-colors"
                    >
                      {deptSortAsc ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                    {sortedDeptAvg.map((dept) => (
                      <div key={dept.department} className="p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">{dept.department}</div>
                          <div className="text-sm text-gray-500">({dept.employee_count} คน)</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((dept.avg_ot_hours / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="font-bold text-purple-600 min-w-[60px] text-right">
                            {dept.avg_ot_hours.toFixed(1)} ชม.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Leave Statistics */}
          {leaveStats && (leaveStats.top_leave.length > 0 || leaveStats.low_leave.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Leaves */}
              {leaveStats.top_leave.length > 0 && (
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <Calendar className="h-5 w-5" />
                      ลางานมากที่สุด 5 อันดับ
                    </CardTitle>
                    <CardDescription>
                      รอบ: {selectedPeriod.period_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {leaveStats.top_leave.map((emp, idx) => (
                        <div key={emp.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.employee_id}</div>
                            </div>
                          </div>
                          <div className="font-bold text-orange-600">{emp.leave_count} วัน</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Low Leaves */}
              {leaveStats.low_leave.length > 0 && (
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                    <CardTitle className="flex items-center gap-2 text-teal-700">
                      <Calendar className="h-5 w-5" />
                      ลางานน้อยที่สุด 5 อันดับ
                    </CardTitle>
                    <CardDescription>
                      รอบ: {selectedPeriod.period_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {leaveStats.low_leave.map((emp, idx) => (
                        <div key={emp.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.employee_id}</div>
                            </div>
                          </div>
                          <div className="font-bold text-teal-600">{emp.leave_count} วัน</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {!selectedPeriod && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-20 pb-20 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              เลือกรอบเงินเดือนเพื่อดูข้อมูล
            </h3>
            <p className="text-gray-500">
              กรุณาเลือกรอบเงินเดือนจากด้านบนเพื่อแสดงข้อมูลสรุป
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
