import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "react-hot-toast";
import { ChatButton } from "@/components/ai/chat-button";
import { LanguageProvider } from "@/contexts/language-context";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "Payroll System - SaaS",
  description: "ระบบคำนวณเงินเดือนอัตโนมัติสำหรับโรงงาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={sarabun.className}>
        <LanguageProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <ChatButton />
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
