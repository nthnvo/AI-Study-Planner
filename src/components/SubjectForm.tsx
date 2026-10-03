import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Subject } from '../types';
import { SubjectModal } from './SubjectModal';
import { daysBetween } from '../services/plannerEngine';
import { formatDate } from '../utils/sampleData';

interface SubjectFormProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onLoadSample: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onNext,
  onBack,
  onLoadSample,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [validationError, setValidationError] = useState('');

  const todayStr = formatDate(new Date());

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
    setValidationError('');
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
    setValidationError('');
  };

  const handleSaveModal = (subject: Subject) => {
    if (editingSubject) {
      onUpdateSubject(subject);
    } else {
      onAddSubject(subject);
    }
  };

  const handleNextClick = () => {
    if (subjects.length === 0) {
      setValidationError('กรุณาเพิ่มวิชาที่ต้องอ่านอย่างน้อย 1 วิชา');
      return;
    }
    setValidationError('');
    onNext();
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <span>ขั้นตอนที่ 1 จาก 3</span>
            <span>•</span>
            <span>ข้อมูลวิชาและวันสอบ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            วิชาที่ต้องเตรียมสอบ
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            เพิ่มวิชาที่ต้องสอบ ระบุวันสอบ ระดับความยาก และหัวข้อ เพื่อให้ AI ประเมินลำดับความสำคัญ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subjects.length === 0 && (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>โหลดข้อมูลตัวอย่าง</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มวิชา</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-3.5 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Subject List */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">ยังไม่มีวิชาในตาราง</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            เริ่มสร้างแผนการอ่านหนังสือโดยการกดปุ่ม "เพิ่มวิชา" หรือกด "โหลดข้อมูลตัวอย่าง" เพื่อดูตาราง 4 วิชาตัวอย่างทันที
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มวิชาแรกของคุณ</span>
            </button>
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>โหลดข้อมูลตัวอย่าง 4 วิชา</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {subjects.map((subj, index) => {
            const daysLeft = daysBetween(todayStr, subj.examDate);
            const isUrgent = daysLeft <= 3;

            return (
              <div
                key={subj.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Left color bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{ backgroundColor: subj.color || '#4f46e5' }}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pl-2">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        วิชาที่ {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">
                        {subj.name}
                      </h3>

                      {/* Difficulty Badge */}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        subj.difficulty === 'hard'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : subj.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        ความยาก: {subj.difficulty === 'hard' ? 'ยาก' : subj.difficulty === 'medium' ? 'ปานกลาง' : 'ง่าย'}
                      </span>

                      {/* Understanding Badge */}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        subj.understandingLevel === 'low'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : subj.understandingLevel === 'medium'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        ความเข้าใจ: {subj.understandingLevel === 'low' ? 'ยังไม่เข้าใจ' : subj.understandingLevel === 'medium' ? 'เข้าใจบางส่วน' : 'เข้าใจดี'}
                      </span>
                    </div>

                    {/* Exam Date & Proximity */}
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>วันสอบ: {subj.examDate}</span>
                        {subj.examTime && <span className="text-slate-400">({subj.examTime} น.)</span>}
                      </div>

                      <div className={`px-2 py-0.5 rounded-md font-medium ${
                        isUrgent 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {daysLeft > 0 ? `อีก ${daysLeft} วันจะสอบ` : daysLeft === 0 ? 'สอบวันนี้!' : 'สอบผ่านไปแล้ว'}
                      </div>
                    </div>

                    {/* Topics tags */}
                    {subj.topics && subj.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {subj.topics.map((tp, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{tp}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {subj.notes && (
                      <p className="text-xs text-slate-500 italic pt-1">
                        หมายเหตุ: {subj.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:self-center">
                    <button
                      onClick={() => handleOpenEdit(subj)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="แก้ไขข้อมูลวิชานี้"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(subj.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="ลบวิชานี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <button
          onClick={handleNextClick}
          disabled={subjects.length === 0}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer ${
            subjects.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
          }`}
        >
          <span>ต่อไป: กำหนดเวลาว่าง</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialSubject={editingSubject}
      />
    </div>
  );
};
