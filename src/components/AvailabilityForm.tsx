import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CalendarDays, 
  Sun, 
  Moon,
  Info
} from 'lucide-react';
import { TimeSlot } from '../types';
import { calculateTotalAvailableHours, timeToMinutes } from '../services/plannerEngine';
import { formatDate } from '../utils/sampleData';

interface AvailabilityFormProps {
  timeSlots: TimeSlot[];
  onChangeTimeSlots: (slots: TimeSlot[]) => void;
  onNext: () => void;
  onBack: () => void;
  startDate?: string;
  totalDays?: number;
}

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  timeSlots,
  onChangeTimeSlots,
  onNext,
  onBack,
  startDate = formatDate(new Date()),
  totalDays = 14,
}) => {
  const [error, setError] = useState('');

  const weekdaySlots = timeSlots.filter((s) => s.dayType === 'weekday');
  const weekendSlots = timeSlots.filter((s) => s.dayType === 'weekend');

  const stats = calculateTotalAvailableHours(timeSlots, startDate, totalDays);

  const handleUpdateTimeSlot = (id: string, field: 'startTime' | 'endTime', val: string) => {
    const updated = timeSlots.map((slot) => {
      if (slot.id === id) {
        return { ...slot, [field]: val };
      }
      return slot;
    });
    onChangeTimeSlots(updated);
  };

  const handleAddSlot = (dayType: 'weekday' | 'weekend') => {
    const defaultStart = dayType === 'weekday' ? '19:00' : '10:00';
    const defaultEnd = dayType === 'weekday' ? '22:00' : '12:00';

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayType,
      startTime: defaultStart,
      endTime: defaultEnd,
    };

    onChangeTimeSlots([...timeSlots, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    if (timeSlots.length <= 1) {
      setError('ต้องมีช่วงเวลาอ่านหนังสืออย่างน้อย 1 ช่วงเวลา');
      return;
    }
    setError('');
    onChangeTimeSlots(timeSlots.filter((s) => s.id !== id));
  };

  const handleNextClick = () => {
    // Validate each slot
    for (const slot of timeSlots) {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);
      if (end <= start) {
        setError(`ช่วงเวลาไม่ถูกต้อง: เวลาสิ้นสุด (${slot.endTime}) ต้องมากกว่าเวลาเริ่ม (${slot.startTime})`);
        return;
      }
      if (end - start < 30) {
        setError(`แต่ละช่วงเวลาควรอ่านอย่างน้อย 30 นาที`);
        return;
      }
    }

    if (stats.totalHours <= 0) {
      setError('กรุณากำหนดเวลาอ่านหนังสืออย่างน้อย 1 ชั่วโมง');
      return;
    }

    setError('');
    onNext();
  };

  // Helper to calculate duration for a slot
  const getSlotHours = (s: TimeSlot) => {
    const start = timeToMinutes(s.startTime);
    const end = timeToMinutes(s.endTime);
    const mins = Math.max(0, end - start);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <span>ขั้นตอนที่ 2 จาก 3</span>
          <span>•</span>
          <span>กำหนดเวลาว่างสำหรับอ่านหนังสือ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          กำหนดช่วงเวลาที่คุณว่างอ่านหนังสือ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          ระบบจะจัดช่วงอ่านและช่วงพักผ่อนให้อยู่เฉพาะในกรอบเวลานี้เท่านั้น โดยไม่รบกวนเวลาเรียนหรือธุระส่วนตัว
        </p>
      </div>

      {/* Total Hours Computed Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
              สรุปเวลาว่างตลอดช่วงสอบ ({totalDays} วัน)
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-white flex items-baseline gap-2">
              <span>{stats.totalHours}</span>
              <span className="text-lg font-normal text-indigo-200">ชั่วโมง</span>
            </div>
            <p className="text-xs text-indigo-200/90 mt-1">
              คำนวณอัตโนมัติจากวันจันทร์-อาทิตย์ เพื่อนำไปจัดสรร Study Sessions ให้ทุกวิชา
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-xs text-indigo-200">จันทร์–ศุกร์ (5 วัน)</div>
              <div className="text-xl font-bold">{stats.weekdayHoursPerDay} ชม./วัน</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-xs text-indigo-200">เสาร์–อาทิตย์ (2 วัน)</div>
              <div className="text-xl font-bold">{stats.weekendHoursPerDay} ชม./วัน</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Weekday Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">วันจันทร์ – วันศุกร์</h3>
                  <p className="text-xs text-slate-500">มักเป็นช่วงเย็นหลังเลิกเรียน เช่น 19:00 - 22:00</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {weekdaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">เริ่มเวลา</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUpdateTimeSlot(slot.id, 'startTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">ถึงเวลา</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateTimeSlot(slot.id, 'endTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-right px-2 shrink-0">
                    <span className="text-xs font-semibold text-indigo-600 block">
                      {getSlotHours(slot)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                    title="ลบช่วงเวลานี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleAddSlot('weekday')}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มช่วงเวลาวันจันทร์-ศุกร์</span>
          </button>
        </div>

        {/* Weekend Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">วันเสาร์ – วันอาทิตย์</h3>
                  <p className="text-xs text-slate-500">กำหนดได้หลายช่วง เช่น เช้า 10:00-12:00 และ บ่าย 13:00-16:00</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {weekendSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">เริ่มเวลา</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUpdateTimeSlot(slot.id, 'startTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">ถึงเวลา</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateTimeSlot(slot.id, 'endTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-right px-2 shrink-0">
                    <span className="text-xs font-semibold text-indigo-600 block">
                      {getSlotHours(slot)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                    title="ลบช่วงเวลานี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleAddSlot('weekend')}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 text-slate-600 hover:text-amber-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มช่วงเวลาวันเสาร์-อาทิตย์</span>
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100/80 text-xs text-slate-600 mb-8">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          ระบบจะซอยย่อยช่วงเวลาที่คุณกำหนดให้เป็น Session การอ่านหนังสือที่เหมาะสม (เช่น 50 นาทีอ่าน + 10 นาทีพัก) โดยอัตโนมัติ เพื่อให้สมองไม่ล้าและจดจำเนื้อหาได้ดีที่สุด
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ (วิชา)</span>
        </button>

        <button
          onClick={handleNextClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-200 transition cursor-pointer"
        >
          <span>ต่อไป: ตั้งค่า Preference</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
