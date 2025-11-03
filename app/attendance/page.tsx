'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/language-context';

export default function AttendancePage() {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      toast.success(t('attendance.fileReadSuccess'));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error(t('attendance.enterDataError'));
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/attendance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('attendance.enterDataError'));
      }

      setResult(data);
      toast.success(t('attendance.recordsCreated').replace('{count}', data.daily_records_created.toString()));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleData = `01	11-10-2025	00:27:19	'20056402		1
01	11-10-2025	00:37:30	'20056415		1
01	11-10-2025	00:52:56	'20056330		1
04	11-10-2025	20:13:39	'20055675		2
04	11-10-2025	21:05:25	'20056298		2`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('attendance.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('attendance.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('attendance.import')}</CardTitle>
            <CardDescription>
              {t('attendance.uploadDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('attendance.uploadFile')}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('attendance.pasteHere')}
              </label>
              <textarea
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 placeholder:text-gray-400"
                placeholder={exampleData}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t('attendance.importing') : t('attendance.importData')}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('attendance.dataFormat')}</CardTitle>
            <CardDescription>
              {t('attendance.formatDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800">
                {exampleData}
              </pre>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900">{t('attendance.formatExplain')}</p>
              <ul className="space-y-1 text-gray-700">
                <li>• {t('attendance.formatMachineId')}</li>
                <li>• {t('attendance.formatDate')}</li>
                <li>• {t('attendance.formatTime')}</li>
                <li>• {t('attendance.formatEmpId')}</li>
                <li>• {t('attendance.formatType')}</li>
              </ul>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-900">
                      {t('attendance.importSuccess')}
                    </p>
                    <p className="text-green-800 mt-1">
                      {t('attendance.scansImported').replace('{count}', result.scans_imported.toString())}
                    </p>
                    <p className="text-green-800">
                      {t('attendance.recordsCreated').replace('{count}', result.daily_records_created.toString())}
                    </p>
                    {result.scans_skipped > 0 && (
                      <p className="text-orange-700 mt-1">
                        {t('attendance.scansSkipped').replace('{count}', result.scans_skipped.toString())}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
