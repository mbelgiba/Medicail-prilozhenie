import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import { FiClock, FiCalendar, FiUser, FiActivity, FiMapPin, FiSmile, FiHeart, FiTrendingUp } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const userName = currentUser?.username || 'Пользователь';

  const activities = [
    { label: 'Шаги', value: '4 230', max: 8000, current: 4230, color: 'var(--gradient-primary)' },
    { label: 'Активность', value: '53%', max: 100, current: 53, color: 'var(--gradient-green)' },
    { label: 'Игровые сессии', value: '3/5', max: 5, current: 3, color: 'var(--gradient-purple)' },
  ];

  const quickActions = [
    { to: '/appointments', icon: '📅', label: 'Запись к врачу', bg: '#EBF2FF', color: 'var(--primary)' },
    { to: '/medical',      icon: '🩺', label: 'Медкарта',       bg: '#ECFDF5', color: 'var(--accent-green)' },
    { to: '/map',          icon: '🗺️', label: 'Карта клиник',   bg: '#FFF7ED', color: 'var(--accent-orange)' },
    { to: '/games',        icon: '🎮', label: 'Игры и развитие', bg: '#F5F3FF', color: 'var(--accent-purple)' },
  ];

  return (
    <div className="dashboard-container">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Добро пожаловать, {userName}! 👋</h1>
          <p>Ваша сводка здоровья на сегодня. У вас запланирован 1 приём.</p>
          <div className="welcome-stats-mini">
            <div className="w-stat">
              <span className="w-stat-val">2</span>
              <span className="w-stat-label">Приёма</span>
            </div>
            <div className="w-stat">
              <span className="w-stat-val">5</span>
              <span className="w-stat-label">Уровень</span>
            </div>
            <div className="w-stat">
              <span className="w-stat-val">85</span>
              <span className="w-stat-label">Пульс</span>
            </div>
          </div>
        </div>
        <div className="welcome-illustration">🏥</div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          title="Пульс"
          value="85 уд/мин"
          description="В пределах нормы"
          icon={<FiHeart color="var(--accent-red)" />}
          iconBg="var(--accent-red-bg)"
          trend="↑ Норма"
          trendType="ok"
        />
        <StatCard
          title="Физическая активность"
          value="4 230 шагов"
          description="Цель: 8 000 шагов"
          icon={<FiActivity color="var(--accent-green)" />}
          iconBg="var(--accent-green-bg)"
          trend="53% выполнено"
          trendType="ok"
        />
        <StatCard
          title="Прогресс в играх"
          value="Уровень 5"
          description="650 / 1 000 XP"
          icon={<FiSmile color="var(--accent-purple)" />}
          iconBg="var(--accent-purple-bg)"
          trend="+120 XP сегодня"
          trendType="up"
        />
        <StatCard
          title="Следующий приём"
          value="Завтра"
          description="14:30 — Педиатр"
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
          <div className="dashboard-appointment-item">
            <div className="apt-info">
              <h4>Педиатр (Осмотр)</h4>
              <p><FiUser size={11} /> Доктор Смирнов А.В. • Каб. 302</p>
            </div>
            <div className="apt-time">
              <FiClock size={11} /> Завтра, 14:30
            </div>
          </div>
          <div className="dashboard-appointment-item">
            <div className="apt-info">
              <h4>Логопед-Дефектолог</h4>
              <p><FiUser size={11} /> Доктор Иванова Е.С. • Каб. 105</p>
            </div>
            <div className="apt-time">
              <FiCalendar size={11} /> 15 Мая, 10:00
            </div>
          </div>
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
    </div>
  );
}

export default Dashboard;