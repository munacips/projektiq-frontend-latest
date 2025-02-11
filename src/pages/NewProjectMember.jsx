import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Cookies from 'js-cookie'
import axios from "axios"
import {
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Alert
} from "@mui/material"
import { use } from "react"
import { useProject } from "../components/ProjectContext"

function NewProjectMember() {
  const location = useLocation()
  const navigate = useNavigate()
  const accessToken = localStorage.getItem('accessToken')
  const csrfToken = Cookies.get('csrftoken')
  const username = localStorage.getItem('username')
    
  const [selectedUser, setSelectedUser] = useState(null)
  const [role, setRole] = useState('')
  const [userSuggestions, setUserSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {project , setProject } = useProject()

  useEffect(()=>{
    if(location.state?.project){
        setProject(location.state.project)
    }
  },[project, location.state, setProject])

  const fetchUpdatedProject = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:8000/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching updated project:', error)
      throw error
    }
  }

  const roles = [
      { value: 'Project Manager', label: 'Project Manager' },
      { value: 'Developer', label: 'Developer' },
      { value: 'Tester', label: 'Tester' },
      { value: 'Maintainer', label: 'Maintainer' },
      { value: 'Member', label: 'Member' }
  ]

  const handleUserSearch = async (query,username) => {
      if (query.length < 2) {
          setUserSuggestions([])
          return
      }

      setLoading(true)
      try {
          const response = await axios.get(`http://localhost:8000/search_org_users/?query=${query}&username=${username}`, {
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken
              }
          })
          if (response.data && Array.isArray(response.data)) {
              setUserSuggestions(response.data)
          }
      } catch (error) {
          console.error('Error fetching users:', error)
          setUserSuggestions([])
      } finally {
          setLoading(false)
      }
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      setError('')

      if (!selectedUser || !role) return

      try {
          const response = await axios.post(`http://localhost:8000/add_member_to_project/`, {
              project_id: project.id,
              user_id: selectedUser.id,
              role: role
          }, {
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken
              }
          })

          if (response.status === 201) {
            const updatedProject = await fetchUpdatedProject(project.id);
            await setProject(updatedProject);
            navigate(`/project_management`, {
                state: { project: updatedProject }
            });
        }
      } catch (error) {
          setError(error.response?.data?.detail || 'Failed to add member to project. Please try again.')
      }
  }

  return (
      <div style={styles.pageWrapper}>
          <Paper style={styles.formContainer}>
              <Typography variant="h4" style={styles.title}>
                  Add Project Member
              </Typography>
              <Typography variant="subtitle1" style={styles.subtitle}>
                  {project?.name}
              </Typography>

              {error && (
                  <Alert severity="error" style={styles.errorAlert}>
                      {error}
                  </Alert>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                  <Autocomplete
                      fullWidth
                      loading={loading}
                      options={userSuggestions}
                      getOptionLabel={(option) => option?.username || ''}
                      onChange={(_, newValue) => setSelectedUser(newValue)}
                      onInputChange={(_, newInputValue) => {
                          handleUserSearch(newInputValue,username)
                      }}
                      isOptionEqualToValue={(option, value) => 
                          option?.id === value?.id
                      }
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="Username"
                              variant="outlined"
                              required
                          />
                      )}
                      style={styles.formField}
                  />

                  <FormControl fullWidth style={styles.formField}>
                      <InputLabel>Role</InputLabel>
                      <Select
                          value={role}
                          label="Role"
                          onChange={(e) => setRole(e.target.value)}
                          required
                      >
                          {roles.map((role) => (
                              <MenuItem key={role.value} value={role.value}>
                                  {role.label}
                              </MenuItem>
                          ))}
                      </Select>
                  </FormControl>

                  <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      style={styles.submitButton}
                      disabled={!selectedUser || !role}
                  >
                      Add Project Member
                  </Button>
              </form>
          </Paper>
      </div>
  )
}

const styles = {
  pageWrapper: {
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
  },
  formContainer: {
      padding: '32px',
      maxWidth: '500px',
      width: '100%',
      borderRadius: '12px'
  },
  title: {
      color: '#1F2937',
      marginBottom: '8px',
      fontWeight: 600
  },
  subtitle: {
      color: '#6B7280',
      marginBottom: '24px'
  },
  form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
  },
  formField: {
      marginBottom: '16px'
  },
  submitButton: {
      backgroundColor: '#4299e1',
      padding: '12px',
      marginTop: '16px',
      '&:hover': {
          backgroundColor: '#3182ce'
      }
  },
  errorAlert: {
      marginBottom: '20px',
      width: '100%'
  }
}

export default NewProjectMember