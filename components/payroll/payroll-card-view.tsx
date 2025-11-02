import { formatCurrency } from '@/lib/utils';
import { Users } from 'lucide-react';

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

interface PayrollCardViewProps {
  data: PayrollCalculation[];
  isLoading?: boolean;
  searchTerm?: string;
}

export function PayrollCardView({ data, isLoading, searchTerm }: PayrollCardViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">
          {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((calc) => (
        <div
          key={calc.id}
          className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3 pb-3 border-b">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base">{calc.employees?.name}</h3>
              <p className="text-sm text-gray-600">รหัส: {calc.employee_id}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {calc.employees?.department}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">เงินสุทธิ</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(calc.net_salary)}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">OT (ชม.)</p>
              <p className="font-semibold text-blue-600">{calc.total_ot_hours.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ค่า OT</p>
              <p className="font-semibold text-blue-600">{formatCurrency(calc.ot_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">เงินฐาน</p>
              <p className="font-semibold text-gray-900">{formatCurrency(calc.base_salary)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Gross</p>
              <p className="font-semibold text-purple-600">{formatCurrency(calc.gross_salary)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
