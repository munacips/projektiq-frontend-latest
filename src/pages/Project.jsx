import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import ProjectGantt from '../components/ProjectGantt'

function Project() {
    const { id } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [shouldFetchComments, setShouldFetchComments] = useState(false)

    const handleCommentChange = (e) => {
        setNewComment(e.target.value)
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (newComment.trim()) {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                // Submit the new comment
                await axios.post(`http://localhost:8000/post_project_comment/${project.id}/`, {
                    comment: newComment,
                }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                })

                setNewComment('') // Clear the input after submission
                setShouldFetchComments(true) // Indicate that comments should be fetched
            } catch (error) {
                console.error('Error submitting comment:', error)
                // Handle error (e.g., show a notification)
            }
        }
    }

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

                const response = await axios.get(`http://localhost:8000/project/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });

                setProject(response.data);
                console.log(response.data)
                console.log("Fetching Comment now...")

                // Fetch initial comments
                const commentsResponse = await axios.get(`http://localhost:8000/get_project_comments/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                });

                console.log("Comments : ", commentsResponse.data)
                setComments(commentsResponse.data);
            } catch (error) {
                console.error('Error fetching project:', error);
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
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [navigate, id])

    // Fetch comments only when a new comment is added
    useEffect(() => {
        if (!project || !shouldFetchComments) return; // Don't fetch if no project or no need to fetch comments

        const fetchComments = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const csrfToken = Cookies.get('csrftoken');

                const response = await axios.get(`http://localhost:8000/get_project_comments/${project.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    withCredentials: true
                });

                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setShouldFetchComments(false); // Reset the flag after fetching
            }
        };

        fetchComments();
    }, [project?.id, shouldFetchComments, navigate]);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loader}></div>
            </div>
        )
    }

    if (!project) {
        return (
            <div style={styles.errorContainer}>
                <h2>Project not found</h2>
                <button style={styles.button} onClick={() => navigate('/')}>
                    Return to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>{project.project_name}</h1>
                    <div style={styles.organizations}>
                        {project.organization_names.map((org, index) => (
                            <span key={index} style={styles.orgBadge}>{org}</span>
                        ))}
                    </div><br />
                    <div>
                        <button style={styles.addButton} onClick={() => { navigate('/project_management', { state: { project } }) }}>Management</button>
                    </div>
                </div>
                <div style={styles.statusBadge}>
                    {project.status}
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.mainContent}>
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Project Details</h2>
                        <div style={styles.detailsGrid}>
                            <div style={styles.detailItem}>
                                <span style={styles.label}>Project Manager</span>
                                <span style={styles.value}>{project.project_manager}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.label}>Created</span>
                                <span style={styles.value}>{new Date(project.date_created).toLocaleDateString()}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.label}>Last Updated</span>
                                <span style={styles.value}>{new Date(project.date_updated).toLocaleDateString()}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.label}>Description</span>
                                <p style={styles.description}>{project.description}</p>
                            </div>
                        </div>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Project Gantt Chart</h2>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ProjectGantt projectId={project.id} />
                        </div>
                    </section>
                    <section></section>
                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Issues</h2>
                            <button style={styles.addButton} onClick={() => { navigate("/new_issue", { state: { project } }) }} >+ New Issue</button>
                        </div>
                        <div style={styles.cardGrid}>
                            {project.issues?.map((issue, index) => (
                                <div key={index} style={styles.card} onClick={() => navigate(`/issue/${issue.id}`)}>
                                    <h3 style={styles.cardTitle}>{issue.issue}</h3>
                                    <p style={styles.cardDescription}>{issue.description}</p>
                                    <div style={styles.cardFooter}>
                                        <span style={styles.cardStatus}>
                                            {issue.closed ? 'Closed' : 'Open'}
                                        </span>
                                        <span style={styles.cardDate}>
                                            {new Date(issue.date_created).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Requirements</h2>
                            <button style={styles.addButton} onClick={() => { navigate("/new_requirement", { state: { project } }) }} >+ Add Requirement</button>
                        </div>
                        <div style={styles.cardGrid}>
                            {project.requirements?.map((req, index) => (
                                <div key={index} style={styles.card} onClick={() => navigate(`/requirement/${req.id}`)}>
                                    <h3 style={styles.cardTitle}>{req.requirement}</h3>
                                    <p style={styles.cardDescription}>{req.description}</p>
                                    <div style={styles.cardFooter}>
                                        <span style={{
                                            ...styles.cardStatus,
                                            backgroundColor: req.implemented ? '#48bb78' : '#ed8936'
                                        }}>
                                            {req.implemented ? 'Implemented' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Change Requests</h2>
                            <button style={styles.addButton} onClick={() => { navigate("/new_change_request", { state: { project } }) }}>+ New Request</button>
                        </div>
                        <div style={styles.cardGrid}>
                            {project.change_requests?.map((request, index) => (
                                <div key={index} style={styles.card} onClick={() => { navigate(`/change_request/${request.id}`) }} >
                                    <h3 style={styles.cardTitle}>{request.request}</h3>
                                    <p style={styles.cardDescription}>{request.description}</p>
                                    <div style={styles.cardFooter}>
                                        <span style={{
                                            ...styles.cardStatus,
                                            backgroundColor: request.implemented ? '#48bb78' : '#ed8936'
                                        }}>
                                            {request.implemented ? 'Implemented' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Comments Section */}
                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Comments</h2>
                        </div>

                        <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                            <textarea
                                value={newComment}
                                onChange={handleCommentChange}
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                rows="3"
                            />
                            <button
                                type="submit"
                                style={styles.submitButton}
                                disabled={!newComment.trim()}
                            >
                                Post Comment
                            </button>
                        </form>

                        <div style={styles.commentsList}>
                            {comments
                                .sort((a, b) => new Date(b.date_created) - new Date(a.date_created)) // Sort by date, newest first
                                .map((comment, index) => (
                                    <div key={index} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <span style={styles.commentAuthor}>{comment.user.username}</span>
                                            <span style={styles.commentDate}>
                                                {new Date(comment.date_created).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={styles.commentText}>{comment.comment}</p>
                                    </div>
                                ))}
                        </div>                    </section>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
    },
    organizations: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    orgBadge: {
        backgroundColor: '#edf2f7',
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '14px',
        color: '#4a5568',
    },
    statusBadge: {
        backgroundColor: '#4299e1',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: '500',
    },
    grid: {
        display: 'grid',
        gap: '32px',
    },
    mainContent: {
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
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        margin: 0,
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginTop: '16px',
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        color: '#718096',
    },
    value: {
        fontSize: '16px',
        color: '#2d3748',
        fontWeight: '500',
    },
    description: {
        fontSize: '16px',
        color: '#4a5568',
        lineHeight: '1.6',
        margin: 0,
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
        },
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '8px',
    },
    cardDescription: {
        fontSize: '14px',
        color: '#718096',
        marginBottom: '16px',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardStatus: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: '#4299e1',
    },
    cardDate: {
        fontSize: '12px',
        color: '#718096',
    },
    addButton: {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#3182ce',
        },
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
    errorContainer: {
        textAlign: 'center',
        padding: '48px',
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
    },
    // Comment section styles
    commentForm: {
        marginBottom: '24px',
    },
    commentInput: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        marginBottom: '12px',
        fontSize: '14px',
        resize: 'vertical',
    },
    submitButton: {
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
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    commentItem: {
        padding: '16px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    commentAuthor: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2d3748',
    },
    commentDate: {
        fontSize: '12px',
        color: '#718096',
    },
    commentText: {
        fontSize: '14px',
        color: '#4a5568',
        margin: 0,
        lineHeight: '1.5',
    },
}

export default Project