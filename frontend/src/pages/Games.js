import React, { useMemo, useState } from 'react';
import { FiArrowLeft, FiVolume2, FiCheckCircle, FiPlay, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import './Games.css';

function Games() {
  // Состояние: какая игра сейчас открыта. null = главное меню игр.
  const [activeGame, setActiveGame] = useState(null);
  
  // Состояние для игры "Гимнастика"
  const [gymStep, setGymStep] = useState(0);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [puzzleMessage, setPuzzleMessage] = useState('Найди пару: предмет и действие.');
  const [saveStatus, setSaveStatus] = useState('');

  const saveProgress = async (gameId, score, completed = true) => {
    setSaveStatus('Сохраняем прогресс...');
    try {
      await api.saveGameProgress({ gameId, score, completed });
      setSaveStatus('Прогресс сохранён');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (error) {
      setSaveStatus(error.message || 'Не удалось сохранить прогресс');
    }
  };

  // ФУНКЦИЯ ОЗВУЧКИ (Использует встроенный в браузер синтезатор речи!)
  const playSound = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Останавливаем предыдущую озвучку
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8; // Замедляем речь для ребенка
      utterance.pitch = 1.3; // Делаем голос чуть выше (детским)
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Ваш браузер не поддерживает озвучку текста :(');
    }
  };

  // ДАННЫЕ ИГР
  const animals = [
    { id: 1, name: 'Корова', emoji: '🐄', sound: 'Муууу! Муууу!' },
    { id: 2, name: 'Кошка', emoji: '🐈', sound: 'Мяяяу! Мяяяу!' },
    { id: 3, name: 'Собака', emoji: '🐕', sound: 'Гав! Гав! Гав!' },
    { id: 4, name: 'Утка', emoji: '🦆', sound: 'Кря! Кря! Кря!' },
    { id: 5, name: 'Овечка', emoji: '🐑', sound: 'Бееее! Бееее!' },
    { id: 6, name: 'Лягушка', emoji: '🐸', sound: 'Ква! Ква!' },
  ];

  const gymnastics = [
    { title: 'Улыбка', desc: 'Растяни губы в широкой улыбке, покажи зубки. Держи 5 секунд!', emoji: '😬' },
    { title: 'Трубочка', desc: 'Вытяни губы вперед сильно-сильно, как будто дуешь в дудочку.', emoji: '😗' },
    { title: 'Часики', desc: 'Открой рот и тянись языком то к левому уголку губ, то к правому. Тик-так!', emoji: '😛' },
    { title: 'Вкусное варенье', desc: 'Широким языком оближи верхнюю губу сверху вниз.', emoji: '😋' }
  ];

  const puzzlePairs = [
    { id: 'soap', left: 'Мыло', right: 'Моем руки', icon: '🧼' },
    { id: 'brush', left: 'Щётка', right: 'Чистим зубы', icon: '🪥' },
    { id: 'water', left: 'Вода', right: 'Пьём после прогулки', icon: '💧' },
    { id: 'sleep', left: 'Подушка', right: 'Ложимся спать вовремя', icon: '🛏️' },
  ];

  const puzzleCards = useMemo(() => {
    const left = puzzlePairs.map((item) => ({ ...item, side: 'left', text: item.left }));
    const right = puzzlePairs.map((item) => ({ ...item, side: 'right', text: item.right }));
    return [...left, ...right].sort((a, b) => `${a.side}-${a.id}`.localeCompare(`${b.side}-${b.id}`));
  }, []);

  const resetPuzzle = () => {
    setSelectedPairs([]);
    setMatchedPairs([]);
    setPuzzleMessage('Найди пару: предмет и действие.');
  };

  const handlePuzzlePick = (card) => {
    if (matchedPairs.includes(card.id) || selectedPairs.some((item) => item.side === card.side)) return;

    const next = [...selectedPairs, card];
    setSelectedPairs(next);
    if (next.length < 2) return;

    if (next[0].id === next[1].id) {
      setMatchedPairs((prev) => [...prev, card.id]);
      setPuzzleMessage('Верно! Отличная связка.');
      playSound('Верно! Отличная связка.');
    } else {
      setPuzzleMessage('Почти. Попробуй другую пару.');
      playSound('Попробуй другую пару.');
    }

    setTimeout(() => {
      setSelectedPairs([]);
      if (next[0].id === next[1].id && matchedPairs.length + 1 === puzzlePairs.length) {
        setPuzzleMessage('Все пары собраны. Молодец!');
        playSound('Все пары собраны. Молодец!');
        saveProgress('puzzle', 100, true);
      }
    }, 800);
  };

  // КОМПОНЕНТЫ ИГР
  const AnimalsGame = () => (
    <div className="active-game-area">
      <button className="btn-back-game" onClick={() => setActiveGame(null)}>
        <FiArrowLeft /> Назад к играм
      </button>
      <h2 style={{ textAlign: 'center', fontSize: '24px' }}>Кто как говорит? 🎧</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Нажимай на карточки и повторяй звуки за диктором!</p>
      
      <div className="animals-grid">
        {animals.map(animal => (
          <div key={animal.id} className="animal-card" onClick={() => playSound(animal.sound)}>
            <div className="animal-emoji">{animal.emoji}</div>
            <h3 style={{ fontSize: '18px' }}>{animal.name}</h3>
            <button className="btn-sound"><FiVolume2 /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const GymnasticsGame = () => {
    const isLastStep = gymStep === gymnastics.length - 1;
    const current = gymnastics[gymStep];

    const handleNext = () => {
      if (isLastStep) {
        playSound('Молодец! Тренировка окончена!');
        saveProgress('gymnastics', 100, true);
        setActiveGame(null);
        setGymStep(0);
      } else {
        setGymStep(gymStep + 1);
        playSound(gymnastics[gymStep + 1].desc);
      }
    };

    return (
      <div className="active-game-area">
        <button className="btn-back-game" onClick={() => {setActiveGame(null); setGymStep(0);}}>
          <FiArrowLeft /> Назад к играм
        </button>
        
        <div className="gymnastics-step">
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#dd6b20' }}>Упражнение "{current.title}"</h2>
          <div className="gym-illustration">{current.emoji}</div>
          <p style={{ fontSize: '20px', maxWidth: '600px', lineHeight: '1.5', color: 'var(--text-dark)' }}>
            {current.desc}
          </p>
          
          <div className="gym-controls">
            <button 
              className="btn-sound" 
              style={{ width: '50px', height: '50px', fontSize: '24px' }}
              onClick={() => playSound(current.desc)}
            >
              <FiVolume2 />
            </button>
            
            <button className="btn-gym-next" onClick={handleNext}>
              {isLastStep ? <><FiCheckCircle /> Завершить (Получить XP)</> : <><FiPlay /> Следующее</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PuzzleGame = () => (
    <div className="active-game-area">
      <button className="btn-back-game" onClick={() => { setActiveGame(null); resetPuzzle(); }}>
        <FiArrowLeft /> Назад к играм
      </button>
      <div className="game-play-header">
        <div>
          <h2>Полезные пары</h2>
          <p>Соединяй привычку и предмет. Игра тренирует внимание и бытовые навыки.</p>
        </div>
        <button className="btn-outline" onClick={resetPuzzle}>
          <FiRefreshCw size={14} /> Сначала
        </button>
      </div>

      <div className="puzzle-status">
        <strong>{matchedPairs.length}/{puzzlePairs.length}</strong>
        <span>{puzzleMessage}</span>
      </div>

      <div className="puzzle-grid">
        {puzzleCards.map((card) => {
          const isMatched = matchedPairs.includes(card.id);
          const isSelected = selectedPairs.some((item) => item.side === card.side && item.id === card.id);
          return (
            <button
              key={`${card.side}-${card.id}`}
              className={`puzzle-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handlePuzzlePick(card)}
              disabled={isMatched}
            >
              <span className="puzzle-icon">{card.icon}</span>
              <span>{card.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ОСНОВНОЙ РЕНДЕР
  return (
    <div className="games-container">
      {/* Показываем заголовок только если мы в меню */}
      {!activeGame && (
        <div className="games-header">
          <h1>Игры и развитие (ЗРР / ЗПР)</h1>
          <p>Специализированные упражнения для стимуляции речи и нейроразвития</p>
          {saveStatus && <span className="game-save-status">{saveStatus}</span>}
        </div>
      )}

      {/* РОУТИНГ ВНУТРИ КОМПОНЕНТА */}
      {activeGame === 'animals' && <AnimalsGame />}
      {activeGame === 'gymnastics' && <GymnasticsGame />}
      {activeGame === 'puzzle' && <PuzzleGame />}
      
      {/* ГЛАВНОЕ МЕНЮ ИГР */}
      {!activeGame && (
        <div className="games-menu-grid">
          
          <div className="game-card-menu" onClick={() => setActiveGame('animals')}>
            <div className="game-icon-large">🐄</div>
            <h3>Звукоподражание</h3>
            <p>Нажимаем на животных и учимся произносить первые звуки.</p>
            <span className="game-badge">Для детей 2-4 лет (ЗРР)</span>
          </div>

          <div className="game-card-menu" onClick={() => { setActiveGame('gymnastics'); playSound(gymnastics[0].desc); }}>
            <div className="game-icon-large">😛</div>
            <h3>Артикуляционная гимнастика</h3>
            <p>Укрепляем мышцы языка и губ для правильного произношения звуков.</p>
            <span className="game-badge">Для детей 4-7 лет (Логопедия)</span>
          </div>

          <div className="game-card-menu" onClick={() => setActiveGame('puzzle')}>
            <div className="game-icon-large">🧩</div>
            <h3>Полезные пары</h3>
            <p>Соединяем предметы и действия: гигиена, сон, вода и ежедневные привычки.</p>
            <span className="game-badge">Внимание и режим дня</span>
          </div>

        </div>
      )}
    </div>
  );
}

export default Games;
