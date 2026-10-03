import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, Calendar, Clock, AlertCircle, Sparkles, Tag } from 'lucide-react';
import { Subject, DifficultyLevel, UnderstandingLevel } from '../types';
import { COLOR_PALETTE, formatDate } from '../utils/sampleData';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:00');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [understandingLevel, setUnderstandingLevel] = useState<UnderstandingLevel>('medium');
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setExamDate(initialSubject.examDate);
      setExamTime(initialSubject.examTime || '09:00');
      setDifficulty(initialSubject.difficulty);
      setUnderstandingLevel(initialSubject.understandingLevel);
      setTopics(initialSubject.topics || []);
      setNotes(initialSubject.notes || '');
    } else {
      // Default new subject
      setName('');
      // Default exam date: 10 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 10);
      setExamDate(formatDate(defaultDate));
      setExamTime('09:00');
      setDifficulty('medium');
      setUnderstandingLevel('medium');
      setTopics([]);
      setNotes('');
    }
    setError('');
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (!topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
    }
    setTopicInput('');
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setTopics(topics.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อวิชา');
      return;
    }
    if (!examDate) {
      setError('กรุณาเลือกวันสอบ');
      return;
    }

    const color = initialSubject?.color || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    const finalTopics = topics.length > 0 
      ? topics 
      : topicInput.trim() 
      ? [topicInput.trim()] 
      : ['ทบทวนเนื้อหาภาพรวม (General Topics)'];

    const subjectToSave: Subject = {
      id: initialSubject?.id || 'sub-' + Date.now(),
      name: name.trim(),
      examDate,
      examTime: examTime || '09:00',
      difficulty,
      understandingLevel,
      topics: finalTopics,
      notes: notes.trim(),
      color,
    };

    onSave(subjectToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialSubject ? 'แก้ไขข้อมูลวิชา' : 'เพิ่มวิชาที่ต้องสอบ'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              ชื่อวิชา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Data Mining, Database Systems, Software Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
            />
          </div>

          {/* Exam Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                วันสอบ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                เวลาเริ่มสอบ
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              ระดับความยาก
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  difficulty === 'easy'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>ง่าย (Easy)</span>
                <span className="text-[11px] text-emerald-600 font-normal">อ่านเข้าใจเร็ว</span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('medium')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  difficulty === 'medium'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>ปานกลาง (Medium)</span>
                <span className="text-[11px] text-amber-600 font-normal">มาตรฐานทั่วไป</span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  difficulty === 'hard'
                    ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>ยาก (Hard)</span>
                <span className="text-[11px] text-red-600 font-normal">ต้องเน้นเป็นพิเศษ</span>
              </button>
            </div>
          </div>

          {/* Understanding Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              ระดับความเข้าใจปัจจุบัน
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setUnderstandingLevel('low')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  understandingLevel === 'low'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>ยังไม่เข้าใจ</span>
                <span className="text-[11px] text-rose-600 font-normal">ต้องปูพื้นฐานใหม่</span>
              </button>

              <button
                type="button"
                onClick={() => setUnderstandingLevel('medium')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  understandingLevel === 'medium'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>เข้าใจบางส่วน</span>
                <span className="text-[11px] text-indigo-600 font-normal">พอจำคอนเซ็ปต์ได้</span>
              </button>

              <button
                type="button"
                onClick={() => setUnderstandingLevel('high')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  understandingLevel === 'high'
                    ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>เข้าใจดี</span>
                <span className="text-[11px] text-teal-600 font-normal">เน้นทวนและทำโจทย์</span>
              </button>
            </div>
          </div>

          {/* Topics & Chapters */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-800">
                หัวข้อ / บทที่ต้องอ่าน ({topics.length} หัวข้อ)
              </label>
              <span className="text-xs text-slate-500">กด Enter เพื่อเพิ่มหัวข้อ</span>
            </div>

            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                placeholder="พิมพ์ชื่อหัวข้อ เช่น Classification แล้วกด Enter"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleKeyDownTopic}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {/* Topic Chips */}
            {topics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                {topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-indigo-700 border border-indigo-200 shadow-2xs"
                  >
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(idx)}
                      className="text-slate-400 hover:text-red-500 ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                ยังไม่ได้ระบุหัวข้อ (หากไม่ระบุ ระบบจะสร้างช่วงศึกษาและทบทวนให้อัตโนมัติ)
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              หมายเหตุเพิ่มเติม (Notes)
            </label>
            <textarea
              rows={2}
              placeholder="เช่น มีสูตรคำนวณเยอะ ต้องฝึกเขียนโค้ด หรือเน้นข้อสอบเก่าปีที่แล้ว"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-200 transition"
            >
              {initialSubject ? 'บันทึกการแก้ไข' : 'เพิ่มวิชานี้'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
