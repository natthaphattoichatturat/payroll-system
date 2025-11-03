'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';
import { PeriodSelector } from '@/components/shared/period-selector';
import { EmployeeSearch } from '@/components/shared/employee-search';
import { DateRangePicker } from '@/components/shared/date-range-picker';
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
import { PayrollCardView } from '@/components/payroll/payroll-card-view';
import { useLanguage } from '@/contexts/language-context';
import { getDayColor, parseDate, getDayName } from '@/lib/date-utils';

interface PayrollPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: string;
}

interface DayData {
  date: string;
  ot_hours: number;
  is_sunday: boolean;
  actual_ot: number;
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
  daily_attendance?: {
    day1?: DayData | null;
    day2?: DayData | null;
    day3?: DayData | null;
    day4?: DayData | null;
    day5?: DayData | null;
    day6?: DayData | null;
    day7?: DayData | null;
    day8?: DayData | null;
    day9?: DayData | null;
    day10?: DayData | null;
    day11?: DayData | null;
    day12?: DayData | null;
    day13?: DayData | null;
    day14?: DayData | null;
    day15?: DayData | null;
    total_ot_hours?: number;
    regular_ot_hours?: number;
    sunday_ot_calculated?: number;
  } | null;
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

interface LeaveRecord {
  id: number;
  employee_id: string;
  leave_date: string;
  leave_type: string;
  reason?: string;
  employees?: {
    name: string;
    department: string;
  };
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<PayrollCalculation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [filteredLeaveRecords, setFilteredLeaveRecords] = useState<LeaveRecord[]>([]);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptSortAsc, setDeptSortAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPayrollData();
      fetchStats();
      fetchLeaveStats();
      fetchLeaveRecords();
    }
  }, [selectedPeriod]);

  useEffect(() => {
    filterCalculations();
  }, [calculations, searchTerm]);

  useEffect(() => {
    filterLeaveRecords();
  }, [leaveRecords, leaveStartDate, leaveEndDate]);

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

  const fetchLeaveRecords = async () => {
    try {
      const response = await fetch('/api/leave');
      const data = await response.json();
      setLeaveRecords(data);
    } catch (error) {
      console.error('Error fetching leave records:', error);
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

  const filterLeaveRecords = () => {
    let filtered = [...leaveRecords];

    // Filter by date range
    if (leaveStartDate) {
      filtered = filtered.filter(
        (leave) => new Date(leave.leave_date) >= new Date(leaveStartDate)
      );
    }

    if (leaveEndDate) {
      filtered = filtered.filter(
        (leave) => new Date(leave.leave_date) <= new Date(leaveEndDate)
      );
    }

    setFilteredLeaveRecords(filtered);
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('home.title')}</h1>
            <p className="mt-1 text-sm text-blue-100">
              {t('home.subtitle')}
            </p>
          </div>
          <div className="w-full lg:w-80">
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
                    {t('payroll.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('payroll.period')}: {selectedPeriod.period_name} | {t('payroll.employees')} {filteredCalculations.length} {t('payroll.people')}
                  </CardDescription>
                </div>
                <Link href={`/payroll?period_id=${selectedPeriod.id}`}>
                  <Button variant="outline" className="gap-2">
                    {t('payroll.viewDetails')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <EmployeeSearch onSearch={setSearchTerm} />
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden max-h-[500px] overflow-y-auto">
                <PayrollCardView
                  data={sortedData}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                />
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-x-auto overflow-y-auto relative">
                  <Table className="min-w-[1800px]">
                    <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                      <TableRow className="group">
                      <SortableTableHeader
                        columnKey="employee_id"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        {t('payroll.empId')}
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="employees.name"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        {t('payroll.name')}
                      </SortableTableHeader>
                      <SortableTableHeader
                        columnKey="employees.department"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      >
                        {t('payroll.department')}
                      </SortableTableHeader>
                      {/* 15 Day Columns */}
                      {Array.from({ length: 15 }, (_, i) => {
                        const dayKey = `day${i + 1}` as keyof typeof sortedData[0]['daily_attendance'];
                        const sampleDayData = sortedData[0]?.daily_attendance?.[dayKey] as DayData | null | undefined;
                        const date = sampleDayData?.date;

                        let bgColor = 'bg-white';
                        let dayName = '';
                        let dayNum = i + 11; // Days 11-25 for first half

                        if (date) {
                          const { year, month, day } = parseDate(date);
                          bgColor = getDayColor(year, month, day);
                          dayName = getDayName(year, month, day, t('lang.code') as 'th' | 'en' | 'cn');
                          dayNum = day;
                        }

                        return (
                          <TableCell key={i} className={`text-center font-semibold text-xs ${bgColor} border-l`}>
                            <div>{t('payroll.day')} {dayNum}</div>
                            {dayName && <div className="text-[10px] text-gray-500">{dayName}</div>}
                          </TableCell>
                        );
                      })}
                      <SortableTableHeader
                        columnKey="total_ot_hours"
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                        align="right"
                      >
                        {t('payroll.totalOT')}
                      </SortableTableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={19} className="text-center py-8 text-gray-500">
                          {t('payroll.loading')}
                        </TableCell>
                      </TableRow>
                    ) : sortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={19} className="text-center py-8 text-gray-500">
                          {searchTerm ? t('payroll.noResults') : t('payroll.noData')}
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
                          {/* 15 Day Cells */}
                          {Array.from({ length: 15 }, (_, i) => {
                            const dayKey = `day${i + 1}` as keyof typeof calc['daily_attendance'];
                            const dayData = calc.daily_attendance?.[dayKey] as DayData | null | undefined;
                            const otHours = dayData?.actual_ot || 0;

                            let bgColor = 'bg-white';
                            if (dayData?.date) {
                              const { year, month, day } = parseDate(dayData.date);
                              bgColor = getDayColor(year, month, day);
                            }

                            return (
                              <TableCell key={i} className={`text-center text-sm ${bgColor} border-l`}>
                                {otHours > 0 ? (
                                  <span className={dayData?.is_sunday ? 'font-bold text-red-600' : 'text-gray-700'}>
                                    {otHours.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right font-bold text-blue-600 border-l">
                            {calc.daily_attendance?.total_ot_hours?.toFixed(1) || '0.0'}
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

          {/* Leave Records Table */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Calendar className="h-5 w-5" />
                    {t('leave.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('leave.subtitle')}
                  </CardDescription>
                </div>
                <Link href="/leave">
                  <Button variant="outline" className="gap-2">
                    {t('leave.manage')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Date Range Filter */}
              <div className="mb-4 flex items-center gap-3">
                <DateRangePicker
                  startDate={leaveStartDate}
                  endDate={leaveEndDate}
                  onStartDateChange={setLeaveStartDate}
                  onEndDateChange={setLeaveEndDate}
                  onClear={() => {
                    setLeaveStartDate('');
                    setLeaveEndDate('');
                  }}
                />
                <div className="text-sm text-gray-600">
                  {t('leave.showing')} {filteredLeaveRecords.length} {t('leave.items')}
                  {(leaveStartDate || leaveEndDate) && ` (${t('leave.outOf')} ${leaveRecords.length} ${t('leave.items')})`}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto relative">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                      <TableRow>
                        <TableCell className="text-left font-semibold">{t('leave.date')}</TableCell>
                        <TableCell className="text-left font-semibold">{t('leave.empId')}</TableCell>
                        <TableCell className="text-left font-semibold">{t('leave.empName')}</TableCell>
                        <TableCell className="text-left font-semibold">{t('leave.department')}</TableCell>
                        <TableCell className="text-left font-semibold">{t('leave.type')}</TableCell>
                        <TableCell className="text-left font-semibold">{t('leave.reason')}</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaveRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {leaveRecords.length === 0 ? t('leave.noLeaves') : t('leave.noLeavesInRange')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeaveRecords.map((leave) => (
                          <TableRow key={leave.id} className="hover:bg-amber-50">
                            <TableCell className="font-medium">
                              {new Date(leave.leave_date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{leave.employee_id}</TableCell>
                            <TableCell>{leave.employees?.name || '-'}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {leave.employees?.department || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                leave.leave_type === 'Sick'
                                  ? 'bg-red-100 text-red-700'
                                  : leave.leave_type === 'Personal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : leave.leave_type === 'Vacation'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {leave.leave_type === 'Sick' ? t('leave.typeSick') :
                                 leave.leave_type === 'Personal' ? t('leave.typePersonal') :
                                 leave.leave_type === 'Vacation' ? t('leave.typeVacation') :
                                 leave.leave_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {leave.reason || '-'}
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
                    {t('finance.baseSalary')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.financial_summary.total_base_salary)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('finance.baseSalaryDesc')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t('finance.otTotal')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.financial_summary.total_ot_amount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('finance.otTotalDesc')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t('finance.grossTotal')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.financial_summary.total_gross)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('finance.grossSalary')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t('finance.netTotal')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.financial_summary.total_net)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('finance.netDesc')}
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
                    {t('stats.topOT')}
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
                          <div className="font-bold text-green-600">{emp.ot_hours.toFixed(1)} {t('stats.hours')}</div>
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
                    {t('stats.lowOT')}
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
                          <div className="font-bold text-blue-600">{emp.ot_hours.toFixed(1)} {t('stats.hours')}</div>
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
                      {t('stats.deptAvgOT')}
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
                            {dept.avg_ot_hours.toFixed(1)} {t('stats.hours')}
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
                      {t('stats.topLeave')}
                    </CardTitle>
                    <CardDescription>
                      {t('payroll.period')}: {selectedPeriod.period_name}
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
                          <div className="font-bold text-orange-600">{emp.leave_count} {t('stats.days')}</div>
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
                      {t('stats.lowLeave')}
                    </CardTitle>
                    <CardDescription>
                      {t('payroll.period')}: {selectedPeriod.period_name}
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
                          <div className="font-bold text-teal-600">{emp.leave_count} {t('stats.days')}</div>
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
              {t('home.selectPeriod')}
            </h3>
            <p className="text-gray-500">
              {t('home.selectPeriodDesc')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
