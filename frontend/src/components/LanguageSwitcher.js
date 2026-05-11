import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-switcher">
      <button 
        className={`lang-btn ${i18n.language === 'ru' ? 'active' : ''}`} 
        onClick={() => changeLanguage('ru')}
      >
        RU
      </button>
      <button 
        className={`lang-btn ${i18n.language === 'kk' ? 'active' : ''}`} 
        onClick={() => changeLanguage('kk')}
      >
        KZ
      </button>
    </div>
  );
}

export default LanguageSwitcher;