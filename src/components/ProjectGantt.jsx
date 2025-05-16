import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';

// Color mapping for categories
const categoryColors = {
  "Requirements": "#ff4136", // Red
  "Design": "#2ecc40",       // Green
  "Development": "#0074d9",  // Blue
  "Testing": "#ff851b",      // Orange
  "Deployment": "#b10dc9",   // Purple
  "Maintenance": "#39cccc",  // Teal
  "Closed": "#7fdbff",       // Light blue
  "Cancelled": "#85144b",    // Maroon
  "Other": "#aaaaaa",        // Gray
  "Implementation": "#f012be" // Pink
};


// 1. Accept refreshTrigger as a prop
export default function ProjectGantt({ projectId, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("month"); // "month" or "week"
  // Set initial currentDate to today for a more dynamic start
  const [currentDate, setCurrentDate] = useState(new Date()); // Changed from fixed date
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uniqueCategories = useMemo(() => {
    return [...new Set(tasks.map(task => task.category))];
  }, [tasks]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) { // Ensure projectId is available
        setTasks([]); // Clear tasks if no projectId
        return;
      }
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');

        // Ensure tokens are present
        if (!accessToken || !csrfToken) {
            setError("Authentication details are missing. Please log in again.");
            setLoading(false);
            setTasks([]); // Clear tasks if auth fails
            return;
        }

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
              // If date_ended is null or invalid, consider it ongoing till today or use start date
              const endDate = item.date_ended ? new Date(item.date_ended) : new Date(Math.max(startDate.getTime(), new Date().getTime()));
              if (endDate < startDate) { // Ensure end date is not before start date
                endDate.setTime(startDate.getTime()); // Set to start date if invalid
              }


              return {
                id: item.id || `task-${index}`, // Prefer actual ID from backend if available
                name: item.description || item.status || `Phase ${index + 1}`, // Use description if available
                startDate,
                endDate,
                progress: 100, // This could be dynamic based on current date vs end_date
                category: item.status || "Other", // Default category if status is missing
                // Dependency logic might need to be more sophisticated based on actual project data
                // dependency: index > 0 ? (response.data[index-1].id || `task-${index - 1}`) : "",
              };
            });
            console.log("Fetched and formatted tasks:", formatted);
            setTasks(formatted);
          } else {
            setTasks([]); // Set to empty array if API returns empty
            console.log("No project history data received from API.");
          }
        } else {
          console.warn("Unexpected data format received from API:", response.data);
          setTasks([]); // Set to empty if format is wrong
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
        setTasks([]); // Clear tasks on error
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases
      }
    };

    if (projectId) {
      fetchData();
    } else {
      setTasks([]); // Clear tasks if projectId becomes null/undefined
      setLoading(false);
    }
  // 2. Add refreshTrigger to the dependency array
  }, [projectId, refreshTrigger]);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else { // week view
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else { // week view
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Calculate calendar dates
  const getCalendarDates = () => {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "month") {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

      // Days from previous month
      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = new Date(year, month, 0 - (firstDayOfWeek - 1 - i));
        dates.push({ date: day, isCurrentMonth: false });
      }

      // Days of current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const day = new Date(year, month, i);
        dates.push({ date: day, isCurrentMonth: true });
      }

      // Days from next month to fill up to 6 weeks (42 days)
      const daysDisplayed = dates.length;
      const daysToAddFromNextMonth = (daysDisplayed % 7 === 0) ? 0 : 7 - (daysDisplayed % 7);
      
      // Ensure we always display 6 weeks for consistent height if needed, or just complete the last week.
      // For a strict 6-week (42 days) display:
      // const totalCells = 42;
      // for (let i = 1; dates.length < totalCells; i++) {
      //    const day = new Date(year, month + 1, i);
      //    dates.push({ date: day, isCurrentMonth: false });
      // }
      // Or to just complete the current grid:
       for (let i = 1; i <= daysToAddFromNextMonth; i++) {
         const day = new Date(year, month + 1, i);
         dates.push({ date: day, isCurrentMonth: false });
       }


    } else { // Week view
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
    if (calendarDates.length === 0) return weeks; // Handle empty calendarDates
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
      taskStart.setHours(0,0,0,0); // Normalize task start date
      const taskEnd = new Date(task.endDate);
      taskEnd.setHours(23,59,59,999); // Normalize task end date
      
      // Check if the task's period overlaps with the target date
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
  
  if (loading) { // More prominent loading state for the whole component
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
                const dateKey = day.date.toISOString().split('T')[0]; // Use date part as key
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
                      {tasksForDate.slice(0, viewMode === "month" ? 3 : 5).map((task) => { // Show more in week view
                        const taskStart = new Date(task.startDate);
                        taskStart.setHours(0,0,0,0);
                        const taskEnd = new Date(task.endDate);
                        taskEnd.setHours(0,0,0,0); // Use 00:00:00 for end date comparison for "isTaskEnd"

                        const currentDayStart = new Date(day.date);
                        currentDayStart.setHours(0,0,0,0);

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
                        // else: it's a middle segment, no extra rounding needed

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
// Keep your styles object as is
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
    // gap: '0.5rem', // Removed to make buttons touch for segmented control look
    background: '#e5e7eb', // Light gray background for the toggle group
    borderRadius: '0.5rem',
    padding: '0.25rem',
    border: '1px solid #d1d5db' // Softer border
  },
  viewButton: {
    padding: '0.35rem 0.85rem', // Slightly more padding
    borderRadius: '0.35rem',    // Slightly more rounded inner buttons
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#374151', // Darker text for inactive buttons
    fontWeight: '500',
    transition: 'background-color 0.2s, color 0.2s' // Smooth transition
  },
  activeViewButton: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', // Refined shadow
    color: '#1f2937', // Darker text for active button
    fontWeight: '600',
  },
  navButton: {
    padding: '0.35rem 0.6rem', // Adjusted padding
    borderRadius: '0.35rem',
    border: '1px solid #d1d5db', // Consistent border
    background: 'white',       // White background
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem', // Reduced gap for denser legend
    marginBottom: '1.5rem', // More space below legend
    padding: '0.5rem 0'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem' // Smaller gap
  },
  legendColor: {
    width: '0.875rem', // 14px
    height: '0.875rem',
    borderRadius: '0.125rem' // 2px
  },
  calendar: {
    background: '#1f2937',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    border: '1px solid #e5e7eb', // Light border for the calendar
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' // Softer shadow
  },
  daysHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    padding: '0.75rem 0', // More padding
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280', // Gray for day names
    fontWeight: '600', // Bolder day names
    background: '#f9fafb' // Very light gray for header background
  },
  calendarGrid: {
    display: 'flex',
    flexDirection: 'column'
  },
  week: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #e5e7eb', // Separator between weeks
    '&:last-child': { // This pseudo-selector won't work in inline styles
        borderBottom: 'none', // No border for the last week
    }
  },
  day: {
    minHeight: '6rem', // Minimum height for day cells
    padding: '0.5rem', // More padding
    borderTop: 'none', // Remove individual top borders, use week's borderBottom
    position: 'relative',
    color: '#1f2937' // Default text color for days
  },
  dayBorderRight: {
    borderRight: '1px solid #e5e7eb' // Vertical separator for days
  },
  dayNumber: {
    fontWeight: '500',
    marginBottom: '0.35rem',
    textAlign: 'left', // Align day number to the left
    fontSize: '0.875rem' // 14px
  },
  dayInMonth: {
    color: '#1f2937' // Dark text for days in current month
  },
  dayOutOfMonth: {
    color: '#9ca3af' // Lighter gray for days not in current month
  },
  today: {
    background: '#eff6ff', // Very light blue for today
    '& > div:first-child': { // Target .dayNumber within .today, needs CSS-in-JS solution or classes
        color: '#2563eb', // Blue color for today's number
        fontWeight: 'bold',
    }
  },
  taskIndicators: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem', // Tighter gap for task bars
    marginTop: '0.25rem'
  },
  taskBar: {
    height: '0.625rem', // 10px height
    borderRadius: '0', // Default square ends
    position: 'relative',
    zIndex: '1',
    overflow: 'hidden', // To ensure text doesn't overflow if added later
    // Add a very subtle border to distinguish stacked bars if they are same color
    // border: '1px solid rgba(0,0,0,0.05)' 
  },
  taskBarRounded: {
    borderRadius: '0.25rem' // 4px radius for single-day tasks
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
    color: '#6b7280', // Gray for "more" indicator
    marginTop: '0.25rem',
    textAlign: 'right',
    paddingRight: '0.25rem'
  },
  loadingOverlay: { // Style for a full component loading state
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#1f2937',
    fontSize: '1.25rem',
    fontWeight: '500',
    textAlign: 'center',
    padding: '2rem'
    // position: 'absolute', // If you want it to overlay existing content
    // top: 0, left: 0, right: 0, bottom: 0,
    // background: 'rgba(255, 255, 255, 0.8)',
    // zIndex: 10
  }
};