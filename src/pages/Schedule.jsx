import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

function Schedule() {
    const localizer = momentLocalizer(moment)
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [newTodo, setNewTodo] = useState('')
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        task: '',
        description: '',
        due_date: '',
    })

    const events = todos.map(todo => ({
        title: todo.task,
        start: new Date(todo.date_created),
        end: new Date(todo.due_date),
    }))

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }
                const response = await axios.get(`http://localhost:8000/my_schedule/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });

                setTodos(response.data);
            } catch (error) {
                console.error('Error fetching todos:', error);
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

                            fetchTodos();
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
        fetchTodos()
    }, [navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const accessToken = localStorage.getItem('accessToken')
            const csrfToken = Cookies.get('csrftoken')
            const response = await axios.post('http://localhost:8000/my_tasks/',
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
                setFormData({
                    task: '',
                    description: '',
                    due_date: ''
                })
                window.location.reload()
            }
        } catch (error) {
            console.error('Error creating task:', error)
        } finally {
            setLoading(false)
        }
    }

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
                <h1 style={styles.title}>Schedule</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="task"
                        placeholder="Task title..."
                        value={formData.task}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <input
                        name="description"
                        placeholder="Task description..."
                        value={formData.description}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <input
                        type="datetime-local"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        style={styles.dateInput}
                        required
                    />
                    <button type="submit" style={styles.addButton}>
                        Add Schedule Item
                    </button>
                </form>

            </div>

            <div style={styles.content}>
                <div style={styles.calendarSection}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={styles.calendar}
                        defaultView="month"
                        titleAccessor="title"
                    />
                </div>

                <div style={styles.listsContainer}>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Active Items</h2>
                        <div style={styles.todoList}>
                            {todos
                                .filter(todo => !todo.completed)
                                .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                                .map((todo, index) => (
                                    <div key={index} style={styles.todoCard}>
                                        <h3 style={styles.todoTitle}>{todo.description}</h3>
                                        {todo.issue_name && (
                                            <div style={styles.issueBadge}>
                                                Issue: {todo.issue_name}
                                            </div>
                                        )}
                                        {todo.task_name && (
                                            <div style={styles.taskBadge}>
                                                Task: {todo.task_name}
                                            </div>
                                        )}
                                        <div style={styles.todoFooter}>
                                            <div style={styles.dateInfo}>
                                                <span style={styles.dateLabel}>From:</span>
                                                <span style={styles.dateValue}>
                                                    {new Date(todo.date_created).toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={styles.dateInfo}>
                                                <span style={styles.dateLabel}>To:</span>
                                                <span style={styles.dateValue}>
                                                    {new Date(todo.due_date).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {todos.filter(todo => todo.completed).length > 0 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Completed Items</h2>
                            <div style={styles.todoList}>
                                {todos
                                    .filter(todo => todo.completed)
                                    .sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated))
                                    .map((todo, index) => (
                                        <div key={index} style={{ ...styles.todoCard, opacity: 0.8 }}>
                                            <h3 style={styles.todoTitle}>{todo.description}</h3>
                                            <div style={styles.completedBadge}>Completed</div>
                                            <div style={styles.todoFooter}>
                                                <div style={styles.dateInfo}>
                                                    <span style={styles.dateLabel}>Completed:</span>
                                                    <span style={styles.dateValue}>
                                                        {new Date(todo.date_updated).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
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
        marginBottom: '24px',
    },
    form: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    input: {
        flex: '1',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        minWidth: '200px',
    },
    dateInput: {
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
    },
    addButton: {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '32px',
    },
    calendarSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    calendar: {
        height: '700px',
    },
    listsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
    },
    todoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    todoCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
    },
    todoTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '12px',
    },
    issueBadge: {
        backgroundColor: '#ebf4ff',
        color: '#4299e1',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'inline-block',
        marginBottom: '8px',
    },
    taskBadge: {
        backgroundColor: '#f0fff4',
        color: '#48bb78',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'inline-block',
        marginBottom: '8px',
        marginLeft: '8px',
    },
    completedBadge: {
        backgroundColor: '#48bb78',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'inline-block',
        marginBottom: '8px',
    },
    todoFooter: {
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    dateInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: '12px',
        color: '#718096',
    },
    dateValue: {
        fontSize: '12px',
        color: '#4a5568',
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

export default Schedule