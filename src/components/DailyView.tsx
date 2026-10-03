import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Coffee, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckCheck,
  Zap,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { StudySession, ActivityType } from '../types';

interface DailyViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates: string[];
  sessions: StudySession[];
  onToggleSessionComplete: (sessionId: string) => void;
  subjectColorMap: Record<string, string>;
}

// Activity badge color and label helper
export function getActivityMeta(activity: ActivityType) {
  switch (activity) {
    case 'Learning':
      return {
        label: 'อ่านเนื้อหาใหม่',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: '📘',
        chip: 'bg-blue-500',
      };
    case 'Review':
      return {
        label: 'ทบทวนเนื้อหา',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '📙',
        chip: 'bg-amber-500',
      };
    case 'Practice':
      return {
        label: 'ทำแบบฝึกหัด / โจทย์',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '📗',
        chip: 'bg-emerald-500',
      };
    case 'Mock Exam':
      return {
        label: 'จำลองการสอบจับเวลา',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: '📝',
        chip: 'bg-purple-600',
      };
    case 'Final Review':
      return {
        label: 'ทบทวนสรุปก่อนสอบ',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '📕',
        chip: 'bg-rose-500',
      };
    case 'Break':
      return {
        label: 'พักเบรก',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: '☕',
        chip: 'bg-slate-400',
      };
  }
}

// Format date into Thai friendly display, e.g. "วันจันทร์ที่ 5 ตุลาคม 2026"
export function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const daysThai = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayName = daysThai[dateObj.getDay()];
  const monthName = monthsThai[dateObj.getMonth()];
  return `${dayName}ที่ ${d} ${monthName} ${y + 543}`;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  onSelectDate,
  availableDates,
  sessions,
  onToggleSessionComplete,
  subjectColorMap,
}) => {
  const currentIndex = availableDates.indexOf(selectedDate);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < availableDates.length - 1;

  const handlePrevDay = () => {
    if (hasPrev) onSelectDate(availableDates[currentIndex - 1]);
  };

  const handleNextDay = () => {
    if (hasNext) onSelectDate(availableDates[currentIndex + 1]);
  };

  // Filter sessions for the selected date
  const daySessions = sessions.filter((s) => s.date === selectedDate);

  const studySessionsOnly = daySessions.filter((s) => s.activity !== 'Break');
  const completedCount = studySessionsOnly.filter((s) => s.completed).length;
  const dayProgress = studySessionsOnly.length > 0 
    ? Math.round((completedCount / studySessionsOnly.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Date Header & Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                Day {currentIndex + 1} จาก {availableDates.length}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatThaiDate(selectedDate)}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {studySessionsOnly.length} Study Sessions • อ่านเสร็จแล้ว {completedCount}/{studySessionsOnly.length} ({dayProgress}%)
            </p>
          </div>
        </div>

        {/* Day Jump Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handlePrevDay}
            disabled={!hasPrev}
            className={`p-2 rounded-xl border text-sm flex items-center gap-1 transition ${
              hasPrev
                ? 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
            title="วันก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">วันก่อนหน้า</span>
          </button>

          {/* Quick Date Selector Dropdown */}
          <select
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableDates.map((dStr, idx) => (
              <option key={dStr} value={dStr}>
                Day {idx + 1}: {dStr}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextDay}
            disabled={!hasNext}
            className={`p-2 rounded-xl border text-sm flex items-center gap-1 transition ${
              hasNext
                ? 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
            title="วันถัดไป"
          >
            <span className="hidden xs:inline">วันถัดไป</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar for the Day */}
      {studySessionsOnly.length > 0 && (
        <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-4">
          <div className="text-xs font-semibold text-slate-700 shrink-0">
            ความคืบหน้ารายวัน:
          </div>
          <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                dayProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          <div className="text-xs font-bold text-slate-900 shrink-0">
            {dayProgress}%
          </div>
        </div>
      )}

      {/* Sessions Timeline List */}
      {daySessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Coffee className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="font-semibold text-slate-700">ไม่มีตารางอ่านหนังสือในวันนี้</p>
          <p className="text-xs text-slate-400 mt-1">วันนี้เป็นวันพักผ่อน หรือไม่มีเวลาว่างที่กำหนดไว้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {daySessions.map((session, index) => {
            const isBreak = session.activity === 'Break';
            const meta = getActivityMeta(session.activity);
            const customColor = session.subjectId ? subjectColorMap[session.subjectId] : undefined;

            if (isBreak) {
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-100/80 border border-dashed border-slate-300 text-slate-600"
                >
                  <div className="w-8 text-center shrink-0">
                    <Coffee className="w-4 h-4 mx-auto text-amber-600" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 min-w-28 sm:min-w-32">
                    {session.startTime} – {session.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      พักเบรก {session.duration} นาที
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {session.topic}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs relative overflow-hidden ${
                  session.completed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Accent Color Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: customColor || '#4f46e5' }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                  <div className="space-y-1.5">
                    {/* Time & Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{session.startTime} – {session.endTime}</span>
                        <span className="text-slate-400 font-normal">({session.duration} นาที)</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${meta.badge}`}>
                        <span>{meta.icon}</span>
                        <span>{session.activity}</span>
                        <span className="text-slate-500 font-normal">({meta.label})</span>
                      </span>
                    </div>

                    {/* Subject Name & Topic */}
                    <div className="pt-0.5">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{session.subjectName}</span>
                      </h4>
                      <p className={`text-sm mt-0.5 ${
                        session.completed ? 'line-through text-slate-400' : 'text-slate-600 font-medium'
                      }`}>
                        หัวข้อ: {session.topic}
                      </p>
                    </div>
                  </div>

                  {/* Mark as completed Checkbox */}
                  <div className="sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleSessionComplete(session.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        session.completed
                          ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-200'
                          : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                      }`}
                    >
                      {session.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>อ่านเสร็จแล้ว ✓</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark as completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
