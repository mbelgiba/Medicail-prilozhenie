import React from 'react';
import './SectionCard.css';

function SectionCard({ title, actionElement, children, noPadding }) {
  return (
    <div className="section-card-component">
      {/* Показываем шапку, только если передан заголовок */}
      {title && (
        <div className="section-card-header">
          <h2 className="section-card-title">{title}</h2>
          {actionElement && <div className="section-card-action">{actionElement}</div>}
        </div>
      )}
      
      {/* noPadding позволяет убрать отступы, если мы хотим вставить таблицу или список на всю ширину */}
      <div className="section-card-body" style={noPadding ? { padding: 0 } : {}}>
        {children}
      </div>
    </div>
  );
}

export default SectionCard;