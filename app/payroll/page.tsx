'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);

  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

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
    try {
      const response = await fetch(`/api/payroll/${periodId}`);
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
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

  const totalGross = calculations.reduce((sum, c) => sum + c.gross_salary, 0);
  const totalNet = calculations.reduce((sum, c) => sum + c.net_salary, 0);
  const totalOTAmount = calculations.reduce((sum, c) => sum + c.ot_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          คำนวณเงินเดือน
        </h1>
        <p className="mt-2 text-gray-600">
          จัดการรอบการจ่ายเงินเดือนและคำนวณเงินเดือนพนักงาน
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Period */}
        <Card>
          <CardHeader>
            <CardTitle>สร้างรอบเงินเดือน</CardTitle>
            <CardDescription>
              กำหนดวันที่เริ่มต้น-สิ้นสุด และวันจ่ายเงิน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อรอบ (เช่น "พฤศจิกายน 2025")
                </label>
                <Input
                  placeholder="ตุลาคม 2025"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มต้น
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
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
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันจ่ายเงิน
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                สร้างรอบเงินเดือน
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Periods List */}
        <Card>
          <CardHeader>
            <CardTitle>รอบเงินเดือน</CardTitle>
            <CardDescription>
              เลือกรอบเพื่อคำนวณหรือดูรายละเอียด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-auto">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{period.period_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(period.start_date).toLocaleDateString('th-TH')} -{' '}
                      {new Date(period.end_date).toLocaleDateString('th-TH')}
                    </p>
                    <p className="text-xs text-gray-600">
                      จ่ายวันที่:{' '}
                      {new Date(period.payment_date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCalculate(period)}
                      disabled={isCalculating}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      คำนวณ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPeriod(period);
                        fetchCalculations(period.id);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {periods.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  ยังไม่มีรอบเงินเดือน
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculations Table */}
      {selectedPeriod && calculations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>เงินเดือน - {selectedPeriod.period_name}</CardTitle>
                <CardDescription>
                  แสดง {calculations.length} รายการ
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                ส่งออก Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3 mb-6 p-4 bg-gray-50 rounded-md">
              <div className="text-center">
                <p className="text-sm text-gray-500">เงินเดือนรวม (Gross)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{totalGross.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">ค่า OT รวม</p>
                <p className="text-2xl font-bold text-blue-600">
                  ฿{totalOTAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">เงินสุทธิรวม (Net)</p>
                <p className="text-2xl font-bold text-green-600">
                  ฿{totalNet.toLocaleString()}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead className="text-right">วันทำงาน</TableHead>
                  <TableHead className="text-right">OT (ชม.)</TableHead>
                  <TableHead className="text-right">เงินฐาน</TableHead>
                  <TableHead className="text-right">ค่า OT</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">ภาษี</TableHead>
                  <TableHead className="text-right">ประกันสังคม</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium">
                      {calc.employee_id}
                    </TableCell>
                    <TableCell>{calc.employees?.name}</TableCell>
                    <TableCell>{calc.employees?.department}</TableCell>
                    <TableCell className="text-right">{calc.total_days}</TableCell>
                    <TableCell className="text-right">
                      {calc.total_ot_hours.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      ฿{calc.base_salary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      ฿{calc.ot_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ฿{calc.gross_salary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -฿{calc.tax_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -฿{calc.social_security.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ฿{calc.net_salary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
