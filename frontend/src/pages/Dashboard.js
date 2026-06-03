import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import { FiClock, FiCalendar, FiUser, FiActivity, FiMapPin, FiSmile, FiHeart, FiTrendingUp, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const userName = currentUser?.username || 'Пользователь';
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
    ])
      .then(([appointments, children, medical, progress]) => {
        if (!mounted) return;
        setSummary({
          appointments: Array.isArray(appointments) ? appointments : [],
          children: Array.isArray(children) ? children : [],
          medical: Array.isArray(medical) ? medical : [],
          progress: Array.isArray(progress) ? progress : [],
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

  const sortedAppointments = useMemo(() => {
    return [...summary.appointments].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  }, [summary.appointments]);

  const nextAppointment = sortedAppointments[0];
  const totalScore = summary.progress.reduce((sum, item) => sum + (item.score || 0), 0);

  const activities = [
    { label: 'Дети в профиле', value: String(summary.children.length), max: 5, current: Math.min(summary.children.length, 5), color: 'var(--gradient-primary)' },
    { label: 'Записи медкарты', value: String(summary.medical.length), max: 10, current: Math.min(summary.medical.length, 10), color: 'var(--gradient-green)' },
    { label: 'Игровые сессии', value: String(summary.progress.length), max: 10, current: Math.min(summary.progress.length, 10), color: 'var(--gradient-purple)' },
  ];

  const quickActions = [
    { to: '/appointments', icon: '📅', label: 'Запись к врачу', bg: '#EBF2FF', color: 'var(--primary)' },
    { to: '/medical',      icon: '🩺', label: 'Медкарта',       bg: '#ECFDF5', color: 'var(--accent-green)' },
    { to: '/map',          icon: '🗺️', label: 'Карта клиник',   bg: '#FFF7ED', color: 'var(--accent-orange)' },
    { to: '/games',        icon: '🎮', label: 'Игры и развитие', bg: '#F5F3FF', color: 'var(--accent-purple)' },
  ];

  const parentChecklist = [
    'Дать витамин D после завтрака',
    'Проверить температуру вечером',
    'Подготовить анализ крови к приему',
  ];

  const emergencyContacts = [
    { label: 'Скорая помощь', value: '103' },
    { label: 'Единый номер', value: '112' },
    { label: 'Регистратура', value: '+7 727 123 45 67' },
  ];

  return (
    <div className="dashboard-container">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Добро пожаловать, {userName}! 👋</h1>
          <p>Сводка здоровья семьи на сегодня. Важные дела, записи и напоминания собраны в одном месте.</p>
          <div className="welcome-stats-mini">
            <div className="w-stat">
              <span className="w-stat-val">{summary.appointments.length}</span>
              <span className="w-stat-label">Приёма</span>
            </div>
            <div className="w-stat">
              <span className="w-stat-val">{summary.children.length}</span>
              <span className="w-stat-label">Детей</span>
            </div>
            <div className="w-stat">
              <span className="w-stat-val">{summary.medical.length}</span>
              <span className="w-stat-label">Медзаписей</span>
            </div>
          </div>
        </div>
        <div className="welcome-illustration">🏥</div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          title="Пульс"
          value={summary.loading ? '...' : `${summary.medical.length} записей`}
          description="Данные из медкарты"
          icon={<FiHeart color="var(--accent-red)" />}
          iconBg="var(--accent-red-bg)"
          trend="↑ Норма"
          trendType="ok"
        />
        <StatCard
          title="Физическая активность"
          value={`${summary.children.length} профилей`}
          description="Прикреплённые дети"
          icon={<FiActivity color="var(--accent-green)" />}
          iconBg="var(--accent-green-bg)"
          trend="53% выполнено"
          trendType="ok"
        />
        <StatCard
          title="Прогресс в играх"
          value={`${totalScore} XP`}
          description={`${summary.progress.length} сохранённых сессий`}
          icon={<FiSmile color="var(--accent-purple)" />}
          iconBg="var(--accent-purple-bg)"
          trend="+120 XP сегодня"
          trendType="up"
        />
        <StatCard
          title="Следующий приём"
          value={nextAppointment ? nextAppointment.date : 'Нет'}
          description={nextAppointment ? `${nextAppointment.time} — ${nextAppointment.spec}` : 'Запишитесь к врачу'}
          icon={<FiCalendar color="var(--primary)" />}
          iconBg="var(--primary-light)"
          trend="1 запись"
          trendType="ok"
        />
      </div>

      {/* ── Quick Actions ── */}
      <SectionCard title="Быстрые действия">
        <div className="quick-actions-grid">
          {quickActions.map((qa) => (
            <Link key={qa.to} to={qa.to} className="quick-action-btn">
              <div className="qa-icon" style={{ background: qa.bg, fontSize: '24px' }}>
                {qa.icon}
              </div>
              <span className="qa-label">{qa.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* ── Bottom Grid ── */}
      <div className="dashboard-grid-2">

        {/* Upcoming Appointments */}
        <SectionCard title="Предстоящие приёмы" noPadding>
          {sortedAppointments.length === 0 ? (
            <div className="dashboard-appointment-item">
              <div className="apt-info">
                <h4>Нет предстоящих приёмов</h4>
                <p><FiCalendar size={11} /> Создайте запись в разделе записи к врачу</p>
              </div>
            </div>
          ) : sortedAppointments.slice(0, 3).map((appointment) => (
            <div className="dashboard-appointment-item" key={appointment.id}>
              <div className="apt-info">
                <h4>{appointment.spec}</h4>
                <p><FiUser size={11} /> {appointment.docName} • {appointment.reason}</p>
              </div>
              <div className="apt-time">
                <FiClock size={11} /> {appointment.date}, {appointment.time}
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Daily Activity */}
        <SectionCard title="Ежедневная активность">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activities.map((a) => (
              <div key={a.label} className="activity-bar-wrap">
                <div className="activity-bar-label">
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{a.label}</span>
                  <span>{a.value}</span>
                </div>
                <div className="activity-bar-track">
                  <div
                    className="activity-bar-fill"
                    style={{
                      width: `${(a.current / a.max) * 100}%`,
                      background: a.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      <div className="dashboard-grid-2">
        <SectionCard title="Родительский чеклист">
          <div className="parent-checklist">
            {parentChecklist.map((item) => (
              <div key={item} className="parent-check-item">
                <FiCheckCircle />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Важные контакты">
          <div className="emergency-grid">
            {emergencyContacts.map((contact) => (
              <a key={contact.label} className="emergency-contact" href={`tel:${contact.value.replace(/\s/g, '')}`}>
                <FiPhone />
                <span>{contact.label}</span>
                <strong>{contact.value}</strong>
              </a>
            ))}
          </div>
          <div className="privacy-note">
            <FiShield />
            <span>Медицинские данные показываются только после входа в аккаунт.</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default Dashboard;
