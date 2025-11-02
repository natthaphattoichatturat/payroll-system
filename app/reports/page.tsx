'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table as TableIcon } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          รายงาน
        </h1>
        <p className="mt-2 text-gray-600">
          ส่งออกและดูรายงานต่างๆ ในระบบ
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายงานเวลาทำงาน</CardTitle>
            <CardDescription>
              รายงานการเข้า-ออกงานของพนักงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              ส่งออก Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายงาน OT รายเดือน</CardTitle>
            <CardDescription>
              สรุปชั่วโมง OT ของพนักงานแต่ละคน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              ส่งออก Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายงานเงินเดือน</CardTitle>
            <CardDescription>
              รายงานเงินเดือนพนักงานรายเดือน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              ส่งออก PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สลิปเงินเดือน</CardTitle>
            <CardDescription>
              ออกสลิปเงินเดือนสำหรับพนักงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              สร้างสลิป PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายงานการลา</CardTitle>
            <CardDescription>
              สรุปการลางานของพนักงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              ส่งออก Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายงานสรุปประจำปี</CardTitle>
            <CardDescription>
              สรุปเงินเดือนและ OT ตลอดทั้งปี
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TableIcon className="mr-2 h-4 w-4" />
              ดูรายงาน
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>คำแนะนำ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• รายงานทั้งหมดสามารถส่งออกเป็นไฟล์ Excel หรือ PDF ได้</p>
          <p>• สลิปเงินเดือนสามารถออกเป็น PDF สำหรับส่งให้พนักงานได้</p>
          <p>• รายงานสามารถกรองตามช่วงเวลาและแผนกได้</p>
        </CardContent>
      </Card>
    </div>
  );
}
