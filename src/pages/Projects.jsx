import React, { useEffect, useState } from "react";
import axios from 'axios'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const csrfToken = Cookies.get('csrftoken')

        if (!accessToken) {
          console.error('No access token found')
          navigate('/login')
          return
        }

        const response = await axios.get("http://localhost:8000/my_projects/", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Include CSRF token in headers
          }
        });

        setProjects(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (error.response && error.response.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
          const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post(
                'http://localhost:8000/o/token/',
                new URLSearchParams({
                  grant_type: 'refresh_token',
                  refresh_token: refreshToken,
                  client_id: 'your_client_id', // Replace with your actual client ID
                  client_secret: 'your_client_secret', // Replace with your actual client secret
                }),
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken, // Optional, only include if needed
                  },
                }
              );
          
              const newAccessToken = refreshResponse.data.access_token;
              localStorage.setItem('accessToken', newAccessToken);
          
              // Retry fetching projects with the new token
              fetchProjects();
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              navigate('/');
            }
          } else {
            navigate('/');
          }
          
        }
      }
    }
    fetchProjects()
  }, [navigate])
  return (
    <div>
      <h1>Projects</h1>
      <div style={styles.container}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.cardHover.transform;
              e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.card.boxShadow;
            }}
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <h2 style={styles.title}>{project.project_name}</h2> {/* Project Name */}
            <p style={styles.text}>{project.project_description}</p> {/* Project Description */}
            <p style={styles.status}>Status: {project.project_status}</p> {/* Project Status */}
            <p style={styles.text}>
              <span style={styles.strong}>Organizations:</span>
              {project.organization_names ? project.organization_names.join(', ') : 'No organizations listed.'}
            </p> {/* Organization Names */}
            <p style={styles.date}>Created: {new Date(project.date_created).toLocaleDateString()}</p> {/* Date Created */}
            <p style={styles.date}>Updated: {new Date(project.date_updated).toLocaleDateString()}</p> {/* Date Updated */}
          </div>
        ))}
      </div>
    </div>
  )
}

// Define internal styles
const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f4f8',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    width: '300px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #e0e0e0',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
  },
  title: {
    margin: '0 0 10px',
    fontSize: '1.5em',
    color: '#333',
  },
  text: {
    margin: '5px 0',
    color: '#555',
    lineHeight: '1.5',
  },
  status: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  date: {
    fontSize: '0.9em',
    color: '#888',
  },
};

export default Projects
