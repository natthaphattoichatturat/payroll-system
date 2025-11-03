'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, Calendar, DollarSign, FileText, Clock, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'หน้าแรก', href: '/', icon: Home },
  { name: 'พนักงาน', href: '/employees', icon: Users },
  { name: 'บันทึกเวลา', href: '/attendance', icon: Clock },
  { name: 'ลางาน', href: '/leave', icon: Calendar },
  { name: 'เงินเดือน', href: '/payroll', icon: DollarSign },
  { name: 'รายงาน', href: '/reports', icon: FileText },
  { name: 'AI Features', href: '/ai-features', icon: Brain },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-table-bg shadow-xl z-50 transform transition-transform border-r border-table-border">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">เมนู</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isAI = item.name === 'AI Features';
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                        isActive
                          ? isAI
                            ? 'bg-ai-purple/10 text-ai-purple font-semibold border border-ai-purple/20'
                            : 'bg-automation-blue/10 text-automation-blue font-semibold'
                          : 'text-text-secondary hover:bg-soft-gray hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {isAI && (
                        <span className="ml-auto w-2 h-2 bg-ai-purple rounded-full animate-pulse"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
