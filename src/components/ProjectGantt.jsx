import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function ProjectGantt({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');

        const response = await axios.get(`http://localhost:8000/project_history/${projectId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const formatted = response.data.map((item, index) => {
            const startDate = new Date(item.date_created);
            const endDate = item.date_ended ? new Date(item.date_ended) : new Date();

            return {
              id: `task-${index}`,
              name: item.status || `Step ${index + 1}`,
              startDate,
              endDate,
              progress: 100,
              dependency: index > 0 ? `task-${index - 1}` : "",
            };
          });
          setTasks(formatted);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching project history:", error);
        setError("Failed to load project timeline. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (loading) return <div>Loading project timeline...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (tasks.length === 0) return <div>No timeline data available for this project.</div>;

  const earliestDate = new Date(Math.min(...tasks.map(task => task.startDate.getTime())));
  const latestDate = new Date(Math.max(...tasks.map(task => task.endDate.getTime())));
  const totalDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="gantt-container" style={{ width: '100%', overflowX: 'auto' }}>
      <h3>Project Timeline</h3>

      <div className="gantt-chart" ref={containerRef} style={{ 
        fontFamily: 'Arial, sans-serif',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
          <div style={{ width: '200px', fontWeight: 'bold', paddingRight: '20px' }}>Task</div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatDate(earliestDate)}</span>
            <span>{formatDate(latestDate)}</span>
          </div>
        </div>

        {/* Date ruler */}
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ width: '200px' }}></div>
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            {[...Array(totalDays)].map((_, i) => {
              const date = new Date(earliestDate);
              date.setDate(date.getDate() + i);
              return (
                <div key={i} style={{
                  width: `${100 / totalDays}%`,
                  fontSize: '10px',
                  textAlign: 'center',
                  borderLeft: i !== 0 ? '1px solid #eee' : 'none',
                  padding: '2px 0'
                }}>
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task bars */}
        {tasks.map((task, index) => {
          const startDays = Math.floor((task.startDate - earliestDate) / (1000 * 60 * 60 * 24));
          const durationDays = Math.ceil((task.endDate - task.startDate) / (1000 * 60 * 60 * 24)) + 1;
          const startPercentage = (startDays / totalDays) * 100;
          const widthPercentage = (durationDays / totalDays) * 100;

          return (
            <div key={task.id} style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
              <div style={{
                width: '200px',
                paddingRight: '20px',
                fontWeight: index === 0 ? 'bold' : 'normal',
                position: 'sticky',
                left: 0,
                backgroundColor: '#fff',
                zIndex: 1
              }}>
                {task.name}
              </div>
              <div style={{ flex: 1, position: 'relative', height: '30px' }}>
                <div
                  title={`${formatDate(task.startDate)} → ${formatDate(task.endDate)}`}
                  style={{
                    position: 'absolute',
                    left: `${startPercentage}%`,
                    width: `${widthPercentage}%`,
                    height: '100%',
                    backgroundColor: '#1e88e5',
                    borderRadius: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {task.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="timeline-info" style={{ marginTop: '20px' }}>
        <div><strong>Timeline Start:</strong> {formatDate(earliestDate)}</div>
        <div><strong>Timeline End:</strong> {formatDate(latestDate)}</div>
        <div><strong>Total Duration:</strong> {totalDays} days</div>
      </div>
    </div>
  );
}
