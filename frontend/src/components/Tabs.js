import React, { useState } from 'react';
import './Tabs.css';

// Компонент принимает массив вкладок: [{ id: 'tab1', label: 'Название', content: <JSX /> }]
function Tabs({ tabs, defaultTabId }) {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0].id);

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tabs-content">
        {/* Отображаем контент только активной вкладки */}
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

export default Tabs;