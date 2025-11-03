import { ChatInterface } from '@/components/ai/chat-interface';
import { Brain, TrendingUp, FileSearch, Sparkles } from 'lucide-react';

export default function AIFeaturesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header - AI Purple accent */}
      <div className="bg-ai-purple rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">AI Features</h1>
            <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
              Powered by GPT-4o-mini
            </span>
          </div>
          <p className="text-white/90">
            ใช้ AI เพื่อวิเคราะห์ข้อมูล ตอบคำถาม และช่วยเหลือในการใช้งานระบบ Payroll แบบอัตโนมัติ
          </p>
        </div>
      </div>

      {/* Chat Interface - Main Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatInterface className="h-[600px]" />
        </div>

        {/* Sidebar - Tips & Info */}
        <div className="space-y-4">
          <div className="bg-table-bg border border-table-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-ai-purple" />
              คุณสมบัติ AI
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-ai-purple font-bold">•</span>
                <span>ตอบคำถามเกี่ยวกับข้อมูลพนักงานและเงินเดือน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ai-purple font-bold">•</span>
                <span>วิเคราะห์ข้อมูล OT และประสิทธิภาพการทำงาน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ai-purple font-bold">•</span>
                <span>แนะนำวิธีการใช้งานระบบ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ai-purple font-bold">•</span>
                <span>สร้างรายงานและสรุปข้อมูลอัตโนมัติ</span>
              </li>
            </ul>
          </div>

          <div className="bg-lavender border-2 border-matcha/30 rounded-lg p-4">
            <h3 className="font-bold text-blackish mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-5 w-5 text-inky-blue" />
              ตัวอย่างคำถาม
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-cream rounded px-3 py-2 text-blackish">
                "พนักงานคนไหนทำ OT มากที่สุด 5 อันดับแรก?"
              </div>
              <div className="bg-cream rounded px-3 py-2 text-blackish">
                "ค่าใช้จ่ายเงินเดือนรวมของแผนก Production เท่าไหร่?"
              </div>
              <div className="bg-cream rounded px-3 py-2 text-blackish">
                "วิธีการ import ข้อมูลเวลาเข้างานทำอย่างไร?"
              </div>
              <div className="bg-cream rounded px-3 py-2 text-blackish">
                "อธิบายการคำนวณ OT ในระบบหน่อย"
              </div>
            </div>
          </div>

          <div className="bg-matcha/20 border-2 border-matcha rounded-lg p-4">
            <h3 className="font-bold text-blackish mb-2 flex items-center gap-2 text-sm">
              <FileSearch className="h-5 w-5 text-olive" />
              เคล็ดลับ
            </h3>
            <ul className="space-y-1 text-xs text-olive">
              <li>• ถามคำถามแบบเฉพาะเจาะจงเพื่อผลลัพธ์ที่ดีขึ้น</li>
              <li>• สามารถถามต่อเนื่องในบริบทเดียวกันได้</li>
              <li>• AI จะจำบริบทการสนทนาก่อนหน้า</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future AI Features Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-cream border-2 border-dashed border-matcha rounded-lg p-6 text-center opacity-60">
          <div className="h-12 w-12 bg-lavender rounded-full mx-auto mb-3 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-olive" />
          </div>
          <h3 className="font-semibold text-olive mb-1 text-sm">AI Analytics</h3>
          <p className="text-xs text-olive">เร็วๆ นี้</p>
        </div>

        <div className="bg-cream border-2 border-dashed border-matcha rounded-lg p-6 text-center opacity-60">
          <div className="h-12 w-12 bg-lavender rounded-full mx-auto mb-3 flex items-center justify-center">
            <FileSearch className="h-6 w-6 text-olive" />
          </div>
          <h3 className="font-semibold text-olive mb-1 text-sm">Smart Reports</h3>
          <p className="text-xs text-olive">เร็วๆ นี้</p>
        </div>

        <div className="bg-cream border-2 border-dashed border-matcha rounded-lg p-6 text-center opacity-60">
          <div className="h-12 w-12 bg-lavender rounded-full mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-olive" />
          </div>
          <h3 className="font-semibold text-olive mb-1 text-sm">Predictions</h3>
          <p className="text-xs text-olive">เร็วๆ นี้</p>
        </div>
      </div>
    </div>
  );
}
