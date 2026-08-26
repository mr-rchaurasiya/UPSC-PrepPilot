import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getMentorChatHistory, sendMentorMessage } from '../services/chatService.js';

export const MentorRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    setLoading(true);
    const history = await getMentorChatHistory();
    setMessages(history || []);
    setLoading(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    setSending(true);

    // Append user message immediately for responsiveness
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    try {
      const updated = await sendMentorMessage(userText);
      setMessages(updated || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handlePromptClick = async (promptText) => {
    setSending(true);
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    try {
      const updated = await sendMentorMessage(promptText);
      setMessages(updated || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const suggestedPrompts = [
    'What should I study today?',
    'Why is my score not improving?',
    'Which topics are weak?',
    'Explain Federalism.',
    'Give me a 7-day revision plan.',
    'Give me a Mains question.',
    'Quiz me on Polity.'
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading AI Mentor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1 d-flex flex-column" style={{ maxWidth: '950px' }}>
        
        {/* HEADER */}
        <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">AI Personal Mentor</h2>
            <p className="text-secondary small">Access context-aware preparation strategies, study schedule recommendations, and revision blueprints</p>
          </div>
          <span className="badge bg-secondary-subtle text-secondary small border">Rate Limited: 5 msg/min</span>
        </div>

        {/* AI Disclaimer Alert */}
        <div className="p-3 rounded mb-4 text-start small text-warning border bg-dark-subtle" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          ⚠️ <strong>Advisory Disclaimer Label</strong>: PrepPilot AI Mentor feedback is advisory. Check official notifications and standard references to verify syllabus facts.
        </div>

        {/* CHAT DISPLAY SCREEN */}
        <div className="row g-4 flex-grow-1">
          
          {/* Left Bubble Panel */}
          <div className="col-12 col-md-8 d-flex flex-column">
            <div className="custom-card glass-panel p-4 flex-grow-1 d-flex flex-column justify-content-between" style={{ minHeight: '400px' }}>
              
              {/* Message scroll list */}
              <div className="mb-4" style={{ height: '360px', overflowY: 'auto', paddingRight: '5px' }}>
                <div className="d-flex flex-column gap-3">
                  {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={idx} className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start animate-fade-in'}`}>
                        <div
                          className="p-3 rounded-lg text-start small"
                          style={{
                            maxWidth: '85%',
                            backgroundColor: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: isUser ? '#ffffff' : 'var(--text-primary)',
                            border: isUser ? 'none' : '1px solid var(--border-color)',
                            borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            lineHeight: '1.5'
                          }}
                        >
                          <span className="d-block mb-1 text-muted" style={{ fontSize: '0.65rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                            {isUser ? 'You' : 'PrepPilot Mentor'}
                          </span>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control-custom py-2.5 px-3 flex-grow-1"
                  placeholder="Ask a question (e.g. What should I study today?)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sending}
                  required
                />
                <button type="submit" className="btn-primary-custom py-2.5 px-4" disabled={sending}>
                  {sending ? '...' : 'Send'}
                </button>
              </form>

            </div>
          </div>

          {/* Right Suggested Prompts list */}
          <div className="col-12 col-md-4">
            <div className="custom-card glass-panel p-4 h-100">
              <h6 className="fw-semibold text-secondary mb-3">Suggested Mentoring Prompts</h6>
              
              <div className="d-flex flex-column gap-2.5">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="text-start p-2.5 rounded border small text-secondary bg-transparent hover-card"
                    style={{ borderColor: 'var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => handlePromptClick(prompt)}
                    disabled={sending}
                  >
                    💡 "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MentorRoom;
