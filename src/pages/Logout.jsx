import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Logout() {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
      
      const clearAuthData = () => {
          
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('username')
          localStorage.removeItem('userId')
            
          
          sessionStorage.clear()
            
          
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
              if (key.startsWith('auth_') || key.startsWith('user_') || key.startsWith('token_')) {
                  localStorage.removeItem(key)
              }
          })
      }

      
      const performLogout = async () => {
          try {
              
              clearAuthData()
                
              
              setTimeout(() => {
                  setIsLoading(false)
                  
                  setTimeout(() => {
                      navigate('/login', { replace: true })
                  }, 1000)
              }, 1000)
                
          } catch (error) {
              console.error('Logout error:', error)
              
              clearAuthData()
              setIsLoading(false)
              setTimeout(() => {
                  navigate('/login', { replace: true })
              }, 1000)
          }
      }

      performLogout()
  }, [navigate])

  return (
      <div style={styles.container}>
          <div style={styles.card}>
              <h1 style={styles.title}>
                  {isLoading ? 'Logging Out...' : 'Logged Out Successfully'}
              </h1>
              <p style={styles.subtitle}>
                  {isLoading 
                      ? 'Please wait while we securely log you out' 
                      : 'You have been successfully logged out'
                  }
              </p>

              <div style={styles.statusContainer}>
                  {isLoading ? (
                      <div style={styles.loadingContainer}>
                          <div style={styles.spinner}></div>
                          <span style={styles.loadingText}>Clearing session data...</span>
                      </div>
                  ) : (
                      <div style={styles.successContainer}>
                          <div style={styles.checkmark}>✓</div>
                          <span style={styles.successText}>Redirecting to login...</span>
                      </div>
                  )}
              </div>

              <div style={styles.loginLink}>
                  <p>
                      <span 
                          style={styles.link} 
                          onClick={() => navigate('/login')}
                      >
                          Return to Login
                      </span>
                  </p>
              </div>
          </div>
      </div>
  )
}

const styles = {
  container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
  },
  card: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
  },
  title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px',
      textAlign: 'center',
  },
  subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '32px',
      textAlign: 'center',
  },
  statusContainer: {
      marginBottom: '32px',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  },
  loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexDirection: 'column',
  },
  spinner: {
      width: '24px',
      height: '24px',
      border: '3px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: '#007bff',
      animation: 'spin 1s ease-in-out infinite',
      display: 'inline-block',
  },
  loadingText: {
      fontSize: '14px',
      color: '#666',
      marginTop: '8px',
  },
  successContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexDirection: 'column',
  },
  checkmark: {
      width: '32px',
      height: '32px',
      backgroundColor: '#28a745',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
  },
  successText: {
      fontSize: '14px',
      color: '#28a745',
      marginTop: '8px',
  },
  loginLink: {
      textAlign: 'center',
  },
  link: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '16px',
  },
  '@keyframes spin': {
      to: { transform: 'rotate(360deg)' }
  }
}

export default Logout
