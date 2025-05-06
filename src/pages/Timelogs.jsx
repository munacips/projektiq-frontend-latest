import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

function Timelogs() {
  const [viewType, setViewType] = useState('account')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  const [newLog, setNewLog] = useState({
    description: '',
    start_time: '',
    end_time: '',
    project: '',
    task: '',
    billable: false
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const csrfToken = Cookies.get('csrftoken')

        const response = await axios.get('http://localhost:8000/my_projects/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })
        console.log('Projects:', response.data)
        setProjects(response.data)
        const tasks = await axios.get('http://localhost:8000/my_tasks/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })
        console.log('Tasks:', tasks.data)
        setTasks(tasks.data)
      } catch (error) {
        console.error('Error fetching projects or task:', error)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const accessToken = localStorage.getItem('accessToken')
        const csrfToken = Cookies.get('csrftoken')
        const accountId = localStorage.getItem('userId') || ''
        const organizationId = localStorage.getItem('organizationId') || ''

        let endpoint = ''
        switch (viewType) {
          case 'organization':
            endpoint = `http://localhost:8000/get_organization_timelogs/${organizationId}/`
            break
          default:
            endpoint = `http://localhost:8000/get_account_timelogs/${accountId}/`
        }

        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })
        setLogs(response.data)
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [viewType])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewLog((prevLog) => ({
      ...prevLog,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddEntry = async () => {
    // Validate time entry
    if (!newLog.start_time || !newLog.end_time) {
      alert('Please select both start and end times');
      return;
    }
    
    const startTime = new Date(newLog.start_time);
    const endTime = new Date(newLog.end_time);
    
    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }
    
    // Calculate duration in minutes
    const durationMinutes = (endTime - startTime) / (1000 * 60);
    
    if (durationMinutes <= 0) {
      alert('Time entry must be greater than 0 minutes');
      return;
    }
    
    try {
      const accessToken = localStorage.getItem('accessToken')
      const csrfToken = Cookies.get('csrftoken')
      const accountId = localStorage.getItem('userId') || ''
      const organizationId = localStorage.getItem('organizationId') || ''

      let endpoint = `http://localhost:8000/timelogs/`

      await axios.post(endpoint, newLog, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      })

      setNewLog({ description: '', start_time: '', end_time: '', project: '', task: '', billable: false })
      alert('Time entry added successfully')
      setViewType(viewType)
    } catch (error) {
      console.error('Error adding time entry:', error)
      alert('Failed to add time entry')
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={{
            ...styles.button,
            backgroundColor: viewType === 'organization' ? '#3182ce' : '#4299e1'
          }}
          onClick={() => setViewType('organization')}
        >
          View Organization Logs
        </button>
        <button
          style={{
            ...styles.button,
            backgroundColor: viewType === 'account' ? '#3182ce' : '#4299e1'
          }}
          onClick={() => setViewType('account')}
        >
          View My Logs
        </button>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Add New Time Entry</h2>
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newLog.description}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="datetime-local"
          name="start_time"
          placeholder="Start Time (YYYY-MM-DD HH:MM)"
          value={newLog.start_time}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <input
          type="datetime-local"
          name="end_time"
          placeholder="End Time (YYYY-MM-DD HH:MM)"
          value={newLog.end_time}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        {newLog.start_time && newLog.end_time && 
          new Date(newLog.end_time) <= new Date(newLog.start_time) && (
          <div style={styles.errorMessage}>
            End time must be after start time
          </div>
        )}

        <select
          name="project"
          value={newLog.project}
          onChange={handleInputChange}
          style={styles.input}
        >
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name}
            </option>
          ))}
        </select>

        <select
          type="text"
          name="task"
          placeholder="Task"
          value={newLog.task}
          onChange={handleInputChange}
          style={styles.input}
        >
          <option value="">Select a Task</option>
          {tasks
            .filter(task => {
              return !newLog.project || parseInt(newLog.project) === parseInt(task.project);
            })
            .map((task) => (
              <option key={task.id} value={task.id}>
                {task.task}
              </option>
            ))}
        </select>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="billable"
            checked={newLog.billable}
            onChange={handleInputChange}
          />{' '}
          Billable
        </label>
        <button style={styles.button} onClick={handleAddEntry}>Add Entry</button>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {viewType === 'organization' ? 'Organization Logs' : 'My Logs'}
        </h2>

        <div style={styles.cardGrid}>
          {logs.map((log) => (
            <div key={log.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{log.username}</h3>
                <span style={styles.projectBadge}>Project: {log.project_name}</span>
              </div>
              <p style={styles.cardDescription}>{log.description}</p>
              <div style={styles.timeInfo}>
                <span style={styles.timeLabel}>Start: {new Date(log.start_time).toLocaleString()}</span>
                <span style={styles.timeLabel}>End: {new Date(log.end_time).toLocaleString()}</span>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.updateDate}>
                  Last updated: {new Date(log.date_updated).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.extraInfo}>
                <p>Task: {log.task_name || 'N/A'}</p>
                <p>Billable: {log.billable ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', gap: '16px', marginBottom: '32px' },
  button: { backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' },
  section: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '32px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: '#2d3748' },
  input: { margin: '8px 0', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '100%' },
  checkboxLabel: { display: 'block', margin: '8px 0', color: '#4a5568' },
  cardGrid: { display: 'grid', gap: '20px' },
  card: { padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: '16px', fontWeight: '600' },
  cardDescription: { fontSize: '14px', color: '#718096' },
  timeInfo: { display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0' },
  timeLabel: { fontSize: '14px', color: '#4a5568' },
  cardFooter: { fontSize: '12px', color: '#a0aec0' },
  extraInfo: { fontSize: '14px', marginTop: '8px' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  loader: { border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  projectBadge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
  errorMessage: { 
    color: '#e53e3e', 
    fontSize: '14px', 
    marginTop: '4px', 
    marginBottom: '8px' 
  }
}

export default Timelogs
