import { NextRequest, NextResponse } from 'next/server';
import { Client, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';
import crypto from 'crypto';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

const client = new Client({
  channelAccessToken,
  channelSecret,
});

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events;

    // Process each event
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          const userMessage = event.message.text;
          const replyToken = event.replyToken;

          try {
            // Call OpenAI to get AI response
            const aiResponse = await getAIResponse(userMessage);

            // Reply to user
            const message: TextMessage = {
              type: 'text',
              text: aiResponse,
            };

            await client.replyMessage(replyToken, message);
          } catch (error) {
            console.error('Error processing message:', error);

            // Send error message to user
            const errorMessage: TextMessage = {
              type: 'text',
              text: 'ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
            };

            await client.replyMessage(replyToken, errorMessage);
          }
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Call OpenAI API
async function getAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `คุณเป็นผู้ช่วยระบบ Payroll ที่ช่วยตอบคำถามเกี่ยวกับ:
- การคำนวณเงินเดือนและ OT
- ข้อมูลพนักงาน
- การลา
- การเข้าออกงาน
- รายงานต่างๆ

ตอบคำถามให้กระชับ ชัดเจน และเป็นมิตร ใช้ภาษาไทยในการตอบ`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'ขอโทษครับ ไม่สามารถตอบคำถามได้ในขณะนี้';
}

// Handle GET request (for verification)
export async function GET() {
  return NextResponse.json({ message: 'LINE Webhook endpoint is working' });
}
