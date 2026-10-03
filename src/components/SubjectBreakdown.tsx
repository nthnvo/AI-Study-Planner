import React from 'react';
import { Subject, StudyPlan, PriorityScore } from '../types';
import { BrainCircuit, Award, CheckCircle2, AlertTriangle, BookOpen, Clock, Tag } from 'lucide-react';
import { daysBetween } from '../services/plannerEngine';

interface SubjectBreakdownProps {
  plan: StudyPlan;
  subjects: Subject[];
}

export const SubjectBreakdown: React.FC<SubjectBreakdownProps> = ({ plan, subjects }) => {
  return (
    <div className="space-y-6">
      {/* AI Recommendations Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              การวิเคราะห์เชิงกลยุทธ์จาก AI (AI Strategic Analysis)
            </h3>
            <p className="text-xs text-indigo-200">
              {plan.aiAnalysisSummary || 'ประมวลผลสมดุลเวลาตามลำดับวันสอบ ความยาก และความเข้าใจ'}
            </p>
          </div>
        </div>

        {plan.keyRecommendations && plan.keyRecommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-white/10">
            {plan.keyRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority Scoring Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => {
          const prio = plan.priorities.find((p) => p.subjectId === sub.id);
          const subSessions = plan.sessions.filter((s) => s.subjectId === sub.id && s.activity !== 'Break');
          const completedCount = subSessions.filter((s) => s.completed).length;
          const subHours = Math.round((subSessions.reduce((acc, s) => acc + s.duration, 0) / 60) * 10) / 10;
          const progressPct = subSessions.length > 0 ? Math.round((completedCount / subSessions.length) * 100) : 0;
          const daysLeft = daysBetween(plan.startDate, sub.examDate);

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ backgroundColor: sub.color || '#4f46e5' }}
              />

              <div className="pl-2 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {sub.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      วันสอบ: {sub.examDate} ({daysLeft > 0 ? `อีก ${daysLeft} วัน` : 'สอบวันนี้'})
                    </div>
                  </div>

                  {prio && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Priority Score</span>
                      <span className="text-lg font-extrabold text-indigo-600">
                        {prio.score}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    sub.difficulty === 'hard'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : sub.difficulty === 'medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    ความยาก: {sub.difficulty === 'hard' ? 'ยาก' : sub.difficulty === 'medium' ? 'ปานกลาง' : 'ง่าย'}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    sub.understandingLevel === 'low'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : sub.understandingLevel === 'medium'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    ความเข้าใจ: {sub.understandingLevel === 'low' ? 'ยังไม่เข้าใจ' : sub.understandingLevel === 'medium' ? 'เข้าใจบางส่วน' : 'เข้าใจดี'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">ความคืบหน้าการอ่าน</span>
                    <span className="font-bold text-slate-900">
                      {completedCount}/{subSessions.length} ช่วง ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">เวลาที่ได้รับจัดสรร</span>
                    <span className="font-bold text-slate-800 text-sm">{subHours} ชั่วโมง</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">จำนวน Sessions</span>
                    <span className="font-bold text-slate-800 text-sm">{subSessions.length} รอบอ่าน</span>
                  </div>
                </div>

                {/* Topics Preview */}
                {sub.topics && sub.topics.length > 0 && (
                  <div className="pt-1">
                    <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                      หัวข้อที่ครอบคลุม ({sub.topics.length} หัวข้อ):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sub.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
