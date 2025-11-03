'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translations object
const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.employees': 'พนักงาน',
    'nav.attendance': 'เวลาเข้างาน',
    'nav.leave': 'การลางาน',
    'nav.payroll': 'เงินเดือน',
    'nav.ai': 'AI Features',
    'nav.reports': 'รายงาน',
    'nav.auto': 'AUTO',

    // Dashboard/Home
    'home.title': 'ระบบคำนวณเงินเดือน',
    'home.subtitle': 'ภาพรวมข้อมูลเงินเดือนพนักงาน',
    'home.selectPeriod': 'เลือกรอบเงินเดือนเพื่อดูข้อมูล',
    'home.selectPeriodDesc': 'กรุณาเลือกรอบเงินเดือนจากด้านบนเพื่อแสดงข้อมูลสรุป',

    // Payroll Table
    'payroll.title': 'รายการเงินเดือนพนักงาน',
    'payroll.period': 'รอบ',
    'payroll.employees': 'พนักงาน',
    'payroll.people': 'คน',
    'payroll.viewDetails': 'ดูรายละเอียดเต็ม',
    'payroll.search': 'ค้นหาพนักงาน...',
    'payroll.loading': 'กำลังโหลดข้อมูล...',
    'payroll.noData': 'ยังไม่มีข้อมูล',
    'payroll.noResults': 'ไม่พบข้อมูลที่ค้นหา',
    'payroll.empId': 'รหัส',
    'payroll.name': 'ชื่อ-นามสกุล',
    'payroll.department': 'แผนก',
    'payroll.otHours': 'OT (ชม.)',
    'payroll.otAmount': 'ค่า OT',
    'payroll.gross': 'Gross',
    'payroll.net': 'Net',

    // Leave Records
    'leave.title': 'ประวัติการลาทั้งหมด',
    'leave.subtitle': 'รายการการลางานของพนักงานทั้งหมด',
    'leave.manage': 'จัดการการลา',
    'leave.selectDateRange': 'เลือกช่วงเวลา',
    'leave.showing': 'แสดง',
    'leave.items': 'รายการ',
    'leave.outOf': 'จากทั้งหมด',
    'leave.date': 'วันที่ลา',
    'leave.empId': 'รหัสพนักงาน',
    'leave.empName': 'ชื่อ-นามสกุล',
    'leave.department': 'แผนก',
    'leave.type': 'ประเภท',
    'leave.reason': 'เหตุผล',
    'leave.noLeaves': 'ไม่มีรายการลา',
    'leave.noLeavesInRange': 'ไม่พบรายการลาในช่วงเวลาที่เลือก',
    'leave.typeSick': 'ลาป่วย',
    'leave.typePersonal': 'ลากิจ',
    'leave.typeVacation': 'ลาพักร้อน',

    // Financial Summary
    'finance.baseSalary': 'เงินเดือนฐาน (ทั้งหมด)',
    'finance.baseSalaryDesc': 'ไม่รวมค่า OT',
    'finance.otTotal': 'ค่า OT (ทั้งหมด)',
    'finance.otTotalDesc': 'ค่าล่วงเวลาทั้งหมด',
    'finance.grossTotal': 'รวม (ก่อนหัก)',
    'finance.grossSalary': 'Gross Salary',
    'finance.netTotal': 'รวม (สุทธิ)',
    'finance.netDesc': 'หลังหักภาษี + ประกันสังคม',

    // Statistics
    'stats.topOT': 'Top 5 OT สูงสุด',
    'stats.lowOT': 'Top 5 OT ต่ำสุด',
    'stats.deptAvgOT': 'OT เฉลี่ยแต่ละแผนก',
    'stats.topLeave': 'ลางานมากที่สุด 5 อันดับ',
    'stats.lowLeave': 'ลางานน้อยที่สุด 5 อันดับ',
    'stats.hours': 'ชม.',
    'stats.days': 'วัน',

    // Date Range Picker
    'dateRange.select': 'เลือกช่วงเวลา',
    'dateRange.startDate': 'วันที่เริ่มต้น',
    'dateRange.endDate': 'วันที่สิ้นสุด',
    'dateRange.clear': 'ล้าง',
    'dateRange.ok': 'ตกลง',

    // Leave Page
    'leavePage.title': 'จัดการการลางาน',
    'leavePage.subtitle': 'บันทึกและจัดการวันลาของพนักงาน',
    'leavePage.addLeave': 'บันทึกการลา',
    'leavePage.selectEmployee': 'เลือกพนักงานและวันที่ลา',
    'leavePage.searchEmployee': 'ค้นหาพนักงาน',
    'leavePage.searchPlaceholder': 'พิมพ์ชื่อหรือรหัสพนักงาน...',
    'leavePage.leaveDate': 'วันที่ลา',
    'leavePage.leaveType': 'ประเภทการลา',
    'leavePage.reasonOptional': 'เหตุผล (ไม่บังคับ)',
    'leavePage.reasonPlaceholder': 'ระบุเหตุผลการลา...',
    'leavePage.submit': 'บันทึกการลา',
    'leavePage.recentLeaves': 'รายการลางาน',
    'leavePage.recent10': 'ล่าสุด 10 รายการ',
    'leavePage.allLeaves': 'ประวัติการลาทั้งหมด',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.employees': 'Employees',
    'nav.attendance': 'Attendance',
    'nav.leave': 'Leave',
    'nav.payroll': 'Payroll',
    'nav.ai': 'AI Features',
    'nav.reports': 'Reports',
    'nav.auto': 'AUTO',

    // Dashboard/Home
    'home.title': 'Payroll System',
    'home.subtitle': 'Employee payroll overview',
    'home.selectPeriod': 'Select payroll period to view data',
    'home.selectPeriodDesc': 'Please select a payroll period from above to display summary',

    // Payroll Table
    'payroll.title': 'Employee Payroll List',
    'payroll.period': 'Period',
    'payroll.employees': 'Employees',
    'payroll.people': 'people',
    'payroll.viewDetails': 'View Details',
    'payroll.search': 'Search employee...',
    'payroll.loading': 'Loading data...',
    'payroll.noData': 'No data available',
    'payroll.noResults': 'No results found',
    'payroll.empId': 'ID',
    'payroll.name': 'Name',
    'payroll.department': 'Department',
    'payroll.otHours': 'OT (hrs)',
    'payroll.otAmount': 'OT Amount',
    'payroll.gross': 'Gross',
    'payroll.net': 'Net',

    // Leave Records
    'leave.title': 'All Leave Records',
    'leave.subtitle': 'All employee leave records',
    'leave.manage': 'Manage Leave',
    'leave.selectDateRange': 'Select date range',
    'leave.showing': 'Showing',
    'leave.items': 'items',
    'leave.outOf': 'out of',
    'leave.date': 'Leave Date',
    'leave.empId': 'Employee ID',
    'leave.empName': 'Name',
    'leave.department': 'Department',
    'leave.type': 'Type',
    'leave.reason': 'Reason',
    'leave.noLeaves': 'No leave records',
    'leave.noLeavesInRange': 'No leave records in selected date range',
    'leave.typeSick': 'Sick',
    'leave.typePersonal': 'Personal',
    'leave.typeVacation': 'Vacation',

    // Financial Summary
    'finance.baseSalary': 'Base Salary (Total)',
    'finance.baseSalaryDesc': 'Excluding OT',
    'finance.otTotal': 'OT Amount (Total)',
    'finance.otTotalDesc': 'Total overtime pay',
    'finance.grossTotal': 'Total (Before Deduction)',
    'finance.grossSalary': 'Gross Salary',
    'finance.netTotal': 'Total (Net)',
    'finance.netDesc': 'After tax + social security',

    // Statistics
    'stats.topOT': 'Top 5 Highest OT',
    'stats.lowOT': 'Top 5 Lowest OT',
    'stats.deptAvgOT': 'Average OT by Department',
    'stats.topLeave': 'Top 5 Most Leave',
    'stats.lowLeave': 'Top 5 Least Leave',
    'stats.hours': 'hrs',
    'stats.days': 'days',

    // Date Range Picker
    'dateRange.select': 'Select date range',
    'dateRange.startDate': 'Start Date',
    'dateRange.endDate': 'End Date',
    'dateRange.clear': 'Clear',
    'dateRange.ok': 'OK',

    // Leave Page
    'leavePage.title': 'Leave Management',
    'leavePage.subtitle': 'Record and manage employee leave',
    'leavePage.addLeave': 'Record Leave',
    'leavePage.selectEmployee': 'Select employee and leave date',
    'leavePage.searchEmployee': 'Search Employee',
    'leavePage.searchPlaceholder': 'Type name or employee ID...',
    'leavePage.leaveDate': 'Leave Date',
    'leavePage.leaveType': 'Leave Type',
    'leavePage.reasonOptional': 'Reason (Optional)',
    'leavePage.reasonPlaceholder': 'Enter leave reason...',
    'leavePage.submit': 'Submit Leave',
    'leavePage.recentLeaves': 'Leave Records',
    'leavePage.recent10': 'Recent 10 records',
    'leavePage.allLeaves': 'All Leave Records',
  },
};
