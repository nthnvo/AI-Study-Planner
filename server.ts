import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDeterministicPlan } from './src/services/plannerEngine.ts';
import { StudyPlan, Subject, TimeSlot, UserPreferences } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI() : null;

// Endpoint 1: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Endpoint 2: Generate Study Plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { subjects, timeSlots, preferences } = req.body as {
      subjects: Subject[];
      timeSlots: TimeSlot[];
      preferences: UserPreferences;
    };

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ error: 'กรุณาระบุวิชาที่ต้องอ่านอย่างน้อย 1 วิชา' });
    }

    // Generate solid mathematically-sound plan first
    const basePlan = generateDeterministicPlan({
      subjects,
      timeSlots,
      preferences,
    });

    // If Gemini is available, provide AI pedagogical insights & personalized study tips
    if (ai) {
      try {
        const prompt = `
You are an expert AI Study Planner and University Academic Coach specializing in Thai university exam preparation.
Review the following exam schedule and study plan, and provide personalized advice in Thai:

วิชาที่ต้องสอบ:
${subjects.map((s, idx) => `${idx + 1}. ${s.name} (สอบวันที่: ${s.examDate} ${s.examTime || ''}, ความยาก: ${s.difficulty}, ความเข้าใจ: ${s.understandingLevel}, เนื้อหา: ${s.topics.join(', ')})`).join('\n')}

เวลาที่มีทั้งหมด: ${basePlan.totalStudyHours} ชั่วโมง
จำนวน Sessions: ${basePlan.totalSessions} ช่วง

จงเขียนสรุปคำแนะนำเชิงกลยุทธ์ (Strategic Advice) สั้นกระชับเข้าใจง่ายเป็นภาษาไทย 3-4 ข้อ พร้อมประเมินจุดที่ควรระวังเป็นพิเศษ เช่น วิชาที่ยากหรือสอบก่อน เพื่อให้นักศึกษาทำคะแนนสอบได้คะแนน A และไม่หมดไฟ (Burnout).
ตอบกลับในรูปแบบ JSON:
{
  "aiSummary": "ข้อความสรุปภาพรวมแผนการอ่านหนังสือ",
  "recommendations": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2", "คำแนะนำข้อที่ 3"]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.aiSummary) {
            basePlan.aiAnalysisSummary = parsed.aiSummary;
          }
          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            basePlan.keyRecommendations = parsed.recommendations;
          }
        }
      } catch (geminiError) {
        console.warn('Gemini enrichment skipped, using built-in engine:', geminiError);
      }
    }

    res.json({ success: true, plan: basePlan });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างแผนการอ่าน' });
  }
});

// Endpoint 3: AI Reschedule / Adjustment
app.post('/api/reschedule-plan', async (req: Request, res: Response) => {
  try {
    const { prompt, plan, subjects, timeSlots, preferences, currentDate } = req.body as {
      prompt: string;
      plan: StudyPlan;
      subjects: Subject[];
      timeSlots: TimeSlot[];
      preferences: UserPreferences;
      currentDate?: string;
    };

    if (!prompt || !plan) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วนสำหรับการปรับตาราง' });
    }

    // Preserve completed sessions
    const completedIds = new Set(
      plan.sessions.filter((s) => s.completed).map((s) => s.id)
    );

    const targetDate = currentDate || plan.startDate;
    const lowerPrompt = prompt.toLowerCase();

    let actionType: 'skip_today_subject' | 'boost_topic' | 'rebalance' | 'custom' = 'rebalance';
    let targetSubjectName: string | undefined;
    let targetTopicName: string | undefined;
    let aiExplanation = '';

    // Check Gemini for deep semantic understanding of user reschedule request
    if (ai) {
      try {
        const nlpPrompt = `
User wants to reschedule their study plan with the following natural language request:
"${prompt}"

Available subjects: ${subjects.map(s => s.name).join(', ')}
All topics: ${subjects.map(s => s.topics.join(', ')).join(', ')}

Analyze the user's intent:
1. Is user unable to study a subject today / running out of time for a subject today? (e.g. "วันนี้อ่าน Data Mining ไม่ทัน", "วันนี้ไม่มีเวลาอ่าน Database")
2. Does user feel weak or struggle with a specific topic and need more practice? (e.g. "ฉันไม่เข้าใจเรื่อง Classification", "เน้น Automata ให้หน่อย")
3. General rebalance or adjustment?

Respond in JSON format:
{
  "actionType": "skip_today_subject" | "boost_topic" | "rebalance",
  "matchedSubject": "exact subject name if mentioned or empty string",
  "matchedTopic": "exact topic name if mentioned or empty string",
  "explanationThai": "อธิบายสั้นๆ 1-2 ประโยคว่าระบบได้ปรับตารางอย่างไรให้ผู้ใช้ เช่น 'ปรับนำหัวข้อ Data Mining ของวันนี้ไปกระจายในวันพรุ่งนี้และสุดสัปดาห์ พร้อมเพิ่มช่วงทบทวนให้สมดุล'"
}
`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: nlpPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (resp.text) {
          const parsed = JSON.parse(resp.text);
          if (parsed.actionType) actionType = parsed.actionType;
          if (parsed.matchedSubject) targetSubjectName = parsed.matchedSubject;
          if (parsed.matchedTopic) targetTopicName = parsed.matchedTopic;
          if (parsed.explanationThai) aiExplanation = parsed.explanationThai;
        }
      } catch (geminiErr) {
        console.warn('Gemini NLP fallback to heuristic:', geminiErr);
      }
    }

    // Heuristic fallback if AI didn't catch or was offline
    if (!targetSubjectName && !targetTopicName) {
      for (const s of subjects) {
        if (lowerPrompt.includes(s.name.toLowerCase())) {
          targetSubjectName = s.name;
          if (lowerPrompt.includes('ไม่ทัน') || lowerPrompt.includes('ไม่มีเวลา') || lowerPrompt.includes('เลื่อน')) {
            actionType = 'skip_today_subject';
          }
          break;
        }
        for (const t of s.topics) {
          if (lowerPrompt.includes(t.toLowerCase())) {
            targetTopicName = t;
            actionType = 'boost_topic';
            break;
          }
        }
      }
    }

    // Default explanations if not provided by Gemini
    if (!aiExplanation) {
      if (actionType === 'skip_today_subject' && targetSubjectName) {
        aiExplanation = `นำช่วงการอ่านของ ${targetSubjectName} ในวันนี้ไปกระจายลงในวันถัดไปที่มีเวลาว่างเรียบร้อยแล้ว โดยไม่กระทบวิชาอื่น`;
      } else if (actionType === 'boost_topic' && targetTopicName) {
        aiExplanation = `เพิ่มความถี่ในการทบทวนและฝึกทำโจทย์สำหรับหัวข้อ "${targetTopicName}" เพิ่มเติมตามที่คุณต้องการ`;
      } else {
        aiExplanation = `จัดระเบียบตารางอ่านหนังสือใหม่ โดยคงหัวข้อที่ทำเสร็จแล้วไว้ และกระจายเนื้อหาที่เหลืออย่างสมดุล`;
      }
    }

    // Regenerate plan with updated directive
    const newPlan = generateDeterministicPlan({
      subjects,
      timeSlots,
      preferences,
      existingCompletedIds: completedIds,
      rescheduleDirective: {
        actionType,
        targetSubjectName,
        targetTopicName,
        targetDate,
        customInstruction: prompt,
      },
    });

    newPlan.aiAnalysisSummary = aiExplanation;

    res.json({
      success: true,
      plan: newPlan,
      explanation: aiExplanation,
    });
  } catch (error: any) {
    console.error('Error rescheduling plan:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการปรับตาราง' });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Study Planner server running on http://0.0.0.0:${port}`);
  });
}

startServer();
