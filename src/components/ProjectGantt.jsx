import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';


const categoryColors = {
  "Requirements": "#ff4136",
  "Design": "#2ecc40",
  "Development": "#0074d9",
  "Testing": "#ff851b",
  "Deployment": "#b10dc9",
  "Maintenance": "#39cccc",
  "Closed": "#7fdbff",
  "Cancelled": "#85144b",
  "Other": "#aaaaaa",
  "Implementation": "#f012be"
};


export default function ProjectGantt({ projectId, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uniqueCategories = useMemo(() => {
    return [...new Set(tasks.map(task => task.category))];
  }, [tasks]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setTasks([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');

        const response = await axios.get(`http://localhost:8000/project_history/${projectId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        });

        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            const formatted = response.data.map((item, index) => {
              const startDate = new Date(item.date_created);
              const endDate = item.date_ended ? new Date(item.date_ended) : new Date(Math.max(startDate.getTime(), new Date().getTime()));
              if (endDate < startDate) {
                endDate.setTime(startDate.getTime());
              }


              return {
                id: item.id || `task-${index}`,
                name: item.description || item.status || `Phase ${index + 1}`,
              };
            });
            console.log("Fetched and formatted tasks:", formatted);
            setTasks(formatted);
          } else {
            setTasks([]);
            console.log("No project history data received from API.");
          }
        } else {
          console.warn("Unexpected data format received from API:", response.data);
          setTasks([]);
          setError("Failed to load project timeline due to unexpected data format.");
        }
      } catch (error) {
        console.error("Error fetching project history:", error);
        if (error.response) {
          console.error("Error details:", error.response.data);
          setError(`Failed to load project timeline (Status: ${error.response.status}). Please try again later.`);
        } else if (error.request) {
          setError("Failed to load project timeline. No response from server.");
        } else {
          setError("Failed to load project timeline. An unexpected error occurred.");
        }
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    } else {
      setTasks([]);
      setLoading(false);
    }

  }, [projectId, refreshTrigger]);


  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };


  const getCalendarDates = () => {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "month") {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay();


      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = new Date(year, month, 0 - (firstDayOfWeek - 1 - i));
        dates.push({ date: day, isCurrentMonth: false });
      }


      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const day = new Date(year, month, i);
        dates.push({ date: day, isCurrentMonth: true });
      }


      const daysDisplayed = dates.length;
      const daysToAddFromNextMonth = (daysDisplayed % 7 === 0) ? 0 : 7 - (daysDisplayed % 7);

      for (let i = 1; i <= daysToAddFromNextMonth; i++) {
        const day = new Date(year, month + 1, i);
        dates.push({ date: day, isCurrentMonth: false });
      }


    } else {
      let currentDayIterator = new Date(currentDate);
      let dayOfWeek = currentDayIterator.getDay();
      let diffToSunday = currentDayIterator.getDate() - dayOfWeek;

      const startOfWeek = new Date(currentDayIterator.setDate(diffToSunday));

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        dates.push({ date: day, isCurrentMonth: day.getMonth() === month });
      }
    }
    return dates;
  };

  const calendarDates = getCalendarDates();

  const getCalendarWeeks = () => {
    const weeks = [];
    if (calendarDates.length === 0) return weeks;
    for (let i = 0; i < calendarDates.length; i += 7) {
      weeks.push(calendarDates.slice(i, i + 7));
    }
    return weeks;
  };

  const calendarWeeks = getCalendarWeeks();

  const getTasksForDate = (date) => {
    const targetDateStart = new Date(date);
    targetDateStart.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(date);
    targetDateEnd.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      taskStart.setHours(0, 0, 0, 0);
      const taskEnd = new Date(task.endDate);
      taskEnd.setHours(23, 59, 59, 999);


      return taskStart <= targetDateEnd && taskEnd >= targetDateStart;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = (datesInWeek) => {
    if (!datesInWeek || datesInWeek.length === 0) return '';
    const start = datesInWeek[0].date;
    const end = datesInWeek[datesInWeek.length - 1].date;

    const startString = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endString = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startString} - ${endString}`;
  };

  if (loading) {
    return <div style={{ ...styles.container, ...styles.loadingOverlay, position: 'relative', minHeight: '300px' }}>Loading Project Timeline...</div>;
  }


  return (
    <div style={styles.container}>
      {/* {loading && <div style={styles.loadingOverlay}>Loading...</div>} */} {/* Can be removed if top-level loading is preferred */}
      {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '0.25rem' }}>{error}</div>}

      <div style={styles.header}>
        <h2 style={styles.title}>
          {viewMode === "month" ? formatMonthYear(currentDate) : formatWeekRange(calendarDates)}
        </h2>

        <div style={styles.controls}>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'week' ? styles.activeViewButton : {})
              }}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'month' ? styles.activeViewButton : {})
              }}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={goToPrevious} style={styles.navButton}>
              &lt;
            </button>
            <button onClick={goToNext} style={styles.navButton}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div style={styles.legend}>
        {uniqueCategories.map((category, index) => (
          <div key={index} style={styles.legendItem}>
            <div
              style={{
                ...styles.legendColor,
                backgroundColor: categoryColors[category] || '#999999'
              }}
            ></div>
            <span>{category}</span>
          </div>
        ))}
      </div>

      <div style={styles.calendar}>
        <div style={styles.daysHeader}>
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        <div style={styles.calendarGrid}>
          {calendarWeeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} style={styles.week}>
              {week.map((day, dayIndex) => {
                const dateKey = day.date.toISOString().split('T')[0];
                const tasksForDate = getTasksForDate(day.date);
                const isCurrentDay = isToday(day.date);

                const dayStyle = {
                  ...styles.day,
                  ...(dayIndex < 6 ? styles.dayBorderRight : {}),
                  ...(isCurrentDay ? styles.today : {})
                };

                return (
                  <div key={dateKey} style={dayStyle}>
                    <div
                      style={{
                        ...styles.dayNumber,
                        ...(day.isCurrentMonth ? styles.dayInMonth : styles.dayOutOfMonth)
                      }}
                    >
                      {day.date.getDate()}
                    </div>
                    <div style={styles.taskIndicators}>
                      {tasksForDate.slice(0, viewMode === "month" ? 3 : 5).map((task) => {
                        const taskStart = new Date(task.startDate);
                        taskStart.setHours(0, 0, 0, 0);
                        const taskEnd = new Date(task.endDate);
                        taskEnd.setHours(0, 0, 0, 0);

                        const currentDayStart = new Date(day.date);
                        currentDayStart.setHours(0, 0, 0, 0);

                        const isTaskStart = taskStart.getTime() === currentDayStart.getTime();
                        const isTaskEnd = taskEnd.getTime() === currentDayStart.getTime();


                        let taskBarStyle = {
                          ...styles.taskBar,
                          backgroundColor: categoryColors[task.category] || '#999999'
                        };

                        if (isTaskStart && isTaskEnd) {
                          taskBarStyle = { ...taskBarStyle, ...styles.taskBarRounded };
                        } else if (isTaskStart) {
                          taskBarStyle = { ...taskBarStyle, ...styles.taskBarRoundedLeft };
                        } else if (isTaskEnd) {
                          taskBarStyle = { ...taskBarStyle, ...styles.taskBarRoundedRight };
                        }


                        return (
                          <div
                            key={`${dateKey}-task-${task.id}`}
                            style={taskBarStyle}
                            title={`${task.name}: ${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()}`}
                          ></div>
                        );
                      })}
                      {tasksForDate.length > (viewMode === "month" ? 3 : 5) && (
                        <div style={styles.moreIndicator}>+{tasksForDate.length - (viewMode === "month" ? 3 : 5)} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  viewToggle: {
    display: 'flex',

    background: '#e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.25rem',
    border: '1px solid #d1d5db'
  },
  viewButton: {
    padding: '0.35rem 0.85rem',
    borderRadius: '0.35rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500',
    transition: 'background-color 0.2s, color 0.2s'
  },
  activeViewButton: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    color: '#1f2937',
    fontWeight: '600',
  },
  navButton: {
    padding: '0.35rem 0.6rem',
    borderRadius: '0.35rem',
    border: '1px solid #d1d5db',
    background: 'white',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '0.5rem 0'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  legendColor: {
    width: '0.875rem',
    height: '0.875rem',
    borderRadius: '0.125rem'
  },
  calendar: {
    background: '#1f2937',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
  },
  daysHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    background: '#f9fafb'
  },
  calendarGrid: {
    display: 'flex',
    flexDirection: 'column'
  },
  week: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #e5e7eb',
    '&:last-child': {
      borderBottom: 'none',
    }
  },
  day: {
    minHeight: '6rem',
    padding: '0.5rem',
    borderTop: 'none',
    position: 'relative',
    color: '#1f2937'
  },
  dayBorderRight: {
    borderRight: '1px solid #e5e7eb'
  },
  dayNumber: {
    fontWeight: '500',
    marginBottom: '0.35rem',
    textAlign: 'left',
    fontSize: '0.875rem'
  },
  dayInMonth: {
    color: '#1f2937'
  },
  dayOutOfMonth: {
    color: '#9ca3af'
  },
  today: {
    background: '#eff6ff',
    '& > div:first-child': {
      color: '#2563eb',
      fontWeight: 'bold',
    }
  },
  taskIndicators: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    marginTop: '0.25rem'
  },
  taskBar: {
    height: '0.625rem',
    borderRadius: '0',
    position: 'relative',
    zIndex: '1',
    overflow: 'hidden',


  },
  taskBarRounded: {
    borderRadius: '0.25rem'
  },
  taskBarRoundedLeft: {
    borderTopLeftRadius: '0.25rem',
    borderBottomLeftRadius: '0.25rem'
  },
  taskBarRoundedRight: {
    borderTopRightRadius: '0.25rem',
    borderBottomRightRadius: '0.25rem'
  },
  moreIndicator: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    textAlign: 'right',
    paddingRight: '0.25rem'
  },
  loadingOverlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#1f2937',
    fontSize: '1.25rem',
    fontWeight: '500',
    textAlign: 'center',
    padding: '2rem'




  }
};