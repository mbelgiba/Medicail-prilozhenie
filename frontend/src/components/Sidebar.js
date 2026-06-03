import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiActivity, FiSmile, FiUser, FiCalendar, FiMapPin, FiLogOut, FiBriefcase, FiGift } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Sidebar.css';

function Sidebar() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parentLinks = [
    { to: '/',             icon: <FiHome />,     label: 'Главная' },
    { to: '/appointments', icon: <FiCalendar />, label: 'Запись к врачу' },
    { to: '/medical',      icon: <FiActivity />, label: 'Медицинская карта' },
    { to: '/map',          icon: <FiMapPin />,   label: 'Карта клиник (GPS)' },
    { to: '/games',        icon: <FiSmile />,    label: 'Игры и развитие' },
    { to: '/child-zone',    icon: <FiGift />,     label: 'Детский режим' },
    { to: '/profile',      icon: <FiUser />,     label: 'Профиль' },
  ];
  const doctorLinks = [
    { to: '/',             icon: <FiHome />,      label: 'Главная' },
    { to: '/doctor',       icon: <FiBriefcase />, label: 'Кабинет врача' },
    { to: '/profile',      icon: <FiUser />,      label: 'Профиль' },
  ];
  const navLinks = currentUser?.role === 'doctor' ? doctorLinks : parentLinks;

  const userInitial = currentUser?.username?.charAt(0)?.toUpperCase() || 'А';
  const userName = currentUser?.username || 'Пользователь';
  const userRole = currentUser?.role === 'parent' ? 'Родитель' :
                   currentUser?.role === 'doctor' ? 'Врач' : 'Пациент';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">✚</div>
        <span>DamuKids</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Навигация</div>
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
        <LanguageSwitcher />

        {currentUser && (
          <div className="sidebar-user-mini">
            <div className="sidebar-avatar">{userInitial}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{userRole}</div>
            </div>
          </div>
        )}

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut size={14} />
          Выйти из аккаунта
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
