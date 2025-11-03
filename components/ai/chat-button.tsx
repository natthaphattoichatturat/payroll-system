'use client';

import { useState } from 'react';
import { MessageCircle, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './chat-interface';
import Link from 'next/link';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button - AI Purple accent */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-ai-purple text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-white text-ai-purple text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Popup Window */}
          <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] lg:w-[450px] shadow-2xl">
            <div className="relative">
              {/* Header with Controls */}
              <div className="absolute top-0 right-0 flex gap-2 p-2 z-10">
                <Link href="/ai-features">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-sm text-text-primary"
                    title="ขยายเต็มหน้า"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-sm text-text-primary"
                  title="ปิด"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Interface */}
              <ChatInterface className="h-[500px] sm:h-[600px]" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
