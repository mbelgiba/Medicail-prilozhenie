import React, { useState } from 'react';
import { FiArrowLeft, FiVolume2, FiCheckCircle, FiPlay } from 'react-icons/fi';
import './Games.css';

function Games() {
  // Состояние: какая игра сейчас открыта. null = главное меню игр.
  const [activeGame, setActiveGame] = useState(null);
  
  // Состояние для игры "Гимнастика"
  const [gymStep, setGymStep] = useState(0);

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

  // ОСНОВНОЙ РЕНДЕР
  return (
    <div className="games-container">
      {/* Показываем заголовок только если мы в меню */}
      {!activeGame && (
        <div className="games-header">
          <h1>Игры и развитие (ЗРР / ЗПР)</h1>
          <p>Специализированные упражнения для стимуляции речи и нейроразвития</p>
        </div>
      )}

      {/* РОУТИНГ ВНУТРИ КОМПОНЕНТА */}
      {activeGame === 'animals' && <AnimalsGame />}
      {activeGame === 'gymnastics' && <GymnasticsGame />}
      
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

          <div className="game-card-menu" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            <div className="game-icon-large">🧩</div>
            <h3>Нейро-пазлы (В разработке)</h3>
            <p>Тренировка межполушарного взаимодействия и логики.</p>
            <span className="game-badge" style={{ background: '#edf2f7', color: '#718096' }}>Скоро</span>
          </div>

        </div>
      )}
    </div>
  );
}

export default Games;