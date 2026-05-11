import React from 'react';
import './StatCard.css';

function StatCard({ title, value, description, icon, iconBg, trend, trendType }) {
  return (
    <div className="stat-card-component animate-fadeInUp">
      {icon && (
        <div className="stat-card-icon" style={{ background: iconBg || 'var(--primary-light)' }}>
          {icon}
        </div>
      )}
      <span className="stat-card-title">{title}</span>
      <span className="stat-card-value">{value}</span>
      {description && <span className="stat-card-desc">{description}</span>}
      {trend && (
        <span className={`stat-card-trend trend-${trendType || 'ok'}`}>
          {trend}
        </span>
      )}
    </div>
  );
}

export default StatCard;