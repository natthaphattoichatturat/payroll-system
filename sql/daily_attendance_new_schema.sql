-- ==========================================
-- DROP และสร้าง daily_attendance table ใหม่
-- เพื่อรองรับการเก็บข้อมูล OT รายวัน (15 วัน/รอบ)
-- ==========================================

-- Drop table เดิม (ระวัง: จะลบข้อมูลทั้งหมด)
DROP TABLE IF EXISTS public.daily_attendance CASCADE;

-- สร้าง table ใหม่
CREATE TABLE public.daily_attendance (
  id SERIAL NOT NULL,
  employee_id VARCHAR(20) NOT NULL,
  period_id INTEGER NOT NULL, -- เชื่อมโยงกับ payroll_periods
  period_start_date DATE NOT NULL, -- วันที่เริ่มต้นรอบ (11 หรือ 26)
  period_end_date DATE NOT NULL, -- วันที่สิ้นสุดรอบ (25 หรือ 10)

  -- เก็บข้อมูล OT แต่ละวัน (15 วัน) เป็น JSONB
  -- Format: {"date": "2025-01-11", "ot_hours": 2.5, "is_sunday": false, "actual_ot": 2.5}
  -- actual_ot = ot_hours * 3 (ถ้าเป็นวันอาทิตย์) หรือ ot_hours (วันปกติ)
  day1 JSONB NULL,
  day2 JSONB NULL,
  day3 JSONB NULL,
  day4 JSONB NULL,
  day5 JSONB NULL,
  day6 JSONB NULL,
  day7 JSONB NULL,
  day8 JSONB NULL,
  day9 JSONB NULL,
  day10 JSONB NULL,
  day11 JSONB NULL,
  day12 JSONB NULL,
  day13 JSONB NULL,
  day14 JSONB NULL,
  day15 JSONB NULL,

  -- สรุปข้อมูล OT
  total_work_days INTEGER NULL DEFAULT 0, -- จำนวนวันที่ทำงาน
  regular_ot_hours NUMERIC(6, 2) NULL DEFAULT 0, -- OT ปกติ (จันทร์-เสาร์)
  sunday_ot_hours NUMERIC(6, 2) NULL DEFAULT 0, -- OT วันอาทิตย์ (ก่อนคูณ 3)
  sunday_ot_calculated NUMERIC(6, 2) NULL DEFAULT 0, -- OT วันอาทิตย์ (หลังคูณ 3)
  total_ot_hours NUMERIC(6, 2) NULL DEFAULT 0, -- OT รวมทั้งหมด (regular_ot + sunday_ot_calculated)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),

  CONSTRAINT daily_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT daily_attendance_employee_period_key UNIQUE (employee_id, period_id),
  CONSTRAINT fk_daily_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id),
  CONSTRAINT fk_daily_period FOREIGN KEY (period_id) REFERENCES payroll_periods (id)
) TABLESPACE pg_default;

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_daily_attendance_employee ON public.daily_attendance
  USING btree (employee_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_daily_attendance_period ON public.daily_attendance
  USING btree (period_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_daily_attendance_dates ON public.daily_attendance
  USING btree (period_start_date, period_end_date) TABLESPACE pg_default;

-- สร้าง trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_attendance_updated_at
  BEFORE UPDATE ON daily_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- คำอธิบาย
COMMENT ON TABLE public.daily_attendance IS 'เก็บข้อมูล OT รายวันของพนักงานแต่ละรอบ (15 วัน/รอบ)';
COMMENT ON COLUMN public.daily_attendance.day1 IS 'ข้อมูล OT วันที่ 1 ของรอบ (JSONB: {date, ot_hours, is_sunday, actual_ot})';
COMMENT ON COLUMN public.daily_attendance.total_ot_hours IS 'OT รวมทั้งหมด = regular_ot + (sunday_ot * 3)';

-- ==========================================
-- ตัวอย่างการใช้งาน
-- ==========================================

-- INSERT ข้อมูลตัวอย่าง
/*
INSERT INTO daily_attendance (
  employee_id,
  period_id,
  period_start_date,
  period_end_date,
  day1,
  day2,
  total_work_days,
  regular_ot_hours,
  sunday_ot_hours,
  sunday_ot_calculated,
  total_ot_hours
) VALUES (
  '20012345',
  1,
  '2025-01-11',
  '2025-01-25',
  '{"date": "2025-01-11", "ot_hours": 2.5, "is_sunday": false, "actual_ot": 2.5}'::jsonb,
  '{"date": "2025-01-12", "ot_hours": 3.0, "is_sunday": true, "actual_ot": 9.0}'::jsonb,
  2,
  2.5,
  3.0,
  9.0,
  11.5
);
*/

-- Query ข้อมูล
/*
SELECT
  employee_id,
  day1->>'date' as day1_date,
  (day1->>'ot_hours')::numeric as day1_ot,
  (day1->>'actual_ot')::numeric as day1_actual_ot,
  total_ot_hours
FROM daily_attendance
WHERE employee_id = '20012345';
*/
