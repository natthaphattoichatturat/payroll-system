'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmployeeSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export function EmployeeSearch({ onSearch, placeholder = "ค้นหาชื่อหรือรหัสพนักงาน..." }: EmployeeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-gray-900 border-2 border-gray-300 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
