export const DATABASE_SCHEMA = `
# Database Schema for Payroll System

## ⚠️ สำคัญ: Tables ที่มีจริงในฐานข้อมูล

### Tables ที่มี:
1. employees (ข้อมูลพนักงาน)
2. payroll_periods (รอบเงินเดือน)
3. daily_attendance (ข้อมูล OT และการทำงานรายวัน) ← **ใช้ table นี้สำหรับข้อมูล OT**
4. attendance_scans (การสแกนเข้า-ออกงาน)

### ❌ Tables ที่ไม่มี:
- **payroll** - ไม่มี table นี้! ข้อมูล OT อยู่ใน daily_attendance แทน

---

## Tables Detail:

### 1. employees
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) UNIQUE (รหัสพนักงาน เช่น '20055885')
- **name: VARCHAR(255)** (ชื่อ-นามสกุลเต็ม เช่น "สมชาย ใจดี") ← **เป็น full name ไม่แยก first/last**
- department: VARCHAR(100) (แผนก เช่น Production, QA, Office, Warehouse)
- certificate_type: VARCHAR(50) (ประเภทใบรับรอง)
- base_salary: NUMERIC(10,2) (เงินเดือนฐาน default 5000.00)
- ot_rate: NUMERIC(10,2) (อัตรา OT ต่อชั่วโมง default 80.00)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**สำคัญ:** 
- ใช้ 'name' ไม่ใช่ 'first_name' กับ 'last_name'
- ถ้าต้องการค้นหาชื่อ ใช้: WHERE name LIKE '%สมชาย%' หรือ WHERE name = 'สมชาย ใจดี'

### 2. payroll_periods
- id: SERIAL PRIMARY KEY
- period_name: VARCHAR(100) (เช่น "ตุลาคม 2025")
- start_date: DATE (วันเริ่มต้นรอบ เช่น 2025-10-11)
- end_date: DATE (วันสิ้นสุดรอบ เช่น 2025-10-25)
- payment_date: DATE (วันจ่ายเงิน)
- status: VARCHAR(20) (draft/calculated/paid)
- created_at: TIMESTAMP

### 3. daily_attendance ← **ใช้ table นี้สำหรับข้อมูล OT**
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

### 4. attendance_scans
- id: SERIAL PRIMARY KEY
- machine_id: VARCHAR(10) (รหัสเครื่องสแกน เช่น '01', '04')
- employee_id: VARCHAR(20) (FK -> employees.employee_id)
- scan_date: DATE (วันที่สแกน)
- scan_time: TIME (เวลาที่สแกน)
- scan_type: INTEGER (1 = เข้า, 2 = ออก)
- created_at: TIMESTAMP

## Relationships:
- daily_attendance.employee_id -> employees.employee_id
- daily_attendance.period_id -> payroll_periods.id
- attendance_scans.employee_id -> employees.employee_id

## Important Query Examples:

### ✅ ดึงข้อมูลพนักงานพร้อม OT ในรอบล่าสุด (Top 5):
\`\`\`sql
SELECT 
  e.employee_id,
  e.name as full_name,
  e.department,
  da.total_ot_hours,
  da.regular_ot_hours,
  da.sunday_ot_hours,
  da.sunday_ot_calculated,
  (da.total_ot_hours * e.ot_rate) as estimated_ot_amount
FROM daily_attendance da
JOIN employees e ON da.employee_id = e.employee_id
JOIN payroll_periods pp ON da.period_id = pp.id
WHERE pp.id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1)
ORDER BY da.total_ot_hours DESC
LIMIT 5;
\`\`\`

### ✅ ดึง OT ของพนักงานคนเดียว (ค้นหาด้วยชื่อ):
\`\`\`sql
SELECT 
  e.employee_id,
  e.name,
  e.department,
  da.total_ot_hours,
  da.regular_ot_hours,
  da.sunday_ot_hours,
  da.total_work_days,
  pp.period_name
FROM daily_attendance da
JOIN employees e ON da.employee_id = e.employee_id
JOIN payroll_periods pp ON da.period_id = pp.id
WHERE e.name LIKE '%สรรเพรญ%'
ORDER BY pp.start_date DESC
LIMIT 1;
\`\`\`

### ✅ สรุป OT ตามแผนก:
\`\`\`sql
SELECT 
  e.department,
  COUNT(DISTINCT e.employee_id) as employee_count,
  SUM(da.total_ot_hours) as total_ot_hours,
  AVG(da.total_ot_hours) as avg_ot_hours,
  SUM(da.total_ot_hours * e.ot_rate) as estimated_total_ot_cost
FROM daily_attendance da
JOIN employees e ON da.employee_id = e.employee_id
WHERE da.period_id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1)
GROUP BY e.department
ORDER BY total_ot_hours DESC;
\`\`\`

### ✅ นับจำนวนพนักงานในแต่ละแผนก:
\`\`\`sql
SELECT 
  department,
  COUNT(*) as employee_count
FROM employees
GROUP BY department
ORDER BY employee_count DESC;
\`\`\`

## Important Notes:

### ⚠️ สำคัญมาก - ข้อมูล OT อยู่ที่ไหน:
- **ไม่มี table payroll!**
- **ข้อมูล OT ทั้งหมดอยู่ใน daily_attendance**
- ใช้ column total_ot_hours สำหรับ OT รวม
- ใช้ column regular_ot_hours สำหรับ OT ธรรมดา
- ใช้ column sunday_ot_hours สำหรับ OT วันอาทิตย์ (ชั่วโมงจริง)
- ใช้ column sunday_ot_calculated สำหรับ OT วันอาทิตย์ (คำนวณแล้ว x3)

### การค้นหาชื่อพนักงาน:
- **employees.name เป็น full name** (ไม่แยก first_name/last_name)
- ใช้ LIKE '%ชื่อ%' สำหรับค้นหา
- ตัวอย่าง: WHERE e.name LIKE '%สรรเพรญ%'
- หรือ: WHERE e.name = 'สรรเพรญ เพชรสงค์'

### JSONB Structure in daily_attendance (day1-day15):
Each day column contains JSON like:
  {"date": "2025-10-11", "ot_hours": 4, "actual_ot": 4, "is_sunday": false}

- ot_hours: ชั่วโมง OT จริง
- actual_ot: ชั่วโมง OT หลังคำนวณ (วันอาทิตย์ x3)
- is_sunday: true ถ้าเป็นวันอาทิตย์

### OT Calculation:
- Regular OT: 1.5x (เก็บใน regular_ot_hours)
- Sunday OT: 3.0x (เก็บใน sunday_ot_calculated)
- Total OT: regular_ot_hours + sunday_ot_calculated = total_ot_hours
- OT Amount (บาท): total_ot_hours * employees.ot_rate

### การ Query ข้อมูล:
- ✅ ใช้ daily_attendance สำหรับข้อมูล OT (ไม่มี table payroll)
- ✅ ใช้ e.name สำหรับชื่อเต็ม (ไม่ใช่ first_name/last_name)
- ✅ ใช้ JOIN employees เพื่อดึงชื่อและแผนก
- ✅ ใช้ JOIN payroll_periods เพื่อดึงข้อมูลรอบ
- ✅ ใช้ ORDER BY ... DESC LIMIT N เพื่อดู Top N
- ✅ ใช้ WHERE period_id = (SELECT id FROM payroll_periods ORDER BY start_date DESC LIMIT 1) สำหรับรอบล่าสุด
- ✅ ใช้ WHERE name LIKE '%keyword%' สำหรับค้นหาชื่อพนักงาน

### Safety Rules:
- ❌ ห้ามใช้: DROP, DELETE, UPDATE, INSERT, TRUNCATE, ALTER
- ✅ ใช้เฉพาะ: SELECT queries only
- ✅ ต้องมี LIMIT สำหรับ queries ที่อาจได้ผลลัพธ์เยอะ (แนะนำ LIMIT 100 หรือน้อยกว่า)
- ✅ ใช้ LIKE '%text%' สำหรับค้นหาชื่อ (เพราะเป็น full name)
`;
