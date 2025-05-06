import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function ManageMember() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(location.state?.member || null);
    const [project, setProject] = useState(location.state?.project || null);
    const [tasks, setTasks] = useState([]);
    const [timelogs, setTimelogs] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [userRole, setUserRole] = useState(user?.role || 'Member');
    const csrfToken = Cookies.get('csrftoken')

    // Form states
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [newTask, setNewTask] = useState({
        task: '',
        description: '',
        due_date: '',
        priority: 'medium',
        hours_needed : ''
    });

    // Base API URL and Headers
    const API_BASE_URL = 'http://localhost:8000';
    
    const getAuthHeaders = useCallback(() => {
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = Cookies.get('csrftoken');
        
        return {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        };
    }, []);

    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const csrfToken = Cookies.get('csrftoken');
        
        if (!refreshToken) {
            navigate('/');
            return null;
        }
        
        try {
            const refreshResponse = await axios.post(
                `${API_BASE_URL}/o/token/`,
                { refresh_token: refreshToken },
                { headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken } }
            );
            
            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            return newAccessToken;
        } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            navigate('/');
            return null;
        }
    }, [navigate]);

    const apiRequest = useCallback(async (method, endpoint, data = null) => {
        try {
            const headers = getAuthHeaders();
            const config = { headers };
            
            let response;
            if (method === 'get') {
                response = await axios.get(`${API_BASE_URL}${endpoint}`, config);
            } else if (method === 'post') {
                response = await axios.post(`${API_BASE_URL}${endpoint}`, data, config);
            } else if (method === 'put') {
                response = await axios.put(`${API_BASE_URL}${endpoint}`, data, config);
            } else if (method === 'delete') {
                response = await axios.delete(`${API_BASE_URL}${endpoint}`, config);
            } else if (method === 'patch') {
                response = await axios.patch(`${API_BASE_URL}${endpoint}`, data, config);
            }
            
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const newToken = await refreshToken();
                if (newToken) {
                    // Retry the request with new token
                    return apiRequest(method, endpoint, data);
                }
            }
            throw error;
        }
    }, [getAuthHeaders, refreshToken]);

    const fetchUpdatedProject = async (projectId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/project/${projectId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching updated project:', error);
            throw error;
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken) {
                console.error('No access token found');
                navigate('/login');
                return;
            }

            // Fetch project data if not available
            let projectId = project?.id || id;
            let userId = id;
            
            if (!project) {
                const projectData = await apiRequest('get', `/project/${projectId}`);
                setProject(projectData);
            }

            // Fetch user data if not available
            if (!user) {
                const userData = await apiRequest('get', `/user/${userId}`);
                setUser(userData);
                setUserRole(userData.role || 'Member');
            }

            // Fetch tasks
            const tasksData = await axios.get(`${API_BASE_URL}/user_project_tasks/${id}/${project.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
            setTasks(tasksData.data);

            // Fetch timelogs
            const timelogsData = await axios.get(`http://localhost:8000/get_account_timelogs/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
            setTimelogs(timelogsData.data);

            // Calculate total hours from the fetched timelogs
            const total = timelogsData.data.reduce((sum, log) => {
                const startTime = new Date(log.start_time);
                const endTime = new Date(log.end_time);
                const durationHours = (endTime - startTime) / (1000 * 60 * 60);
                return sum + durationHours;
            }, 0);

            setTotalHours(total);

            // Fetch project members
            const membersData = await apiRequest('get', `/get_project_members/${projectId}`);
            setProjectMembers(membersData.filter(member => member.id !== userId));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [id, navigate, project, user, apiRequest, csrfToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleFormVisibility = (formId, isVisible) => {
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = isVisible ? 'block' : 'none';
        }
    };

    const handleReassignTask = async (e) => {
        e.preventDefault();
        
        if (!selectedTask || !selectedMember) {
            alert('Please select both a task and a team member');
            return;
        }

        try {
            await apiRequest('patch', `/get_task/${selectedTask}/`, {
                assigned_to: selectedMember, assigned_by: user.id
            });

            // Update local state
            setTasks(tasks.filter(task => task.id !== parseInt(selectedTask)));
            alert('Task reassigned successfully');
            setSelectedTask('');
            setSelectedMember('');
            toggleFormVisibility('reassignForm', false);
        } catch (error) {
            console.error('Error reassigning task:', error);
            alert('Failed to reassign task');
        }
    };

    const handleRemoveFromProject = async () => {
        if (window.confirm('Are you sure you want to remove this user from the project?')) {
            try {
                // Using the correct endpoint from ManageProjectMembers.jsx
                await axios.post(`${API_BASE_URL}/remove_member_from_project/`, {
                    user_id: id,
                    project_id: project.id
                }, {
                    headers: getAuthHeaders()
                });
                
                alert('User removed from project successfully');
                navigate(`/project/${project.id}`);
            } catch (error) {
                console.error('Error removing user from project:', error);
                alert('Failed to remove user from project');
            }
        }
    };

    const handleRoleChange = async (newRole) => {
        try {
            // Using the correct endpoint from ManageProjectMembers.jsx
            const response = await axios.post(`${API_BASE_URL}/update_project_member_role/`, {
                user_id: id,
                role: newRole,
                project_id: project.id
            }, {
                headers: getAuthHeaders()
            });
            
            if (response.status === 200) {
                const updatedProject = await fetchUpdatedProject(project.id);
                setProject(updatedProject);
                setUserRole(newRole);
                alert('Role updated successfully');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTask((prevTask) => ({
            ...prevTask,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        if (!newTask.task || !newTask.description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await apiRequest('post', '/create_task/', {
                ...newTask,
                project: project.id,
                assigned_to: id,
                assigned_by: user.id
            });

            // Refresh tasks
            const tasksData = await apiRequest('get', `/user_project_tasks/${id}/${project.id}`);
            setTasks(tasksData);

            alert('New task assigned successfully');
            setNewTask({
                task: '',
                description: '',
                due_date: '',
                priority: 'medium'
            });
            toggleFormVisibility('newTaskForm', false);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task');
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const dateTime = new Date(dateTimeString);
        return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}`;
    };

    const calculateHours = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;
        const start = new Date(startTime);
        const end = new Date(endTime);
        return ((end - start) / (1000 * 60 * 60)).toFixed(2);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loader}></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Team Member</h1>
                <div style={styles.breadcrumbs}>
                    <span onClick={() => navigate('/dashboard')} style={styles.breadcrumbLink}>Dashboard</span>
                    <span style={styles.breadcrumbSeparator}>/</span>
                    <span onClick={() => navigate(`/project/${project?.id}`)} style={styles.breadcrumbLink}>{project?.project_name}</span>
                    <span style={styles.breadcrumbSeparator}>/</span>
                    <span style={styles.breadcrumbCurrent}>{user?.username}</span>
                </div>
            </div>

            {/* User Info Card */}
            <div style={styles.section}>
                <div style={styles.userInfoCard}>
                    <div style={styles.userAvatar}>
                        <i className="fas fa-user" style={styles.avatarIcon}></i>
                    </div>
                    <div style={styles.userDetails}>
                        <h2 style={styles.userName}>{user?.username}</h2>
                        <p style={styles.userEmail}>{user?.email}</p>
                        <div style={styles.roleContainer}>
                            <p style={styles.userRoleLabel}>Role:</p>
                            <select
                                value={userRole}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                style={styles.roleSelect}
                                disabled={userRole === 'Project Manager' || userRole === 'General Manager'}
                            >
                                <option value="Project Manager">Project Manager</option>
                                <option value="Admin">Admin</option>
                                <option value="Developer">Developer</option>
                                <option value="Tester">Tester</option>
                                <option value="Maintainer">Maintainer</option>
                                <option value="Member">Member</option>
                            </select>
                        </div>
                        <p style={styles.totalHours}>Total Hours on Project: {totalHours.toFixed(2)}</p>
                    </div>
                    <div style={styles.userActions}>
                        <button
                            style={{...styles.button, ...styles.assignButton}}
                            onClick={() => toggleFormVisibility('newTaskForm', true)}
                        >
                            <i className="fas fa-plus-circle" style={styles.buttonIcon}></i>
                            Assign New Task
                        </button>
                        <button
                            style={{...styles.button, ...styles.removeButton}}
                            onClick={handleRemoveFromProject}
                            disabled={userRole === 'Project Manager'}
                        >
                            <i className="fas fa-user-minus" style={styles.buttonIcon}></i>
                            Remove from Project
                        </button>
                    </div>
                </div>
            </div>

            {/* New Task Form (Initially Hidden) */}
            <div id="newTaskForm" style={{ ...styles.section, display: 'none' }}>
                <h2 style={styles.sectionTitle}>Assign New Task</h2>
                <form onSubmit={handleCreateTask} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Task Title</label>
                        <input
                            type="text"
                            name="task"
                            value={newTask.task}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Enter task title"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            style={styles.textarea}
                            placeholder="Enter task description"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            value={newTask.due_date}
                            onChange={handleInputChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Hours Needed</label>
                        <input
                            type="number"
                            name="hours_needed"
                            value={newTask.hours_needed}
                            onChange={handleInputChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Priority</label>
                        <select
                            name="priority"
                            value={newTask.priority}
                            onChange={handleInputChange}
                            style={styles.select}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div style={styles.formActions}>
                        <button type="submit" style={{...styles.button, ...styles.submitButton}}>Assign Task</button>
                        <button
                            type="button"
                            style={{...styles.button, ...styles.cancelButton}}
                            onClick={() => toggleFormVisibility('newTaskForm', false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Tasks Section */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Assigned Tasks</h2>
                    {tasks.length > 0 && (
                        <button
                            style={{...styles.button, ...styles.reassignButton}}
                            onClick={() => toggleFormVisibility('reassignForm', true)}
                        >
                            <i className="fas fa-exchange-alt" style={styles.buttonIcon}></i>
                            Reassign Task
                        </button>
                    )}
                </div>

                {tasks.length === 0 ? (
                    <div style={styles.emptyState}>
                        <i className="fas fa-clipboard-list" style={styles.emptyStateIcon}></i>
                        <p style={styles.emptyStateText}>No tasks assigned to this user</p>
                        <button
                            style={{...styles.button, ...styles.assignButton}}
                            onClick={() => toggleFormVisibility('newTaskForm', true)}
                        >
                            <i className="fas fa-plus-circle" style={styles.buttonIcon}></i>
                            Assign New Task
                        </button>
                    </div>
                ) : (
                    <div style={styles.cardGrid}>
                        {tasks
                        .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                        .map(task => (
                            <div key={task.id} style={styles.card}>
                                <h3 style={styles.cardTitle}>{task.task}</h3>
                                <p style={styles.cardDescription}>{task.description}</p>
                                <div style={styles.cardFooter}>
                                    <span style={{
                                        ...styles.priorityBadge,
                                        backgroundColor:
                                            task.priority === 'high' ? '#e53e3e' :
                                            task.priority === 'medium' ? '#ed8936' : '#38a169'
                                    }}>
                                        {task.priority}
                                    </span>
                                    {task.due_date && (
                                        <span style={styles.dueDate}>
                                            Due: {formatDateTime(task.due_date)}
                                        </span>
                                    )}
                                </div>
                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.actionButton}
                                        onClick={() => {
                                            setSelectedTask(task.id);
                                            toggleFormVisibility('reassignForm', true);
                                        }}
                                    >
                                        <i className="fas fa-exchange-alt"></i>
                                    </button>
                                    <button
                                        style={styles.actionButton}
                                        onClick={()=>{navigate("/task",{state:{task}})}}
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Logs Section */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Time Logs</h2>
                </div>
                <div style={styles.card}>
                    {timelogs.length === 0 ? (
                        <div style={styles.emptyState}>
                            <i className="fas fa-hourglass-half" style={styles.emptyStateIcon}></i>
                            <p style={styles.emptyStateText}>No time logs recorded for this user</p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.cardFooter}>
                                <h5 style={styles.totalHours}>Total Hours: <span style={styles.totalHoursValue}>{totalHours.toFixed(2)}</span></h5>
                            </div>
                            <div style={styles.cardGrid}>
                                {timelogs.map(log => (
                                    <div key={log.id} style={styles.card}>
                                        <p style={styles.cardDescription}>{log.task_title}</p>
                                        <p style={styles.cardDescription}>{log.description}</p>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.dueDate}>
                                                {formatDateTime(log.start_time)} - {formatDateTime(log.end_time)}
                                            </span>
                                            <span style={styles.totalHours}>
                                                {calculateHours(log.start_time, log.end_time)} hours
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Reassign Task Form (Initially Hidden) */}
            <div id="reassignForm" style={{ ...styles.section, display: 'none' }}>
                <h2 style={styles.sectionTitle}>Reassign Task</h2>
                <form onSubmit={handleReassignTask} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Select Task</label>
                        <select
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            style={styles.select}
                            required
                        >
                            <option value="">Choose a task...</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.task}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Reassign To</label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            style={styles.select}
                            required
                        >
                            <option value="">Choose a team member...</option>
                            {projectMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.formActions}>
                        <button type="submit" style={{...styles.button, ...styles.submitButton}}>Reassign Task</button>
                        <button
                            type="button"
                            style={{...styles.button, ...styles.cancelButton}}
                            onClick={() => toggleFormVisibility('reassignForm', false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px'
    },
    breadcrumbs: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#718096'
    },
    breadcrumbLink: {
        color: '#4299e1',
        cursor: 'pointer',
        textDecoration: 'none'
    },
    breadcrumbSeparator: {
        margin: '0 8px'
    },
    breadcrumbCurrent: {
        color: '#4a5568'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '32px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        margin: 0
    },
    userInfoCard: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center'
    },
    userAvatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#edf2f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarIcon: {
        fontSize: '48px',
        color: '#a0aec0'
    },
    userDetails: {
        flex: '1'
    },
    userName: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '8px'
    },
    userEmail: {
        fontSize: '16px',
        color: '#718096',
        marginBottom: '8px'
    },
    roleContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
    },
    userRoleLabel: {
        fontSize: '16px',
        color: '#4a5568',
        marginRight: '10px'
    },
    roleSelect: {
        padding: '4px 8px',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#4a5568'
    },
    totalHours: {
        fontSize: '16px',
        color: '#4a5568',
        fontWeight: '500'
    },
    userActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    button: {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    buttonIcon: {
        fontSize: '16px'
    },
    assignButton: {
        backgroundColor: '#4299e1'
    },
    removeButton: {
        backgroundColor: '#e53e3e'
    },
    reassignButton: {
        backgroundColor: '#805ad5'
    },
    submitButton: {
        backgroundColor: '#38a169'
    },
    cancelButton: {
        backgroundColor: '#718096'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#4a5568'
    },
    input: {
        padding: '8px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '14px'
    },
    select: {
        padding: '8px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '14px'
    },
    textarea: {
        padding: '8px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '14px',
        minHeight: '100px',
        resize: 'vertical'
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px'
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '8px'
    },
    cardDescription: {
        fontSize: '14px',
        color: '#718096',
        marginBottom: '16px'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    },
    priorityBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        color: 'white'
    },
    dueDate: {
        fontSize: '12px',
        color: '#718096'
    },
    cardActions: {
        display: 'flex',
        gap: '8px'
    },
    actionButton: {
        backgroundColor: '#edf2f7',
        color: '#4a5568',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    emptyState: {
        textAlign: 'center',
        padding: '48px 0'
    },
    emptyStateIcon: {
        fontSize: '48px',
        color: '#a0aec0',
        marginBottom: '16px'
    },
    emptyStateText: {
        fontSize: '16px',
        color: '#718096',
        marginBottom: '24px'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
    },
    loader: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },
    totalHoursValue: {
        fontWeight: '600',
        color: '#2d3748'
    }
};

export default ManageMember;