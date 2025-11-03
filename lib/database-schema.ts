export const DATABASE_SCHEMA = `
# Database Schema for Payroll System

## Tables:

### 1. departments
- id: SERIAL PRIMARY KEY
- name: VARCHAR (ชื่อแผนก เช่น Production, QA, Warehouse)
- description: TEXT
- created_at: TIMESTAMP

### 2. employees
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR UNIQUE (รหัสพนักงาน)
- name: VARCHAR (ชื่อ-นามสกุล)
- department_id: INTEGER (FK -> departments.id)
- position: VARCHAR (ตำแหน่งงาน)
- hire_date: DATE (วันที่เริ่มงาน)
- base_salary: DECIMAL (เงินเดือนฐาน)
- status: VARCHAR (active/inactive)
- created_at: TIMESTAMP

### 3. attendance_scans
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR (FK -> employees.employee_id)
- scan_date: DATE (วันที่สแกน)
- scan_type: VARCHAR (check_in/check_out)
- scan_time: TIME (เวลาที่สแกน)
- created_at: TIMESTAMP

### 4. shift_schedules
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR (FK -> employees.employee_id)
- shift_date: DATE (วันที่กะทำงาน)
- shift_start: TIME (เวลาเริ่มกะ)
- shift_end: TIME (เวลาสิ้นสุดกะ)
- is_overnight: BOOLEAN (กะข้ามคืน)
- created_at: TIMESTAMP

### 5. leave_records
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR (FK -> employees.employee_id)
- leave_type: VARCHAR (sick/personal/annual)
- start_date: DATE (วันเริ่มลา)
- end_date: DATE (วันสิ้นสุดลา)
- days: DECIMAL (จำนวนวันลา)
- status: VARCHAR (pending/approved/rejected)
- reason: TEXT
- created_at: TIMESTAMP

### 6. payroll_periods
- id: SERIAL PRIMARY KEY
- period_name: VARCHAR (เช่น "มกราคม 2024")
- start_date: DATE (วันเริ่มต้นรอบเงินเดือน)
- end_date: DATE (วันสิ้นสุดรอบเงินเดือน)
- status: VARCHAR (draft/finalized/paid)
- created_at: TIMESTAMP

### 7. payroll_calculations
- id: SERIAL PRIMARY KEY
- period_id: INTEGER (FK -> payroll_periods.id)
- employee_id: VARCHAR (FK -> employees.employee_id)
- base_salary: DECIMAL (เงินเดือนฐาน)
- total_ot_hours: DECIMAL (ชั่วโมง OT รวม)
- ot_amount: DECIMAL (เงิน OT)
- gross_salary: DECIMAL (เงินเดือนรวมก่อนหัก)
- tax: DECIMAL (ภาษี)
- social_security: DECIMAL (ประกันสังคม)
- net_salary: DECIMAL (เงินสุทธิ)
- created_at: TIMESTAMP

### 8. holidays
- id: SERIAL PRIMARY KEY
- holiday_date: DATE (วันหยุด)
- name: VARCHAR (ชื่อวันหยุด)
- is_public_holiday: BOOLEAN
- created_at: TIMESTAMP

## Relationships:
- employees.department_id -> departments.id
- attendance_scans.employee_id -> employees.employee_id
- shift_schedules.employee_id -> employees.employee_id
- leave_records.employee_id -> employees.employee_id
- payroll_calculations.period_id -> payroll_periods.id
- payroll_calculations.employee_id -> employees.employee_id

## Important Notes:
- OT calculation rules:
  * Regular OT (นอกเวลา): 1.5x hourly rate
  * Sunday OT (วันอาทิตย์): 3.0x hourly rate
  * Hourly rate = base_salary / 240
- Tax calculation: Progressive rate (0-150k: 0%, 150k-300k: 5%, etc.)
- Social security: 5% of gross salary (max 750 THB)
- Join employees table to get employee name and department information
`;
