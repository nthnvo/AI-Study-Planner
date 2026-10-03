import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Loader2,
  Calendar,
  Flame
} from 'lucide-react';
import { Subject, StudyPlan } from '../types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (prompt: string) => Promise<void>;
  subjects: Subject[];
  currentDate?: string;
  isProcessing: boolean;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
  subjects,
  currentDate,
  isProcessing,
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedQuickPreset, setSelectedQuickPreset] = useState('');

  if (!isOpen) return null;

  // Generate dynamic quick presets based on actual subjects and topics
  const firstSubj = subjects[0]?.name || 'Data Mining';
  const secondSubj = subjects[1]?.name || 'Database';
  const sampleTopic = subjects[0]?.topics[0] || 'Classification';

  const quickPresets = [
    {
      title: `วันนี้อ่าน ${firstSubj} ไม่ทัน`,
      prompt: `วันนี้อ่าน ${firstSubj} ไม่ทัน ช่วยกระจาย session ที่ยังไม่ได้อ่านไปวันที่เหลือให้หน่อย`,
      desc: 'กระจายหัวข้อที่ค้างไปวันถัดไป',
    },
    {
      title: `ฉันไม่เข้าใจเรื่อง ${sampleTopic}`,
      prompt: `ฉันไม่เข้าใจเรื่อง ${sampleTopic} ช่วยเพิ่มเวลาทบทวนและฝึกทำโจทย์หัวข้อนี้ให้หน่อย`,
      desc: 'เพิ่มชั่วโมงเจาะลึกหัวข้อนี้',
    },
    {
      title: `วันนี้ฉันไม่มีเวลาอ่าน ${secondSubj}`,
      prompt: `วันนี้ฉันไม่มีเวลาอ่าน ${secondSubj} ย้ายวิชานี้ออกจากวันนี้และนำไปจัดในวันหยุดหรือวันถัดไป`,
      desc: 'ลบวิชานี้ออกจากวันนี้และเกลี่ยใหม่',
    },
    {
      title: 'เพิ่มเวลาทำ Mock Exam ก่อนสอบ',
      prompt: 'เพิ่มเวลาทำแบบฝึกหัดข้อสอบจริง (Mock Exam) ให้กับทุกวิชาก่อนถึงวันสอบ 2 วัน',
      desc: 'เน้นจำลองทำข้อสอบจับเวลา',
    },
  ];

  const handleSelectPreset = (presetPrompt: string) => {
    setPromptText(presetPrompt);
    setSelectedQuickPreset(presetPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isProcessing) return;
    await onSubmitPrompt(promptText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ปรับตารางด้วย AI (AI Reschedule)
              </h2>
              <p className="text-xs text-slate-500">
                บอกสถานการณ์ของคุณเป็นภาษาธรรมชาติ AI จะจัดสรรตารางให้อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              สถานการณ์ด่วนยอดนิยม (คลิกเพื่อเลือก)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.prompt)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    promptText === preset.prompt
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 font-medium'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{preset.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              หรือพิมพ์ความต้องการของคุณ
            </label>
            <textarea
              rows={3}
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="เช่น วันนี้ติดธุระด่วน อ่านได้แค่ 1 ชั่วโมง ช่วยลดตารางวันนี้แล้วย้ายไปวันเสาร์แทน..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm leading-relaxed"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>ปลอดภัย:</strong> หัวข้อที่คุณกดติ๊กถูก (Mark as completed) ไปแล้วจะไม่ถูกลบหรือจัดซ้ำ ระบบจะปรับเปลี่ยนเฉพาะตารางที่เหลือเท่านั้น
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={!promptText.trim() || isProcessing}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition ${
                !promptText.trim() || isProcessing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-200 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI กำลังปรับตาราง...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ปรับตารางทันที</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
