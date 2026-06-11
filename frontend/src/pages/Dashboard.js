import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiShield,
  FiSmile,
  FiUser,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const [summary, setSummary] = useState({
    appointments: [],
    children: [],
    medical: [],
    progress: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getAppointments(),
      api.getChildren(),
      api.getMedicalRecords(),
      api.getGameProgress(),
      api.getAiAnalysis().catch(() => null), // If AI fails, return null
    ])
      .then(([appointments, children, medical, progress, ai]) => {
        if (!mounted) return;
        setSummary({
          appointments: normalizeList(appointments),
          children: normalizeList(children),
          medical: normalizeList(medical),
          progress: normalizeList(progress),
          ai: ai,
          loading: false,
        });
      })
      .catch(() => {
        if (mounted) setSummary((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const appointments = useMemo(() => {
    return [...summary.appointments].sort((a, b) => {
      return new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`);
    });
  }, [summary.appointments]);

  const nextAppointment = appointments[0];
  const totalPoints = summary.progress.reduce((sum, item) => sum + (item.coins || 0), 0);
  const completedExercises = summary.progress.filter((item) => item.completed).length;
  const userName = currentUser?.username || 'Пользователь';

  const stats = [
    {
      label: 'Предстоящие приёмы',
      value: summary.loading ? '...' : appointments.length,
      icon: <FiCalendar />,
      tone: 'blue',
    },
    {
      label: 'Детей в профиле',
      value: summary.loading ? '...' : summary.children.length,
      icon: <FiUser />,
      tone: 'green',
    },
    {
      label: 'Записи медкарты',
      value: summary.loading ? '...' : summary.medical.length,
      icon: <FiFileText />,
      tone: 'orange',
    },
    {
      label: 'Упражнений выполнено',
      value: summary.loading ? '...' : completedExercises,
      icon: <FiSmile />,
      tone: 'purple',
    },
  ];

  const quickActions = [
    { to: '/appointments', icon: <FiCalendar />, title: 'Записаться к врачу', text: 'Педиатр, логопед, невролог или психолог' },
    { to: '/medical', icon: <FiHeart />, title: 'Открыть медкарту', text: 'История визитов, диагнозы и назначения' },
    { to: '/games', icon: <FiActivity />, title: 'Домашние упражнения', text: 'Речь, внимание, артикуляция и привычки' },
    { to: '/map', icon: <FiMapPin />, title: 'Найти клинику', text: 'Поликлиники, аптеки и центры развития' },
  ];

  const checklist = [
    'Проверьте, прикреплен ли ребёнок в профиле',
    'Добавьте последние назначения в медкарту',
    'Сохраните 1-2 упражнения после занятия со специалистом',
  ];

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">DamuKids MVP</span>
          <h1>Здравствуйте, {userName}</h1>
          <p>
            Ваша семейная медицинская панель: приёмы, медкарта и развивающие упражнения
            для ребёнка собраны в одном рабочем пространстве.
          </p>
        </div>
        <div className="next-visit-panel">
          <span className="panel-label">Ближайший приём</span>
          {nextAppointment ? (
            <>
              <strong>{nextAppointment.spec}</strong>
              <span>{nextAppointment.docName}</span>
              <div><FiClock /> {nextAppointment.date}, {nextAppointment.time}</div>
            </>
          ) : (
            <>
              <strong>Приём не запланирован</strong>
              <span>Выберите специалиста и удобное время</span>
              <Link to="/appointments">Записаться <FiArrowRight /></Link>
            </>
          )}
        </div>
      </section>

      <div className="dashboard-stats">
        {stats.map((item) => (
          <div className={`dashboard-stat ${item.tone}`} key={item.label}>
            <span>{item.icon}</span>
            <div>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <section className="work-card wide">
          <div className="work-card-header">
            <div>
              <h2>Быстрые действия</h2>
              <p>Основные сценарии для родителя и специалиста</p>
            </div>
          </div>
          <div className="quick-action-list">
            {quickActions.map((item) => (
              <Link className="quick-action-row" to={item.to} key={item.to}>
                <span className="quick-action-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
                <FiArrowRight className="quick-action-arrow" />
              </Link>
            ))}
          </div>
        </section>

        <section className="work-card">
          <div className="work-card-header">
            <div>
              <h2>Семья</h2>
              <p>Прикрепленные детские профили</p>
            </div>
            <Link to="/profile">Профиль</Link>
          </div>
          {summary.children.length === 0 ? (
            <div className="empty-state">Добавьте ребёнка по ИИН, чтобы вести медкарту и упражнения.</div>
          ) : (
            <div className="child-mini-list">
              {summary.children.slice(0, 3).map((child) => (
                <div className="child-mini" key={child.id}>
                  <span>{child.name?.charAt(0) || 'Р'}</span>
                  <div>
                    <strong>{child.name}</strong>
                    <p>{child.birthDate || 'Дата рождения не указана'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="work-card">
          <div className="work-card-header">
            <div>
              <h2>Развитие</h2>
              <p>Прогресс домашних занятий</p>
            </div>
            <Link to="/games">{totalPoints} баллов</Link>
          </div>
          <div className="progress-block">
            <div className="progress-ring">{completedExercises}</div>
            <div>
              <strong>завершённых сессий</strong>
              <p>Игры используются как поддержка занятий с логопедом, дефектологом или психологом.</p>
            </div>
          </div>
        </section>

        <section className="work-card">
          <div className="work-card-header">
            <div>
              <h2>Умный Анализ (AI)</h2>
              <p>Оценка динамики развития</p>
            </div>
            {summary.ai?.riskLevel === 'Low' && <span className="badge badge-success">Всё отлично</span>}
            {summary.ai?.riskLevel === 'Medium' && <span className="badge badge-warning">Требует внимания</span>}
            {summary.ai?.riskLevel === 'High' && <span className="badge badge-danger">Критично</span>}
          </div>
          <div className="checklist" style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px 0' }}>
            {summary.ai ? (
              <>
                <p><strong>Анализ:</strong> {summary.ai.analysis}</p>
                {summary.ai.recommendedGames?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Рекомендуемые упражнения:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                      {summary.ai.recommendedGames.map((game, i) => (
                        <li key={i}>{game}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Аналитика пока недоступна.</p>
            )}
          </div>
        </section>

        <section className="work-card">
          <div className="work-card-header">
            <div>
              <h2>Срочно</h2>
              <p>Контакты первой необходимости</p>
            </div>
          </div>
          <div className="contact-grid">
            <a href="tel:103"><FiPhone /> Скорая помощь <strong>103</strong></a>
            <a href="tel:112"><FiShield /> Единый номер <strong>112</strong></a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
