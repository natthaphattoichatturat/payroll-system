'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/shared/date-range-picker';
import { Search, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Employee } from '@/lib/supabase';
import { useLanguage } from '@/contexts/language-context';

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

export default function LeavePage() {
  const { t } = useLanguage();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveType, setLeaveType] = useState('Personal');
  const [reason, setReason] = useState('');

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(
        (emp) =>
          emp.name.includes(searchTerm) || emp.employee_id.includes(searchTerm)
      );
      setFilteredEmployees(filtered);
      setShowEmployeeList(true);
    } else {
      setFilteredEmployees([]);
      setShowEmployeeList(false);
    }
  }, [searchTerm, employees]);

  useEffect(() => {
    filterLeaves();
  }, [leaves, filterStartDate, filterEndDate]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/leave');
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(employee.name);
    setShowEmployeeList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !leaveDate) {
      toast.error(t('leavePage.selectEmployeeError'));
      return;
    }

    try {
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          leave_date: leaveDate,
          leave_type: leaveType,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(t('leavePage.saveError'));
      }

      toast.success(t('leavePage.saveSuccess'));
      fetchLeaves();

      // Reset form
      setSelectedEmployee(null);
      setSearchTerm('');
      setLeaveDate('');
      setReason('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('leavePage.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/leave?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(t('leavePage.deleteError'));
      }

      toast.success(t('leavePage.deleteSuccess'));
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(
        (leave) => new Date(leave.leave_date) >= new Date(filterStartDate)
      );
    }

    if (filterEndDate) {
      filtered = filtered.filter(
        (leave) => new Date(leave.leave_date) <= new Date(filterEndDate)
      );
    }

    setFilteredLeaves(filtered);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('leavePage.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('leavePage.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Leave Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leavePage.addLeave')}</CardTitle>
            <CardDescription>
              {t('leavePage.selectEmployee')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leavePage.searchEmployee')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('leavePage.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Employee dropdown */}
                {showEmployeeList && filteredEmployees.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-gray-500">
                          {emp.employee_id} - {emp.department}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedEmployee && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedEmployee.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    {selectedEmployee.employee_id} - {selectedEmployee.department}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leavePage.leaveDate')}
                </label>
                <Input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leavePage.leaveType')}
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="Personal">{t('leave.typePersonal')}</option>
                  <option value="Sick">{t('leave.typeSick')}</option>
                  <option value="Vacation">{t('leave.typeVacation')}</option>
                  <option value="Other">{t('leavePage.typeOther')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leavePage.reasonOptional')}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('leavePage.reasonPlaceholder')}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {t('leavePage.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leave Records */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leavePage.recentLeaves')}</CardTitle>
            <CardDescription>
              {t('leavePage.recent10')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-auto">
              {leaves.slice(0, 10).map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {leave.employees?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(leave.leave_date).toLocaleDateString('th-TH')} -{' '}
                      {leave.leave_type}
                    </p>
                    {leave.reason && (
                      <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(leave.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              {leaves.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {t('leavePage.noLeaveItems')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Leave Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('leavePage.allLeaves')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date Range Filter */}
          <div className="mb-4 flex items-center gap-3">
            <DateRangePicker
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartDateChange={setFilterStartDate}
              onEndDateChange={setFilterEndDate}
              onClear={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
            />
            <div className="text-sm text-gray-600">
              {t('leavePage.showingItems').replace('{count}', filteredLeaves.length.toString())}
              {(filterStartDate || filterEndDate) && ` ${t('leavePage.outOfTotal').replace('{total}', leaves.length.toString())}`}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('leave.date')}</TableHead>
                <TableHead>{t('leave.empId')}</TableHead>
                <TableHead>{t('leave.empName')}</TableHead>
                <TableHead>{t('leave.department')}</TableHead>
                <TableHead>{t('leave.type')}</TableHead>
                <TableHead>{t('leave.reason')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {leaves.length === 0 ? t('leave.noLeaves') : t('leave.noLeavesInRange')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {new Date(leave.leave_date).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>{leave.employee_id}</TableCell>
                    <TableCell>{leave.employees?.name}</TableCell>
                    <TableCell>{leave.employees?.department}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        {leave.leave_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(leave.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
