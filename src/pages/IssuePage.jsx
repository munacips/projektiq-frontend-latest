import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function IssuePage() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [shouldFetchComments, setShouldFetchComments] = useState(false);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        if (newComment.trim()) {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const csrfToken = Cookies.get('csrftoken');

                if (!accessToken) {
                    console.error('No access token found');
                    navigate('/login');
                    return;
                }

                // Submit the new comment
                await axios.post(`http://localhost:8000/post_issue/${issue.id}`, {
                    comment: newComment,
                }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });

                setNewComment(''); // Clear the input after submission
                setShouldFetchComments(true); // Indicate that comments should be fetched
            } catch (error) {
                console.error('Error submitting comment:', error);
                // Handle error (e.g., show a notification)
            }
        }
    };

    // Fetch initial issue data
useEffect(() => {
    const fetchIssue = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');
            
            if (!accessToken) {
                console.error('No access token found');
                navigate('/login');
                return;
            }
            
            const response = await axios.get(`http://localhost:8000/issues/${id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
            
            setIssue(response.data);
            setComments(response.data['comments']);
        } catch (error) {
            // ... error handling ...
        } finally {
            setLoading(false);
        }
    };
    
    fetchIssue();
}, [navigate, id]);

// Fetch comments only when a new comment is added
useEffect(() => {
    if (!issue || !shouldFetchComments) return; // Don't fetch if no issue or no need to fetch comments

    const fetchComments = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');

            const response = await axios.get(`http://localhost:8000/get_issue_comments/${issue.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setShouldFetchComments(false); // Reset the flag after fetching
        }
    };

    fetchComments();
}, [issue?.id, shouldFetchComments]); // Use shouldFetchComments in the dependency array

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Issue Details</h1>
            </div>

            <div style={styles.content}>
                {loading ? (
                    <p>Loading...</p>
                ) : issue ? (
                    <div style={styles.section}>
                        <div style={styles.taskCard}>
                            <div style={styles.header}>
                                <div style={styles.headerContent}>
                                    <h1 style={styles.title}>{issue.issue}</h1>
                                    {!issue.closed && (
                                        <button style={styles.markCompletedButton}>
                                            Mark as Closed
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p style={styles.description}>{issue.description}</p>

                            <div style={styles.metaInfo}>
                                {/* <div style={styles.infoItem}>
                                    <span style={styles.label}>Created by:</span>
                                    <span style={styles.value}>{issue.created_by}</span>
                                </div> */}
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Created:</span>
                                    <span style={styles.value}>
                                        {new Date(issue.date_created).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Status:</span>
                                    <span style={styles.value}>
                                        {issue.closed ? 'Closed' : 'Open'}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.commentsSection}>
                                <h4 style={styles.commentsTitle}>Comments</h4>

                                <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
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
                                    {comments.map((comment, index) => (
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
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Issue not found.</p>
                )}
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

export default IssuePage;