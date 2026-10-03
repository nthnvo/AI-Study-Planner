import React, { useState } from 'react';
import { StudySession, ActivityType } from '../types';
import { getActivityMeta } from './DailyView';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  sessions: StudySession[];
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSwitchToDailyView: (date: string) => void;
  subjectColorMap: Record<string, string>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  availableDates,
  selectedDate,
  onSelectDate,
  onSwitchToDailyView,
  subjectColorMap,
}) => {
  const [viewScope, setViewScope] = useState<'all' | 'week' | 'day'>('all');

  // Filter dates based on scope
  let displayedDates = availableDates;
  if (viewScope === 'day') {
    displayedDates = [selectedDate];
  } else if (viewScope === 'week') {
    const idx = availableDates.indexOf(selectedDate);
    const startIdx = Math.max(0, idx >= 0 ? idx : 0);
    displayedDates = availableDates.slice(startIdx, startIdx + 7);
  }

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            มุมมองปฏิทินอ่านหนังสือ
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            (คลิกวันที่เพื่อดูรายละเอียดรายวัน)
          </span>
        </div>

        {/* Scope Switcher: Day, Week, 14 Days */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewScope('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewScope === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            14 วัน (ทั้งหมด)
          </button>
          <button
            type="button"
            onClick={() => setViewScope('week')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewScope === 'week'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 สัปดาห์ (7 วัน)
          </button>
          <button
            type="button"
            onClick={() => setViewScope('day')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewScope === 'day'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายวัน (Day)
          </button>
        </div>
      </div>

      {/* Activity Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-700 mr-1">สัญลักษณ์กิจกรรม:</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Learning (อ่านใหม่)</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Review (ทบทวน)</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Practice (ทำแบบฝึกหัด)</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Mock Exam (จำลองสอบ)</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Final Review (ทวนก่อนสอบ)</span>
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedDates.map((dateStr, idx) => {
          const daySessions = sessions.filter((s) => s.date === dateStr);
          const studySessions = daySessions.filter((s) => s.activity !== 'Break');
          const isSelected = dateStr === selectedDate;
          const completedCount = studySessions.filter((s) => s.completed).length;

          const dayNumber = availableDates.indexOf(dateStr) + 1;

          // Day date parse
          const [y, m, d] = dateStr.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const dayNameThai = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][dateObj.getDay()];

          return (
            <div
              key={dateStr}
              onClick={() => {
                onSelectDate(dateStr);
              }}
              className={`bg-white rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top / Header */}
              <div className={`p-3.5 border-b flex items-center justify-between ${
                isWeekend ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      Day {dayNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {dayNameThai} {d}/{m}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {studySessions.length} รอบอ่าน • เสร็จ {completedCount}/{studySessions.length}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchToDailyView(dateStr);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition"
                >
                  <span>ดูรายวัน</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sessions List Preview */}
              <div className="p-3 space-y-2 flex-1 min-h-[160px] max-h-[300px] overflow-y-auto">
                {studySessions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic py-6">
                    ไม่มีรอบอ่านในวันนี้
                  </div>
                ) : (
                  studySessions.map((sess) => {
                    const meta = getActivityMeta(sess.activity);
                    const subjColor = sess.subjectId ? subjectColorMap[sess.subjectId] : '#6366f1';

                    return (
                      <div
                        key={sess.id}
                        className={`p-2 rounded-xl border text-xs relative overflow-hidden transition ${
                          sess.completed 
                            ? 'bg-emerald-50/30 border-emerald-200 text-slate-500' 
                            : 'bg-white border-slate-200/90 text-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: subjColor }}
                        />

                        <div className="pl-1.5">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-slate-900 truncate">
                              {sess.subjectName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {sess.startTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${meta.badge}`}>
                              {sess.activity}
                            </span>
                            {sess.completed && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>

                          <div className={`text-[11px] mt-1 truncate ${
                            sess.completed ? 'line-through text-slate-400' : 'text-slate-600'
                          }`}>
                            {sess.topic}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
