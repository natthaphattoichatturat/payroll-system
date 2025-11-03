import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, MODEL } from '@/lib/openai';

export type QueryType = 'data_query' | 'how_to' | 'general';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `คุณคือ AI ที่ช่วยจำแนกประเภทของคำถาม

ระบบ Payroll นี้มีข้อมูลดังนี้:
- ข้อมูลพนักงาน (ชื่อ, แผนก, ตำแหน่ง, เงินเดือน)
- ข้อมูลเวลาเข้า-ออกงาน (attendance_scans)
- ข้อมูลการทำงานล่วงเวลา (OT)
- ข้อมูลการลางาน (leave_records)
- ข้อมูลการคำนวณเงินเดือน (payroll_calculations)
- ข้อมูลแผนก (departments)

จำแนกคำถามเป็น 3 ประเภท:

1. "data_query" - คำถามที่ต้องการข้อมูลจากฐานข้อมูล เช่น:
   - พนักงานคนไหนทำ OT เยอะที่สุด
   - แผนกไหนมีค่าใช้จ่ายเงินเดือนมากที่สุด
   - มีพนักงานกี่คนในแผนก Production
   - รายชื่อพนักงานที่ลามากที่สุด
   - ค่าเงินเดือนรวมของบริษัทเท่าไหร่

2. "how_to" - คำถามเกี่ยวกับวิธีใช้งานระบบ เช่น:
   - วิธีการ import ข้อมูลเวลาทำงานอย่างไร
   - วิธีเพิ่มพนักงานใหม่
   - การคำนวณ OT ในระบบทำงานอย่างไร
   - วิธีการสร้างรายงาน
   - ระบบคำนวณภาษีอย่างไร

3. "general" - คำถามทั่วไป ทักทาย หรือคำถามอื่นๆ ที่ไม่เกี่ยวกับข้อมูลหรือการใช้งาน เช่น:
   - สวัสดี
   - ขอบคุณ
   - คุณคือใคร
   - อธิบายเกี่ยวกับ AI

ตอบกลับเพียงคำเดียว: "data_query", "how_to", หรือ "general"`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.1,
    });

    const classification = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'general';

    let queryType: QueryType = 'general';
    if (classification.includes('data_query')) {
      queryType = 'data_query';
    } else if (classification.includes('how_to')) {
      queryType = 'how_to';
    }

    return NextResponse.json({ queryType });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify message' },
      { status: 500 }
    );
  }
}
