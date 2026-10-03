import { 
  Subject, 
  TimeSlot, 
  UserPreferences, 
  StudySession, 
  StudyPlan, 
  PriorityScore, 
  ActivityType 
} from '../types';
import { formatDate } from '../utils/sampleData';

// Helper to convert time "HH:mm" to minutes from 00:00
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Helper to convert minutes from 00:00 to "HH:mm"
export function minutesToTime(m: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, m));
  const h = Math.floor(normalized / 60);
  const min = Math.floor(normalized % 60);
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Difference in whole calendar days (date2 - date1)
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Calculate total available hours in time slots across a given number of days
export function calculateTotalAvailableHours(
  timeSlots: TimeSlot[],
  startDate: string,
  totalDays: number = 14
): { totalHours: number; weekdayHoursPerDay: number; weekendHoursPerDay: number } {
  let weekdayMinutes = 0;
  let weekendMinutes = 0;

  for (const slot of timeSlots) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    const duration = Math.max(0, end - start);

    if (slot.dayType === 'weekday') {
      weekdayMinutes += duration;
    } else if (slot.dayType === 'weekend') {
      weekendMinutes += duration;
    } else {
      // Default to both if unspecified
      weekdayMinutes += duration;
      weekendMinutes += duration;
    }
  }

  let totalMinutes = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    totalMinutes += isWeekend ? weekendMinutes : weekdayMinutes;
  }

  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    weekdayHoursPerDay: Math.round((weekdayMinutes / 60) * 10) / 10,
    weekendHoursPerDay: Math.round((weekendMinutes / 60) * 10) / 10,
  };
}

// Calculate base priority scores for subjects
export function computeSubjectPriorities(
  subjects: Subject[],
  baseDate: string,
  preferences: UserPreferences
): PriorityScore[] {
  return subjects.map((sub) => {
    const daysToExam = Math.max(1, daysBetween(baseDate, sub.examDate));

    // Difficulty score (1 to 3)
    let diffWeight = sub.difficulty === 'hard' ? 3 : sub.difficulty === 'medium' ? 2 : 1;
    if (!preferences.focusDifficult) diffWeight = 1.5;

    // Understanding score (1 to 3, lower understanding = higher weight)
    let underWeight = sub.understandingLevel === 'low' ? 3 : sub.understandingLevel === 'medium' ? 2 : 1;
    if (!preferences.focusLowUnderstanding) underWeight = 1.5;

    // Topics weight
    let topicWeight = Math.max(1, Math.min(3, sub.topics.length * 0.6));
    if (!preferences.focusHeavyContent) topicWeight = 1.5;

    // Proximity weight (closer exam = higher base priority)
    let proximityWeight = Math.max(1, 15 - daysToExam);
    if (!preferences.focusEarlyExams) proximityWeight = 5;

    // Composite Priority Score
    const compositeScore = (diffWeight * 1.8) + (underWeight * 2.0) + (proximityWeight * 1.2) + (topicWeight * 1.0);

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      score: Math.round(compositeScore * 10) / 10,
      daysToExam,
      difficultyWeight: diffWeight,
      understandingWeight: underWeight,
      topicsWeight: Math.round(topicWeight * 10) / 10,
      allocatedHours: 0,
    };
  }).sort((a, b) => b.score - a.score);
}

interface GeneratePlanOptions {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
  existingCompletedIds?: Set<string>;
  rescheduleDirective?: {
    actionType: 'skip_today_subject' | 'boost_topic' | 'rebalance' | 'custom';
    targetSubjectName?: string;
    targetTopicName?: string;
    targetDate?: string;
    customInstruction?: string;
  };
}

export function generateDeterministicPlan(options: GeneratePlanOptions): StudyPlan {
  const { subjects, timeSlots, preferences, existingCompletedIds = new Set(), rescheduleDirective } = options;

  if (subjects.length === 0) {
    throw new Error('กรุณาเพิ่มวิชาที่ต้องอ่านอย่างน้อย 1 วิชา');
  }

  const startDate = preferences.startDate || formatDate(new Date());
  
  // Find the latest exam date among all subjects
  let maxExamDate = startDate;
  for (const s of subjects) {
    if (daysBetween(startDate, s.examDate) > daysBetween(startDate, maxExamDate)) {
      maxExamDate = s.examDate;
    }
  }

  // Ensure minimum 7 days, max exam date
  const totalDays = Math.max(7, daysBetween(startDate, maxExamDate) + 1);

  // Calculate priorities
  const priorities = computeSubjectPriorities(subjects, startDate, preferences);

  // Subject topic tracker: pointer to next topic and cycle count
  const subjectTopicState: Record<string, { topicIndex: number; learnedTopics: Set<string>; practiceCount: number }> = {};
  for (const s of subjects) {
    subjectTopicState[s.id] = {
      topicIndex: 0,
      learnedTopics: new Set<string>(),
      practiceCount: 0,
    };
  }

  const sessionDuration = preferences.sessionDuration || 50;
  const breakDuration = preferences.breakDuration || 10;
  const totalBlockDuration = sessionDuration + breakDuration;

  const generatedSessions: StudySession[] = [];
  let totalStudyMinutes = 0;
  let totalBreakMinutes = 0;
  let sessionCounter = 1;

  // Track subject hours
  const subjectStudyMinutes: Record<string, number> = {};
  subjects.forEach(s => subjectStudyMinutes[s.id] = 0);

  // Loop through each day
  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentD = new Date(startDate + 'T00:00:00');
    currentD.setDate(currentD.getDate() + dayOffset);
    const currentDateStr = formatDate(currentD);
    const dayNumber = dayOffset + 1;
    const isWeekend = currentD.getDay() === 0 || currentD.getDay() === 6;

    // Filter relevant slots for this day
    const daySlots = timeSlots.filter(s => {
      if (s.dayType === 'weekday' && !isWeekend) return true;
      if (s.dayType === 'weekend' && isWeekend) return true;
      if (s.dayType === 'specific' && s.dayOfWeek !== undefined) {
        return s.dayOfWeek === currentD.getDay();
      }
      return false;
    });

    // If no slots configured for this day type, fallback to default hours
    const activeSlots = daySlots.length > 0 ? daySlots : [
      isWeekend 
        ? { id: 'fallback-we', dayType: 'weekend' as const, startTime: '10:00', endTime: '15:00' }
        : { id: 'fallback-wd', dayType: 'weekday' as const, startTime: '19:00', endTime: '22:00' }
    ];

    // For each slot on this day, subdivide into session + break blocks
    for (const slot of activeSlots) {
      let currentMinute = timeToMinutes(slot.startTime);
      const slotEndMinute = timeToMinutes(slot.endTime);

      while (currentMinute + sessionDuration <= slotEndMinute) {
        // Find which subjects are eligible today (exam has not passed yet)
        const eligibleSubjects = subjects.filter(sub => {
          const daysLeft = daysBetween(currentDateStr, sub.examDate);
          if (daysLeft < 0) return false; // exam already finished
          if (daysLeft === 0) {
            // Exam is today: only study if slot is BEFORE exam time
            const examMinutes = timeToMinutes(sub.examTime || '09:00');
            return currentMinute + sessionDuration <= examMinutes;
          }
          return true;
        });

        if (eligibleSubjects.length === 0) {
          break; // All exams completed
        }

        // Apply reschedule directive filter if needed
        let candidateSubjects = eligibleSubjects;
        if (
          rescheduleDirective?.actionType === 'skip_today_subject' &&
          rescheduleDirective.targetDate === currentDateStr &&
          rescheduleDirective.targetSubjectName
        ) {
          const filtered = eligibleSubjects.filter(
            s => !s.name.toLowerCase().includes(rescheduleDirective.targetSubjectName!.toLowerCase())
          );
          if (filtered.length > 0) {
            candidateSubjects = filtered;
          }
        }

        // Select the best subject for this session using dynamic scoring
        let bestSubject = candidateSubjects[0];
        let bestScore = -Infinity;

        for (const sub of candidateSubjects) {
          const daysLeft = daysBetween(currentDateStr, sub.examDate);
          const prio = priorities.find(p => p.subjectId === sub.id)?.score || 5;
          const studyTimeSoFar = subjectStudyMinutes[sub.id] || 0;

          // Urgency multiplier for approaching exam
          let urgency = 1;
          if (daysLeft <= 1) urgency = 3.5;
          else if (daysLeft <= 3) urgency = 2.4;
          else if (daysLeft <= 6) urgency = 1.6;

          // Topic boost if user explicitly requested boosting this topic/subject
          let boostMultiplier = 1;
          if (
            rescheduleDirective?.actionType === 'boost_topic' &&
            rescheduleDirective.targetTopicName &&
            sub.topics.some(t => t.toLowerCase().includes(rescheduleDirective.targetTopicName!.toLowerCase()))
          ) {
            boostMultiplier = 2.2;
          }

          // Balance factor: subjects that have received fewer study minutes get a natural boost
          const balancePenalty = (studyTimeSoFar / 50) * 0.45;

          const currentDynamicScore = (prio * 1.5 * urgency * boostMultiplier) - balancePenalty;

          if (currentDynamicScore > bestScore) {
            bestScore = currentDynamicScore;
            bestSubject = sub;
          }
        }

        // Determine activity type based on days to exam and state
        const daysLeft = daysBetween(currentDateStr, bestSubject.examDate);
        const state = subjectTopicState[bestSubject.id];
        let activity: ActivityType = 'Learning';
        let topic = bestSubject.topics[0] || 'Core Review';

        // Select topic
        if (bestSubject.topics.length > 0) {
          // If boost requested for a topic, prefer that topic
          if (
            rescheduleDirective?.actionType === 'boost_topic' &&
            rescheduleDirective.targetTopicName &&
            bestSubject.topics.some(t => t.toLowerCase().includes(rescheduleDirective.targetTopicName!.toLowerCase()))
          ) {
            const matched = bestSubject.topics.find(t => 
              t.toLowerCase().includes(rescheduleDirective.targetTopicName!.toLowerCase())
            );
            topic = matched || bestSubject.topics[state.topicIndex % bestSubject.topics.length];
          } else {
            topic = bestSubject.topics[state.topicIndex % bestSubject.topics.length];
          }
        }

        // Phase Activity Logic
        if (daysLeft === 0) {
          activity = 'Final Review';
        } else if (daysLeft === 1) {
          // 1 day before exam: Mock Exam or Final Review
          activity = state.practiceCount % 2 === 0 ? 'Mock Exam' : 'Final Review';
          state.practiceCount++;
        } else if (daysLeft <= 3) {
          // 2-3 days before exam: Practice and Review
          if (preferences.includePractice && state.practiceCount % 2 === 0) {
            activity = 'Practice';
          } else if (preferences.includeReview) {
            activity = 'Review';
          } else {
            activity = 'Practice';
          }
          state.practiceCount++;
        } else if (daysLeft <= 6) {
          // 4-6 days: Mix of Learning and Review/Practice
          if (state.learnedTopics.size >= bestSubject.topics.length && preferences.includePractice) {
            activity = 'Practice';
          } else if (state.topicIndex > 0 && state.topicIndex % 3 === 0 && preferences.includeReview) {
            activity = 'Review';
          } else {
            activity = 'Learning';
            state.learnedTopics.add(topic);
            state.topicIndex++;
          }
        } else {
          // Early phase (>6 days): mostly Learning, occasional Review
          if (state.topicIndex > 0 && state.topicIndex % 4 === 0 && preferences.includeReview) {
            activity = 'Review';
          } else {
            activity = 'Learning';
            state.learnedTopics.add(topic);
            state.topicIndex++;
          }
        }

        const sessionStart = minutesToTime(currentMinute);
        const sessionEnd = minutesToTime(currentMinute + sessionDuration);

        const sessionId = `sess-${dayOffset + 1}-${sessionCounter++}`;
        const isPreviouslyCompleted = existingCompletedIds.has(sessionId);

        // Add Study Session
        generatedSessions.push({
          id: sessionId,
          date: currentDateStr,
          dayNumber,
          startTime: sessionStart,
          endTime: sessionEnd,
          subjectId: bestSubject.id,
          subjectName: bestSubject.name,
          activity,
          topic,
          duration: sessionDuration,
          completed: isPreviouslyCompleted,
          completedAt: isPreviouslyCompleted ? new Date().toISOString() : undefined,
        });

        totalStudyMinutes += sessionDuration;
        subjectStudyMinutes[bestSubject.id] = (subjectStudyMinutes[bestSubject.id] || 0) + sessionDuration;
        currentMinute += sessionDuration;

        // Check if there is room for a break before slot ends
        if (breakDuration > 0 && currentMinute + breakDuration <= slotEndMinute) {
          const breakStart = minutesToTime(currentMinute);
          const breakEnd = minutesToTime(currentMinute + breakDuration);

          generatedSessions.push({
            id: `break-${dayOffset + 1}-${sessionCounter++}`,
            date: currentDateStr,
            dayNumber,
            startTime: breakStart,
            endTime: breakEnd,
            subjectId: '',
            subjectName: 'เวลาพัก',
            activity: 'Break',
            topic: 'พักสมอง ดื่มน้ำ ยืดกล้ามเนื้อ ☕',
            duration: breakDuration,
            completed: false,
          });

          totalBreakMinutes += breakDuration;
          currentMinute += breakDuration;
        } else if (breakDuration > 0) {
          // If remaining time in slot is less than full break, just advance to end of slot
          currentMinute = slotEndMinute;
        }
      }
    }
  }

  // Update priorities with allocated hours
  priorities.forEach(p => {
    p.allocatedHours = Math.round(((subjectStudyMinutes[p.subjectId] || 0) / 60) * 10) / 10;
  });

  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const totalBreakHours = Math.round((totalBreakMinutes / 60) * 10) / 10;

  const keyRecommendations = [
    `กระจายเวลาอ่านหนังสือครบทั้ง ${subjects.length} วิชา ตามระดับความเร่งด่วนและลำดับวันสอบ`,
    `จัดสรรช่วงฝึกทำโจทย์ (Practice) และจำลองข้อสอบจริง (Mock Exam) ก่อนวันสอบ 1-3 วัน`,
    `มีช่วงพักสมองระหว่าง Session เพื่อลดความเหนื่อยล้า และเพิ่มประสิทธิภาพความจำระยะยาว (Spaced Repetition)`,
    `วิชาที่มีความยากสูงอย่าง ${subjects.filter(s => s.difficulty === 'hard').map(s => s.name).join(', ') || 'วิชาหลัก'} ได้รับการจัดชั่วโมงศึกษาและทบทวนเป็นพิเศษ`,
  ];

  const planId = 'plan-' + Date.now();
  const nowIso = new Date().toISOString();

  return {
    id: planId,
    createdAt: nowIso,
    updatedAt: nowIso,
    startDate,
    endDate: addDays(startDate, totalDays - 1),
    totalStudyHours,
    totalBreakHours,
    totalSessions: generatedSessions.length,
    sessions: generatedSessions,
    priorities,
    aiAnalysisSummary: `สร้างแผนการอ่านหนังสือสำหรับ ${subjects.length} วิชา ในกรอบเวลา ${totalDays} วัน รวมเวลาอ่านจริง ${totalStudyHours} ชั่วโมง พร้อมเวลาพักอย่างสมดุล`,
    keyRecommendations,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
