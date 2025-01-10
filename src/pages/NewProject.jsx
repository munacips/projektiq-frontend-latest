import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios'
import Cookies from 'js-cookie'

const NewProject = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const clientId = process.env.REACT_APP_CLIENT_ID
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    deadline: '',
    stage_due_date: '',
    participantOrganizations: [],
    manager: localStorage.getItem('username')
  });

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const csrfToken = Cookies.get('csrftoken')

        if (!accessToken) {
          navigate('/login')
          return
        }

        const response = await axios.get("http://localhost:8000/organizations/", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })

        setOrganizations(response.data)
      } catch (error) {
        if (error.response?.status === 401) {
          await handleTokenRefresh()
        }
      }
    }

    const handleTokenRefresh = async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      const csrfToken = Cookies.get('csrftoken')

      if (!refreshToken) {
        navigate('/')
        return
      }

      try {
        const response = await axios.post(
          'http://localhost:8000/o/token/',
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRFToken': csrfToken,
            },
          }
        )

        localStorage.setItem('accessToken', response.data.access_token)
        fetchOrganisations()
      } catch (error) {
        navigate('/login')
      }
    }

    fetchOrganisations()
  }, [navigate, clientId, clientSecret])



  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for the multiple select
    if (name === 'participantOrganizations') {
      setProjectData(prevState => ({
        ...prevState,
        participantOrganizations: value // value will be an array for multiple select
      }));
    } else {
      // Handle all other inputs normally
      setProjectData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = Cookies.get('csrftoken');

      const response = await axios.post('http://localhost:8000/projects/', projectData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });

      if (response.status === 201) {
        navigate('/projects');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
          const refreshResponse = await axios.post(
            'http://localhost:8000/o/token/',
            new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': Cookies.get('csrftoken'),
              },
            }
          );
          localStorage.setItem('accessToken', refreshResponse.data.access_token);
          // Retry the project creation with new token
          const retryResponse = await axios.post('http://localhost:8000/projects/', projectData, {
            headers: {
              'Authorization': `Bearer ${refreshResponse.data.access_token}`,
              'Content-Type': 'application/json',
              'X-CSRFToken': Cookies.get('csrftoken')
            }
          });
          if (retryResponse.status === 201) {
            navigate('/projects');
          }
        } catch (refreshError) {
          navigate('/login');
        }
      }
      console.error('Error creating project:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            required
            label="Project Name"
            name="name"
            value={projectData.name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Description"
            name="description"
            value={projectData.description}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            type="datetime-local"
            label="Stage Due Date"
            name="stage_due_date"
            value={projectData.stage_due_date}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            required
            type="datetime-local"
            label="Project Deadline"
            name="deadline"
            value={projectData.deadline}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="organizations-label">Participant Organizations</InputLabel>
            <Select
              labelId="organizations-label"
              multiple
              name="participantOrganizations"
              value={projectData.participantOrganizations}
              onChange={handleInputChange}
              label="Participant Organizations"
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Create Project
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default NewProject;
