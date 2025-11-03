'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-table-bg border border-table-border rounded-lg shadow-lg ${className}`}>
      {/* Header - AI Purple accent */}
      <div className="px-4 py-3 border-b border-ai-purple/20 bg-ai-purple text-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <h2 className="text-sm font-bold">AI Assistant</h2>
          <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">GPT-4o-mini</span>
        </div>
        <p className="text-xs text-white/80 mt-1">ถามคำถามเกี่ยวกับข้อมูลเงินเดือน หรือวิธีใช้งานระบบ</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-soft-gray min-h-[400px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <p className="text-center text-sm">
              👋 สวัสดีครับ! ผมคือ AI Assistant
              <br />
              พร้อมช่วยตอบคำถามเกี่ยวกับระบบ Payroll
            </p>
            <div className="mt-3 text-xs text-left space-y-1.5">
              <p className="font-semibold text-text-primary">ตัวอย่างคำถาม:</p>
              <ul className="list-disc list-inside text-text-secondary space-y-0.5">
                <li>พนักงานคนไหนทำ OT เยอะที่สุดเดือนนี้?</li>
                <li>แผนก Production มีค่าเงินเดือนรวมเท่าไหร่?</li>
                <li>วิธีการ import ข้อมูลเวลาเข้างานทำอย่างไร?</li>
                <li>วิธีการคำนวณ OT ในระบบเป็นอย่างไร?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-automation-blue text-white'
                  : 'bg-table-bg border border-table-border text-text-primary'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-xs max-w-none prose-headings:text-text-primary prose-headings:text-sm prose-headings:font-semibold prose-headings:mb-2 prose-p:text-text-primary prose-p:text-xs prose-p:leading-relaxed prose-strong:text-text-primary prose-ul:text-text-primary prose-ul:text-xs prose-ol:text-text-primary prose-ol:text-xs prose-code:text-ai-purple prose-code:bg-ai-purple/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-table:text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}
              <p
                className={`text-[10px] mt-1.5 ${
                  message.role === 'user' ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                {message.timestamp.toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-table-bg border border-table-border rounded px-3 py-2">
              <div className="flex items-center gap-2 text-text-secondary text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>กำลังประมวลผล...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-table-border bg-table-bg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามของคุณ..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-table-border rounded-md focus:outline-none focus:ring-2 focus:ring-ai-purple disabled:bg-soft-gray disabled:text-text-secondary"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 text-sm bg-ai-purple hover:bg-ai-purple/90"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
