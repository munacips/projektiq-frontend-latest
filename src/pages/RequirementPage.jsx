import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

function RequirementPage() {
  const { id } = useParams()
  const [requirement, setRequirement] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
      const fetchRequirement = async () => {
          try {
              const accessToken = localStorage.getItem('accessToken')
              const csrfToken = Cookies.get('csrftoken')
                
              if (!accessToken) {
                  console.error('No access token found')
                  navigate('/login')
                  return
              }
                
              const response = await axios.get(`http://localhost:8000/project/${id}/requirements/`, {
                  headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrfToken
                  }
              })
                
              setRequirement(response.data)
          } catch (error) {
              console.error('Error fetching requirement:', error)
          } finally {
              setLoading(false)
          }
      }
        
      fetchRequirement()
  }, [navigate, id])

  const handleMarkImplemented = async () => {
      try {
          const accessToken = localStorage.getItem('accessToken')
          const csrfToken = Cookies.get('csrftoken')

          await axios.patch(`http://localhost:8000/project/${id}/requirements/`, {
              implemented: true
          }, {
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken
              }
          })

          setRequirement(prev => ({...prev, implemented: true}))
      } catch (error) {
          console.error('Error updating requirement:', error)
      }
  }

  return (
      <div style={styles.container}>
          <div style={styles.header}>
              <h1 style={styles.title}>Requirement Details</h1>
          </div>

          <div style={styles.content}>
              {loading ? (
                  <p>Loading...</p>
              ) : requirement ? (
                  <div style={styles.section}>
                      <div style={styles.requirementCard}>
                          <div style={styles.header}>
                              <div style={styles.headerContent}>
                                  <h1 style={styles.title}>{requirement.requirement}</h1>
                                  {!requirement.implemented && (
                                      <button 
                                          style={styles.markImplementedButton}
                                          onClick={handleMarkImplemented}
                                      >
                                          Mark as Implemented
                                      </button>
                                  )}
                              </div>
                          </div>

                          <p style={styles.description}>{requirement.description}</p>

                          <div style={styles.metaInfo}>
                              <div style={styles.infoItem}>
                                  <span style={styles.label}>Created:</span>
                                  <span style={styles.value}>
                                      {new Date(requirement.date_created).toLocaleDateString()}
                                  </span>
                              </div>
                              <div style={styles.infoItem}>
                                  <span style={styles.label}>Last Updated:</span>
                                  <span style={styles.value}>
                                      {new Date(requirement.date_updated).toLocaleDateString()}
                                  </span>
                              </div>
                              <div style={styles.infoItem}>
                                  <span style={styles.label}>Status:</span>
                                  <span style={styles.value}>
                                      {requirement.implemented ? 'Implemented' : 'Not Implemented'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <p>Requirement not found.</p>
              )}
          </div>
      </div>
  )
}

const styles = {
  container: {
      padding: '32px',
      maxWidth: '1200px',
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
  requirementCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
  },
  description: {
      fontSize: '16px',
      color: '#4a5568',
      marginBottom: '24px',
      lineHeight: '1.6',
  },
  metaInfo: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
      marginBottom: '32px',
      padding: '16px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
  },
  infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
  },
  label: {
      fontSize: '14px',
      color: '#718096',
      fontWeight: '500',
  },
  value: {
      fontSize: '16px',
      color: '#2d3748',
  },
  headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  markImplementedButton: {
      backgroundColor: '#48bb78',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      hover: {
          backgroundColor: '#38a169'
      }
  }
}

export default RequirementPage