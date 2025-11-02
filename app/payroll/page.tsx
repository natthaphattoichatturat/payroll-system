'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PeriodSelector } from '@/components/shared/period-selector';
import { EmployeeSearch } from '@/components/shared/employee-search';
import { Calculator, Download, FileText, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

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
  total_days: number;
  total_hours: number;
  regular_ot_hours: number;
  holiday_ot_hours: number;
  total_ot_hours: number;
  base_salary: number;
  ot_amount: number;
  gross_salary: number;
  tax_amount: number;
  social_security: number;
  net_salary: number;
  employees?: {
    name: string;
    department: string;
  };
}

function PayrollContent() {
  const searchParams = useSearchParams();
  const urlPeriodId = searchParams.get('period_id');

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<PayrollCalculation[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Handle URL period_id parameter
  useEffect(() => {
    if (urlPeriodId && periods.length > 0) {
      const period = periods.find(p => p.id === parseInt(urlPeriodId));
      if (period) {
        setSelectedPeriod(period);
      }
    }
  }, [urlPeriodId, periods]);

  // Fetch calculations when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchCalculations(selectedPeriod.id);
    }
  }, [selectedPeriod]);

  // Filter calculations by search term
  useEffect(() => {
    filterCalculations();
  }, [calculations, searchTerm]);

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/payroll/periods');
      const data = await response.json();
      setPeriods(data);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchCalculations = async (periodId: number) => {
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/payroll/${periodId}`);
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterCalculations = () => {
    if (!searchTerm) {
      setFilteredCalculations(calculations);
      return;
    }

    const filtered = calculations.filter(
      c =>
        c.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.employees?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCalculations(filtered);
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_name: periodName,
          start_date: startDate,
          end_date: endDate,
          payment_date: paymentDate,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถสร้างรอบเงินเดือนได้');
      }

      toast.success('สร้างรอบเงินเดือนสำเร็จ');
      fetchPeriods();

      // Reset form
      setPeriodName('');
      setStartDate('');
      setEndDate('');
      setPaymentDate('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCalculate = async (period: PayrollPeriod) => {
    setIsCalculating(true);

    try {
      const response = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_id: period.id,
          start_date: period.start_date,
          end_date: period.end_date,
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถคำนวณเงินเดือนได้');
      }

      const data = await response.json();
      toast.success(`คำนวณเงินเดือนสำเร็จ ${data.records_created} รายการ`);

      setSelectedPeriod(period);
      fetchCalculations(period.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const totalBaseSalary = calculations.reduce((sum, c) => sum + c.base_salary, 0);
  const totalOTAmount = calculations.reduce((sum, c) => sum + c.ot_amount, 0);
  const totalGross = calculations.reduce((sum, c) => sum + c.gross_salary, 0);
  const totalTax = calculations.reduce((sum, c) => sum + c.tax_amount, 0);
  const totalSocialSecurity = calculations.reduce((sum, c) => sum + c.social_security, 0);
  const totalNet = calculations.reduce((sum, c) => sum + c.net_salary, 0);

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-lg">
        <h1 className="text-2xl font-bold">จัดการเงินเดือนพนักงาน</h1>
        <p className="mt-1 text-sm text-indigo-100">
          คำนวณและจัดการข้อมูลเงินเดือนพนักงาน
        </p>
      </div>

      {/* Payroll Table - MOVED TO TOP */}
      {selectedPeriod && (
        <>
          {/* Financial Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  เงินเดือนฐาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBaseSalary)}
                </div>
                <p className="text-xs text-gray-500 mt-1">ไม่รวมค่า OT</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  ค่า OT รวม
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalOTAmount)}
                </div>
                <p className="text-xs text-gray-500 mt-1">ค่าล่วงเวลาทั้งหมด</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  รวม (ก่อนหัก)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalGross)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Gross Salary</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  รวม (สุทธิ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalNet)}
                </div>
                <p className="text-xs text-gray-500 mt-1">หลังหักภาษี + ประกัน</p>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Table with Search */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Users className="h-5 w-5" />
                    รายการเงินเดือนพนักงาน - {selectedPeriod.period_name}
                  </CardTitle>
                  <CardDescription>
                    พนักงานทั้งหมด {calculations.length} คน
                    {searchTerm && ` | ผลการค้นหา ${filteredCalculations.length} คน`}
                  </CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  ส่งออก Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Search Bar */}
              <div className="mb-6">
                <EmployeeSearch
                  onSearch={setSearchTerm}
                  placeholder="ค้นหาด้วยชื่อหรือรหัสพนักงาน..."
                />
              </div>

              {/* Table Container with Scroll */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-100 z-10">
                      <TableRow>
                        <TableHead className="font-bold">รหัสพนักงาน</TableHead>
                        <TableHead className="font-bold">ชื่อ-นามสกุล</TableHead>
                        <TableHead className="font-bold">แผนก</TableHead>
                        <TableHead className="text-right font-bold">วันทำงาน</TableHead>
                        <TableHead className="text-right font-bold">ชม. OT</TableHead>
                        <TableHead className="text-right font-bold">เงินฐาน</TableHead>
                        <TableHead className="text-right font-bold">ค่า OT</TableHead>
                        <TableHead className="text-right font-bold">Gross</TableHead>
                        <TableHead className="text-right font-bold">ภาษี</TableHead>
                        <TableHead className="text-right font-bold">ประกันสังคม</TableHead>
                        <TableHead className="text-right font-bold">Net</TableHead>
                        <TableHead className="font-bold"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingData ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <p>กำลังโหลดข้อมูล...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredCalculations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">
                              {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลเงินเดือน'}
                            </p>
                            {!searchTerm && calculations.length === 0 && (
                              <p className="text-sm text-gray-400 mt-1">
                                กดปุ่ม "คำนวณ" เพื่อคำนวณเงินเดือนของรอบนี้
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCalculations.map((calc) => (
                          <TableRow key={calc.id} className="hover:bg-green-50 transition-colors">
                            <TableCell className="font-semibold text-gray-900">
                              {calc.employee_id}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {calc.employees?.name}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {calc.employees?.department}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{calc.total_days}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {calc.total_ot_hours.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-900">
                              {formatCurrency(calc.base_salary)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {formatCurrency(calc.ot_amount)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-purple-600">
                              {formatCurrency(calc.gross_salary)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              -{formatCurrency(calc.tax_amount)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              -{formatCurrency(calc.social_security)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600 text-base">
                              {formatCurrency(calc.net_salary)}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" className="h-8">
                                <FileText className="h-4 w-4" />
                              </Button>
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
        </>
      )}

      {/* Period Management - MOVED TO BOTTOM */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Period */}
        <Card className="border-2 lg:col-span-1">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Calendar className="h-5 w-5" />
              สร้างรอบเงินเดือน
            </CardTitle>
            <CardDescription>
              กำหนดรอบการจ่ายเงินเดือนใหม่
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อรอบ
                </label>
                <Input
                  placeholder="เช่น ตุลาคม 2025"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="h-11 border-2"
                  required
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    วันที่เริ่มต้น
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 border-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    วันที่สิ้นสุด
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 border-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    วันจ่ายเงิน
                  </label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-11 border-2"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-semibold">
                <Calendar className="mr-2 h-4 w-4" />
                สร้างรอบเงินเดือน
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Periods List */}
        <Card className="border-2 lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="h-5 w-5" />
              รอบเงินเดือนทั้งหมด
            </CardTitle>
            <CardDescription>
              เลือกรอบเพื่อคำนวณหรือดูรายละเอียดเงินเดือน
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 max-h-[500px] overflow-auto">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedPeriod?.id === period.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base text-gray-900">{period.period_name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">ระยะเวลา:</span>{' '}
                        {new Date(period.start_date).toLocaleDateString('th-TH')} -{' '}
                        {new Date(period.end_date).toLocaleDateString('th-TH')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">จ่ายวันที่:</span>{' '}
                        {new Date(period.payment_date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      period.status === 'paid' ? 'bg-green-100 text-green-700' :
                      period.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {period.status === 'paid' ? 'จ่ายแล้ว' :
                       period.status === 'approved' ? 'อนุมัติแล้ว' : 'ร่าง'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCalculate(period)}
                      disabled={isCalculating}
                      className="h-10"
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      คำนวณ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPeriod(period);
                      }}
                      className="h-10"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      ดูข้อมูล
                    </Button>
                  </div>
                </div>
              ))}

              {periods.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">ยังไม่มีรอบเงินเดือน</p>
                  <p className="text-sm text-gray-400 mt-1">สร้างรอบเงินเดือนใหม่เพื่อเริ่มต้น</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <PayrollContent />
    </Suspense>
  );
}
