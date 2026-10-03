import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  StudyPlan, 
  Subject, 
  TimeSlot, 
  UserPreferences, 
  StudySession 
} from '../types';
import { 
  Sparkles, 
  Edit3, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ListFilter, 
  BarChart2, 
  Table, 
  Flame, 
  Share2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { DailyView } from './DailyView';
import { CalendarView } from './CalendarView';
import { TableView } from './TableView';
import { SubjectBreakdown } from './SubjectBreakdown';
import { RescheduleModal } from './RescheduleModal';
import { daysBetween } from '../services/plannerEngine';
import { formatDate } from '../utils/sampleData';

interface DashboardProps {
  plan: StudyPlan;
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleCompleteSession: (sessionId: string) => void;
  onEditData: () => void;
  onRescheduleWithAI: (prompt: string) => Promise<void>;
  isRescheduling: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plan,
  subjects,
  timeSlots,
  preferences,
  selectedDate,
  onSelectDate,
  onToggleCompleteSession,
  onEditData,
  onRescheduleWithAI,
  isRescheduling,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar' | 'table' | 'breakdown'>('daily');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Extract unique sorted dates in the plan
  const availableDates = Array.from(new Set(plan.sessions.map((s) => s.date))).sort();

  // Create subject color mapping
  const subjectColorMap: Record<string, string> = {};
  subjects.forEach((s) => {
    subjectColorMap[s.id] = s.color || '#6366f1';
  });

  // Calculate statistics
  const studySessionsOnly = plan.sessions.filter((s) => s.activity !== 'Break');
  const totalStudySessions = studySessionsOnly.length;
  const completedSessions = studySessionsOnly.filter((s) => s.completed).length;

  const totalStudyMinutes = studySessionsOnly.reduce((acc, s) => acc + s.duration, 0);
  const completedMinutes = studySessionsOnly
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);

  const completedHours = Math.round((completedMinutes / 60) * 10) / 10;
  const totalHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const overallProgress = totalStudySessions > 0
    ? Math.round((completedSessions / totalStudySessions) * 100)
    : 0;

  const totalDays = availableDates.length;

  // Today's preview sessions for current selected date or first date
  const todaySessions = plan.sessions
    .filter((s) => s.date === selectedDate && s.activity !== 'Break')
    .slice(0, 4);

  const handleToggleSessionWithCelebration = (sessionId: string) => {
    const session = plan.sessions.find((s) => s.id === sessionId);
    if (session && !session.completed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onToggleCompleteSession(sessionId);
  };

  const handleOpenReschedule = () => {
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (prompt: string) => {
    await onRescheduleWithAI(prompt);
    setIsRescheduleModalOpen(false);
    setNotificationMsg('ตารางอ่านหนังสือได้รับการปรับเปลี่ยนด้วย AI เรียบร้อยแล้ว!');
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Study Plan Active</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {plan.startDate} ถึง {plan.endDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            แดชบอร์ดแผนการอ่านหนังสือ
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Reschedule Button */}
          <button
            onClick={handleOpenReschedule}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 animate-spin" />
            <span>ปรับตารางด้วย AI</span>
          </button>

          {/* Edit Data Button (Crucial Section 12 & 14) */}
          <button
            onClick={onEditData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition cursor-pointer"
            title="ย้อนกลับไปแก้ไขข้อมูลวิชาหรือเวลาว่าง โดยข้อมูลเดิมไม่หาย"
          >
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>แก้ไขข้อมูล</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="flex items-center gap-2 p-3.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Stats Card Matching Section 8 & 17 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Highlight Summary Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                AI Study Planner • ภาพรวมความก้าวหน้า
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 font-medium">
                {plan.sessions.length} ทั้งหมดรวมพักเบรก
              </span>
            </div>

            {/* Large Stats Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">จำนวนวิชา</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
                  {subjects.length} <span className="text-sm font-normal text-indigo-300">วิชา</span>
                </span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">ระยะเวลา</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
                  {totalDays} <span className="text-sm font-normal text-indigo-300">วัน</span>
                </span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">ชั่วโมงอ่านทั้งหมด</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
                  {totalHours} <span className="text-sm font-normal text-indigo-300">ชม.</span>
                </span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">อ่านเสร็จแล้ว</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">
                  {completedHours} <span className="text-sm font-normal text-indigo-300">ชม.</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
              <span className="text-slate-300">ความก้าวหน้ารวม (Overall Progress)</span>
              <span className="text-white font-extrabold text-base">{overallProgress}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3.5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>อ่านไปแล้ว {completedSessions} จาก {totalStudySessions} ช่วงอ่านหนังสือ</span>
              <span>เหลืออีก {totalStudySessions - completedSessions} ช่วงอ่าน</span>
            </div>
          </div>
        </div>

        {/* Right: Today's Plan Quick Card (Section 17) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Today's Plan (วันปัจจุบัน)
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {selectedDate}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              รอบอ่านสำคัญที่ระบบจัดไว้สำหรับวันนี้:
            </p>

            {todaySessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                ไม่มีรอบอ่านหนังสือในวันนี้ หรืออ่านครบหมดแล้ว
              </div>
            ) : (
              <div className="space-y-2">
                {todaySessions.map((ts) => (
                  <div
                    key={ts.id}
                    onClick={() => setActiveTab('daily')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        {ts.startTime}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {ts.subjectName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                      {ts.topic}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('daily')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
          >
            เปิดตารางเช็คลิสต์รายวันเต็มรูปแบบ →
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('daily')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>ตารางประจำวัน (Daily Schedule & Check-off)</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>มุมมองปฏิทิน (Calendar View)</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'table'
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>ตารางรวมทุกวิชา (Table View)</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'breakdown'
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>วิเคราะห์ลำดับความสำคัญ (AI Insights & Priorities)</span>
        </button>
      </div>

      {/* Main View Display Area */}
      <div>
        {activeTab === 'daily' && (
          <DailyView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            availableDates={availableDates}
            sessions={plan.sessions}
            onToggleSessionComplete={handleToggleSessionWithCelebration}
            subjectColorMap={subjectColorMap}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            sessions={plan.sessions}
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onSwitchToDailyView={(date) => {
              onSelectDate(date);
              setActiveTab('daily');
            }}
            subjectColorMap={subjectColorMap}
          />
        )}

        {activeTab === 'table' && (
          <TableView
            sessions={plan.sessions}
            onToggleComplete={handleToggleSessionWithCelebration}
            subjects={subjects}
          />
        )}

        {activeTab === 'breakdown' && (
          <SubjectBreakdown plan={plan} subjects={subjects} />
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSubmitPrompt={handleRescheduleSubmit}
        subjects={subjects}
        currentDate={selectedDate}
        isProcessing={isRescheduling}
      />
    </div>
  );
};
