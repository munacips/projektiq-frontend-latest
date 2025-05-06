import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate, useLocation } from 'react-router-dom'

function NewTask() {
  const location = useLocation()
  const project = location.state.project
  const [loading, setLoading] = useState(false)
  const [projectMembers, setProjectMembers] = useState([])
  const userId = localStorage.getItem("userId")
  const [formData, setFormData] = useState({
    task: '',
    description: '',
    due_date: '',
    hours_needed: '',
    assigned_to: '',
    assigned_by: userId,
    project: project.id,
    implemented: false
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch project members when component mounts
    fetchProjectMembers()
  }, [])

  const fetchProjectMembers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await axios.get(`http://localhost:8000/get_project_members/${project.id}/`, {
        //params: { project_id: project.id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      setProjectMembers(response.data)
    } catch (error) {
      console.error('Error fetching project members:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      const csrfToken = Cookies.get('csrftoken')
      
      // Format the date and time for the due_date field
      const formattedData = {
        ...formData,
        due_date: formData.due_date && formData.due_date_time 
          ? `${formData.due_date}T${formData.due_date_time}:00` 
          : formData.due_date
      }
      
      // Remove the temporary due_date_time field
      delete formattedData.due_date_time
      
      const response = await axios.post('http://localhost:8000/create_task/',
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        }
      )
      if (response.status === 201) {
        navigate(`/task`,{state:{task: response.data}})
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Task</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Task Title</label>
              <input
                type="text"
                name="task"
                value={formData.task}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                rows="4"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Time</label>
              <input
                type="time"
                name="due_date_time"
                value={formData.due_date_time || ''}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Hours Needed</label>
              <input
                type="number"
                name="hours_needed"
                value={formData.hours_needed}
                onChange={handleChange}
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select a team member</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.username || member.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="implemented"
                  checked={formData.implemented}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Already Implemented
              </label>
            </div>

            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
  },
  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    resize: 'vertical',
  },
  checkbox: {
    marginRight: '8px',
  },
  submitButton: {
    backgroundColor: '#4299e1',
    width: '100%',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '16px',
  },
}

export default NewTask
