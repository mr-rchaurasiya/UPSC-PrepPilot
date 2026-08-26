import mongoose from 'mongoose';
import { sendVerificationEmail } from '../services/emailService.js';

export const dbCheck = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  console.log(`[Offline Fallback Mode] Intercepting request to ${req.method} ${req.path}`);

  const cleanPath = req.path.replace(/\/$/, '');

  // 1. Auth routes
  if (cleanPath.startsWith('/auth/register')) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Password strength validation: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
      });
    }

    // Initialize mock database in global memory
    if (!global.offlineUsers) {
      global.offlineUsers = {};
    }

    if (global.offlineUsers[email]) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Save user details
    const newUserId = `mock-user-${Date.now()}`;
    global.offlineUsers[email] = {
      id: newUserId,
      name,
      email,
      password,
      onboardingCompleted: false
    };

    const registeredUser = global.offlineUsers[email];

    return res.status(201).json({
      success: true,
      token: `mock-jwt-token-${registeredUser.id}`,
      user: {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: 'student',
        onboardingCompleted: registeredUser.onboardingCompleted
      }
    });
  }

  if (cleanPath.startsWith('/auth/login')) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (!global.offlineUsers) {
      global.offlineUsers = {};
    }

    const registeredUser = global.offlineUsers[email];
    
    if (!registeredUser) {
      return res.status(401).json({
        success: false,
        message: 'No registered user found with this email. Please register first.'
      });
    }

    if (registeredUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    return res.status(200).json({
      success: true,
      token: `mock-jwt-token-${registeredUser.id}`,
      user: {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: 'student',
        onboardingCompleted: registeredUser.onboardingCompleted
      }
    });
  }

  if (cleanPath.startsWith('/auth/forgot-password')) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email.' });
    }

    if (!global.offlineUsers) {
      global.offlineUsers = {};
    }

    const registeredUser = global.offlineUsers[email];
    if (!registeredUser) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email. Please register first.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (!global.dbUsersResetCodes) {
      global.dbUsersResetCodes = {};
    }
    global.dbUsersResetCodes[email] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    console.log(`[PASS RESET] Code for ${email} is: ${code}`);

    await sendVerificationEmail(email, code);

    return res.status(200).json({
      success: true,
      message: `Verification code generated successfully to ${email}. For testing convenience, enter the code: ${code}`
    });
  }

  if (cleanPath.startsWith('/auth/reset-password')) {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (!global.offlineUsers) {
      global.offlineUsers = {};
    }

    const registeredUser = global.offlineUsers[email];
    if (!registeredUser) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email.' });
    }

    const saved = global.dbUsersResetCodes?.[email];
    if (!saved || saved.code !== code || saved.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
      });
    }

    // Update password
    registeredUser.password = newPassword;
    delete global.dbUsersResetCodes[email];

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully!'
    });
  }

  if (cleanPath.startsWith('/auth/profile') || cleanPath.startsWith('/users/me')) {
    const authHeader = req.headers.authorization;
    let targetUser = {
      _id: 'mock-user-123',
      name: 'UPSC Aspirant',
      email: 'aspirant@preppilot.com',
      role: 'student',
      onboardingCompleted: true
    };

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const mockId = token.replace('mock-jwt-token-', '');

      if (global.offlineUsers) {
        const matched = Object.values(global.offlineUsers).find(u => u.id === mockId);
        if (matched) {
          targetUser = {
            _id: matched.id,
            name: matched.name,
            email: matched.email,
            role: 'student',
            onboardingCompleted: matched.onboardingCompleted
          };
        }
      }
    }

    return res.status(200).json({
      success: true,
      user: targetUser
    });
  }

  if (cleanPath.startsWith('/users/onboarding')) {
    const authHeader = req.headers.authorization;
    let targetUser = {
      _id: 'mock-user-123',
      name: 'UPSC Aspirant',
      email: 'aspirant@preppilot.com',
      role: 'student',
      onboardingCompleted: true
    };

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const mockId = token.replace('mock-jwt-token-', '');
      
      if (global.offlineUsers) {
        const matched = Object.values(global.offlineUsers).find(u => u.id === mockId);
        if (matched) {
          matched.onboardingCompleted = true;
          targetUser = {
            _id: matched.id,
            name: matched.name,
            email: matched.email,
            role: 'student',
            onboardingCompleted: true
          };
        }
      }
    }

    return res.status(200).json({
      success: true,
      user: targetUser
    });
  }

  // Chat Room routes
  if (cleanPath.startsWith('/chat')) {
    if (!global.offlineChatHistory) {
      global.offlineChatHistory = [{
        sender: 'assistant',
        text: 'Namaste! I am your PrepPilot AI Mentor. Ask me about your study scheduling, weak areas, mocks accuracy, or polity concepts. I am here to optimize your UPSC preparation.'
      }];
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        messages: global.offlineChatHistory
      });
    }

    if (req.method === 'POST') {
      const text = req.body.text || '';
      const lower = text.toLowerCase();
      let reply = '';

      const provider = process.env.AI_PROVIDER || 'mock';
      if ((provider === 'openai' || provider === 'chatgpt') && process.env.OPENAI_API_KEY) {
        try {
          const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a senior UPSC CSE Civil Services mentor. Respond as a knowledgeable UPSC Mentor. Use clear structure. Keep response within 200 words. Do not invent official UPSC notification facts. Frame response advice as advisory.' },
                { role: 'user', content: text }
              ],
              max_tokens: 400
            })
          });
          const openAiData = await openAiResponse.json();
          if (openAiData.choices && openAiData.choices[0]) {
            reply = openAiData.choices[0].message.content;
          }
        } catch (err) {
          console.warn('OpenAI offline chat failed, falling back:', err.message);
        }
      }

      if (!reply) {
        reply = 'I recommend grounding your arguments in Constitutional Articles and committee findings (like Punchhi and Sarkaria). What specific topic can I clarify next?';

        if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
          reply = 'Hello! How is your UPSC preparation going today? Ask me about study scheduling, weak areas, mocks accuracy, or polity concepts.';
        } else if (lower.includes('who are you') || lower.includes('mentor')) {
          reply = 'I am your PrepPilot AI Study Mentor. I analyze your syllabus progress rates, mock accuracy, and revision plans to guide your daily target strategies.';
        } else if (lower.includes('thank you') || lower.includes('thanks')) {
          reply = "You're welcome! Focus on consistency and continue mapping your weak areas to clear the qualifying cut-off benchmark.";
        } else if (lower.includes('laxmikanth') || lower.includes('polity')) {
          reply = "M. Laxmikanth's Indian Polity is the definitive reference. Focus on Chapters like Fundamental Rights, Parliament, Governor discretionary powers, and local self-government.";
        } else if (lower.includes('what should i study today')) {
          reply = `Looking at your syllabus stats, you should prioritize uncompleted Polity or History targets. Also check your mistake book items to avoid careless conceptual traps today.`;
        } else if (lower.includes('why is my score not improving')) {
          reply = `To cross the qualifying cut-off benchmark, focus strictly on reviewing explanations for wrong options. Your mistake book has logged active errors—reviewing those is key.`;
        } else if (lower.includes('which topics are weak')) {
          reply = `Your weak topics according to syllabus confidence rating include Fundamental Rights. Focus on fundamental text readings and attempt topic practice MCQs for these areas.`;
        } else if (lower.includes('explain federalism')) {
          reply = `Federalism in India represents a 'quasi-federal' structure. Landmark cases like S.R. Bommai (1994) declared federalism as part of the basic structure, laying down strict constraints on Article 356 executive proclamations.`;
        } else if (lower.includes('quiz me')) {
          reply = `Here is a quick Polity question for you: 'Which amendment introduced the Anti-Defection law (Tenth Schedule)?' (Tip: Think about 1985 amendment rules).`;
        } else if (lower.includes('mains question')) {
          reply = `Here is a subjective prompt: 'Critically analyze the efficacy of the Inter-State Council in resolving federal frictions. (15 Marks, 250 Words)'.`;
        } else if (lower.includes('7-day revision plan')) {
          reply = `Here is a 7-day Revision Plan: Day 1-2: Fundamental Rights. Day 3-4: Parliament. Day 5: Union-State financial devolution. Day 6: Sarkaria Commission. Day 7: Attempt 100-Question Mock Test.`;
        }
      }

      global.offlineChatHistory.push({ sender: 'user', text });
      global.offlineChatHistory.push({ sender: 'assistant', text: reply });

      return res.status(200).json({
        success: true,
        messages: global.offlineChatHistory
      });
    }
  }

  // 2. Syllabus routes
  if (cleanPath.startsWith('/syllabus')) {
    return res.status(200).json({
      success: true,
      topics: [
        { _id: 't1', code: 'POL1', title: 'Fundamental Rights (FR)', subject: 'Indian Polity & Governance', paper: 'GS1' },
        { _id: 't2', code: 'POL2', title: 'Directive Principles (DPSP)', subject: 'Indian Polity & Governance', paper: 'GS1' },
        { _id: 't3', code: 'HIS1', title: 'Revolt of 1857', subject: 'Modern Indian History & Culture', paper: 'GS1' }
      ],
      progress: []
    });
  }

  // 3. Practice questions
  if (cleanPath.startsWith('/practice/questions')) {
    return res.status(200).json({
      success: true,
      questions: [
        {
          _id: 'mock-q1',
          subject: 'Indian Polity & Governance',
          paper: 'GS1',
          questionText: 'Which of the following parts of the Constitution of India describes India as a Secular State?',
          options: [
            'Fundamental Rights',
            'Preamble to the Constitution',
            'Directive Principles of State Policy',
            'Ninth Schedule'
          ],
          correctOption: 1,
          explanation: 'The Preamble to the Constitution of India declares India to be a "Sovereign Socialist Secular Democratic Republic". The word "Secular" was added by the 42nd Constitutional Amendment Act of 1976.',
          difficulty: 'easy',
          source: 'pyq',
          year: 2015
        }
      ]
    });
  }

  // 4. Mistake book
  if (cleanPath.startsWith('/practice/mistakes')) {
    return res.status(200).json({
      success: true,
      mistakes: []
    });
  }

  // 5. Analytics
  if (cleanPath.startsWith('/analytics/complete')) {
    return res.status(200).json({
      success: true,
      preparationScore: 72,
      factors: [
        { name: 'Syllabus Completion', weight: '30%', score: 68, color: 'var(--accent-primary)' },
        { name: 'Mock MCQ Accuracy', weight: '30%', score: 74, color: 'var(--accent-success)' },
        { name: 'Mains Evaluation Rating', weight: '20%', score: 78, color: 'var(--accent-warning)' },
        { name: 'Revision Success Rate', weight: '20%', score: 70, color: 'var(--accent-info)' }
      ],
      study: { totalStudyHours: 145.5, dailyHours: 6.2, weeklyHours: 42.5, monthlyHours: 135.0, focusedSessions: 45 },
      question: { questionsAttempted: 350, accuracy: 74, correct: 259, incorrect: 91, skipped: 15, avgTimePerQuestion: 48 },
      subject: { progress: 68, weakTopics: [], strongTopics: [] },
      mains: { answersWritten: 12, avgMainsScore: 6.8, wordComplianceRate: 75 },
      revision: { completedRevisions: 14, overdueRevisions: 3, revisionSuccessRate: 78 },
      recommendations: [
        { type: 'syllabus', text: 'Prioritize uncompleted Polity chapters to raise your preparation index score.' }
      ]
    });
  }

  if (cleanPath.startsWith('/analytics/dashboard')) {
    return res.status(200).json({
      success: true,
      stats: {
        overallProgress: 68,
        prelimsProgress: 75,
        mainsProgress: 60,
        optionalProgress: 50,
        studyStreak: 5,
        totalStudyHours: 145,
        questionsSolved: 350,
        averageAccuracy: 74,
        studyTimeToday: 6.2
      },
      weeklyConsistency: [],
      recentTasks: [],
      weakTopics: [],
      recommendations: []
    });
  }

  // 6. Generic success for CRUD operations
  return res.status(200).json({
    success: true,
    message: 'Operation simulated successfully in offline mock mode.'
  });
};

export default dbCheck;
