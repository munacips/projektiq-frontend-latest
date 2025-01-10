import React from 'react';

const DashboardCard = ({ icon, title, mainStat, stats, linkUrl, linkText }) => {
  return (
    <div className="dashboard-card">
      <div className="icon-container">
        <span className="icon">{icon}</span>
      </div>
      <h2 className="card-title">{title}</h2>
      {mainStat && <div className="main-stat">{mainStat}</div>}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            {stat.dot && (
              <span 
                className="status-dot" 
                style={{ backgroundColor: stat.dotColor }}
              />
            )}
            <span>{stat.label}: {stat.value}</span>
          </div>
        ))}
      </div>
      <a href={linkUrl} className="card-link">{linkText}</a>
    </div>
  );
};

export default DashboardCard;
