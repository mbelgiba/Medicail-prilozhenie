import React, { useContext } from 'react';
import SectionCard from '../components/SectionCard';
import { FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Medical.css';

const HISTORY = [
  { id: 1, type: 'test', date: '10 Мая 2026', title: 'Общий анализ крови', desc: 'Уровень гемоглобина 110 г/л. Рекомендована коррекция диеты.', doctor: 'Лаборатория ИНВИВО' },
  { id: 2, type: 'visit', date: '05 Мая 2026', title: 'Осмотр педиатра', desc: 'Жалобы на легкий кашель. Диагноз: ОРВИ легкой степени. Назначено обильное питье.', doctor: 'Смирнов А.В.' },
  { id: 3, type: 'vaccine', date: '12 Апр 2026', title: 'Вакцинация', desc: 'Прививка КПК (корь, паротит, краснуха). Перенесена хорошо, без температуры.', doctor: 'Прививочный кабинет №3' },
  { id: 4, type: 'visit', date: '01 Фев 2026', title: 'Плановый осмотр невролога', desc: 'Развитие по возрасту. Рекомендованы развивающие игры для мелкой моторики.', doctor: 'Ким Д.И.' },
];

function Medical() {
  const { currentUser } = useContext(AuthContext);
  const name = currentUser?.username || 'Пользователь';

  return (
    <div className="medical-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Медицинская карта</h1>
          <p>История болезни и физические параметры: {name}</p>
        </div>
      </div>

      <div className="app-layout-grid">
        
        {/* Left: Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SectionCard title="История визитов и анализов">
            <div className="timeline-container">
              {HISTORY.map(item => (
                <div key={item.id} className="timeline-item animate-fadeInUp">
                  <div className={`timeline-dot ${item.type}`}></div>
                  <div className="timeline-date">{item.date}</div>
                  <div className="timeline-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <div className="t-doctor"><FiUser size={12}/> {item.doctor}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right: Parameters & Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <SectionCard title="Физические параметры">
            <div className="params-grid">
              <div className="param-card">
                <div className="param-icon">⚖️</div>
                <div className="param-val">22 кг</div>
                <div className="param-label">Вес</div>
              </div>
              <div className="param-card">
                <div className="param-icon">📏</div>
                <div className="param-val">115 см</div>
                <div className="param-label">Рост</div>
              </div>
              <div className="param-card">
                <div className="param-icon">🩸</div>
                <div className="param-val">II (A)</div>
                <div className="param-label">Группа крови</div>
              </div>
              <div className="param-card">
                <div className="param-icon">💓</div>
                <div className="param-val">85</div>
                <div className="param-label">Пульс (уд/мин)</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Аллергии и противопоказания">
            <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.2)', padding: '16px', borderRadius: 'var(--radius)', color: 'var(--accent-red)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>⚠️ Пищевая аллергия</div>
              <p style={{ fontSize: '13px' }}>Цитрусовые, мед, шоколад (умеренно).</p>
            </div>
            <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(27,110,243,0.2)', padding: '16px', borderRadius: 'var(--radius)', color: 'var(--primary)', marginTop: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>Медикаментозных аллергий нет</div>
              <p style={{ fontSize: '13px' }}>Пенициллин и антибиотики переносятся нормально.</p>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}

export default Medical;