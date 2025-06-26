import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function Task() {
    const location = useLocation();
    const { task: initialTask } = location.state || {};
    const [task, setTask] = useState(initialTask || {});
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Get task ID either from location state or URL params
    const taskId = task?.id || (location.state && location.state.taskId);

    // Fetch task data
    useEffect(() => {
        const fetchTaskData = async () => {
            if (!taskId) return;

            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await axios.get(`http://localhost:8000/get_task/${taskId}/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    setTask(response.data);
                }
            } catch (error) {
                console.error("Error fetching task data:", error);
            }
        };

        fetchTaskData();
    }, [taskId, refreshTrigger]); // Re-fetch when taskId changes or refreshTrigger is updated

    const handleComment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');
            await axios.post(`http://localhost:8000/task_comment/`,
                {
                    task: task.id, // Make sure to include the task ID
                    comment: comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                }
            );
            setComment('');
            // Refresh task data to show the new comment
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsDone = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');

            const response = await axios.patch(`http://localhost:8000/get_task/${task.id}/`, {
                "implemented": true
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (response.status === 200) {
                console.log("Task marked as done");
                // Increment the refreshTrigger to cause the useEffect to run again
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error marking task as done:", error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Task Details</h1>
            </div>

            <div style={styles.content}>
                <div style={styles.section}>
                    <div style={styles.taskCard}>
                        <div style={styles.header}>
                            <div style={styles.headerContent}>
                                <h1 style={styles.title}>{task.task}</h1>
                                {!task?.implemented && (
                                    <button
                                        onClick={markAsDone}
                                        style={styles.markCompletedButton}
                                    >
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </div>

                        <p style={styles.description}>{task?.description}</p>

                        <div style={styles.metaInfo}>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Assigned by:</span>
                                <span style={styles.value}>{task?.assigned_by_name}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Created:</span>
                                <span style={styles.value}>
                                    {task?.date_created && new Date(task.date_created).toLocaleDateString()}
                                </span>
                            </div>
                            {task?.due_date && (
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Due Date:</span>
                                    <span style={{
                                        ...styles.value,
                                        color: new Date() > new Date(task.due_date) ? '#e53e3e' : '#38a169'
                                    }}>
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {task?.implemented && (
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Updated:</span>
                                    <span style={{
                                        ...styles.value,
                                        color: new Date() > new Date(task.date_updated) ? '#e53e3e' : '#38a169'
                                    }}>
                                        {new Date(task.date_updated).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* <div style={styles.commentsSection}>
                            <h4 style={styles.commentsTitle}>Comments</h4>

                            <form onSubmit={handleComment} style={styles.commentForm}>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    style={styles.commentInput}
                                    placeholder="Add a comment..."
                                    rows="3"
                                />
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                    disabled={loading || !comment.trim()}
                                >
                                    {loading ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>

                            <div style={styles.commentsList}>
                                {task?.comments?.map(comment => (
                                    <div key={comment.id} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <span style={styles.commentAuthor}>{comment.user.username}</span>
                                            <span style={styles.commentDate}>
                                                {new Date(comment.date_created).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={styles.commentText}>{comment.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '32px',
        maxWidth: '1200px',
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
        gap: '24px',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
    },
    taskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    taskTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#2d3748',
        margin: 0,
    },
    description: {
        fontSize: '16px',
        color: '#4a5568',
        marginBottom: '24px',
        lineHeight: '1.6',
    },
    metaInfo: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '32px',
        padding: '16px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '14px',
        color: '#718096',
        fontWeight: '500',
    },
    value: {
        fontSize: '16px',
        color: '#2d3748',
    },
    completedBadge: {
        backgroundColor: '#48bb78',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
    },
    activeBadge: {
        backgroundColor: '#4299e1',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
    },
    commentsSection: {
        marginTop: '32px',
    },
    commentsTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
    },
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
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    markCompletedButton: {
        backgroundColor: '#48bb78',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        hover: {
            backgroundColor: '#38a169'
        }
    }
};

export default Task;
