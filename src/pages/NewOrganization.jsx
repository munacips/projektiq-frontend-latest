import React, { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

function NewOrganization() {
  const [organization, setOrganization] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: ''
  })
  const navigate = useNavigate()

  const fetchOrganization = async (orgId) => {
    const accessToken = localStorage.getItem('accessToken')
    const csrfToken = Cookies.get('csrftoken')
    const response = await axios.get(`http://localhost:8000/organizations/${orgId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      }
    })

    if (response.status == 200) {
      setOrganization(response.data)
    } else {
      console.error(response.data)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const accessToken = localStorage.getItem('accessToken')
      const csrfToken = Cookies.get('csrftoken')

      const response = await axios.post('http://localhost:8000/organizations/',
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

        const resp = await axios.post('http://localhost:8000/add_member_to_organization/', {
          "user_id": localStorage.getItem("userId"),
          "org_id": response.data.id,
          "role": "Admin"
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })

        if (resp.status === 201) {
          fetchOrganization(response.data.id)
          navigate(`/organization`, {
            state: { organization: response.data }
          })
        }
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      setError(error.response?.data?.detail || 'Failed to create organization. Please try again.')
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
        <h1 style={styles.title}>Create New Organization</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Organization Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Organization'}
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
  errorAlert: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  }
}

export default NewOrganization
