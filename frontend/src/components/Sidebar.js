import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiActivity, FiSmile, FiUser, FiCalendar, FiMapPin, FiLogOut, FiBriefcase, FiUnlock } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Sidebar.css';

function Sidebar() {
  const { currentUser, logout, childMode, toggleChildMode } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExitChildMode = () => {
    // В будущем можно добавить проверку PIN-кода
    if (window.confirm('Выйти из детского режима?')) {
      toggleChildMode(false);
      navigate('/');
    }
  };

  const parentLinks = [
    { to: '/',             icon: <FiHome />,     label: 'Главная' },
    { to: '/appointments', icon: <FiCalendar />, label: 'Запись к врачу' },
    { to: '/medical',      icon: <FiActivity />, label: 'Медицинская карта' },
    { to: '/map',          icon: <FiMapPin />,   label: 'Карта клиник (GPS)' },
    { to: '/games',        icon: <FiSmile />,    label: 'Развитие ребёнка' },
    { to: '/profile',      icon: <FiUser />,     label: 'Профиль' },
  ];
  
  const childLinks = [
    { to: '/games',        icon: <FiSmile />,    label: 'Игры и развитие' },
  ];

  const doctorLinks = [
    { to: '/',             icon: <FiHome />,      label: 'Главная' },
    { to: '/doctor',       icon: <FiBriefcase />, label: 'Кабинет врача' },
    { to: '/profile',      icon: <FiUser />,      label: 'Профиль' },
  ];
  
  let navLinks = parentLinks;
  if (currentUser?.role === 'doctor') {
    navLinks = doctorLinks;
  } else if (childMode) {
    navLinks = childLinks;
  }

  const userInitial = currentUser?.username?.charAt(0)?.toUpperCase() || 'А';
  const userName = childMode ? 'Ребёнок' : (currentUser?.username || 'Пользователь');
  const userRole = childMode ? 'Детский режим' : (currentUser?.role === 'parent' ? 'Родитель' :
                   currentUser?.role === 'doctor' ? 'Врач' : 'Пациент');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">✚</div>
        <span>DamuKids</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{childMode ? 'Меню ребёнка' : 'Навигация'}</div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-item-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!childMode && <LanguageSwitcher />}

        {currentUser && (
          <div className="sidebar-user-mini">
            <div className="sidebar-avatar">{userInitial}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{userRole}</div>
            </div>
          </div>
        )}

        {childMode ? (
          <button className="sidebar-logout-btn" onClick={handleExitChildMode} style={{ backgroundColor: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}>
            <FiUnlock size={14} />
            Выйти к родителям
          </button>
        ) : (
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FiLogOut size={14} />
            Выйти из аккаунта
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
