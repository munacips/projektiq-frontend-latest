import React, { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'

function MyProjects() {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const clientId = process.env.REACT_APP_CLIENT_ID
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true)
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    navigate('/login')
                    return
                }

                const response = await axios.get("http://localhost:8000/my_projects/", {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                })

                setProjects(response.data)
            } catch (error) {
                if (error.response?.status === 401) {
                    await handleTokenRefresh()
                }
            } finally {
                setIsLoading(false)
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
                fetchProjects()
            } catch (error) {
                navigate('/login')
            }
        }

        fetchProjects()
    }, [navigate, clientId, clientSecret])

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loader}></div>
            </div>
        )
    }

    if (projects.length < 1) {
        return (
            <div style={styles.emptyStateContainer}>
                <h3>No Projects Yet</h3>
                <p>Start your journey by creating your first project</p>
                <button style={styles.createButton} onClick={() => navigate('/new_project')}>
                    Create New Project
                </button>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>My Projects</h2>
                <button style={styles.createButton} onClick={() => navigate('/new_project')} >
                    + New Project
                </button>
            </div>
            <div style={styles.gridContainer}>
                {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    title: {
        margin: 0,
        fontSize: '28px',
        fontWeight: '600',
        color: '#2d3748',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        padding: '16px 0',
    },
    createButton: {
        padding: '12px 24px',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    emptyStateContainer: {
        textAlign: 'center',
        padding: '48px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        margin: '32px auto',
        maxWidth: '500px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
    },
    loader: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
    },
}

export default MyProjects