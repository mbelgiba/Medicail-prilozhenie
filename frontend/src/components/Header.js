import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Header.css';

function Header() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || 'А';
  const name = currentUser?.username || 'Пользователь';
  const role = currentUser?.role === 'parent' ? 'Родитель' :
               currentUser?.role === 'doctor' ? 'Врач' : 'Пациент';

  useEffect(() => {
    api.getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const query = searchVal.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.search(query)
        .then((data) => setSuggestions(Array.isArray(data) ? data : []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchVal]);

  const handleSuggestion = (item) => {
    setSearchVal('');
    setSuggestions([]);
    navigate(item.to || '/');
  };

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
        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((item) => (
              <button key={`${item.type}-${item.title}-${item.subtitle}`} onMouseDown={() => handleSuggestion(item)}>
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="header-actions">
        <button className="notification-btn" title="Уведомления" onClick={() => setShowNotifications(!showNotifications)}>
          <FiBell size={18} />
          {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
        </button>
        {showNotifications && (
          <div className="notifications-panel">
            {notifications.length === 0 ? (
              <div className="notification-empty">Новых уведомлений нет</div>
            ) : notifications.slice(0, 6).map((item) => (
              <div className="notification-item" key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}

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
