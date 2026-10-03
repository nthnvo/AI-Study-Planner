import { Subject, TimeSlot, UserPreferences, StudyPlan } from '../types';
import { generateDeterministicPlan } from './plannerEngine';

export interface GeneratePlanPayload {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
}

export interface ReschedulePayload {
  prompt: string;
  plan: StudyPlan;
  subjects: Subject[];
  timeSlots: TimeSlot[];
  preferences: UserPreferences;
  currentDate?: string;
}

export async function requestGeneratePlan(payload: GeneratePlanPayload): Promise<StudyPlan> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.plan) {
        return data.plan;
      }
    }
  } catch (err) {
    console.warn('API call failed, falling back to local deterministic planner engine:', err);
  }

  // Robust Client-side fallback
  return generateDeterministicPlan({
    subjects: payload.subjects,
    timeSlots: payload.timeSlots,
    preferences: payload.preferences,
  });
}

export async function requestReschedulePlan(payload: ReschedulePayload): Promise<{ plan: StudyPlan; explanation: string }> {
  try {
    const res = await fetch('/api/reschedule-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.plan) {
        return {
          plan: data.plan,
          explanation: data.explanation || 'ตารางอ่านหนังสือได้รับการปรับเปลี่ยนเรียบร้อยแล้ว',
        };
      }
    }
  } catch (err) {
    console.warn('Reschedule API failed, falling back to local heuristic:', err);
  }

  // Local fallback reschedule logic
  const lower = payload.prompt.toLowerCase();
  let actionType: 'skip_today_subject' | 'boost_topic' | 'rebalance' = 'rebalance';
  let targetSubjectName: string | undefined;
  let targetTopicName: string | undefined;

  for (const s of payload.subjects) {
    if (lower.includes(s.name.toLowerCase())) {
      targetSubjectName = s.name;
      if (lower.includes('ไม่ทัน') || lower.includes('ไม่มีเวลา') || lower.includes('เลื่อน')) {
        actionType = 'skip_today_subject';
      }
      break;
    }
    for (const t of s.topics) {
      if (lower.includes(t.toLowerCase())) {
        targetTopicName = t;
        actionType = 'boost_topic';
        break;
      }
    }
  }

  const completedIds = new Set(payload.plan.sessions.filter(s => s.completed).map(s => s.id));

  const plan = generateDeterministicPlan({
    subjects: payload.subjects,
    timeSlots: payload.timeSlots,
    preferences: payload.preferences,
    existingCompletedIds: completedIds,
    rescheduleDirective: {
      actionType,
      targetSubjectName,
      targetTopicName,
      targetDate: payload.currentDate || payload.plan.startDate,
      customInstruction: payload.prompt,
    },
  });

  const explanation = targetSubjectName
    ? `นำหัวข้อ ${targetSubjectName} ไปจัดสรรในวันถัดไปโดยกระจายเวลาอย่างสมดุล`
    : targetTopicName
    ? `เพิ่มเวลาเจาะลึกหัวข้อ ${targetTopicName} เรียบร้อยแล้ว`
    : 'จัดสรรตารางการอ่านหนังสือใหม่ตามที่ระบุ';

  return { plan, explanation };
}
