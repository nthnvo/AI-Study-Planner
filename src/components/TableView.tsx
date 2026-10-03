import React, { useState } from 'react';
import { StudySession } from '../types';
import { getActivityMeta } from './DailyView';
import { Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';

interface TableViewProps {
  sessions: StudySession[];
  onToggleComplete: (id: string) => void;
  subjects: { id: string; name: string }[];
}

export const TableView: React.FC<TableViewProps> = ({
  sessions,
  onToggleComplete,
  subjects,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    if (selectedSubject !== 'all' && s.subjectId !== selectedSubject) return false;
    if (selectedActivity !== 'all' && s.activity !== selectedActivity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSubj = s.subjectName.toLowerCase().includes(q);
      const matchTopic = s.topic.toLowerCase().includes(q);
      const matchDate = s.date.includes(q);
      if (!matchSubj && !matchTopic && !matchDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาวิชา หัวข้อ หรือวันที่ (เช่น Data Mining, Classification)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกวิชา</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Activity Filter */}
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกกิจกรรม (รวมพักเบรก)</option>
            <option value="Learning">Learning (อ่านใหม่)</option>
            <option value="Review">Review (ทบทวน)</option>
            <option value="Practice">Practice (ทำแบบฝึกหัด)</option>
            <option value="Mock Exam">Mock Exam (จำลองสอบ)</option>
            <option value="Final Review">Final Review (ทวนก่อนสอบ)</option>
            <option value="Break">Break (เวลาพัก)</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-3.5 px-4 w-24">วัน</th>
                <th className="py-3.5 px-4 w-32">เวลา</th>
                <th className="py-3.5 px-4">วิชา</th>
                <th className="py-3.5 px-4">กิจกรรม</th>
                <th className="py-3.5 px-4">หัวข้อ</th>
                <th className="py-3.5 px-4 w-28 text-center">ระยะเวลา</th>
                <th className="py-3.5 px-4 w-32 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบรายการตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isBreak = session.activity === 'Break';
                  const meta = getActivityMeta(session.activity);

                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        session.completed ? 'bg-emerald-50/30' : ''
                      } ${isBreak ? 'bg-slate-50/40 text-slate-500 italic' : ''}`}
                    >
                      {/* Day */}
                      <td className="py-3 px-4 font-semibold whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                          Day {session.dayNumber}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {session.date}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 font-medium whitespace-nowrap">
                        {session.startTime} – {session.endTime}
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 font-bold">
                        {isBreak ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          session.subjectName
                        )}
                      </td>

                      {/* Activity */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badge}`}>
                          <span>{meta.icon}</span>
                          <span>{session.activity}</span>
                        </span>
                      </td>

                      {/* Topic */}
                      <td className="py-3 px-4">
                        {isBreak ? (
                          <span className="text-slate-500">พักเบรก ดื่มน้ำ ยืดเส้น</span>
                        ) : (
                          <span className={session.completed ? 'line-through text-slate-400' : ''}>
                            {session.topic}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-center font-medium">
                        {session.duration} นาที
                      </td>

                      {/* Status / Checkbox */}
                      <td className="py-3 px-4 text-center">
                        {isBreak ? (
                          <span className="text-slate-400 text-xs">-</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleComplete(session.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              session.completed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            {session.completed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>เสร็จแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5 text-slate-400" />
                                <span>ยังไม่ทำ</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
