'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear?: () => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangePickerProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDateRange = () => {
    if (!startDate && !endDate) {
      return t('dateRange.select');
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    };

    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} - ...`;
    } else if (endDate) {
      return `... - ${formatDate(endDate)}`;
    }
    return t('dateRange.select');
  };

  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
    if (onClear) onClear();
  };

  const hasDateRange = startDate || endDate;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto gap-2 justify-start text-left font-normal"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm">{formatDateRange()}</span>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-table-border rounded-lg shadow-lg p-4 min-w-[320px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('dateRange.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-table-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-automation-blue/20 focus:border-automation-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('dateRange.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || undefined}
                className="w-full px-3 py-2 border border-table-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-automation-blue/20 focus:border-automation-blue"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-table-border">
              {hasDateRange && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 text-sm"
                >
                  {t('dateRange.clear')}
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-automation-blue hover:bg-automation-blue/90 text-sm"
              >
                {t('dateRange.ok')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
