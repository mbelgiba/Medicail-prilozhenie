import React, { useState, useRef, useEffect, useContext } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCpu } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './AIAssistant.css';

function AIAssistant() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Здравствуйте! Я ваш медицинский AI-ассистент DamuKids. Задайте мне вопрос о симптомах, развитии ребёнка или работе платформы.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.chatAI(userMsg);
      setMessages(prev => [...prev, { text: response.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Извините, сейчас я не могу ответить. Попробуйте позже.', isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!currentUser) return null; // Only for logged in users

  return (
    <div className="ai-widget-container">
      {isOpen ? (
        <div className="ai-chat-window glass-panel slide-up">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <FiCpu size={18} /> DamuKids AI
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="ai-chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.isBot && <div className="ai-avatar"><FiCpu size={14}/></div>}
                <div className={`ai-msg ${msg.isBot ? 'bot-msg' : 'user-msg'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-msg-wrapper bot">
                <div className="ai-avatar"><FiCpu size={14}/></div>
                <div className="ai-msg bot-msg typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Спросите о симптомах..." 
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim()}>
              <FiSend />
            </button>
          </form>
        </div>
      ) : (
        <button className="ai-floating-btn bounce-in" onClick={() => setIsOpen(true)}>
          <FiMessageCircle size={28} />
          <span className="ai-tooltip">AI Консультант</span>
        </button>
      )}
    </div>
  );
}

export default AIAssistant;
