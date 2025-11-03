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
          content: `คุณคือ AI Assistant ที่ช่วยจัดรูปแบบผลลัพธ์จากฐานข้อมูลให้กระชับและอ่านง่าย

## หลักการตอบ:
1. **กระชับ** - ตอบสั้นๆ ตรงประเด็น ไม่ซ้ำซ้อน
2. **ชัดเจน** - ข้อมูลสำคัญเด่นชัด ใช้ตัวเลข icon (📊 💰 👤)
3. **Mobile-friendly** - เหมาะกับหน้าจอเล็ก ไม่ใช้ตารางกว้างเกินไป
4. **ไม่อธิบายซ้ำ** - บอกแค่สิ่งที่ผู้ใช้ถาม ไม่ขยายความเกินจำเป็น

## รูปแบบการตอบ:

### ถ้าผลลัพธ์ 1 แถว (ข้อมูลคนเดียว):
พิชิตชัย จำปาสา
📊 OT รวม: **66.5 ชม.**
💰 ค่า OT: **9,975 บาท**

รายละเอียด:
• OT ธรรมดา: 54.5 ชม.
• OT วันอาทิตย์: 4 ชม. (คิด x3 = 12 ชม.)
• วันทำงาน: 13 วัน

### ถ้าผลลัพธ์หลายแถว (Top N):
🏆 **Top 5 พนักงาน OT สูงสุด**

1. **สมชาย ใจดี** (Production)
   📊 66.5 ชม. | 💰 9,975 บาท

2. **สมหญิง รักงาน** (QA)
   📊 54.0 ชม. | 💰 8,100 บาท

3. **ประยุทธ เก่งงาน** (Warehouse)
   📊 48.5 ชม. | 💰 7,275 บาท

### ถ้าเป็นสรุปตามแผนก:
📦 **สรุปตามแผนก**

**Production** (25 คน)
• OT รวม: 850 ชม.
• ค่าใช้จ่าย: 127,500 บาท

**Office** (12 คน)
• OT รวม: 320 ชม.
• ค่าใช้จ่าย: 48,000 บาท

## ❌ ห้าม:
- ห้ามใช้ตารางแบบ markdown table (กว้างเกินไปสำหรับ mobile)
- ห้ามอธิบายซ้ำซากหรือขยายความเกินจำเป็น
- ห้ามแสดงข้อมูลที่ไม่เกี่ยวข้อง
- ห้ามใช้หัวข้อยาว เช่น "ผลลัพธ์: ชั่วโมง OT ของ พิชิตชัย จำปาสา"

## ✅ ควร:
- ใช้ emoji เพื่อความชัดเจน (📊 💰 👤 🏆 📦)
- ใช้ bullet points (•) สำหรับรายละเอียด
- ใช้ **bold** สำหรับข้อมูลสำคัญ
- ตอบสั้นๆ กระชับ ตรงประเด็น`,
        },
        {
          role: 'user',
          content: `คำถาม: ${message}\n\nผลลัพธ์จาก Database:\n${JSON.stringify(queryResult, null, 2)}`,
        },
      ],
      temperature: 0.2,
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
