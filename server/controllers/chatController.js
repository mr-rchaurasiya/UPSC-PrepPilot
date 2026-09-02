import ChatSession from '../models/ChatSession.js';
import SyllabusProgress from '../models/SyllabusProgress.js';
import Mistake from '../models/Mistake.js';
import MockTestHistory from '../models/MockTestHistory.js';
import MainsAnswer from '../models/MainsAnswer.js';
import StudentProfile from '../models/StudentProfile.js';
import { generateWithGemini } from '../services/ai/geminiClient.js';
import { generateWithGroq } from '../services/ai/groqClient.js';
import dotenv from 'dotenv';

dotenv.config();

export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let session = await ChatSession.findOne({ user: userId });
    if (!session) {
      session = await ChatSession.create({
        user: userId,
        messages: [{
          sender: 'assistant',
          text: 'Namaste! I am your PrepPilot AI Mentor. Ask me about your study scheduling, weak areas, mocks accuracy, or polity concepts. I am here to optimize your UPSC preparation.'
        }]
      });
    }

    res.status(200).json({
      success: true,
      messages: session.messages
    });
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // 1. Gather secure candidate progress context
    const progressList = await SyllabusProgress.find({ user: userId }).populate('topic');
    const mistakes = await Mistake.find({ user: userId, status: 'unresolved' }).populate('question');
    const mocks = await MockTestHistory.find({ user: userId });
    const mains = await MainsAnswer.find({ user: userId });
    const profile = await StudentProfile.findOne({ user: userId });

    const totalTopicsCount = progressList.length;
    const completedCount = progressList.filter(p => p.status === 'Completed' || p.status === 'Revised').length;
    const weakTopics = progressList.filter(p => p.status === 'Weak' || p.confidence <= 2).map(p => p.topic?.title || 'General').slice(0, 3);
    const avgAccuracy = mocks.length > 0 ? Math.round(mocks.reduce((acc, m) => acc + (m.accuracy || 0), 0) / mocks.length) : 0;
    const optionalSubject = profile?.optionalSubject || 'Not selected';

    let contextPrompt = `
      You are a senior UPSC CSE Civil Services mentor. The student has requested mentoring.
      Official UPSC CSE Exam Timeline Reference:
      - UPSC CSE 2026: Prelims was held on 24 May 2026 (Sunday). Mains from September 2026.
      - UPSC CSE 2025: Prelims on 25 May 2025 (Sunday). Mains on 22 August 2025.
      - UPSC CSE 2024: Prelims on 16 June 2024 (Sunday). Mains on 20 September 2024.
      - UPSC CSE 2023: Prelims on 28 May 2023 (Sunday).
      - Pattern: Prelims (GS 1 + CSAT 33% qualifying) -> Mains (1750 Marks) -> Personality Test (275 Marks).

      Student Stats Context:
      - Syllabus Completed: ${completedCount} out of ${totalTopicsCount} topics.
      - Weak Areas: ${weakTopics.join(', ') || 'None registered yet'}.
      - Mock tests attempted: ${mocks.length}. Average accuracy: ${avgAccuracy}%.
      - Active Mistakes: ${mistakes.length} items logged.
      - Optional subject selected: ${optionalSubject}.
      - Answer writing submissions: ${mains.length} reports graded.
    `;

    let reply = '';
    const provider = process.env.AI_PROVIDER || 'groq';

    // 1. Try Groq (Ultra-fast real-time inference)
    if (provider === 'groq' || process.env.GROQ_API_KEY) {
      try {
        const messages = [
          {
            role: 'system',
            content: `You are a knowledgeable, encouraging, and senior UPSC CSE Civil Services mentor. 
${contextPrompt}
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Instructions:
1. Answer the student's question directly, accurately, and politely (e.g. historical facts, CSAT puzzles, day calculations, polity articles, economy concepts).
2. Anti-Hallucination & Factual Guardrails:
   - For future/unannounced UPSC exam dates or notifications: NEVER invent or hallucinate arbitrary exact dates. Explicitly clarify that UPSC CSE Prelims is strictly conducted on a Sunday (traditionally in late May / early June) and official dates must always be verified on upsc.gov.in.
   - Do not make up fake commission reports, fake case law names, or fake dates.
3. Understand the language of the prompt (Hindi, English, or Hinglish) and reply in the same natural tone.
4. If relevant to UPSC CSE, add a concise advisory takeaway. Keep the answer concise and engaging (under 200 words).`
          },
          {
            role: 'user',
            content: text
          }
        ];

        const groqText = await generateWithGroq(messages, { timeoutMs: 8000, maxTokens: 450 });
        if (groqText) {
          reply = groqText;
        }
      } catch (err) {
        console.warn('Groq chat failed, falling back:', err.message);
      }
    }

    // 2. Try Gemini
    if (!reply && (provider === 'gemini' || process.env.GEMINI_API_KEY)) {
      try {
        const prompt = `
          ${contextPrompt}
          Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          
          Student Message: "${text}"
          
          Instructions:
          1. Answer the student's question directly, accurately, and politely (e.g. if they ask a date, day of week, CSAT reasoning question, history fact, or polity question, solve/answer it correctly first).
          2. Understand the language of the prompt (Hindi, English, or Hinglish) and reply in the same natural tone.
          3. If relevant to UPSC CSE, add a concise advisory takeaway. Keep the answer concise (under 200 words).
        `;

        const aiText = await generateWithGemini(prompt, { timeoutMs: 8000 });
        if (aiText) {
          reply = aiText;
        }
      } catch (err) {
        console.warn('Gemini chat failed, falling back:', err.message);
      }
    } else if ((provider === 'openai' || provider === 'chatgpt') && process.env.OPENAI_API_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `${contextPrompt}\nRespond as a knowledgeable UPSC Mentor. Use clear structure. Keep response within 200 words. Do not invent official UPSC notification facts. Frame response advice as advisory.` },
              { role: 'user', content: text }
            ],
            max_tokens: 400
          })
        });
        clearTimeout(timeoutId);
        const openAiData = await openAiResponse.json();
        if (openAiData.choices && openAiData.choices[0]) {
          reply = openAiData.choices[0].message.content;
        }
      } catch (err) {
        console.warn('OpenAI chat failed, falling back to mock reply logic:', err.message);
      }
    }

    if (!reply) {
      // High Quality Mock Response mapping matches standard questions
      const lower = text.toLowerCase().trim();
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('hey') || lower.includes('aspirant')) {
        reply = `Namaste! Aapki UPSC preparation me madad karne ke liye mai yahan hoon. Aap mujhse study schedule, mock test accuracy (${avgAccuracy}%), revision strategy ya specific topics (Polity, History, Economy) ke baare me pooch sakte hain. Aaj kya study plan hai?`;
      } else if (lower.includes('what should i study today') || lower.includes('kya padhu')) {
        reply = `Looking at your syllabus stats (${completedCount}/${totalTopicsCount} completed), you should prioritize uncompleted Polity or History targets. Also check your ${mistakes.length} active mistake book items to avoid careless conceptual traps today.`;
      } else if (lower.includes('why is my score not improving') || lower.includes('score')) {
        reply = `Your mock average accuracy is currently at ${avgAccuracy}%. To cross the qualifying cut-off benchmark, focus strictly on reviewing explanations for wrong options. Your mistake book has ${mistakes.length} unresolved errors—reviewing those is the key to improving.`;
      } else if (lower.includes('which topics are weak') || lower.includes('weak')) {
        reply = weakTopics.length > 0 
          ? `Your weak topics according to syllabus confidence rating include: ${weakTopics.join(', ')}. Focus on fundamental text readings and attempt topic practice MCQs for these areas.`
          : `You do not have any topics marked 'Weak' or rated under low confidence yet. Continue mocks to map weak areas.`;
      } else if (lower.includes('explain federalism') || lower.includes('federalism')) {
        reply = `Federalism in India represents a 'quasi-federal' structure with unitary characters. Landmark cases like S.R. Bommai (1994) declared federalism as part of the basic structure, laying down strict constraints on Article 356 executive proclamations.`;
      } else if (lower.includes('quiz me') || lower.includes('quiz')) {
        reply = `Here is a quick Polity question for you: 'Which amendment introduced the Anti-Defection law (Tenth Schedule)?' (Tip: Think about 1985 52nd Amendment).`;
      } else if (lower.includes('mains question') || lower.includes('mains')) {
        reply = `Here is a subjective prompt: 'Critically analyze the efficacy of the Inter-State Council in resolving federal frictions. (15 Marks, 250 Words)'.`;
      } else if (lower.includes('7-day revision plan') || lower.includes('revision plan') || lower.includes('plan')) {
        reply = `Here is a 7-day Revision Plan: Day 1-2: Fundamental Rights & DPSP. Day 3-4: Parliament & Emergency restraints. Day 5: Union-State financial devolution. Day 6: Sarkaria Commission notes review. Day 7: Attempt 100-Question Mock Test.`;
      } else {
        reply = `Aapke current syllabus progress (${completedCount}/${totalTopicsCount} topics) aur mock accuracy (${avgAccuracy}%) ko dekhte hue, mai recommend karunga ki standard sources (NCERT, Laxmikanth, Current Affairs) ko revise karte rahein aur mistake book par dhyan dein. Kisi specific subject ya doubt par detail chahiye to batayein!`;
      }
    }

    // 2. Save session
    let session = await ChatSession.findOne({ user: userId });
    if (!session) {
      session = new ChatSession({ user: userId, messages: [] });
    }

    session.messages.push({ sender: 'user', text });
    session.messages.push({ sender: 'assistant', text: reply });
    await session.save();

    res.status(200).json({
      success: true,
      messages: session.messages
    });
  } catch (error) {
    next(error);
  }
};
