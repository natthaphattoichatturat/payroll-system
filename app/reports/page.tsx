'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function ReportsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('reports.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('reports.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.attendance')}</CardTitle>
            <CardDescription>
              {t('reports.attendanceDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('reports.exportExcel')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.otMonthly')}</CardTitle>
            <CardDescription>
              {t('reports.otMonthlyDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('reports.exportExcel')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.payroll')}</CardTitle>
            <CardDescription>
              {t('reports.payrollDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('reports.exportPDF')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.payslip')}</CardTitle>
            <CardDescription>
              {t('reports.payslipDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              {t('reports.createPayslip')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.leave')}</CardTitle>
            <CardDescription>
              {t('reports.leaveDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('reports.exportExcel')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.yearlyReport')}</CardTitle>
            <CardDescription>
              {t('reports.yearlyReportDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TableIcon className="mr-2 h-4 w-4" />
              {t('reports.viewReport')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.tips')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• {t('reports.tip1')}</p>
          <p>• {t('reports.tip2')}</p>
          <p>• {t('reports.tip3')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
