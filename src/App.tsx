import React, { useState, useEffect } from 'react';
import { Subject, TimeSlot, UserPreferences, StudyPlan } from './types';
import { getSampleData, formatDate } from './utils/sampleData';
import { requestGeneratePlan, requestReschedulePlan } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SubjectForm } from './components/SubjectForm';
import { AvailabilityForm } from './components/AvailabilityForm';
import { PreferenceForm } from './components/PreferenceForm';
import { GeneratingScreen } from './components/GeneratingScreen';
import { Dashboard } from './components/Dashboard';

const STORAGE_KEY = 'ai_study_planner_app_state_v1';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Core application state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    focusEarlyExams: true,
    focusDifficult: true,
    focusLowUnderstanding: true,
    focusHeavyContent: true,
    includeReview: true,
    includePractice: true,
    sessionDuration: 50,
    breakDuration: 10,
    startDate: formatDate(new Date()),
  });

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Load state from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && Array.isArray(parsed.subjects)) {
          setSubjects(parsed.subjects);
        }
        if (parsed.timeSlots && Array.isArray(parsed.timeSlots)) {
          setTimeSlots(parsed.timeSlots);
        }
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
        }
        if (parsed.plan) {
          setPlan(parsed.plan);
          if (parsed.plan.startDate) {
            setSelectedDate(parsed.plan.startDate);
          }
          // If a plan already exists, resume to Dashboard
          if (parsed.currentStep) {
            setCurrentStep(parsed.currentStep);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read state from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save state to localStorage whenever changes occur
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const stateToSave = {
        currentStep,
        subjects,
        timeSlots,
        preferences,
        plan,
        selectedDate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save state to localStorage:', e);
    }
  }, [isInitialized, currentStep, subjects, timeSlots, preferences, plan, selectedDate]);

  // Load sample dataset (from Section 2 of prompt)
  const handleLoadSampleData = () => {
    const { sampleSubjects, sampleTimeSlots, samplePreferences } = getSampleData();
    setSubjects(sampleSubjects);
    setTimeSlots(sampleTimeSlots);
    setPreferences(samplePreferences);
  };

  const handleLoadSampleAndStart = () => {
    handleLoadSampleData();
    setCurrentStep(2); // Jump straight to subjects view so student can inspect
  };

  // Reset all state
  const handleResetAll = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดและเริ่มต้นใหม่ใช่หรือไม่?')) {
      const freshPrefs = {
        focusEarlyExams: true,
        focusDifficult: true,
        focusLowUnderstanding: true,
        focusHeavyContent: true,
        includeReview: true,
        includePractice: true,
        sessionDuration: 50,
        breakDuration: 10,
        startDate: formatDate(new Date()),
      };
      setSubjects([]);
      setTimeSlots([]);
      setPreferences(freshPrefs);
      setPlan(null);
      setCurrentStep(1);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Subject management
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Toggle Session completion in plan
  const handleToggleCompleteSession = (sessionId: string) => {
    if (!plan) return;
    const nowIso = new Date().toISOString();
    const updatedSessions = plan.sessions.map((s) => {
      if (s.id === sessionId) {
        const nextState = !s.completed;
        return {
          ...s,
          completed: nextState,
          completedAt: nextState ? nowIso : undefined,
        };
      }
      return s;
    });

    setPlan({
      ...plan,
      sessions: updatedSessions,
      updatedAt: nowIso,
    });
  };

  // Step 4 -> 5 -> 6: Plan Generation
  const handleStartGeneration = async () => {
    // If time slots are empty, provide defaults
    let activeSlots = timeSlots;
    if (activeSlots.length === 0) {
      activeSlots = [
        { id: 'def-weekday', dayType: 'weekday', startTime: '19:00', endTime: '22:00' },
        { id: 'def-weekend', dayType: 'weekend', startTime: '10:00', endTime: '15:00' },
      ];
      setTimeSlots(activeSlots);
    }

    setCurrentStep(5); // Show processing screen
    setIsGenerating(true);

    try {
      const generated = await requestGeneratePlan({
        subjects,
        timeSlots: activeSlots,
        preferences,
      });

      setPlan(generated);
      setSelectedDate(generated.startDate || formatDate(new Date()));
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // When animation in Step 5 completes
  const handleProcessingComplete = () => {
    setCurrentStep(6); // Transition into Dashboard
  };

  // AI Reschedule handler
  const handleRescheduleWithAI = async (prompt: string) => {
    if (!plan) return;
    setIsRescheduling(true);
    try {
      const res = await requestReschedulePlan({
        prompt,
        plan,
        subjects,
        timeSlots,
        preferences,
        currentDate: selectedDate,
      });

      setPlan(res.plan);
    } catch (err) {
      console.error('Failed to reschedule:', err);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Navigation handlers (Preserving all data!)
  const handleNavigateStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleEditData = () => {
    // Return to Step 2 with all data intact
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <Navbar
        currentStep={currentStep}
        onNavigateStep={handleNavigateStep}
        plan={plan}
        onLoadSample={() => {
          handleLoadSampleData();
          if (currentStep === 1) setCurrentStep(2);
        }}
        onReset={handleResetAll}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* Step 1: Landing Page */}
        {currentStep === 1 && (
          <LandingPage
            onStart={() => {
              if (subjects.length === 0) {
                // Pre-populate with sample slots if empty so user has good defaults
                const { sampleTimeSlots } = getSampleData();
                setTimeSlots(sampleTimeSlots);
              }
              setCurrentStep(2);
            }}
            onLoadSampleAndStart={handleLoadSampleAndStart}
            hasExistingPlan={!!plan}
            onViewExistingPlan={() => setCurrentStep(6)}
          />
        )}

        {/* Step 2: Subject Form */}
        {currentStep === 2 && (
          <SubjectForm
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onNext={() => {
              if (timeSlots.length === 0) {
                const { sampleTimeSlots } = getSampleData();
                setTimeSlots(sampleTimeSlots);
              }
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(plan ? 6 : 1)}
            onLoadSample={handleLoadSampleData}
          />
        )}

        {/* Step 3: Availability Form */}
        {currentStep === 3 && (
          <AvailabilityForm
            timeSlots={timeSlots}
            onChangeTimeSlots={setTimeSlots}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            startDate={preferences.startDate}
            totalDays={14}
          />
        )}

        {/* Step 4: Preference Form */}
        {currentStep === 4 && (
          <PreferenceForm
            preferences={preferences}
            onChangePreferences={setPreferences}
            onSubmit={handleStartGeneration}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Step 5: Generating Screen */}
        {currentStep === 5 && (
          <GeneratingScreen onComplete={handleProcessingComplete} />
        )}

        {/* Step 6: Study Plan Dashboard */}
        {currentStep === 6 && plan && (
          <Dashboard
            plan={plan}
            subjects={subjects}
            timeSlots={timeSlots}
            preferences={preferences}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleCompleteSession={handleToggleCompleteSession}
            onEditData={handleEditData}
            onRescheduleWithAI={handleRescheduleWithAI}
            isRescheduling={isRescheduling}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>AI Study Planner</span>
            <span>•</span>
            <span>ระบบวางแผนอ่านหนังสือก่อนสอบด้วย AI สำหรับนักศึกษา</span>
          </div>
          <div>
            <span>ออกแบบตามหลัก Spaced Repetition และ Pomodoro Technique</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
