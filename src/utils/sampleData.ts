import { Subject, TimeSlot, UserPreferences } from '../types';

export const COLOR_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1', // indigo
];

// Helper to format date YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getTodayDate(): string {
  // Use today's date formatted
  const now = new Date();
  return formatDate(now);
}

export function getSampleData(baseDateStr?: string) {
  const base = baseDateStr || getTodayDate();

  const sampleSubjects: Subject[] = [
    {
      id: 'sub-data-mining',
      name: 'Data Mining',
      examDate: addDays(base, 7), // 7 days ahead
      examTime: '09:00',
      difficulty: 'hard',
      understandingLevel: 'medium',
      topics: [
        'Classification',
        'Clustering (K-Means / DBSCAN)',
        'Association Rules (Apriori)',
        'Decision Tree & Random Forest',
      ],
      notes: 'สอบเช้า เน้นคำนวณ Gini Index, Information Gain และ Association Rules Support/Confidence',
      color: '#3b82f6', // blue
    },
    {
      id: 'sub-theory-comp',
      name: 'Theory of Computation',
      examDate: addDays(base, 9), // 9 days ahead
      examTime: '13:30',
      difficulty: 'hard',
      understandingLevel: 'low',
      topics: [
        'Deterministic & NFA Automata',
        'Regular Expressions & Pumping Lemma',
        'Context-Free Grammars & Pushdown Automata',
        'Turing Machines & Decidability',
      ],
      notes: 'วิชายาก ต้องฝึกวาด State Diagram และเขียนพิสูจน์ Pumping Lemma ซ้ำๆ',
      color: '#ef4444', // red
    },
    {
      id: 'sub-software-eng',
      name: 'Software Engineering',
      examDate: addDays(base, 12), // 12 days ahead
      examTime: '09:00',
      difficulty: 'medium',
      understandingLevel: 'medium',
      topics: [
        'SDLC & Agile Scrum Methodologies',
        'Architecture Patterns (MVC, Microservices)',
        'GoF Design Patterns (Factory, Singleton, Observer)',
        'Software Testing (Unit, Integration, CI/CD)',
      ],
      notes: 'มีทั้งทฤษฎีและข้อเขียน Case Study เกี่ยวกับ System Design',
      color: '#10b981', // green
    },
    {
      id: 'sub-database',
      name: 'Database Systems',
      examDate: addDays(base, 14), // 14 days ahead
      examTime: '13:00',
      difficulty: 'medium',
      understandingLevel: 'high',
      topics: [
        'ER Model & Relational Algebra',
        'Database Normalization (1NF, 2NF, 3NF, BCNF)',
        'Complex SQL Queries & Indexing B-Trees',
        'ACID Properties, Transaction & Concurrency Control',
      ],
      notes: 'เข้าใจได้ดีพอสมควรแล้ว เน้นทวน Normalization และ Transaction Isolation Level',
      color: '#8b5cf6', // purple
    },
  ];

  const sampleTimeSlots: TimeSlot[] = [
    {
      id: 'slot-weekday-1',
      dayType: 'weekday',
      startTime: '19:00',
      endTime: '22:00', // 3 hours per weekday
    },
    {
      id: 'slot-weekend-morning',
      dayType: 'weekend',
      startTime: '10:00',
      endTime: '12:00', // 2 hours
    },
    {
      id: 'slot-weekend-afternoon',
      dayType: 'weekend',
      startTime: '13:00',
      endTime: '16:00', // 3 hours -> Total 5 hours per weekend day
    },
  ];

  const samplePreferences: UserPreferences = {
    focusEarlyExams: true,
    focusDifficult: true,
    focusLowUnderstanding: true,
    focusHeavyContent: true,
    includeReview: true,
    includePractice: true,
    sessionDuration: 50, // 50 mins study
    breakDuration: 10,   // 10 mins break
    startDate: base,
  };

  return { sampleSubjects, sampleTimeSlots, samplePreferences };
}
