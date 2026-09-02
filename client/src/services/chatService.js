import API from './api';

const getLocalChat = () => {
  const chatStr = localStorage.getItem('mock_chat_session');
  const defaultChat = [{
    sender: 'assistant',
    text: 'Namaste! I am your PrepPilot AI Mentor. Ask me about your study scheduling, weak areas, mocks accuracy, or polity concepts. I am here to optimize your UPSC preparation.'
  }];
  if (!chatStr) {
    localStorage.setItem('mock_chat_session', JSON.stringify(defaultChat));
    return defaultChat;
  }
  return JSON.parse(chatStr);
};

export const getMentorChatHistory = async () => {
  try {
    const res = await API.get('/chat');
    if (res.data.success) {
      return res.data.messages;
    }
  } catch (err) {
    console.warn('Backend chat retrieval failed. Serving local mock chat.');
    return getLocalChat();
  }
};

export const sendMentorMessage = async (text) => {
  try {
    const res = await API.post('/chat', { text });
    if (res.data.success) {
      return res.data.messages;
    }
  } catch (err) {
    console.warn('Backend chat send failed. Running offline mock replies.');
    const messages = getLocalChat();
    messages.push({ sender: 'user', text });

    const lower = text.toLowerCase().trim();
    let reply = '';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('hey') || lower.includes('aspirant')) {
      reply = `Namaste! Kaise chal rahi hai aapki preparation? Aap mujhse study planning, GS revision, mock scores ya CSAT topics ke baare me pooch sakte hain.`;
    } else if (lower.includes('what should i study today') || lower.includes('kya padhu')) {
      reply = `Looking at your syllabus stats, you should prioritize uncompleted Polity or History targets. Also check your mistake book items to avoid careless conceptual traps today.`;
    } else if (lower.includes('why is my score not improving') || lower.includes('score')) {
      reply = `To cross the qualifying cut-off benchmark, focus strictly on reviewing explanations for wrong options. Your mistake book has logged active errors—reviewing those is key.`;
    } else if (lower.includes('which topics are weak') || lower.includes('weak')) {
      reply = `Your weak topics according to syllabus confidence rating include Fundamental Rights. Focus on fundamental text readings and attempt topic practice MCQs for these areas.`;
    } else if (lower.includes('explain federalism') || lower.includes('federalism')) {
      reply = `Federalism in India represents a 'quasi-federal' structure. Landmark cases like S.R. Bommai (1994) declared federalism as part of the basic structure, laying down strict constraints on Article 356 executive proclamations.`;
    } else if (lower.includes('quiz me') || lower.includes('quiz')) {
      reply = `Here is a quick Polity question for you: 'Which amendment introduced the Anti-Defection law (Tenth Schedule)?' (Tip: 52nd Constitutional Amendment Act, 1985).`;
    } else if (lower.includes('mains question') || lower.includes('mains')) {
      reply = `Here is a subjective prompt: 'Critically analyze the efficacy of the Inter-State Council in resolving federal frictions. (15 Marks, 250 Words)'.`;
    } else if (lower.includes('7-day revision plan') || lower.includes('plan')) {
      reply = `Here is a 7-day Revision Plan: Day 1-2: Fundamental Rights & DPSP. Day 3-4: Parliament. Day 5: Union-State financial relations. Day 6: Sarkaria Commission. Day 7: Attempt 100-Question Mock Test.`;
    } else {
      reply = `Aapke sawaal "${text}" ko note kar liya gaya hai. UPSC CSE ke standard references ke anusaar, is topic ko clear concept aur revision notes ke sath practice karein. Agar koi specific doubt ya question solve karwana hai to batayein!`;
    }

    messages.push({ sender: 'assistant', text: reply });
    localStorage.setItem('mock_chat_session', JSON.stringify(messages));
    return messages;
  }
};
