import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const signupUrl = "http://localhost:8000/signup/";

  const handleSubmit = async (e) => {
      e.preventDefault()
      setErrorMessage('')
        
      // Validate passwords match
      if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match')
          return
      }

      setIsLoading(true)
        
      try {
          const response = await axios.post(signupUrl, {
              username: username,
              first_name: firstName,
              last_name: lastName,
              email: email,
              password: password,
              phone_number: phoneNumber,
              date_of_birth: dateOfBirth
          }, {
              headers: {
                  'Content-Type': 'application/json'
              }
          })

          if (response.status === 201) {
              navigate('/login')
          }
      } catch (error) {
          if (error.response) {
              if (error.response.status === 400) {
                  if (error.response.data) {
                      const errorData = error.response.data
                      if (errorData.username) {
                          setErrorMessage(`Username: ${errorData.username[0]}`)
                      } else if (errorData.first_name) {
                          setErrorMessage(`First Name: ${errorData.first_name[0]}`)
                      } else if (errorData.last_name) {
                          setErrorMessage(`Last Name: ${errorData.last_name[0]}`)
                      } else if (errorData.email) {
                          setErrorMessage(`Email: ${errorData.email[0]}`)
                      } else if (errorData.password) {
                          setErrorMessage(`Password: ${errorData.password[0]}`)
                      } else if (errorData.phone_number) {
                          setErrorMessage(`Phone Number: ${errorData.phone_number[0]}`)
                      } else if (errorData.date_of_birth) {
                          setErrorMessage(`Date of Birth: ${errorData.date_of_birth[0]}`)
                      } else if (errorData.detail) {
                          setErrorMessage(errorData.detail)
                      } else {
                          setErrorMessage('Please check your input and try again')
                      }
                  } else {
                      setErrorMessage('Please check your input and try again')
                  }
              } else if (error.response.data && error.response.data.detail) {
                  setErrorMessage(error.response.data.detail)
              } else {
                  setErrorMessage(`Server error: ${error.response.status}`)
              }
          } else if (error.request) {
              setErrorMessage('No response from server. Please check your connection.')
          } else {
              setErrorMessage(`Error: ${error.message}`)
          }
          setIsLoading(false)
      }
  }

  return (
      <div style={styles.container}>
          <div style={styles.card}>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>Please fill in your details to sign up</p>

              {errorMessage && <div style={styles.error}>{errorMessage}</div>}

              <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                      <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <div style={styles.inputRow}>
                      <div style={styles.inputGroup}>
                          <input
                              type="text"
                              placeholder="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              style={styles.input}
                              required
                          />
                      </div>
                      <div style={styles.inputGroup}>
                          <input
                              type="text"
                              placeholder="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              style={styles.input}
                              required
                          />
                      </div>
                  </div>

                  <div style={styles.inputGroup}>
                      <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <div style={styles.inputGroup}>
                      <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <div style={styles.inputGroup}>
                      <input
                          type="date"
                          placeholder="Date of Birth"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <div style={styles.inputGroup}>
                      <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <div style={styles.inputGroup}>
                      <input
                          type="password"
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={styles.input}
                          required
                      />
                  </div>

                  <button type="submit" style={styles.button} disabled={isLoading}>
                      {isLoading ? (
                          <div style={styles.loadingContainer}>
                              <div style={styles.spinner}></div>
                              <span>Creating account...</span>
                          </div>
                      ) : (
                          "Sign Up"
                      )}
                  </button>
              </form>

              <div style={styles.loginLink}>
                  <p>Already have an account? <span style={styles.link} onClick={() => navigate('/login')}>Sign in</span></p>
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
      padding: '20px 0',
  },
  card: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
      marginBottom: '24px',
      textAlign: 'center',
  },
  form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
  },
  inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
  },
  inputRow: {
      display: 'flex',
      gap: '12px',
  },
  input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      transition: 'border-color 0.2s',
      outline: 'none',
  },
  button: {
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '8px',
  },
  error: {
      backgroundColor: '#fff3f3',
      color: '#ff4444',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
  },
  loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
  },
  spinner: {
      width: '16px',
      height: '16px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
      display: 'inline-block',
  },
  loginLink: {
      marginTop: '20px',
      textAlign: 'center',
  },
  link: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'underline',
  },
  '@keyframes spin': {
      to: { transform: 'rotate(360deg)' }
  }
}

export default Signup
