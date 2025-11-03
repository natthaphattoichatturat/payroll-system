'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import { useLanguage } from '@/contexts/language-context';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Brain,
  Languages,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: LayoutDashboard },
    { name: t('nav.employees'), href: '/employees', icon: Users },
    { name: t('nav.attendance'), href: '/attendance', icon: Clock },
    { name: t('nav.leave'), href: '/leave', icon: Calendar },
    { name: t('nav.payroll'), href: '/payroll', icon: DollarSign },
    { name: t('nav.reports'), href: '/reports', icon: FileText },
    { name: t('nav.ai'), href: '/ai-features', icon: Brain },
  ];

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
                {t('nav.auto')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-soft-gray rounded-md transition-all border border-table-border"
              title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
              <Languages className="h-4 w-4" />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
