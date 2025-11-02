'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          ภาพรวมระบบคำนวณเงินเดือนอัตโนมัติ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              พนักงานทั้งหมด
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <p className="text-xs text-gray-600">
              จำนวนพนักงานในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              ชั่วโมง OT เดือนนี้
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <p className="text-xs text-gray-600">
              รวมชั่วโมง OT ทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              เงินเดือนเดือนนี้
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <p className="text-xs text-gray-600">
              รวมเงินเดือนที่ต้องจ่าย
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              ค่า OT เดือนนี้
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <p className="text-xs text-gray-600">
              รวมค่า OT ทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>เริ่มต้นใช้งาน</CardTitle>
          <CardDescription>
            เลือกฟังก์ชันที่ต้องการใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/attendance">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
              <Clock className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">บันทึกเวลาทำงาน</div>
                <div className="text-xs text-gray-500">นำเข้าข้อมูลการแสกน</div>
              </div>
            </Button>
          </Link>

          <Link href="/leave">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
              <Users className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">บันทึกการลางาน</div>
                <div className="text-xs text-gray-500">จัดการวันลาพนักงาน</div>
              </div>
            </Button>
          </Link>

          <Link href="/payroll">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
              <DollarSign className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">คำนวณเงินเดือน</div>
                <div className="text-xs text-gray-500">คำนวณและออกสลิป</div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
