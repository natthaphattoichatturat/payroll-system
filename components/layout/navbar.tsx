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
  Brain,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'พนักงาน', href: '/employees', icon: Users },
  { name: 'บันทึกเวลา', href: '/attendance', icon: Clock },
  { name: 'การลางาน', href: '/leave', icon: Calendar },
  { name: 'คำนวณเงินเดือน', href: '/payroll', icon: DollarSign },
  { name: 'รายงาน', href: '/reports', icon: FileText },
  { name: 'AI Features', href: '/ai-features', icon: Brain },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-table-bg border-b-2 border-table-border sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div className="flex flex-shrink-0 items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                Payroll System
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-automation-blue/10 text-automation-blue rounded-full border border-automation-blue/20">
                <span className="w-1.5 h-1.5 bg-automation-blue rounded-full animate-pulse"></span>
                AUTO
              </span>
            </div>
          </div>
          <div className="flex">
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isAI = item.name === 'AI Features';

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-md relative',
                      isActive
                        ? isAI
                          ? 'bg-ai-purple/10 text-ai-purple border border-ai-purple/20'
                          : 'bg-automation-blue/10 text-automation-blue'
                        : 'text-text-secondary hover:bg-soft-gray hover:text-text-primary',
                      isAI && !isActive && 'hover:bg-ai-purple/5'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {isAI && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-ai-purple rounded-full animate-pulse"></span>
                    )}
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
