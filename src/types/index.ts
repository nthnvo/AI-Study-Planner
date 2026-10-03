export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UnderstandingLevel = 'low' | 'medium' | 'high';

export type ActivityType = 
  | 'Learning' 
  | 'Review' 
  | 'Practice' 
  | 'Mock Exam' 
  | 'Final Review' 
  | 'Break';

export interface Subject {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  difficulty: DifficultyLevel;
  understandingLevel: UnderstandingLevel;
  topics: string[];
  notes?: string;
  color?: string;
}

export interface TimeSlot {
  id: string;
  dayType: 'weekday' | 'weekend' | 'specific';
  dayOfWeek?: number; // 0=Sunday, 1=Monday...
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface UserPreferences {
  focusEarlyExams: boolean;
  focusDifficult: boolean;
  focusLowUnderstanding: boolean;
  focusHeavyContent: boolean;
  includeReview: boolean;
  includePractice: boolean;
  sessionDuration: number; // in minutes (e.g. 25, 50, 60)
  breakDuration: number; // in minutes (e.g. 5, 10, 15)
  startDate: string; // YYYY-MM-DD
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1, 2, ...
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectId: string; // empty string for Break
  subjectName: string;
  activity: ActivityType;
  topic: string;
  duration: number; // minutes
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface PriorityScore {
  subjectId: string;
  subjectName: string;
  score: number;
  daysToExam: number;
  difficultyWeight: number;
  understandingWeight: number;
  topicsWeight: number;
  allocatedHours: number;
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  totalStudyHours: number;
  totalBreakHours: number;
  totalSessions: number;
  sessions: StudySession[];
  priorities: PriorityScore[];
  aiAnalysisSummary?: string;
  keyRecommendations?: string[];
}

export interface AppState {
  currentStep: number; // 1: Landing, 2: Subjects, 3: Availability, 4: Preferences, 5: Generating, 6: Dashboard
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
  plan: StudyPlan | null;
  selectedDate: string; // YYYY-MM-DD for daily view
  viewMode: 'daily' | 'calendar' | 'table' | 'subjects';
  calendarScope: 'all' | 'week' | 'day';
}

export interface RescheduleRequest {
  prompt: string;
  plan: StudyPlan;
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
  currentDate?: string;
}
