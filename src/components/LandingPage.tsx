import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Layers, 
  BrainCircuit, 
  Coffee,
  ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLoadSampleAndStart: () => void;
  hasExistingPlan: boolean;
  onViewExistingPlan: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onLoadSampleAndStart,
  hasExistingPlan,
  onViewExistingPlan,
}) => {
  return (
    <div className="py-8 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>ระบบวางแผนอ่านหนังสืออัจฉริยะสำหรับนักศึกษายุคใหม่</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
          AI Study Planner
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-8">
          วางแผนการอ่านหนังสือด้วย AI ให้เหมาะกับวิชา เวลา และวันสอบของคุณ
          จัดตารางรายวันแบบสมดุล ป้องกันอาการ Burnout พร้อมปรับเปลี่ยนแผนได้ทันทีเมื่ออ่านไม่ทัน
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 text-base group cursor-pointer"
          >
            <span>เริ่มวางแผน</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onLoadSampleAndStart}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold shadow-xs transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ทดลองข้อมูลตัวอย่าง 14 วัน</span>
          </button>

          {hasExistingPlan && (
            <button
              onClick={onViewExistingPlan}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>ดู Study Plan ที่บันทึกไว้</span>
            </button>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Priority Scoring อัจฉริยะ</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            AI คำนวณลำดับความสำคัญจากวันสอบ ความยาก ระดับความเข้าใจ และจำนวนบท เพื่อเทน้ำหนักให้อย่างเหมาะสมโดยไม่ละเลยวิชาอื่น
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">พักผ่อนถูกจังหวะ ไม่ Burnout</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            ผสานเทคนิค Pomodoro และ Spaced Repetition กำหนดช่วงอ่าน 50 นาที พัก 10 นาที หรือปรับแต่งได้ตามความถนัดของคุณ
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">ปรับตารางใหม่ด้วยคำสั่งสั้นๆ</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            เพียงบอก "วันนี้อ่านไม่ทัน" หรือ "ไม่เข้าใจเรื่องนี้" AI จะกระจายหัวข้อไปยังวันที่เหลือทันที ข้อมูลที่ติ๊กถูกไปแล้วไม่สูญหาย
          </p>
        </div>
      </div>

      {/* 5-Step Process Preview */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">วิธีใช้งานง่าย 5 ขั้นตอน</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white">
            จากวิชาที่ต้องสอบ สู่แผนการอ่านที่ทำตามได้จริง
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-indigo-400 font-bold text-sm mb-1">ขั้นตอนที่ 1</div>
            <div className="font-semibold text-white text-sm mb-1">เพิ่มวิชา & วันสอบ</div>
            <div className="text-xs text-slate-300">ระบุวันสอบ ความยาก และหัวข้อที่ออกสอบ</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-indigo-400 font-bold text-sm mb-1">ขั้นตอนที่ 2</div>
            <div className="font-semibold text-white text-sm mb-1">กำหนดเวลาว่าง</div>
            <div className="text-xs text-slate-300">แยกวันจันทร์-ศุกร์ และ เสาร์-อาทิตย์</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-indigo-400 font-bold text-sm mb-1">ขั้นตอนที่ 3</div>
            <div className="font-semibold text-white text-sm mb-1">ตั้งค่า Preference</div>
            <div className="text-xs text-slate-300">เน้นสอบก่อน ซ้อมทำโจทย์ หรือ Pomodoro</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-indigo-400 font-bold text-sm mb-1">ขั้นตอนที่ 4</div>
            <div className="font-semibold text-white text-sm mb-1">AI วิเคราะห์ & สร้างตาราง</div>
            <div className="text-xs text-slate-300">จัดลำดับความสำคัญและสร้างตารางรายวัน</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-indigo-400 font-bold text-sm mb-1">ขั้นตอนที่ 5</div>
            <div className="font-semibold text-white text-sm mb-1">ติ๊กถูก & ติดตามผล</div>
            <div className="text-xs text-slate-300">เช็ค Progress และปรับตารางได้ตลอดเวลา</div>
          </div>
        </div>
      </div>
    </div>
  );
};
