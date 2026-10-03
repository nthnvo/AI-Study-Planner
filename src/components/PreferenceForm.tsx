import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  Timer, 
  Coffee, 
  Calendar,
  Zap,
  BookCheck,
  Flame,
  Award
} from 'lucide-react';
import { UserPreferences } from '../types';

interface PreferenceFormProps {
  preferences: UserPreferences;
  onChangePreferences: (prefs: UserPreferences) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const PreferenceForm: React.FC<PreferenceFormProps> = ({
  preferences,
  onChangePreferences,
  onSubmit,
  onBack,
}) => {
  const [customDuration, setCustomDuration] = useState<number>(preferences.sessionDuration || 50);
  const [isCustomDuration, setIsCustomDuration] = useState(
    ![25, 50, 60].includes(preferences.sessionDuration)
  );

  const toggleCheckbox = (key: keyof UserPreferences) => {
    onChangePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSelectDuration = (mins: number) => {
    setIsCustomDuration(false);
    onChangePreferences({
      ...preferences,
      sessionDuration: mins,
    });
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 30;
    setCustomDuration(val);
    onChangePreferences({
      ...preferences,
      sessionDuration: val,
    });
  };

  const handleSelectBreak = (mins: number) => {
    onChangePreferences({
      ...preferences,
      breakDuration: mins,
    });
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <span>ขั้นตอนที่ 3 จาก 3</span>
          <span>•</span>
          <span>ความต้องการและรูปแบบการอ่าน</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          กำหนดความต้องการและสไตล์การอ่านของคุณ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          เลือกสิ่งที่ต้องการให้ AI เน้นเป็นพิเศษ เพื่อสร้างตารางที่ตรงกับเป้าหมายและสไตล์การเรียนรู้ของคุณ
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {/* Priority Focus Checkboxes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>สิ่งที่ต้องการให้ AI เน้นเป็นพิเศษ (Preferences)</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            AI จะใช้ข้อมูลเหล่านี้ในการคำนวณ Priority Score และเกลี่ยเวลาให้แต่ละวิชา
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. วิชาที่สอบก่อน */}
            <label
              onClick={() => toggleCheckbox('focusEarlyExams')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.focusEarlyExams
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.focusEarlyExams ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">วิชาที่สอบก่อน</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เทเวลาและเริ่มอ่านวิชาที่วันสอบใกล้ที่สุดก่อน เพื่อให้พร้อมทันวันแรก
                </div>
              </div>
            </label>

            {/* 2. วิชาที่ยาก */}
            <label
              onClick={() => toggleCheckbox('focusDifficult')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.focusDifficult
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.focusDifficult ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">วิชาที่ยาก (Hard)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เพิ่มชั่วโมงศึกษาและทบทวนให้วิชาที่มีเนื้อหาซับซ้อนเป็นพิเศษ
                </div>
              </div>
            </label>

            {/* 3. วิชาที่เข้าใจน้อย */}
            <label
              onClick={() => toggleCheckbox('focusLowUnderstanding')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.focusLowUnderstanding
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.focusLowUnderstanding ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">วิชาที่เข้าใจน้อย</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เน้นปูพื้นฐานและเพิ่มรอบการอ่านหัวข้อที่ยังไม่เข้าใจให้แน่นขึ้น
                </div>
              </div>
            </label>

            {/* 4. วิชาที่มีเนื้อหาจำนวนมาก */}
            <label
              onClick={() => toggleCheckbox('focusHeavyContent')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.focusHeavyContent
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.focusHeavyContent ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">วิชาที่มีเนื้อหาจำนวนมาก</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  กระจายหัวข้อย่อยและจัดสรรเวลาให้ครอบคลุมทุกบท ไม่ตกหล่น
                </div>
              </div>
            </label>

            {/* 5. ทบทวนก่อนสอบ */}
            <label
              onClick={() => toggleCheckbox('includeReview')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.includeReview
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.includeReview ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">ทบทวนก่อนสอบ (Review Sessions)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  แทรกช่วงทบทวน Spaced Repetition เป็นระยะและทบทวนสรุปใหญ่ก่อนสอบ
                </div>
              </div>
            </label>

            {/* 6. ทำแบบฝึกหัดก่อนสอบ */}
            <label
              onClick={() => toggleCheckbox('includePractice')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                preferences.includePractice
                  ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {preferences.includePractice ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">ทำแบบฝึกหัด & Mock Exam</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  จัดช่วงทำโจทย์ข้อสอบเก่า และจำลองการสอบจับเวลาจริงก่อนวันสอบ
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Session & Break Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Length */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                ความยาวของแต่ละ Session
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              เลือกระยะเวลาการอ่านต่อ 1 รอบที่เหมาะกับสมาธิของคุณ
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleSelectDuration(25)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  !isCustomDuration && preferences.sessionDuration === 25
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold">25 นาที</div>
                <div className="text-[11px] text-slate-500">Pomodoro</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDuration(50)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  !isCustomDuration && preferences.sessionDuration === 50
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold">50 นาที</div>
                <div className="text-[11px] text-indigo-600 font-semibold">แนะนำ ⭐</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDuration(60)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  !isCustomDuration && preferences.sessionDuration === 60
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold">60 นาที</div>
                <div className="text-[11px] text-slate-500">Deep Focus</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCustomDuration(true);
                  onChangePreferences({ ...preferences, sessionDuration: customDuration });
                }}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  isCustomDuration
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold">กำหนดเอง</div>
                <div className="text-[11px] text-slate-500">{customDuration} นาที</div>
              </button>
            </div>

            {isCustomDuration && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium">ระบุเวลา:</span>
                <input
                  type="number"
                  min={15}
                  max={120}
                  step={5}
                  value={customDuration}
                  onChange={handleCustomDurationChange}
                  className="w-20 px-2.5 py-1 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg"
                />
                <span className="text-xs text-slate-500">นาทีต่อ 1 Session (15 - 120 นาที)</span>
              </div>
            )}
          </div>

          {/* Break Duration & Start Date */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Coffee className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  เวลาพักระหว่าง Session
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                พักสมอง ดื่มน้ำ เพื่อให้โฟกัสได้อย่างต่อเนื่องตลอดวัน
              </p>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => handleSelectBreak(5)}
                  className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                    preferences.breakDuration === 5
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-semibold">5 นาที</span>
                  <span className="block text-[11px] text-slate-400">พักสั้น</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectBreak(10)}
                  className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                    preferences.breakDuration === 10
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-semibold">10 นาที</span>
                  <span className="block text-[11px] text-emerald-600 font-medium">แนะนำ ⭐</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectBreak(15)}
                  className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                    preferences.breakDuration === 15
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-semibold">15 นาที</span>
                  <span className="block text-[11px] text-slate-400">พักสบาย</span>
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่เริ่มอ่านหนังสือ (Start Date)
              </label>
              <input
                type="date"
                value={preferences.startDate}
                onChange={(e) => onChangePreferences({ ...preferences, startDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ (เวลาว่าง)</span>
        </button>

        <button
          onClick={onSubmit}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-base font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-indigo-200 animate-spin" />
          <span>สร้างตารางอ่านหนังสือ (Generate Plan)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
