import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiFileText, FiCalendar, FiMapPin, FiArrowLeft, FiCpu } from 'react-icons/fi';
import './AiBot.css';

// Smart reply generator
function getBotReply(text) {
  const t = text.toLowerCase();
  if (t.includes('анализ') || t.includes('кров'))
    return 'Я проанализировал «Общий_анализ_крови_Май.pdf». Гемоглобин 110 г/л — приближается к нижней границе нормы (110 г/л). Рекомендую проконсультироваться с педиатром о возможной лёгкой анемии и скорректировать питание.';
  if (t.includes('приём') || t.includes('прием') || t.includes('запись') || t.includes('врач'))
    return 'У вас запланировано 2 приёма:\n• Завтра в 14:30 — Педиатр Смирнов А.В. (Кабинет 302)\n• 15 Мая, 10:00 — Логопед-Дефектолог Иванова Е.С. (Кабинет 105)';
  if (t.includes('поликлин') || t.includes('клиник') || t.includes('карта') || t.includes('рядом'))
    return 'Ближайшие учреждения рядом с вами:\n🏥 Детская поликлиника №1 — ул. Абая, 45 (★4.5)\n🏥 Центр «Кенгуру» (ЗРР/ЗПР) — пр. Республики, 55 (★4.9)\n💊 Аптека «Биосфера» — ул. Сейфуллина, 102\n\nМаршруты доступны в разделе «Карта клиник».';
  if (t.includes('игр') || t.includes('упражн'))
    return 'Рекомендую начать с «Артикуляционной гимнастики» — она отлично подходит детям 4–7 лет. Для детей 2–4 лет попробуйте «Звукоподражание». Каждое выполненное упражнение приносит XP!';
  if (t.includes('иин'))
    return 'ИИН (Индивидуальный идентификационный номер) — это 12-значный уникальный номер гражданина РК. Первые 6 цифр — дата рождения (YYMMDD), 7-я цифра — код века и пола, 12-я — контрольный разряд.';
  if (t.includes('привет') || t.includes('здравств') || t.includes('salut') || t.includes('сәлем'))
    return 'Сәлем! 👋 Я ИИ-ассистент DamuKids. Готов помочь с вопросами о здоровье, записями к врачам или ближайшими клиниками. Чем могу помочь?';
  return 'Я анализирую ваш запрос. Для точной медицинской консультации обратитесь к лечащему врачу. Могу помочь с расписанием приёмов, картой клиник или разделом игр для развития.';
}

const quickActions = [
  { icon: <FiFileText size={18} />, label: 'Мои анализы',          text: 'Проанализируй мои последние анализы' },
  { icon: <FiCalendar size={18} />, label: 'Предстоящие приёмы',   text: 'Напомни о моих предстоящих приёмах' },
  { icon: <FiMapPin size={18} />,   label: 'Поликлиники рядом',    text: 'Где ближайшие поликлиники?' },
  { icon: <FiMessageSquare size={18} />, label: 'Написать в чат',  text: null },
];

function AiBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [view, setView]           = useState('menu'); // 'menu' | 'chat'
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const messagesEndRef            = useRef(null);

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Сәлем! 👋 Я ИИ-ассистент DamuKids. Выберите действие или задайте вопрос.' }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setView('chat');
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'bot', text: getBotReply(text) }]);
    }, 1200);
  };

  const handleQuickAction = (action) => {
    if (action.text === null) { setView('chat'); return; }
    sendMessage(action.text);
  };

  const closeBot = () => {
    setIsOpen(false);
    setTimeout(() => setView('menu'), 300);
  };

  return (
    <div className="ai-bot-container">
      {/* Chat window */}
      {isOpen && (
        <div className="ai-window animate-scaleIn">

          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              {view === 'chat' ? (
                <button className="ai-back-btn" onClick={() => setView('menu')} title="Вернуться в меню">
                  <FiArrowLeft size={18} />
                </button>
              ) : (
                <div className="ai-avatar">
                  <FiCpu size={18} />
                </div>
              )}
              <div>
                <div className="ai-title">AI Ассистент</div>
                <div className="ai-subtitle">
                  {isTyping ? (
                    <span className="typing-indicator">
                      <span /><span /><span />
                    </span>
                  ) : 'Всегда на связи'}
                </div>
              </div>
            </div>
            <button className="ai-close-btn" onClick={closeBot}>
              <FiX size={18} />
            </button>
          </div>

          {/* Quick menu */}
          {view === 'menu' && (
            <div className="ai-quick-menu">
              <div className="ai-menu-welcome">
                Чем могу помочь? 🤖
              </div>
              <div className="ai-menu-grid">
                {quickActions.map((a) => (
                  <button key={a.label} className="ai-menu-btn" onClick={() => handleQuickAction(a)}>
                    <span className="ai-menu-icon">{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat view */}
          {view === 'chat' && (
            <div className="ai-chat-area">
              <div className="ai-chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-message ${msg.sender}`}>
                    {msg.sender === 'bot' && (
                      <div className="ai-msg-avatar"><FiCpu size={12} /></div>
                    )}
                    <div className="ai-msg-bubble">
                      {msg.text.split('\n').map((line, j) => (
                        <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="ai-message bot">
                    <div className="ai-msg-avatar"><FiCpu size={12} /></div>
                    <div className="ai-msg-bubble">
                      <span className="typing-indicator"><span /><span /><span /></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="ai-input-area">
                <input
                  type="text"
                  placeholder="Задайте вопрос ИИ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                  autoFocus
                />
                <button
                  className="ai-send-btn"
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`ai-bot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="ИИ-ассистент"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
        {!isOpen && <span className="ai-btn-badge">ИИ</span>}
      </button>
    </div>
  );
}

export default AiBot;