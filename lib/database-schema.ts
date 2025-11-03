export const DATABASE_SCHEMA = `
# Database Schema for Payroll System

## Tables:

### 1. employees
- employee_id: VARCHAR(20) PRIMARY KEY (รหัสพนักงาน เช่น '20055885')
- first_name: VARCHAR (ชื่อ)
- last_name: VARCHAR (นามสกุล)
- department: VARCHAR (แผนก เช่น Production, QA, Office, Warehouse)
- position: VARCHAR (ตำแหน่งงาน)
- base_salary: DECIMAL (เงินเดือนฐาน)
- ot_hourly_rate: DECIMAL (อัตรา OT ต่อชั่วโมง)
- hire_date: DATE (วันที่เริ่มงาน)
- status: VARCHAR (active/inactive)
- created_at: TIMESTAMP

### 2. payroll_periods
- id: SERIAL PRIMARY KEY
- period_name: VARCHAR (เช่น "ตุลาคม 2025")
- start_date: DATE (วันเริ่มต้นรอบเงินเดือน เช่น 2025-10-11)
- end_date: DATE (วันสิ้นสุดรอบเงินเดือน เช่น 2025-10-25)
- payment_date: DATE (วันจ่ายเงิน)
- status: VARCHAR (draft/calculated/paid)
- created_at: TIMESTAMP

### 3. payroll
- id: SERIAL PRIMARY KEY
- period_id: INTEGER (FK -> payroll_periods.id)
- employee_id: VARCHAR(20) (FK -> employees.employee_id)
- base_salary: DECIMAL (เงินเดือนฐาน)
- work_days: INTEGER (จำนวนวันทำงาน)
- ot_hours: DECIMAL(10,2) (ชั่วโมง OT รวม - ข้อมูลที่ใช้คำนวณเงินจริง)
- ot_amount: DECIMAL (เงิน OT)
- gross_salary: DECIMAL (เงินเดือนรวมก่อนหัก)
- tax: DECIMAL (ภาษี)
- social_security: DECIMAL (ประกันสังคม)
- other_deductions: DECIMAL (หักอื่นๆ)
- net_salary: DECIMAL (เงินสุทธิ)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 4. daily_attendance
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) (FK -> employees.employee_id)
- period_id: INTEGER (FK -> payroll_periods.id)
- period_start_date: DATE (วันเริ่มรอบ)
- period_end_date: DATE (วันสิ้นสุดรอบ)
- day1: JSONB (ข้อมูลวันที่ 1: {"date": "2025-10-11", "ot_hours": 4, "actual_ot": 4, "is_sunday": false})
- day2: JSONB (ข้อมูลวันที่ 2)
- day3: JSONB (ข้อมูลวันที่ 3)
- day4: JSONB (ข้อมูลวันที่ 4)
- day5: JSONB (ข้อมูลวันที่ 5)
- day6: JSONB (ข้อมูลวันที่ 6)
- day7: JSONB (ข้อมูลวันที่ 7)
- day8: JSONB (ข้อมูลวันที่ 8)
- day9: JSONB (ข้อมูลวันที่ 9)
- day10: JSONB (ข้อมูลวันที่ 10)
- day11: JSONB (ข้อมูลวันที่ 11)
- day12: JSONB (ข้อมูลวันที่ 12)
- day13: JSONB (ข้อมูลวันที่ 13)
- day14: JSONB (ข้อมูลวันที่ 14)
- day15: JSONB (ข้อมูลวันที่ 15)
- total_work_days: INTEGER (จำนวนวันทำงานรวม)
- regular_ot_hours: DECIMAL(6,2) (ชั่วโมง OT ธรรมดา)
- sunday_ot_hours: DECIMAL(6,2) (ชั่วโมง OT วันอาทิตย์ จริง)
- sunday_ot_calculated: DECIMAL(6,2) (ชั่วโมง OT วันอาทิตย์ คำนวณแล้ว x3)
- total_ot_hours: DECIMAL(6,2) (ชั่วโมง OT รวม = regular_ot + sunday_ot_calculated)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 5. leave_records
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) (FK -> employees.employee_id)
- leave_date: DATE (วันที่ลา)
- leave_type: VARCHAR (sick/personal/vacation/other - ลาป่วย/ลากิจ/ลาพักร้อน/อื่นๆ)
- reason: TEXT (เหตุผล)
- created_at: TIMESTAMP

### 6. attendance_scans
- id: SERIAL PRIMARY KEY
- machine_id: VARCHAR (รหัสเครื่องสแกน เช่น '01', '04')
- employee_id: VARCHAR(20) (FK -> employees.employee_id)
- scan_date: DATE (วันที่สแกน)
- scan_time: TIME (เวลาที่สแกน)
- scan_type: INTEGER (1 = เข้า, 2 = ออก)
- created_at: TIMESTAMP

## Relationships:
- payroll.period_id -> payroll_periods.id
- payroll.employee_id -> employees.employee_id
- daily_attendance.employee_id -> employees.employee_id
- daily_attendance.period_id -> payroll_periods.id
- leave_records.employee_id -> employees.employee_id
- attendance_scans.employee_id -> employees.employee_id

## Important Query Examples:

### ดึงข้อมูลพนักงานพร้อมข้อมูล OT ในรอบล่าสุด:
\`\`\`sql
SELECT 
  e.employee_id,
  e.first_name || ' ' || e.last_name as full_name,
  e.department,
  p.ot_hours,
  p.ot_amount,
  p.net_salary
FROM payroll p
JOIN employees e ON p.employee_id = e.employee_id
JOIN payroll_periods pp ON p.period_id = pp.id
WHERE pp.id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1)
ORDER BY p.ot_hours DESC;
\`\`\`

### ดึงรายละเอียด OT รายวันของพนักงาน:
\`\`\`sql
SELECT 
  da.employee_id,
  e.first_name || ' ' || e.last_name as full_name,
  da.regular_ot_hours,
  da.sunday_ot_hours,
  da.sunday_ot_calculated,
  da.total_ot_hours,
  da.day1, da.day2, da.day3
FROM daily_attendance da
JOIN employees e ON da.employee_id = e.employee_id
WHERE da.period_id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1);
\`\`\`

### สรุปเงินเดือนตามแผนก:
\`\`\`sql
SELECT 
  e.department,
  COUNT(DISTINCT e.employee_id) as employee_count,
  SUM(p.base_salary) as total_base_salary,
  SUM(p.ot_amount) as total_ot,
  SUM(p.gross_salary) as total_gross,
  SUM(p.net_salary) as total_net
FROM payroll p
JOIN employees e ON p.employee_id = e.employee_id
WHERE p.period_id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1)
GROUP BY e.department
ORDER BY total_net DESC;
\`\`\`

## Important Notes:

### OT Calculation Rules:
- **Regular OT (นอกเวลาธรรมดา)**: 1.5x hourly rate
- **Sunday OT (วันอาทิตย์)**: 3.0x hourly rate
- **Hourly rate**: base_salary / 240
- ข้อมูล OT ที่ใช้คำนวณเงินจริง: **payroll.ot_hours**
- รายละเอียด OT รายวัน: **daily_attendance table**

### JSONB Structure in daily_attendance:
- Each day1-day15 contains:
  \`\`\`json
  {
    "date": "2025-10-11",
    "ot_hours": 4,
    "actual_ot": 4,
    "is_sunday": false
  }
  \`\`\`
- **ot_hours**: ชั่วโมง OT จริง
- **actual_ot**: ชั่วโมง OT หลังคำนวณ (วันอาทิตย์ x3)
- **is_sunday**: true ถ้าเป็นวันอาทิตย์

### การ Query ข้อมูล:
- ใช้ **JOIN employees** เพื่อดึงชื่อและแผนก
- ใช้ **ORDER BY ... DESC LIMIT N** เพื่อดู Top N
- ใช้ **WHERE period_id = (subquery)** เพื่อดูรอบล่าสุด
- ใช้ **GROUP BY department** เพื่อสรุปตามแผนก
- ใช้ **|| ' ' ||** เพื่อต่อชื่อ-นามสกุล (PostgreSQL syntax)

### Safety Rules:
- ห้ามใช้: DROP, DELETE, UPDATE, INSERT, TRUNCATE, ALTER
- ใช้เฉพาะ: SELECT queries only
- ต้องมี LIMIT สำหรับ queries ที่อาจได้ผลลัพธ์เยอะ
`;
