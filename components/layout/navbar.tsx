'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'พนักงาน', href: '/employees', icon: Users },
  { name: 'บันทึกเวลา', href: '/attendance', icon: Clock },
  { name: 'การลางาน', href: '/leave', icon: Calendar },
  { name: 'คำนวณเงินเดือน', href: '/payroll', icon: DollarSign },
  { name: 'รายงาน', href: '/reports', icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-lg sm:text-2xl font-bold text-blue-600">
                Payroll System
              </h1>
            </div>
          </div>
          <div className="flex">
            <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
