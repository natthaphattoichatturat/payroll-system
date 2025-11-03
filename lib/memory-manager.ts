import { getOpenAI, MODEL } from './openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class MemoryManager {
  private maxMessages = 10; // Keep last 10 messages
  private maxTokens = 2000; // Approximate max tokens for context

  /**
   * Check if new message is a continuation of previous conversation
   * or a new topic
   */
  async isContinuation(
    newMessage: string,
    previousMessages: Message[]
  ): Promise<boolean> {
    if (previousMessages.length === 0) {
      return false;
    }

    // If only 1-2 messages, likely continuation
    if (previousMessages.length <= 2) {
      return true;
    }

    try {
      const openai = getOpenAI();
      const recentHistory = previousMessages
        .slice(-4) // Last 4 messages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `คุณคือ AI ที่ช่วยตัดสินว่าข้อความใหม่เป็นการสนทนาต่อเนื่องจากบริบทเดิม หรือเป็นหัวข้อใหม่

ตอบ "yes" ถ้าข้อความใหม่:
- ถามต่อจากหัวข้อเดิม
- ใช้คำว่า "นั่น", "มัน", "เขา", "ข้อมูลนี้" ที่อ้างถึงข้อความก่อนหน้า
- เป็นคำถามเพิ่มเติมเกี่ยวกับเรื่องเดียวกัน
- เป็นการขอรายละเอียดเพิ่มเติม

ตอบ "no" ถ้าข้อความใหม่:
- เป็นคำถามหัวข้อใหม่ที่ไม่เกี่ยวข้อง
- เป็นการทักทายใหม่
- เป็นคำสั่งหรือคำขอที่แตกต่างอย่างสิ้นเชิง

ตอบเพียงคำเดียว: "yes" หรือ "no"`,
          },
          {
            role: 'user',
            content: `ประวัติการสนทนา:\n${recentHistory}\n\nข้อความใหม่: ${newMessage}`,
          },
        ],
        temperature: 0.1,
      });

      const answer = completion.choices[0]?.message?.content?.toLowerCase().trim();
      return answer === 'yes';
    } catch (error) {
      console.error('Continuation check error:', error);
      // Default to true if error (safer to include context)
      return true;
    }
  }

  /**
   * Compress conversation history to fit within token limit
   */
  async compressHistory(messages: Message[]): Promise<string> {
    if (messages.length === 0) {
      return '';
    }

    // Take only recent messages
    const recentMessages = messages.slice(-this.maxMessages);

    // Create summary if too many messages
    if (recentMessages.length > 6) {
      const olderMessages = recentMessages.slice(0, -4);
      const newerMessages = recentMessages.slice(-4);

      try {
        const openai = getOpenAI();
        // Summarize older messages
        const messagesToSummarize = olderMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join('\n');

        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'สรุปการสนทนาต่อไปนี้อย่างกระชับ เน้นประเด็นสำคัญและข้อมูลที่เกี่ยวข้อง ตอบเป็นภาษาไทย',
            },
            {
              role: 'user',
              content: messagesToSummarize,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        });

        const summary = completion.choices[0]?.message?.content || '';

        // Combine summary with recent messages
        const recentContext = newerMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join('\n');

        return `[สรุปการสนทนาก่อนหน้า: ${summary}]\n\nการสนทนาล่าสุด:\n${recentContext}`;
      } catch (error) {
        console.error('Compression error:', error);
        // Fallback: just use recent messages
        return recentMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join('\n');
      }
    }

    // If not too many messages, return as is
    return recentMessages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Get context for current message
   */
  async getContext(
    newMessage: string,
    history: Message[]
  ): Promise<string | null> {
    const isContinuation = await this.isContinuation(newMessage, history);

    if (!isContinuation) {
      return null; // No context needed for new topic
    }

    const context = await this.compressHistory(history);
    return context;
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();
