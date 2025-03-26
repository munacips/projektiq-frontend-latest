import React, { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate, useLocation } from 'react-router-dom'

function NewRequirement() {
  const location = useLocation()
  const project = location.state.project
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
      requirement: '',
      description: '',
      project: project.id,
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
          const accessToken = localStorage.getItem('accessToken')
          const csrfToken = Cookies.get('csrftoken')
          const response = await axios.post(`http://localhost:8000/projects/${project.id}/requirements/`,
              formData,
              {
                  headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrfToken
                  }
              }
          )
          if (response.status === 201) {
              navigate(`/requirement/${response.data.id}`)
          }
      } catch (error) {
          console.error('Error creating requirement:', error)
      } finally {
          setLoading(false)
      }
  }

  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      })
  }

  return (
      <div style={styles.container}>
          <div style={styles.header}>
              <h1 style={styles.title}>Create New Requirement</h1>
          </div>

          <div style={styles.content}>
              <div style={styles.section}>
                  <form onSubmit={handleSubmit} style={styles.form}>
                      <div style={styles.formGroup}>
                          <label style={styles.label}>Requirement Title</label>
                          <input
                              type="text"
                              name="requirement"
                              value={formData.requirement}
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

                      <button 
                          type="submit" 
                          style={styles.submitButton}
                          disabled={loading}
                      >
                          {loading ? 'Creating...' : 'Create Requirement'}
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

export default NewRequirement