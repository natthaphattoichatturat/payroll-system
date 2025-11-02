'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: string;
}

interface PeriodSelectorProps {
  onPeriodChange: (period: PayrollPeriod | null) => void;
  selectedPeriod?: PayrollPeriod | null;
}

export function PeriodSelector({ onPeriodChange, selectedPeriod }: PeriodSelectorProps) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/payroll/periods');
      const data = await response.json();
      setPeriods(data);

      // Auto-select latest period
      if (data.length > 0 && !selectedPeriod) {
        onPeriodChange(data[0]);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        เลือกรอบเงินเดือน
      </label>
      <select
        className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        value={selectedPeriod?.id || ''}
        onChange={(e) => {
          const period = periods.find(p => p.id === parseInt(e.target.value));
          onPeriodChange(period || null);
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <option>กำลังโหลด...</option>
        ) : periods.length === 0 ? (
          <option>ไม่มีรอบเงินเดือน</option>
        ) : (
          <>
            <option value="">-- เลือกรอบ --</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.period_name} ({formatDateRange(period.start_date, period.end_date)})
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}
