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
    const [showPhaseForm, setShowPhaseForm] = useState(false);
    const [ganttRefreshTrigger, setGanttRefreshTrigger] = useState(0);

    const handleAddPhase = async (e) => { 
        e.preventDefault();
        const phase = e.target.elements.phase.value;
        const endDate = e.target.elements.endDate.value;
        const date_created = e.target.elements.date_created.value;

        if (!phase || !endDate || !date_created) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');

            await axios.post(`http://localhost:8000/project_history/${project.id}/`, {
                project: project.id,
                status: phase,
                date_created: date_created,
                date_ended: endDate,
                description: phase
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            alert('Phase added successfully');
            setShowPhaseForm(false);

            // Refresh project data to show the new phase
            // and to ensure ProjectGantt can fetch the latest history
            try {
                const response = await axios.get(`http://localhost:8000/project/${id}`, { // Use id from useParams here
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                });
                setProject(response.data);
                // 2. Trigger Gantt chart refresh after project data is updated
                setGanttRefreshTrigger(prevTrigger => prevTrigger + 1);
            } catch (error) {
                console.error('Error refreshing project data after adding phase:', error);
                // Optionally, still trigger Gantt refresh if you think the backend updated
                // but the local project state fetch failed for some reason, though less ideal.
                // setGanttRefreshTrigger(prevTrigger => prevTrigger + 1);
            }

        } catch (error) {
            console.error('Error adding phase:', error);
            alert('Failed to add phase. Check console for details.');
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
            }
        }
    }

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

                await axios.post(`http://localhost:8000/post_project_comment/${project.id}/`, {
                    comment: newComment,
                }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                })

                setNewComment('')
                setShouldFetchComments(true)
            } catch (error) {
                console.error('Error submitting comment:', error)
            }
        }
    }

    useEffect(() => {
        const fetchInitialProjectData = async () => { // Renamed for clarity
            setLoading(true); // Set loading true at the start of fetch
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                const projectResponse = await axios.get(`http://localhost:8000/project/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                });
                setProject(projectResponse.data);
                console.log("Project Data:", projectResponse.data)

                console.log("Fetching initial comments...")
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
                console.error('Error fetching initial project data:', error);
                if (error.response && error.response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    const csrfToken = Cookies.get('csrftoken');
                    if (refreshToken) {
                        try {
                            const refreshResponse = await axios.post('http://localhost:8000/o/token/',
                                { grant_type: 'refresh_token', refresh_token: refreshToken }, // Ensure grant_type is sent if your backend expects it
                                {
                                    headers: {
                                        'Content-Type': 'application/json', // Some token endpoints might prefer 'application/x-www-form-urlencoded'
                                        'X-CSRFToken': csrfToken
                                    }
                                }
                            );
                            const newAccessToken = refreshResponse.data.access_token || refreshResponse.data.access; // Common variations
                            localStorage.setItem('accessToken', newAccessToken);
                            fetchInitialProjectData(); // Retry fetching data
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            navigate('/'); // Or to login
                        }
                    } else {
                        navigate('/'); // Or to login
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        fetchInitialProjectData()
    }, [navigate, id])

    useEffect(() => {
        if (!project || !shouldFetchComments) return;

        const fetchCommentsAgain = async () => { // Renamed for clarity
            try {
                const accessToken = localStorage.getItem('accessToken');
                const csrfToken = Cookies.get('csrftoken');

                // Added check for accessToken similar to other fetches
                if (!accessToken) {
                    console.error('No access token found for fetching comments again');
                    navigate('/login'); // Or handle appropriately
                    return;
                }


                const response = await axios.get(`http://localhost:8000/get_project_comments/${project.id}/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    // withCredentials: true // Generally not needed if using Authorization Bearer token
                });

                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments again:', error);
                 // Handle auth error specifically if needed, similar to initial fetch
                if (error.response && error.response.status === 401) {
                    // Potentially attempt token refresh or navigate to login
                    console.error('Unauthorized while fetching comments again. Consider token refresh.');
                    navigate('/login');
                }
            } finally {
                setShouldFetchComments(false);
            }
        };

        fetchCommentsAgain();
    }, [project, shouldFetchComments, navigate]); // project.id changed to project, to re-run if project object changes

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
                        <button style={styles.addButton} onClick={() => { navigate('/project_management', { state: { project } }) }}>Go To Management</button>
                    </div>
                </div>
                <div style={styles.statusBadge}>
                    {project.status}
                </div>
            </div>
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
                <div>
                    <ProjectGantt projectId={project.id} refreshTrigger={ganttRefreshTrigger} />
                </div>
            </section>

            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Project Phases</h2>
                    {!showPhaseForm && (
                        <button
                            style={styles.addButton}
                            onClick={() => setShowPhaseForm(true)}
                        >
                            + Add Phase
                        </button>
                    )}
                </div>

                {showPhaseForm && (
                    <div style={styles.formContainer}>
                        <form onSubmit={handleAddPhase} style={styles.phaseForm}>
                            {/* ... form fields ... */}
                             <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Project Phase</label>
                                <select name="phase" style={styles.formSelect} defaultValue="" required>
                                    <option value="" disabled>Select a phase</option>
                                    <option value="Requirements">Requirements</option>
                                    <option value="Design">Design</option>
                                    <option value="Development">Development</option>
                                    <option value="Testing">Testing</option>
                                    <option value="Deployment">Deployment</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Start Date</label>
                                <input
                                    type="date"
                                    name="date_created"
                                    style={styles.formInput}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    style={styles.formInput}
                                    required
                                    // min={new Date().toISOString().split('T')[0]} // Consider if min date should be today or linked to start date
                                />
                            </div>
                            {/* ... form actions ... */}
                            <div style={styles.formActions}>
                                <button type="submit" style={styles.submitButton}>
                                    Save Phase
                                </button>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={() => setShowPhaseForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </section>


            {/* ... other sections ... */}
             <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Issues</h2>
                    <button style={styles.addButton} onClick={() => { navigate("/new_issue", { state: { project } }) }} >+ New Issue</button>
                </div>
                <div style={styles.cardGrid}>
                    {project.issues?.map((issue, index) => (
                        <div key={issue.id || index} style={styles.card} onClick={() => navigate(`/issue/${issue.id}`)}>
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
                        <div key={req.id || index} style={styles.card} onClick={() => navigate(`/requirement/${req.id}`)}>
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
                        <div key={request.id || index} style={styles.card} onClick={() => { navigate(`/change_request/${request.id}`) }} >
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
                        style={styles.submitButton} // Ensure this style is defined or use a shared one
                        disabled={!newComment.trim()}
                    >
                        Post Comment
                    </button>
                </form>

                <div style={styles.commentsList}>
                    {comments
                        .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                        .map((comment, index) => (
                            <div key={comment.id || index} style={styles.commentItem}>
                                <div style={styles.commentHeader}>
                                    <span style={styles.commentAuthor}>{comment.user?.username || 'User'}</span> {/* Added optional chaining and fallback */}
                                    <span style={styles.commentDate}>
                                        {new Date(comment.date_created).toLocaleString()}
                                    </span>
                                </div>
                                <p style={styles.commentText}>{comment.comment}</p>
                            </div>
                        ))}
                </div>
            </section>
        </div>
    )
}

// Styles (keep your existing styles here)
const styles = {
    // ... all your existing styles
    container: {
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Example: Adding a more modern font
        //backgroundColor: '#f4f7f6', // A light background for the whole page
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e2e8f0',
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#1a202c', // Darker for better contrast
        marginBottom: '16px',
    },
    organizations: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    orgBadge: {
        backgroundColor: '#e2e8f0', // Lighter badge background
        padding: '6px 14px', // Slightly larger padding
        borderRadius: '16px',
        fontSize: '14px',
        color: '#2d3748', // Darker text
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#4299e1', // Primary color
        color: 'white',
        padding: '10px 20px', // Larger badge
        borderRadius: '8px',
        fontWeight: '600', // Bolder
        fontSize: '14px', // Slightly larger font
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
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
        padding: '28px', // Increased padding
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Softer, more pronounced shadow
        marginBottom: '32px', // Space between sectionsy
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '12px', // Add padding below header
        borderBottom: '1px solid #edf2f7', // Separator line
    },
    sectionTitle: {
        fontSize: '22px', // Larger section title
        fontWeight: '600',
        color: '#1a202c',
        margin: 0,
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Adjusted minmax
        gap: '28px', // Increased gap
        marginTop: '16px',
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: '#f9fafb', // Light background for item
        padding: '16px', // Padding for item
        borderRadius: '8px', // Rounded corners for item
    },
    label: {
        fontSize: '14px',
        color: '#718096', // Gray for label
        fontWeight: '500',
    },
    value: {
        fontSize: '16px',
        color: '#2d3748',
        fontWeight: '500',
    },
    description: {
        fontSize: '16px',
        color: '#4a5568',
        lineHeight: '1.7', // Increased line height
        margin: 0,
        paddingTop: '8px', // Space above description
        whiteSpace: 'pre-wrap', // Preserve line breaks
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Wider cards
        gap: '24px', // Increased gap
    },
    card: {
        backgroundColor: '#ffffff', // Explicit white
        borderRadius: '10px', // More rounded
        padding: '20px', // More padding
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Smooth transition
        '&:hover': { // This won't work directly in JS style objects without a library like JSS or styled-components
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', // Enhanced shadow on hover
        },
    },
    cardTitle: {
        fontSize: '18px', // Larger card title
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '10px', // Increased margin
    },
    cardDescription: {
        fontSize: '14px',
        color: '#718096',
        marginBottom: '16px',
        lineHeight: '1.6', // Better readability
        height: '60px', // Fixed height for description consistency
        overflow: 'hidden', // Hide overflow
        textOverflow: 'ellipsis', // Add ellipsis for overflowed text
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto', // Push footer to bottom if card content varies
    },
    cardStatus: {
        padding: '6px 12px', // Increased padding
        borderRadius: '6px', // More rounded
        fontSize: '12px',
        fontWeight: '600', // Bolder
        color: 'white',
        backgroundColor: '#4299e1', // Default status color
    },
    cardDate: {
        fontSize: '12px',
        color: '#718096',
    },
    addButton: {
        backgroundColor: '#3182ce', // A slightly different blue
        color: 'white',
        border: 'none',
        borderRadius: '8px', // More rounded
        padding: '10px 20px', // More padding
        fontSize: '14px',
        fontWeight: '600', // Bolder
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
        '&:hover': {
            backgroundColor: '#2b6cb0', // Darker on hover
            transform: 'scale(1.02)', // Slight scale effect
        },
         '&:active': {
            transform: 'scale(0.98)', // Slight press effect
        },
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)', // Adjust if you have a fixed header
    },
    loader: {
        border: '5px solid #f3f3f3', // Lighter border
        borderTop: '5px solid #3498db', // Blue color for spinner
        borderRadius: '50%',
        width: '50px', // Larger loader
        height: '50px',
        animation: 'spin 1s linear infinite',
    },
    errorContainer: {
        textAlign: 'center',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 64px)',
    },
    button: { // Generic button, can be used for "Return to Dashboard"
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '20px',
        '&:hover': {
            backgroundColor: '#3182ce',
        },
    },
    // Comment section styles
    commentForm: {
        marginBottom: '24px',
        display: 'flex', // Align items for better layout
        flexDirection: 'column', // Stack textarea and button
        gap: '12px', // Space between textarea and button
    },
    commentInput: {
        width: '100%',
        padding: '14px', // More padding
        borderRadius: '8px', // More rounded
        border: '1px solid #cbd5e0', // Softer border
        fontSize: '14px',
        resize: 'vertical',
        minHeight: '80px', // Minimum height
        boxSizing: 'border-box', // Ensure padding doesn't add to width
    },
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // Increased gap
    },
    commentItem: {
        padding: '20px', // Increased padding
        backgroundColor: '#f8f9fa', // Slightly off-white for comments
        borderRadius: '10px', // More rounded
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)', // Subtle shadow for comments
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        marginBottom: '10px', // Increased margin
    },
    commentAuthor: {
        fontSize: '15px', // Slightly larger
        fontWeight: '600',
        color: '#2d3748',
    },
    commentDate: {
        fontSize: '12px',
        color: '#718096',
    },
    commentText: {
        fontSize: '14px',
        color: '#333', // Darker text for readability
        margin: 0,
        lineHeight: '1.6', // Better line height
        whiteSpace: 'pre-wrap', // Preserve formatting
    },
    // Form styles for adding phase
    formContainer: {
        backgroundColor: '#f8f9fa', // Light background for form area
        borderRadius: '10px',
        padding: '28px', // More padding
        marginTop: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)', // Subtle shadow
    },
    phaseForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // Increased gap between form groups
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    formLabel: {
        fontSize: '14px',
        fontWeight: '600', // Bolder label
        color: '#334155', // Darker label color
    },
    formSelect: {
        padding: '12px 14px', // More padding
        borderRadius: '8px', // More rounded
        border: '1px solid #cbd5e0',
        fontSize: '14px',
        color: '#2d3748',
        backgroundColor: 'white',
        width: '100%', // Full width by default
        boxSizing: 'border-box',
    },
    formInput: {
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e0',
        fontSize: '14px',
        color: '#2d3748',
        width: '100%',
        boxSizing: 'border-box',
    },
    formActions: {
        display: 'flex',
        gap: '16px', // Increased gap
        marginTop: '12px', // Margin above actions
        justifyContent: 'flex-end', // Align buttons to the right
    },
    submitButton: { // Shared style for submit buttons
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
        '&:hover:not(:disabled)': { // Apply hover only if not disabled
            backgroundColor: '#2b6cb0',
            transform: 'scale(1.02)',
        },
         '&:active:not(:disabled)': {
            transform: 'scale(0.98)',
        },
        '&:disabled': { // Style for disabled button
            backgroundColor: '#a0aec0', // Gray out when disabled
            cursor: 'not-allowed',
        }
    },
    cancelButton: {
        backgroundColor: '#e2e8f0',
        color: '#4a5568',
        border: '1px solid #cbd5e0', // Add a light border
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
         '&:hover': {
            backgroundColor: '#cbd5e0', // Darken slightly on hover
            transform: 'scale(1.02)',
        },
        '&:active': {
            transform: 'scale(0.98)',
        },
    },
    // Add keyframes for spin animation if not globally defined
    '@keyframes spin': { // This syntax for keyframes might need a CSS-in-JS library that supports it, or define in a .css file
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    }
};


export default Project