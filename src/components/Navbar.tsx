import React from 'react';
import { Sparkles, Calendar, BookOpen, Clock, RotateCcw, Edit3, CheckCircle2 } from 'lucide-react';
import { StudyPlan } from '../types';

interface NavbarProps {
  currentStep: number;
  onNavigateStep: (step: number) => void;
  plan: StudyPlan | null;
  onLoadSample: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateStep,
  plan,
  onLoadSample,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigateStep(plan ? 6 : 1)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                AI Study Planner
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                Smart Exam
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              วางแผนอ่านหนังสือก่อนสอบแบบเฉพาะบุคคลด้วย AI
            </p>
          </div>
        </div>

        {/* Step Indicator (when in wizard 2, 3, 4) */}
        {currentStep >= 2 && currentStep <= 4 && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600">
            <button
              onClick={() => onNavigateStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 2 ? 'bg-white shadow-xs font-semibold text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. วิชาที่สอบ</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onNavigateStep(3)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 3 ? 'bg-white shadow-xs font-semibold text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>2. เวลาว่าง</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onNavigateStep(4)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 4 ? 'bg-white shadow-xs font-semibold text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. ความต้องการ</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {plan && currentStep === 6 && (
            <button
              onClick={() => onNavigateStep(2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition"
              title="แก้ไขข้อมูลวิชาและเวลาว่าง โดยข้อมูลเดิมไม่หาย"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">แก้ไขข้อมูล</span>
            </button>
          )}

          {plan && currentStep < 6 && (
            <button
              onClick={() => onNavigateStep(6)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>กลับสู่ตาราง</span>
            </button>
          )}

          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200 transition"
            title="โหลดตัวอย่าง: Data Mining, SE, Theory of Comp, Database (14 วัน)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">ตัวอย่างข้อมูล</span>
            <span className="xs:hidden">ตัวอย่าง</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="เริ่มใหม่ทั้งหมด (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
