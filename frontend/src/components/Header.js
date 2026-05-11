import React, { useContext, useState } from 'react';
import { FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { currentUser } = useContext(AuthContext);
  const [searchVal, setSearchVal] = useState('');

  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || 'А';
  const name = currentUser?.username || 'Пользователь';
  const role = currentUser?.role === 'parent' ? 'Родитель' :
               currentUser?.role === 'doctor' ? 'Врач' : 'Пациент';

  return (
    <header className="header">
      <div className="header-search">
        <FiSearch size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Поиск врача, услуги или документа..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button className="notification-btn" title="Уведомления">
          <FiBell size={18} />
          <span className="notification-badge">3</span>
        </button>

        <div className="header-divider" />

        <div className="user-profile-mini">
          <div className="user-avatar-mini" style={{ position: 'relative' }}>
            {initial}
            <span className="online-dot" />
          </div>
          <div className="user-info-mini">
            <span className="user-name-mini">{name}</span>
            <span className="user-role-mini">{role}</span>
          </div>
          <FiChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}

export default Header;