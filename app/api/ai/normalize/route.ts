import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, MODEL } from '@/lib/openai';

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
          content: `คุณคือ AI ที่ช่วยแก้ไขและปรับปรุงข้อความภาษาไทยให้ถูกต้อง

งานของคุณคือ:
1. แก้ไขคำผิด (typos) ในภาษาไทยและภาษาอังกฤษ
2. เติมประโยคที่ไม่สมบูรณ์ให้สมบูรณ์
3. แก้ไขไวยากรณ์ที่ผิดพลาด
4. รักษาความหมายเดิมของข้อความไว้
5. ถ้าข้อความถูกต้องอยู่แล้ว ให้คืนค่าเหมือนเดิม

ตอบกลับด้วยข้อความที่แก้ไขแล้วเท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
    });

    const normalizedMessage = completion.choices[0]?.message?.content || message;

    return NextResponse.json({ normalizedMessage });
  } catch (error) {
    console.error('Normalization error:', error);
    return NextResponse.json(
      { error: 'Failed to normalize message' },
      { status: 500 }
    );
  }
}
