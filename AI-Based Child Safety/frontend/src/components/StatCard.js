import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-content">
        <div className="stat-text">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          {trend && (
            <p className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="stat-icon">
          {Icon && <Icon size={32} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
