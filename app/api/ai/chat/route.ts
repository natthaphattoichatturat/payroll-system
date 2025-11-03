import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory-manager';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert history dates from strings to Date objects
    const typedHistory: Message[] = history.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    // Step 1: Normalize input
    console.log('Step 1: Normalizing input...');
    const normalizeResponse = await fetch(
      `${request.nextUrl.origin}/api/ai/normalize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }
    );

    if (!normalizeResponse.ok) {
      throw new Error('Failed to normalize message');
    }

    const { normalizedMessage } = await normalizeResponse.json();
    console.log('Normalized message:', normalizedMessage);

    // Step 2: Get context from memory if continuation
    console.log('Step 2: Checking conversation context...');
    const context = await memoryManager.getContext(normalizedMessage, typedHistory);
    console.log('Context needed:', context ? 'Yes' : 'No (new topic)');

    // Step 3: Classify the query type
    console.log('Step 3: Classifying query type...');
    const classifyResponse = await fetch(
      `${request.nextUrl.origin}/api/ai/classify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage }),
      }
    );

    if (!classifyResponse.ok) {
      throw new Error('Failed to classify message');
    }

    const { queryType } = await classifyResponse.json();
    console.log('Query type:', queryType);

    // Step 4: Route to appropriate handler based on query type
    let response: string;

    if (queryType === 'data_query') {
      console.log('Step 4: Processing data query...');
      const dataQueryResponse = await fetch(
        `${request.nextUrl.origin}/api/ai/data-query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: normalizedMessage,
            context,
          }),
        }
      );

      if (!dataQueryResponse.ok) {
        const errorData = await dataQueryResponse.json();
        console.error('Data query error:', errorData);
        response = `ขอโทษครับ เกิดข้อผิดพลาดในการค้นหาข้อมูล\n\nกรุณาลองถามคำถามใหม่ในรูปแบบที่ชัดเจนขึ้น หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่`;
      } else {
        const data = await dataQueryResponse.json();
        response = data.response;
      }
    } else if (queryType === 'how_to') {
      console.log('Step 4: Processing how-to query...');
      const howToResponse = await fetch(
        `${request.nextUrl.origin}/api/ai/how-to`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: normalizedMessage,
            context,
          }),
        }
      );

      if (!howToResponse.ok) {
        throw new Error('Failed to process how-to query');
      }

      const data = await howToResponse.json();
      response = data.response;
    } else {
      // general
      console.log('Step 4: Processing general query...');
      const generalResponse = await fetch(
        `${request.nextUrl.origin}/api/ai/general`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: normalizedMessage,
            context,
          }),
        }
      );

      if (!generalResponse.ok) {
        throw new Error('Failed to process general query');
      }

      const data = await generalResponse.json();
      response = data.response;
    }

    return NextResponse.json({
      response,
      queryType,
      normalized: normalizedMessage,
      hasContext: !!context,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
