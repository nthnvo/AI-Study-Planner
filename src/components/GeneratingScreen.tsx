import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';

interface GeneratingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  'วิเคราะห์วันสอบและระยะเวลาเตรียมตัว',
  'วิเคราะห์ระดับความยากและความเข้าใจของแต่ละวิชา',
  'วิเคราะห์เวลาว่างและแบ่งช่วงอ่านหนังสือ (Sessions)',
  'จัดลำดับความสำคัญ (Priority Scoring Matrix)',
  'แทรกช่วงพักสมองและทบทวน (Review & Practice Sessions)',
  'สร้างตารางอ่านหนังสือรายวันแบบเฉพาะบุคคลสำเร็จ!',
];

export const GeneratingScreen: React.FC<GeneratingScreenProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl text-center">
        {/* Pulsing AI Logo */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-300">
            <BrainCircuit className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          AI กำลังวิเคราะห์ตารางสอบของคุณ...
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          ประมวลผลข้อมูลวิชา วันสอบ และจัดตารางอ่านหนังสือที่เหมาะกับคุณที่สุด
        </p>

        {/* Steps Progress List */}
        <div className="space-y-3 text-left bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                  isDone
                    ? 'text-emerald-700 font-medium'
                    : isCurrent
                    ? 'text-indigo-600 font-bold scale-[1.02]'
                    : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
