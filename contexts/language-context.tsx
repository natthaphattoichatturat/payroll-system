'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'th' | 'en' | 'cn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage on client-side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en' || savedLanguage === 'cn')) {
        return savedLanguage;
      }
    }
    return 'th'; // Default to Thai
  });

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
    // Language
    'lang.code': 'th',

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
    'payroll.day': 'วันที่',
    'payroll.totalOT': 'OT รวม',
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
    // Language
    'lang.code': 'en',

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
    'payroll.day': 'Day',
    'payroll.totalOT': 'Total OT',
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
  cn: {
    // Language
    'lang.code': 'cn',

    // Navigation
    'nav.home': '首页',
    'nav.employees': '员工',
    'nav.attendance': '考勤',
    'nav.leave': '请假',
    'nav.payroll': '薪资',
    'nav.ai': 'AI功能',
    'nav.reports': '报告',
    'nav.auto': '自动',

    // Dashboard/Home
    'home.title': '薪资管理系统',
    'home.subtitle': '员工薪资概览',
    'home.selectPeriod': '选择薪资周期查看数据',
    'home.selectPeriodDesc': '请从上方选择薪资周期以显示摘要',

    // Payroll Table
    'payroll.title': '员工薪资清单',
    'payroll.period': '周期',
    'payroll.employees': '员工',
    'payroll.people': '人',
    'payroll.viewDetails': '查看详情',
    'payroll.search': '搜索员工...',
    'payroll.loading': '加载数据中...',
    'payroll.noData': '暂无数据',
    'payroll.noResults': '未找到搜索结果',
    'payroll.empId': '工号',
    'payroll.name': '姓名',
    'payroll.department': '部门',
    'payroll.day': '日',
    'payroll.totalOT': '总加班',
    'payroll.otHours': '加班（小时）',
    'payroll.otAmount': '加班费',
    'payroll.gross': '毛薪',
    'payroll.net': '净薪',

    // Leave Records
    'leave.title': '全部请假记录',
    'leave.subtitle': '全部员工请假记录',
    'leave.manage': '管理请假',
    'leave.selectDateRange': '选择日期范围',
    'leave.showing': '显示',
    'leave.items': '项',
    'leave.outOf': '共',
    'leave.date': '请假日期',
    'leave.empId': '员工工号',
    'leave.empName': '姓名',
    'leave.department': '部门',
    'leave.type': '类型',
    'leave.reason': '原因',
    'leave.noLeaves': '无请假记录',
    'leave.noLeavesInRange': '所选日期范围内无请假记录',
    'leave.typeSick': '病假',
    'leave.typePersonal': '事假',
    'leave.typeVacation': '年假',

    // Financial Summary
    'finance.baseSalary': '基本工资（总计）',
    'finance.baseSalaryDesc': '不包括加班费',
    'finance.otTotal': '加班费（总计）',
    'finance.otTotalDesc': '全部加班费',
    'finance.grossTotal': '总计（税前）',
    'finance.grossSalary': '毛薪',
    'finance.netTotal': '总计（净额）',
    'finance.netDesc': '扣税+社保后',

    // Statistics
    'stats.topOT': '加班时长前5',
    'stats.lowOT': '加班时长后5',
    'stats.deptAvgOT': '各部门平均加班',
    'stats.topLeave': '请假最多前5',
    'stats.lowLeave': '请假最少前5',
    'stats.hours': '小时',
    'stats.days': '天',

    // Date Range Picker
    'dateRange.select': '选择日期范围',
    'dateRange.startDate': '开始日期',
    'dateRange.endDate': '结束日期',
    'dateRange.clear': '清除',
    'dateRange.ok': '确定',

    // Leave Page
    'leavePage.title': '请假管理',
    'leavePage.subtitle': '记录和管理员工请假',
    'leavePage.addLeave': '记录请假',
    'leavePage.selectEmployee': '选择员工和请假日期',
    'leavePage.searchEmployee': '搜索员工',
    'leavePage.searchPlaceholder': '输入姓名或工号...',
    'leavePage.leaveDate': '请假日期',
    'leavePage.leaveType': '请假类型',
    'leavePage.reasonOptional': '原因（可选）',
    'leavePage.reasonPlaceholder': '输入请假原因...',
    'leavePage.submit': '提交请假',
    'leavePage.recentLeaves': '请假记录',
    'leavePage.recent10': '最近10条记录',
    'leavePage.allLeaves': '全部请假记录',
  },
};
