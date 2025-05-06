import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function ProjectLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [viewType, setViewType] = useState('month'); // 'day', 'week', or 'month'
  const navigate = useNavigate();

  // Handle authentication errors
  const handleAuthError = async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      const csrfToken = Cookies.get('csrftoken');
      
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            'http://localhost:8000/o/token/',
            new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: process.env.REACT_APP_CLIENT_ID,
              client_secret: process.env.REACT_APP_CLIENT_SECRET,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
              },
            }
          );
      
          const newAccessToken = refreshResponse.data.access_token;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Don't call fetch functions here as it could cause infinite recursion
          // The effect dependencies will trigger a refetch
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    } else {
      console.error('Error fetching data:', error);
    }
  };

  // First effect to load projects only once when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');

        if (!accessToken) {
          console.error('No access token found');
          navigate('/login');
          return;
        }
        
        const projectsResponse = await axios.get("http://localhost:8000/my_projects/", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        });
        
        setProjects(projectsResponse.data);
        
        // Set default project if none selected
        if (!selectedProject && projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0].id);
        }
      } catch (error) {
        handleAuthError(error);
      }
    };
    
    fetchProjects();
  }, [navigate]); // Only depend on navigate

  // Effect to load logs when the project changes
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedProject) return;
      
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');
        
        if (!accessToken) {
          console.error('No access token found');
          navigate('/login');
          return;
        }
        
        const logsResponse = await axios.get(`http://localhost:8000/get_project_timelogs/${selectedProject}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        });
        
        setLogs(logsResponse.data);
        
        // Extract unique people from all logs
        const uniquePeople = [...new Set(logsResponse.data.map(log => log.username))];
        setPeople(uniquePeople);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [selectedProject, navigate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePersonChange = (e) => {
    setSelectedPerson(e.target.value);
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  // Get start and end dates based on view type
  const getDateRange = () => {
    const selectedDateObj = new Date(selectedDate);
    
    if (viewType === 'day') {
      return {
        start: new Date(selectedDate).toISOString().split('T')[0],
        end: new Date(selectedDate).toISOString().split('T')[0]
      };
    } 
    else if (viewType === 'week') {
      // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDateObj.getDay();
      
      // Calculate the date of Monday (start of week)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise go back to Monday
      const monday = new Date(selectedDateObj);
      monday.setDate(selectedDateObj.getDate() + mondayOffset);
      
      // Calculate the date of Sunday (end of week)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0]
      };
    } 
    else if (viewType === 'month') {
      const year = selectedDateObj.getFullYear();
      const month = selectedDateObj.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
      };
    }
    
    return { start: selectedDate, end: selectedDate };
  };

  // Format time function
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date function
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  };

  // Filter logs based on selected date range and person
  const filteredLogs = logs.filter(log => {
    // Parse the log date for comparison
    const logDate = new Date(log.date_created).toISOString().split('T')[0];
    const dateRange = getDateRange();
    
    // Check if the log date is within the date range
    const isInDateRange = logDate >= dateRange.start && logDate <= dateRange.end;
    
    // Check if the log matches the selected person (if any)
    const matchesPerson = !selectedPerson || log.username === selectedPerson;
    
    return isInDateRange && matchesPerson;
  });

  const getViewTitle = () => {
    const dateRange = getDateRange();
    
    if (viewType === 'day') {
      return `Logs for ${new Date(selectedDate).toLocaleDateString()}`;
    } 
    else if (viewType === 'week') {
      return `Weekly Logs (${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()})`;
    } 
    else if (viewType === 'month') {
      return `Monthly Logs (${new Date(dateRange.start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    }
    
    return 'Logs';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Project Time Logs</h1>
      </div>

      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Select Project:</label>
          <select 
            style={styles.filterSelect} 
            value={selectedProject} 
            onChange={handleProjectChange}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>View Type:</label>
          <select 
            style={styles.filterSelect} 
            value={viewType} 
            onChange={handleViewTypeChange}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>{viewType === 'day' ? 'Select Date' : viewType === 'week' ? 'Select Week' : 'Select Month'}:</label>
          <input 
            type="date" 
            style={styles.filterSelect} 
            value={selectedDate} 
            onChange={handleDateChange}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Person:</label>
          <select 
            style={styles.filterSelect} 
            value={selectedPerson} 
            onChange={handlePersonChange}
          >
            <option value="">All People</option>
            {people.map((person, index) => (
              <option key={index} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {getViewTitle()}
            {selectedPerson && ` - ${selectedPerson}`}
          </h2>
          
          {filteredLogs.length === 0 ? (
            <div style={styles.noLogs}>
              No time logs found for the selected criteria.
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <div style={styles.tableSummary}>
                <strong>Total Hours: </strong>
                {filteredLogs.reduce((total, log) => total + parseFloat(log.hours_spent || 0), 0).toFixed(2)}
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>User</th>
                    <th style={styles.tableHeader}>Project</th>
                    <th style={styles.tableHeader}>Task</th>
                    <th style={styles.tableHeader}>Description</th>
                    <th style={styles.tableHeader}>Start Time</th>
                    <th style={styles.tableHeader}>End Time</th>
                    <th style={styles.tableHeader}>Hours Spent</th>
                    <th style={styles.tableHeader}>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs
                    .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                    .map((log) => (
                      <tr key={log.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{log.username}</td>
                        <td style={styles.tableCell}>{log.project_name}</td>
                        <td style={styles.tableCell}>{log.task_name || 'N/A'}</td>
                        <td style={styles.tableCell}>{log.description || 'N/A'}</td>
                        <td style={styles.tableCell}>{formatTime(log.start_time)}</td>
                        <td style={styles.tableCell}>{formatTime(log.end_time)}</td>
                        <td style={styles.tableCell}>{log.hours_spent}</td>
                        <td style={styles.tableCell}>{formatDate(log.date_created)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
  },
  filterSelect: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#2d3748',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '24px',
  },
  noLogs: {
    padding: '40px',
    textAlign: 'center',
    color: '#718096',
    fontSize: '16px',
    fontStyle: 'italic',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    fontWeight: '600',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    ':hover': {
      backgroundColor: '#f7fafc',
    },
  },
  tableCell: {
    padding: '12px 16px',
    color: '#2d3748',
    verticalAlign: 'top',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  tableSummary: {
    padding: '10px 0',
    fontWeight: 'normal',
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px'
  }
};

export default ProjectLogs;