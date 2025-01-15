import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

function Tasks() {
    const [tasks, setTasks] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [key, setKey] = useState(0)

    const markAsDone = async (id) => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const csrfToken = Cookies.get('csrftoken')
            const response = await axios.put(`http://localhost:8000/my_tasks/`, 
                { id }, 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                }
            )
            
            if (response.status === 200) {
                setKey(prevKey => prevKey + 1)
            }
        } catch (error) {
            console.log("Error updating task, ", error)
        }
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                const response = await axios.get(`http://localhost:8000/my_tasks/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });

                setTasks(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error);
                if (error.response && error.response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
                    const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
                    if (refreshToken) {
                        try {
                            const refreshResponse = await axios.post('http://localhost:8000/o/token/',
                                { refresh_token: refreshToken },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                                    }
                                }
                            );

                            const newAccessToken = refreshResponse.data.access;
                            localStorage.setItem('accessToken', newAccessToken);

                            fetchTasks();
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            navigate('/');
                        }
                    } else {
                        navigate('/');
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [navigate,key])

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loader}></div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Tasks</h1>
            </div>

            <div style={styles.content}>
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Active Tasks</h2>
                    <div style={styles.taskGrid}>
                        {tasks?.filter(task => !task.implemented)
                            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                            .map(task => (
                                <div key={task.id} style={styles.taskCard} onClick={()=>{navigate("/task",{state:{task}})}} >
                                    <div style={styles.taskHeader}>
                                        <h3 style={styles.taskTitle}>{task.task}</h3>
                                        <span style={styles.assignedBy}>
                                            Assigned by: {task.assigned_by}
                                        </span>
                                    </div>
                                    <p style={styles.description}>{task.description}</p>
                                    <div style={styles.taskFooter}>
                                        <div style={styles.dates}>
                                            <span style={styles.dateLabel}>Created:</span>
                                            <span style={styles.dateValue}>
                                                {new Date(task.date_created).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={styles.dates}>
                                            <span style={styles.dateLabel}>Due:</span>
                                            <span style={{
                                                ...styles.dateValue,
                                                color: new Date() > new Date(task.due_date) ? '#e53e3e' : '#38a169'
                                            }}>
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button 
                                            style={styles.completeButton}
                                            onClick={() => markAsDone(task.id)}
                                        >
                                            Complete Task
                                        </button>
                                    </div>
                                </div>
                        ))}
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Completed Tasks</h2>
                    <div style={styles.taskGrid}>
                        {tasks?.filter(task => task.implemented)
                            .sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated))
                            .map(task => (
                                <div key={task.id} style={{...styles.taskCard, opacity: 0.8}}>
                                    <div style={styles.taskHeader}>
                                        <h3 style={styles.taskTitle}>{task.task}</h3>
                                        <span style={styles.completedBadge}>Completed</span>
                                    </div>
                                    <p style={styles.description}>{task.description}</p>
                                    <div style={styles.taskFooter}>
                                        <div style={styles.dates}>
                                            <span style={styles.dateLabel}>Completed:</span>
                                            <span style={styles.dateValue}>
                                                {new Date(task.date_updated).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '32px',
        maxWidth: '1400px',
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
        gap: '48px',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '24px',
    },
    taskGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
    },
    taskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
    },
    taskTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2d3748',
        margin: 0,
    },
    assignedBy: {
        fontSize: '14px',
        color: '#718096',
    },
    description: {
        fontSize: '14px',
        color: '#4a5568',
        marginBottom: '20px',
        lineHeight: '1.6',
    },
    taskFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
    },
    dates: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    dateLabel: {
        fontSize: '12px',
        color: '#718096',
    },
    dateValue: {
        fontSize: '14px',
        fontWeight: '500',
    },
    completeButton: {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    completedBadge: {
        backgroundColor: '#48bb78',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
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

export default Tasks