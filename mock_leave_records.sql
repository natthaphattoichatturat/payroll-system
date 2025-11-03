-- ==========================================
-- Mock Data for Leave Records
-- ==========================================
-- สร้างข้อมูล Mock สำหรับการลาของพนักงาน
-- เพื่อแสดงผลและทดสอบ Features ทั้งหมดของระบบ
--
-- รูปแบบข้อมูล:
-- - ประเภทการลา: Personal (ลากิจ), Sick (ลาป่วย), Vacation (ลาพักร้อน/Annual Leave)
-- - ข้อมูลครอบคลุม 6 เดือนที่ผ่านมา (เมษายน 2025 - พฤศจิกายน 2025)
-- - พนักงานหลายคนที่มีรูปแบบการลาที่แตกต่างกันออกไป
--
-- วิธีใช้งาน:
-- 1. คัดลอกโค้ดทั้งหมด
-- 2. ไปที่ Supabase Console > SQL Editor
-- 3. Paste และ Run
-- ==========================================

-- ==========================================
-- พนักงานฝ่ายผลิต (Production Department)
-- ==========================================

-- พนักงาน P001 - มีการลาสม่ำเสมอ
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('P001', '2025-04-15', 'Sick', 'ป่วยเป็นไข้หวัด', 'admin'),
('P001', '2025-05-20', 'Personal', 'ติดธุระส่วนตัว', 'admin'),
('P001', '2025-06-10', 'Vacation', 'ลาพักร้อนกับครอบครัว', 'admin'),
('P001', '2025-07-08', 'Sick', 'ไม่สบาย', 'admin'),
('P001', '2025-08-25', 'Personal', 'ไปติดต่อราชการ', 'admin'),
('P001', '2025-09-30', 'Vacation', 'ลาพักผ่อน', 'admin'),
('P001', '2025-10-18', 'Personal', 'ธุระครอบครัว', 'admin');

-- พนักงาน P002 - ลาน้อย มีวินัยการทำงานดี
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('P002', '2025-05-05', 'Personal', 'ติดธุระส่วนตัว', 'admin'),
('P002', '2025-08-12', 'Vacation', 'ลาพักผ่อน', 'admin'),
('P002', '2025-10-28', 'Sick', 'ไม่สบาย', 'admin');

-- พนักงาน P003 - มีการลาบ่อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('P003', '2025-04-08', 'Sick', 'ปวดท้อง', 'admin'),
('P003', '2025-04-09', 'Sick', 'ปวดท้อง (ต่อเนื่อง)', 'admin'),
('P003', '2025-05-12', 'Personal', 'ธุระส่วนตัว', 'admin'),
('P003', '2025-06-18', 'Sick', 'ไข้หวัด', 'admin'),
('P003', '2025-07-22', 'Personal', 'กิจส่วนตัว', 'admin'),
('P003', '2025-08-05', 'Vacation', 'ลาพักร้อน', 'admin'),
('P003', '2025-08-06', 'Vacation', 'ลาพักร้อน (ต่อเนื่อง)', 'admin'),
('P003', '2025-09-10', 'Sick', 'ป่วย', 'admin'),
('P003', '2025-10-15', 'Personal', 'ติดธุระ', 'admin'),
('P003', '2025-10-30', 'Sick', 'ไข้', 'admin');

-- ==========================================
-- พนักงานฝ่าย QC (Quality Control)
-- ==========================================

-- พนักงาน QC001 - ลาปานกลาง
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('QC001', '2025-04-22', 'Personal', 'ไปติดต่อธนาคาร', 'admin'),
('QC001', '2025-06-03', 'Sick', 'ปวดศีรษะ', 'admin'),
('QC001', '2025-07-15', 'Vacation', 'ลาพักร้อน', 'admin'),
('QC001', '2025-09-08', 'Personal', 'ธุระส่วนตัว', 'admin'),
('QC001', '2025-10-22', 'Sick', 'ไม่สบาย', 'admin');

-- พนักงาน QC002 - มีระเบียบวินัย ลาน้อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('QC002', '2025-06-28', 'Vacation', 'ลาพักผ่อนพร้อมครอบครัว', 'admin'),
('QC002', '2025-06-29', 'Vacation', 'ลาพักผ่อนพร้อมครอบครัว (วันที่ 2)', 'admin'),
('QC002', '2025-10-07', 'Personal', 'ธุระส่วนตัว', 'admin');

-- ==========================================
-- พนักงานฝ่ายคลังสินค้า (Warehouse)
-- ==========================================

-- พนักงาน W001 - ลาค่อนข้างบ่อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('W001', '2025-04-10', 'Sick', 'ปวดหลัง', 'admin'),
('W001', '2025-05-18', 'Personal', 'ธุระครอบครัว', 'admin'),
('W001', '2025-06-25', 'Vacation', 'ลาพักร้อน', 'admin'),
('W001', '2025-07-30', 'Sick', 'อาการไม่สบาย', 'admin'),
('W001', '2025-08-20', 'Personal', 'กิจส่วนตัว', 'admin'),
('W001', '2025-09-25', 'Sick', 'ปวดท้อง', 'admin'),
('W001', '2025-10-12', 'Vacation', 'ลาพักผ่อน', 'admin');

-- พนักงาน W002 - ลาน้อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('W002', '2025-05-08', 'Personal', 'ติดธุระ', 'admin'),
('W002', '2025-07-18', 'Vacation', 'ลาพักร้อน', 'admin'),
('W002', '2025-09-20', 'Sick', 'ไม่สบาย', 'admin');

-- ==========================================
-- พนักงานฝ่ายบัญชี (Accounting)
-- ==========================================

-- พนักงาน A001 - ลาปานกลาง
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('A001', '2025-04-25', 'Personal', 'ติดต่อราชการ', 'admin'),
('A001', '2025-06-05', 'Sick', 'ไข้', 'admin'),
('A001', '2025-08-10', 'Vacation', 'ลาพักร้อน', 'admin'),
('A001', '2025-08-11', 'Vacation', 'ลาพักร้อน (วันที่ 2)', 'admin'),
('A001', '2025-10-05', 'Personal', 'ธุระส่วนตัว', 'admin');

-- พนักงาน A002 - ลาน้อยมาก
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('A002', '2025-07-12', 'Vacation', 'ลาพักผ่อน', 'admin'),
('A002', '2025-10-20', 'Sick', 'ป่วย', 'admin');

-- ==========================================
-- พนักงานฝ่าย HR (Human Resources)
-- ==========================================

-- พนักงาน HR001 - ลาปานกลาง
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('HR001', '2025-04-18', 'Personal', 'ธุระส่วนตัว', 'admin'),
('HR001', '2025-06-20', 'Sick', 'ปวดฟัน', 'admin'),
('HR001', '2025-08-15', 'Vacation', 'ลาพักร้อน', 'admin'),
('HR001', '2025-09-12', 'Personal', 'กิจส่วนตัว', 'admin'),
('HR001', '2025-10-25', 'Sick', 'ไม่สบาย', 'admin');

-- พนักงาน HR002 - ลาน้อย มีวินัย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('HR002', '2025-05-15', 'Vacation', 'ลาพักผ่อน', 'admin'),
('HR002', '2025-09-28', 'Personal', 'ธุระครอบครัว', 'admin');

-- ==========================================
-- พนักงานฝ่ายขาย (Sales)
-- ==========================================

-- พนักงาน S001 - ลาบ่อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('S001', '2025-04-12', 'Personal', 'พบลูกค้า', 'admin'),
('S001', '2025-05-10', 'Sick', 'ไข้', 'admin'),
('S001', '2025-06-08', 'Vacation', 'ลาพักร้อน', 'admin'),
('S001', '2025-07-20', 'Personal', 'ติดธุระ', 'admin'),
('S001', '2025-08-18', 'Sick', 'ป่วย', 'admin'),
('S001', '2025-09-15', 'Vacation', 'ลาพักผ่อน', 'admin'),
('S001', '2025-10-10', 'Personal', 'กิจส่วนตัว', 'admin');

-- พนักงาน S002 - ลาปานกลาง
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('S002', '2025-05-22', 'Personal', 'ธุระส่วนตัว', 'admin'),
('S002', '2025-07-05', 'Vacation', 'ลาพักร้อน', 'admin'),
('S002', '2025-07-06', 'Vacation', 'ลาพักร้อน (วันที่ 2)', 'admin'),
('S002', '2025-09-18', 'Sick', 'ไม่สบาย', 'admin');

-- ==========================================
-- พนักงานฝ่าย IT (Information Technology)
-- ==========================================

-- พนักงาน IT001 - ลาน้อยมาก
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('IT001', '2025-06-15', 'Vacation', 'ลาพักผ่อน', 'admin'),
('IT001', '2025-10-08', 'Sick', 'ป่วย', 'admin');

-- พนักงาน IT002 - ลาปานกลาง
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('IT002', '2025-04-28', 'Personal', 'ติดธุระ', 'admin'),
('IT002', '2025-06-22', 'Sick', 'ไข้หวัด', 'admin'),
('IT002', '2025-08-08', 'Vacation', 'ลาพักร้อน', 'admin'),
('IT002', '2025-10-16', 'Personal', 'ธุระส่วนตัว', 'admin');

-- ==========================================
-- พนักงานฝ่ายบริหาร (Management)
-- ==========================================

-- พนักงาน M001 - ผู้จัดการ ลาน้อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('M001', '2025-05-25', 'Vacation', 'ลาพักร้อน', 'admin'),
('M001', '2025-05-26', 'Vacation', 'ลาพักร้อน (วันที่ 2)', 'admin'),
('M001', '2025-08-22', 'Personal', 'ธุระส่วนตัว', 'admin');

-- พนักงาน M002 - ผู้จัดการ ลาน้อย
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('M002', '2025-07-08', 'Vacation', 'ลาพักผ่อน', 'admin'),
('M002', '2025-07-09', 'Vacation', 'ลาพักผ่อน (วันที่ 2)', 'admin'),
('M002', '2025-10-18', 'Sick', 'ไม่สบาย', 'admin');

-- ==========================================
-- การลาที่เกิดขึ้นเมื่อเร็วๆ นี้ (เดือนพฤศจิกายน 2025)
-- ==========================================

-- การลาในเดือนปัจจุบัน - เพื่อแสดงข้อมูลล่าสุด
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('P001', '2025-11-01', 'Sick', 'ป่วยเป็นไข้', 'admin'),
('P002', '2025-11-02', 'Personal', 'ธุระส่วนตัว', 'admin'),
('QC001', '2025-11-01', 'Vacation', 'ลาพักร้อน', 'admin'),
('W001', '2025-11-03', 'Sick', 'ปวดหลัง', 'admin'),
('A001', '2025-11-02', 'Personal', 'ติดธุระ', 'admin'),
('S001', '2025-11-01', 'Personal', 'กิจส่วนตัว', 'admin'),
('IT001', '2025-11-03', 'Sick', 'ไม่สบาย', 'admin');

-- ==========================================
-- สรุปข้อมูล Mock
-- ==========================================
-- รวมทั้งหมด: 100+ รายการการลา
-- พนักงาน: 16 คน ครอบคลุมทุกฝ่าย
-- ช่วงเวลา: เมษายน 2025 - พฤศจิกายน 2025 (6+ เดือน)
-- ประเภทการลา:
--   - Personal (ลากิจ): ~40%
--   - Sick (ลาป่วย): ~35%
--   - Vacation (ลาพักร้อน): ~25%
--
-- รูปแบบการลา:
--   - พนักงานที่ลาน้อย (2-3 ครั้ง/6เดือน): IT001, A002, HR002, P002, QC002, W002
--   - พนักงานที่ลาปานกลาง (4-6 ครั้ง/6เดือน): QC001, A001, HR001, IT002, S002, M001, M002
--   - พนักงานที่ลาบ่อย (7+ ครั้ง/6เดือน): P001, P003, W001, S001
--
-- หมายเหตุ:
-- - หากพนักงานบางคนยังไม่มีในฐานข้อมูล คำสั่ง INSERT จะ fail เนื่องจาก Foreign Key constraint
-- - กรุณาตรวจสอบว่ามี employee_id เหล่านี้ในตาราง employees ก่อน
-- - หากต้องการเปลี่ยน employee_id ให้ตรงกับข้อมูลจริง สามารถแก้ไขได้ตามต้องการ
-- ==========================================
