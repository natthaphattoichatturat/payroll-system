import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, MODEL } from '@/lib/openai';
import { DATABASE_SCHEMA } from '@/lib/database-schema';
import { Pool } from 'pg';

// PostgreSQL connection pool using DATABASE_URL
// Format: postgres://user:password@host:port/database
// Lazy initialization to avoid errors during build time
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Please add it to your .env.local file.\n' +
        'Get it from: Supabase Dashboard > Settings > Database > Connection Pooling > Transaction Mode > URI'
      );
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

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

    // Step 1: Generate SQL query
    const sqlCompletion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `คุณคือ SQL Expert ที่ช่วยสร้าง SQL query จากคำถามภาษาไทย

Database Schema:
${DATABASE_SCHEMA}

ข้อกำหนด:
1. สร้าง PostgreSQL query ที่ตอบคำถามของผู้ใช้
2. ใช้ JOIN เมื่อต้องการข้อมูลจากหลายตาราง
3. เรียงลำดับผลลัพธ์ให้เหมาะสม (ORDER BY)
4. จำกัดจำนวนผลลัพธ์ถ้าเหมาะสม (LIMIT)
5. ใช้ alias ที่เข้าใจง่ายสำหรับ column
6. ตรวจสอบว่า query ปลอดภัย (ไม่มี DROP, DELETE, UPDATE)
7. ถ้าคำถามถามเกี่ยวกับ "ล่าสุด" หรือ "เดือนนี้" ให้ใช้ CURRENT_DATE และ date functions

ตอบกลับด้วย SQL query เท่านั้น ไม่ต้องมีคำอธิบาย ไม่ต้องใส่ \`\`\`sql`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.1,
    });

    let sqlQuery = sqlCompletion.choices[0]?.message?.content?.trim() || '';

    // Clean up SQL query
    sqlQuery = sqlQuery.replace(/```sql/g, '').replace(/```/g, '').trim();

    // Safety check
    const dangerousKeywords = ['drop', 'delete', 'truncate', 'alter', 'update', 'insert'];
    const lowerQuery = sqlQuery.toLowerCase();
    if (dangerousKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return NextResponse.json(
        { error: 'Query contains dangerous operations' },
        { status: 400 }
      );
    }

    // Step 2: Execute SQL query using PostgreSQL
    console.log('Executing SQL query:', sqlQuery);
    let queryResult;
    const dbPool = getPool();
    const client = await dbPool.connect();
    
    try {
      const result = await client.query(sqlQuery);
      queryResult = result.rows;
      console.log(`Query returned ${queryResult.length} rows`);
    } catch (execError) {
      console.error('Query execution error:', execError);
      return NextResponse.json(
        {
          error: 'Failed to execute query',
          sql: sqlQuery,
          details: execError instanceof Error ? execError.message : 'Unknown error'
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }

    // Step 3: Format results using LLM
    const formatCompletion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `คุณคือ AI Assistant ที่ช่วยจัดรูปแบบและอธิบายผลลัพธ์จากฐานข้อมูล

งานของคุณ:
1. แปลงผลลัพธ์จากฐานข้อมูลให้เป็นข้อความภาษาไทยที่อ่านง่าย
2. ใช้ Markdown format เพื่อความสวยงาม
3. ใช้ตารางสำหรับข้อมูลที่มีหลายแถว
4. ใช้หัวข้อและจัดหมวดหมู่ที่เหมาะสม
5. เพิ่มสรุปหรือ insight ที่น่าสนใจ (ถ้ามี)
6. ถ้าไม่มีข้อมูล ให้บอกอย่างชัดเจน

ตัวอย่าง format ที่ดี:

## ผลลัพธ์: พนักงานที่ทำ OT มากที่สุด 5 อันดับแรก

| อันดับ | ชื่อ-นามสกุล | แผนก | ชั่วโมง OT | ค่า OT (บาท) |
|--------|--------------|------|------------|--------------|
| 1 | สมชาย ใจดี | Production | 45.5 | 15,750 |
| 2 | สมหญิง รักงาน | QA | 40.0 | 13,200 |

### สรุป
- พนักงานแผนก Production มีแนวโน้มทำ OT มากที่สุด
- ค่า OT เฉลี่ยต่อชั่วโมงอยู่ที่ 330 บาท`,
        },
        {
          role: 'user',
          content: `คำถาม: ${message}\n\nSQL Query:\n${sqlQuery}\n\nผลลัพธ์:\n${JSON.stringify(queryResult, null, 2)}`,
        },
      ],
      temperature: 0.3,
    });

    const formattedResponse = formatCompletion.choices[0]?.message?.content || 'ไม่สามารถจัดรูปแบบผลลัพธ์ได้';

    return NextResponse.json({
      response: formattedResponse,
      sql: sqlQuery,
      rawData: queryResult
    });
  } catch (error) {
    console.error('Data query error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process data query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
