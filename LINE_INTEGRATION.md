# LINE Integration Guide

## ภาพรวม (Overview)

ระบบนี้ได้รับการพัฒนาให้สามารถเชื่อมต่อกับ LINE Messaging API และ LINE LIFF (LINE Front-end Framework) เพื่อให้ผู้ใช้สามารถ:
1. สนทนากับ AI Chatbot ผ่าน LINE Official Account
2. ดูรายงาน OT ของพนักงานผ่าน LIFF App บนมือถือ

---

## 🔑 ข้อมูล LINE Credentials

### LINE Messaging API
- **Channel ID:** `2008409511`
- **Channel Secret:** `99b6f4656a2037e14c8975b5fb61916b`
- **Channel Access Token:** (ตั้งค่าแล้วใน .env.local)

### LINE LIFF
- **LIFF ID:** `2008409515-erDb5ylB`
- **LIFF URL:** `https://liff.line.me/2008409515-erDb5ylB`

---

## 🌐 URLs Configuration

สำหรับ domain: `https://payroll-system-mu.vercel.app/`

### 1. Webhook URL (สำหรับ LINE Messaging API)
```
https://payroll-system-mu.vercel.app/api/line/webhook
```

**วิธีตั้งค่าใน LINE Developers Console:**
1. เข้าสู่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Provider และ Channel ของคุณ (Channel ID: 2008409511)
3. ไปที่แท็บ "Messaging API"
4. ในส่วน "Webhook settings":
   - Webhook URL: `https://payroll-system-mu.vercel.app/api/line/webhook`
   - เปิด "Use webhook": ON
   - เปิด "Verify" เพื่อทดสอบ webhook (ควรได้ status 200)
5. ในส่วน "Auto-reply messages": ปิด (OFF)
6. ในส่วน "Greeting messages": ตั้งค่าตามต้องการ

### 2. LIFF Endpoint URL
```
https://payroll-system-mu.vercel.app/liff/payroll
```

**วิธีตั้งค่าใน LINE Developers Console:**
1. ไปที่แท็บ "LIFF"
2. คลิก "Edit" บน LIFF app ที่มี LIFF ID: `2008409515-erDb5ylB`
3. ตั้งค่าดังนี้:
   - **Endpoint URL:** `https://payroll-system-mu.vercel.app/liff/payroll`
   - **Size:** Full (เต็มจอ)
   - **BLE feature:** OFF
   - **Scan QR:** OFF (หรือตั้งค่าตามต้องการ)
4. คลิก "Update"

---

## 📁 ไฟล์ที่เกี่ยวข้อง

### 1. LINE Webhook API
**ไฟล์:** `app/api/line/webhook/route.ts`

**หน้าที่:**
- รับข้อความจากผู้ใช้ LINE
- Verify signature จาก LINE
- ส่งข้อความไปยัง OpenAI GPT-4o-mini
- ตอบกลับผู้ใช้ผ่าน LINE

**Features:**
- รองรับข้อความประเภท text
- AI Chatbot ตอบคำถามเกี่ยวกับระบบ Payroll
- ตอบภาษาไทย

### 2. LIFF Page
**ไฟล์:** `app/liff/payroll/page.tsx`

**หน้าที่:**
- แสดงข้อมูล OT ของพนักงานทั้งหมด
- แสดงข้อมูลรายวัน 15 วัน (Day 1-15)
- แสดง OT รวมของแต่ละคน

**Features:**
- ✅ Pagination: แสดง 10 คนต่อหน้า
- ✅ Sort: เรียงตามชื่อ, แผนก, หรือ OT รวม (มากไปน้อย / น้อยไปมาก)
- ✅ Mobile-responsive design
- ✅ Color-coded OT display:
  - เขียว: วันธรรมดา
  - แดง: วันอาทิตย์ (×3)
- ✅ Card-based layout สำหรับมือถือ

### 3. LIFF API Endpoint
**ไฟล์:** `app/api/liff/payroll/route.ts`

**หน้าที่:**
- API สำหรับดึงข้อมูล OT จาก database
- Return JSON format สำหรับ LIFF page

---

## 🔧 Environment Variables

ไฟล์ที่ตั้งค่าแล้ว: `.env.local`

```bash
# LINE Messaging API
LINE_CHANNEL_ID=2008409511
LINE_CHANNEL_SECRET=99b6f4656a2037e14c8975b5fb61916b
LINE_CHANNEL_ACCESS_TOKEN=<your-token>

# LINE LIFF
NEXT_PUBLIC_LIFF_ID=2008409515-erDb5ylB

# OpenAI (สำหรับ AI Chatbot)
OPENAI_API_KEY=<your-openai-key>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

---

## 🚀 การใช้งาน

### 1. LINE Bot (AI Chatbot)
1. Add LINE Official Account เป็นเพื่อน (QR Code จาก LINE Developers Console)
2. ส่งข้อความถาม เช่น:
   - "การคำนวณ OT ทำอย่างไร?"
   - "วันอาทิตย์คำนวณ OT แบบไหน?"
   - "ดูข้อมูลพนักงานได้ที่ไหน?"
3. Bot จะตอบคำถามโดยใช้ AI

### 2. LIFF App (รายงาน OT)
1. เปิด LIFF URL หรือส่ง Rich Menu ที่มีปุ่มเปิด LIFF
2. ระบบจะแสดงข้อมูล OT ของพนักงานทั้งหมด
3. สามารถ:
   - เลื่อนดูพนักงานแต่ละคน (10 คน/หน้า)
   - กดปุ่ม "ถัดไป" / "ก่อนหน้า" เพื่อเปลี่ยนหน้า
   - เลือก Sort field และทิศทาง (↑↓)

---

## 🧪 การทดสอบ

### ทดสอบ Webhook
```bash
curl -X POST https://payroll-system-mu.vercel.app/api/line/webhook \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test" \
  -d '{"events":[]}'
```

### ทดสอบ LIFF API
```bash
curl https://payroll-system-mu.vercel.app/api/liff/payroll
```

### ทดสอบ LIFF Page
เปิด browser และไปที่:
```
https://payroll-system-mu.vercel.app/liff/payroll
```

---

## 📱 Screenshots / Features

### LINE Bot
- รับข้อความ text
- ตอบด้วย AI (GPT-4o-mini)
- รองรับภาษาไทย

### LIFF Page
- แสดงข้อมูลพนักงาน 10 คน/หน้า
- Grid 5x3 แสดง OT 15 วัน
- Sort controls (Dropdown + Toggle)
- Pagination buttons (ก่อนหน้า / ถัดไป)
- Mobile-optimized UI

---

## 🔐 Security Notes

1. **Webhook Signature Verification**: ระบบจะตรวจสอบ signature จาก LINE ทุกครั้ง
2. **Environment Variables**: ห้ามเปิดเผย `.env.local` ต่อสาธารณะ
3. **LIFF Login**: LIFF จะตรวจสอบว่า user login ผ่าน LINE แล้วหรือไม่

---

## 📝 Next Steps

หากต้องการเพิ่มฟีเจอร์:

### สำหรับ LINE Bot
- เพิ่มคำตอบสำเร็จรูป (Quick Replies)
- เพิ่ม Rich Menu
- รองรับรูปภาพ / sticker

### สำหรับ LIFF
- เพิ่ม filter ตามแผนก
- เพิ่ม date range selector
- ส่งออก Excel
- แสดง chart / graph

---

## 🆘 Troubleshooting

### Webhook ไม่ทำงาน
1. ตรวจสอบว่า webhook URL ถูกต้อง
2. ตรวจสอบ Channel Secret ใน .env.local
3. เช็ค logs ใน Vercel dashboard
4. Verify webhook ใน LINE Developers Console

### LIFF ไม่แสดงข้อมูล
1. ตรวจสอบว่ามี payroll period ใน database
2. ตรวจสอบ Supabase connection
3. เช็ค browser console สำหรับ errors
4. ตรวจสอบว่า LIFF ID ถูกต้อง

---

## 📚 เอกสารเพิ่มเติม

- [LINE Messaging API Docs](https://developers.line.biz/en/docs/messaging-api/)
- [LINE LIFF Docs](https://developers.line.biz/en/docs/liff/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)

---

**สร้างโดย:** Claude Code
**วันที่:** 2025-11-03
**Version:** 1.0
