'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Employee } from '@/lib/supabase';
import { useLanguage } from '@/contexts/language-context';

export default function EmployeesPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t('employees.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');

      // Skip header
      const dataLines = lines.slice(1);

      const employeesToImport = dataLines
        .map((line) => {
          if (!line.trim()) return null;

          const parts = line.split('\t');
          if (parts.length < 3) return null;

          return {
            employee_id: parts[0].trim(),
            name: parts[1].trim(),
            department: parts[2].trim(),
            certificate_type: parts[3]?.trim() || 'Other',
            base_salary: 5000,
            ot_rate: 80,
          };
        })
        .filter((emp) => emp !== null);

      try {
        for (const emp of employeesToImport) {
          await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp),
          });
        }

        toast.success(t('employees.importSuccess').replace('{count}', employeesToImport.length.toString()));
        fetchEmployees();
      } catch (error) {
        toast.error(t('employees.importError'));
      }
    };

    reader.readAsText(file);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.includes(searchTerm) ||
      emp.employee_id.includes(searchTerm) ||
      emp.department.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('employees.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('employees.subtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Button variant="outline" type="button">
              <Upload className="mr-2 h-4 w-4" />
              {t('employees.importCSV')}
            </Button>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".txt,.csv"
            onChange={handleImportCSV}
            className="hidden"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('employees.list')}</CardTitle>
              <CardDescription>
                {t('employees.totalCount').replace('{count}', filteredEmployees.length.toString())}
              </CardDescription>
            </div>

            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('employees.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.employeeId')}</TableHead>
                <TableHead>{t('employees.name')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead className="text-right">{t('employees.baseSalary')}</TableHead>
                <TableHead className="text-right">{t('employees.otRate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {t('employees.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {t('employees.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employee_id}
                    </TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-right">
                      ฿{employee.base_salary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ฿{employee.ot_rate.toLocaleString()}
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
