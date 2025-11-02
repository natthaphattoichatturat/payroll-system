# Payroll System SaaS

ระบบคำนวณเงินเดือนอัตโนมัติสำหรับโรงงาน พร้อมระบบบันทึกเวลาทำงาน การคำนวณ OT และการจัดการเงินเดือน

## คุณสมบัติหลัก

### 1. บันทึกเวลาทำงาน (Attendance Tracking)
- นำเข้าข้อมูลจากเครื่องสแกนใบหน้า (รองรับรูปแบบ text)
- รองรับการทำงานข้ามวัน (overnight shifts)
- คำนวณเวลาเข้า-ออกอัตโนมัติ
- รองรับกะงานหลายรูปแบบ (กะเช้า, กะดึก)

### 2. คำนวณ OT (Overtime Calculation)
- คำนวณ OT เข้างานก่อนเวลา
- คำนวณ OT เลิกงานหลังเวลา
- OT วันธรรมดา (จันทร์-เสาร์)
- OT วันหยุด (วันอาทิตย์) คูณ 3 เท่า
- ปัดเศษ 30 นาที อัตโนมัติ

### 3. จัดการพนักงาน
- เพิ่ม/แก้ไข/ลบข้อมูลพนักงาน
- นำเข้าข้อมูลจากไฟล์ CSV
- จัดการอัตราค่าจ้างและค่า OT

### 4. จัดการการลางาน
- บันทึกวันลาของพนักงาน
- ระบุประเภทการลา (ลากิจ, ลาป่วย, ลาพักร้อน)
- อัพเดทสถานะการทำงานอัตโนมัติ

### 5. คำนวณเงินเดือน
- คำนวณเงินเดือนตามรอบ (เช่น วันที่ 10-25)
- คำนวณภาษีตามกฎหมาย
- คำนวณประกันสังคม (5% สูงสุด 750 บาท)
- สร้างสลิปเงินเดือน PDF

### 6. รายงาน
- รายงานการทำงานรายวัน
- รายงาน OT รายเดือน
- รายงานเงินเดือนรายเดือน/ประจำปี
- ส่งออกเป็น Excel และ PDF

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
cd payroll-system
npm install
```

### 2. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ooipmyvpvpdbffjvbcej.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**สำคัญ:** คุณต้องเข้า Supabase Console เพื่อนำ Anon Key มาใส่

### 3. สร้าง Database Tables

1. เข้า [Supabase Console](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ SQL Editor
4. Run SQL จากไฟล์ `/Users/piw/Downloads/dem/database_schema.sql`

### 4. Run Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## เทคโนโลยีที่ใช้

- **Frontend & Backend:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **API:** REST API (PostgREST)
- **UI Components:** Custom components
- **Libraries:**
  - date-fns (Date manipulation)
  - xlsx (Excel export)
  - jspdf (PDF generation)
  - react-hot-toast (Notifications)
  - lucide-react (Icons)
