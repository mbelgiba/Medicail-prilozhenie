import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiRefreshCw,
  FiStar,
  FiVolume2,
} from 'react-icons/fi';
import api from '../utils/api';
import './Games.css';

const syllables = [
  { id: 'ma', text: 'ма', prompt: 'Повтори слог: ма' },
  { id: 'pa', text: 'па', prompt: 'Повтори слог: па' },
  { id: 'ta', text: 'та', prompt: 'Повтори слог: та' },
  { id: 'ka', text: 'ка', prompt: 'Повтори слог: ка' },
  { id: 'sha', text: 'ша', prompt: 'Повтори слог: ша' },
  { id: 'ra', text: 'ра', prompt: 'Повтори слог: ра' },
];

const articulation = [
  { title: 'Улыбка', desc: 'Растяни губы в улыбке и удерживай пять секунд.', cue: 'Губы в улыбке, зубы видны.' },
  { title: 'Трубочка', desc: 'Вытяни губы вперёд, как будто дуешь в трубочку.', cue: 'Губы собраны, дыхание спокойное.' },
  { title: 'Часики', desc: 'Открой рот и двигай языком к левому и правому уголку губ.', cue: 'Тик так, медленно и ровно.' },
  { title: 'Варенье', desc: 'Широким языком проведи по верхней губе сверху вниз.', cue: 'Движение мягкое, без спешки.' },
];

const pairs = [
  { id: 'wash', left: 'Мыло', right: 'Моем руки' },
  { id: 'teeth', left: 'Щётка', right: 'Чистим зубы' },
  { id: 'sleep', left: 'Подушка', right: 'Ложимся спать' },
  { id: 'water', left: 'Вода', right: 'Пьём после прогулки' },
];

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.82;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function Games() {
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState([]);
  const [syllableDone, setSyllableDone] = useState([]);
  const [artStep, setArtStep] = useState(0);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);

  const pairCards = useMemo(() => {
    const left = pairs.map((item) => ({ id: item.id, side: 'left', text: item.left }));
    const right = pairs.map((item) => ({ id: item.id, side: 'right', text: item.right }));
    return [...left, ...right];
  }, []);
  const totalPoints = progress.reduce((sum, item) => sum + (item.coins || 0), 0);

  const refresh = () => {
    api.getGameProgress()
      .then((progressData) => {
        setProgress(Array.isArray(progressData) ? progressData : []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveProgress = async (gameId, score) => {
    setStatus('Сохраняем результат...');
    try {
      await api.saveGameProgress({ gameId, score, completed: true });
      setStatus('Результат сохранён');
      refresh();
      setTimeout(() => setStatus(''), 2600);
    } catch (error) {
      setStatus(error.message || 'Не удалось сохранить результат');
    }
  };

  const resetPairs = () => {
    setSelectedPairs([]);
    setMatchedPairs([]);
  };

  const choosePair = (card) => {
    if (matchedPairs.includes(card.id) || selectedPairs.some((item) => item.side === card.side)) return;
    const next = [...selectedPairs, card];
    setSelectedPairs(next);
    if (next.length < 2) return;

    if (next[0].id === next[1].id) {
      setMatchedPairs((prev) => [...prev, card.id]);
      speak('Верно');
      if (matchedPairs.length + 1 === pairs.length) {
        saveProgress('puzzle', 100);
      }
    } else {
      speak('Попробуй другую пару');
    }

    setTimeout(() => setSelectedPairs([]), 700);
  };

  const finishSyllables = () => {
    if (syllableDone.length === syllables.length) {
      saveProgress('syllables', 100);
      setActive(null);
      setSyllableDone([]);
    }
  };

  const startCard = (id) => {
    setActive(id);
    setStatus('');
    if (id === 'articulation') speak(articulation[0].desc);
  };

  if (active === 'syllables') {
    return (
      <div className="games-page">
        <button className="back-link" onClick={() => setActive(null)}><FiArrowLeft /> К упражнениям</button>
        <section className="exercise-board">
          <div className="exercise-heading">
            <div>
              <h1>Слоги и повторение</h1>
              <p>Ребёнок слушает слог, повторяет вслух, взрослый отмечает выполненное.</p>
            </div>
            <strong>{syllableDone.length}/{syllables.length}</strong>
          </div>
          <div className="syllable-grid">
            {syllables.map((item) => {
              const done = syllableDone.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`syllable-card ${done ? 'done' : ''}`}
                >
                  <button type="button" className="listen-syllable" onClick={() => speak(item.prompt)}>
                    <span>{item.text}</span>
                    <FiVolume2 />
                  </button>
                  <small>{done ? 'Выполнено' : 'Прослушать'}</small>
                  <button
                    type="button"
                    className="mark-done"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSyllableDone((prev) => done ? prev.filter((id) => id !== item.id) : [...prev, item.id]);
                    }}
                  >
                    <FiCheckCircle />
                  </button>
                </div>
              );
            })}
          </div>
          <button className="btn-primary" onClick={finishSyllables} disabled={syllableDone.length !== syllables.length}>
            Завершить упражнение
          </button>
        </section>
      </div>
    );
  }

  if (active === 'articulation') {
    const current = articulation[artStep];
    const isLast = artStep === articulation.length - 1;

    return (
      <div className="games-page">
        <button className="back-link" onClick={() => { setActive(null); setArtStep(0); }}><FiArrowLeft /> К упражнениям</button>
        <section className="exercise-board articulation-board">
          <div className="exercise-heading">
            <div>
              <h1>{current.title}</h1>
              <p>{current.desc}</p>
            </div>
            <strong>{artStep + 1}/{articulation.length}</strong>
          </div>
          <div className="cue-card">
            <span>Подсказка взрослому</span>
            <p>{current.cue}</p>
          </div>
          <div className="exercise-controls">
            <button className="btn-outline" onClick={() => speak(current.desc)}><FiVolume2 /> Повторить</button>
            <button
              className="btn-primary"
              onClick={() => {
                if (isLast) {
                  saveProgress('gymnastics', 100);
                  setActive(null);
                  setArtStep(0);
                } else {
                  setArtStep((step) => step + 1);
                  speak(articulation[artStep + 1].desc);
                }
              }}
            >
              {isLast ? 'Завершить' : 'Следующее'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (active === 'pairs') {
    return (
      <div className="games-page">
        <button className="back-link" onClick={() => { setActive(null); resetPairs(); }}><FiArrowLeft /> К упражнениям</button>
        <section className="exercise-board">
          <div className="exercise-heading">
            <div>
              <h1>Полезные пары</h1>
              <p>Соедините предмет и действие. Упражнение тренирует внимание и бытовые навыки.</p>
            </div>
            <button className="btn-outline" onClick={resetPairs}><FiRefreshCw /> Сначала</button>
          </div>
          <div className="pair-status">{matchedPairs.length}/{pairs.length} пар собрано</div>
          <div className="pair-grid">
            {pairCards.map((card) => {
              const matched = matchedPairs.includes(card.id);
              const selected = selectedPairs.some((item) => item.id === card.id && item.side === card.side);
              return (
                <button
                  key={`${card.side}-${card.id}`}
                  className={`pair-card ${matched ? 'matched' : ''} ${selected ? 'selected' : ''}`}
                  disabled={matched}
                  onClick={() => choosePair(card)}
                >
                  {card.text}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (active === 'emotions') {
    const emotions = [
      { emoji: '😄', answer: 'Радость' },
      { emoji: '😢', answer: 'Грусть' },
      { emoji: '😠', answer: 'Злость' },
      { emoji: '😲', answer: 'Удивление' },
    ];
    const options = ['Радость', 'Грусть', 'Злость', 'Удивление', 'Страх', 'Спокойствие'];
    const currentEmotion = emotions[artStep % emotions.length];

    const checkEmotion = (ans) => {
      if (ans === currentEmotion.answer) {
        speak('Правильно!');
        if (artStep + 1 === emotions.length) {
          saveProgress('emotions', 100);
          setActive(null);
          setArtStep(0);
        } else {
          setArtStep(step => step + 1);
        }
      } else {
        speak('Подумай еще раз. Посмотри на лицо.');
      }
    };

    return (
      <div className="games-page">
        <button className="back-link" onClick={() => { setActive(null); setArtStep(0); }}><FiArrowLeft /> К упражнениям</button>
        <section className="exercise-board">
          <div className="exercise-heading">
            <div>
              <h1>Угадай эмоцию</h1>
              <p>Посмотри на лицо и выбери правильную эмоцию.</p>
            </div>
            <strong>{artStep}/{emotions.length}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}>
            <div style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))', animation: 'bounceIn 0.5s' }}>
              {currentEmotion.emoji}
            </div>
            <div className="pair-grid" style={{ width: '100%', maxWidth: '400px' }}>
              {options.sort(() => Math.random() - 0.5).slice(0, 4).map((opt, idx) => (
                // Force include the correct answer if it's missing (simple hack: just map over emotions directly for MVP if needed, but let's just render standard options)
                <button key={idx} className="pair-card" onClick={() => checkEmotion(opt)}>
                  {opt}
                </button>
              ))}
              {/* Ensure correct answer is always present */}
              <button className="pair-card" onClick={() => checkEmotion(currentEmotion.answer)}>{currentEmotion.answer}</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="games-page">
      <section className="development-header">
        <div>
          <span className="eyebrow">Развитие ребёнка</span>
          <h1>Домашние упражнения после консультации</h1>
          <p>
            Короткие задания для речи, внимания и бытовых навыков. Они помогают закреплять работу
            специалиста, но не заменяют диагностику и очные занятия.
          </p>
        </div>
        <div className="wallet-card">
          <span><FiStar /> Прогресс</span>
          <strong>{totalPoints} баллов</strong>
          <p>{progress.length} сохранённых сессий</p>
        </div>
      </section>

      {status && <div className="game-status">{status}</div>}

      <div className="exercise-grid">
        <button className="exercise-card" onClick={() => startCard('syllables')}>
          <span className="exercise-icon"><FiVolume2 /></span>
          <strong>Слоги и повторение</strong>
          <p>Прослушивание слога, повторение и отметка взрослым.</p>
          <small>ЗРР · речь · 5 минут</small>
        </button>
        <button className="exercise-card" onClick={() => startCard('articulation')}>
          <span className="exercise-icon"><FiCheckCircle /></span>
          <strong>Артикуляционная гимнастика</strong>
          <p>Последовательность упражнений для губ и языка.</p>
          <small>Логопедия · 7 минут</small>
        </button>
        <button className="exercise-card" onClick={() => startCard('pairs')}>
          <span className="exercise-icon"><FiRefreshCw /></span>
          <strong>Полезные пары</strong>
          <p>Связь предметов с действиями и режимными привычками.</p>
          <small>ЗПР · внимание · 6 минут</small>
        </button>
        <button className="exercise-card" style={{ border: '1px solid var(--accent-purple)' }} onClick={() => startCard('emotions')}>
          <span className="exercise-icon" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' }}>😄</span>
          <strong>Угадай эмоцию</strong>
          <p>Развитие эмоционального интеллекта и эмпатии у ребёнка.</p>
          <small>РАС · психология · 4 минуты</small>
        </button>
      </div>

      <section className="rewards-section">
        <div className="section-title-row">
          <div>
            <h2>Журнал занятий</h2>
            <p>Сохранённые сессии из backend. Эти данные можно показывать специалисту на приёме.</p>
          </div>
        </div>
        <div className="reward-grid">
          {progress.length === 0 && (
            <div className="reward-card">
              <strong>Пока нет сохранённых занятий</strong>
              <p>Завершите упражнение, чтобы оно появилось в журнале.</p>
            </div>
          )}
          {progress.slice(0, 6).map((item) => (
            <div className="reward-card" key={item.id}>
              <div className="reward-top"><FiCheckCircle /> <span>{item.score} баллов</span></div>
              <strong>{item.gameId}</strong>
              <p>{item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : 'Дата не указана'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Games;
