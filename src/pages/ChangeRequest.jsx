import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function ChangeRequest() {
    const { id } = useParams();
    const [changeRequest, setChangeRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [shouldFetchComments, setShouldFetchComments] = useState(false);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const accessToken = localStorage.getItem('accessToken');
            const csrfToken = Cookies.get('csrftoken');

            if (!accessToken) {
                setError('Authentication required');
                navigate('/login');
                return;
            }

            await axios.post(
                `http://localhost:8000/change_request/${changeRequest.id}/comments`,
                { comment: newComment },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                }
            );

            setNewComment('');
            setShouldFetchComments(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Error submitting comment');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        const fetchChangeRequest = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const csrfToken = Cookies.get('csrftoken');
                
                if (!accessToken) {
                    setError('Authentication required');
                    navigate('/login');
                    return;
                }
                
                const response = await axios.get(
                    `http://localhost:8000/change_request/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    }
                );
                
                setChangeRequest(response.data);
                console.log('Change request : ',response.data)
                setComments(response.data.comments || []);
                setError(null);
            } catch (error) {
                setError(error.response?.data?.message || 'Error fetching change request');
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchChangeRequest();
    }, [navigate, id]);

    useEffect(() => {
        if (!changeRequest?.id || !shouldFetchComments) return;

        const fetchComments = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const csrfToken = Cookies.get('csrftoken');

                if (!accessToken) {
                    setError('Authentication required');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8000/change_request/${changeRequest.id}/comments`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    }
                );

                setComments(response.data);
                setError(null);
            } catch (error) {
                setError(error.response?.data?.message || 'Error fetching comments');
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setShouldFetchComments(false);
            }
        };

        fetchComments();
    }, [changeRequest?.id, shouldFetchComments, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!changeRequest) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Change request not found.</p>
            </div>
        );
    }
      return (
          <div style={styles.container}>
              <div style={styles.header}>
                  <div style={styles.titleSection}>
                      <h1 style={styles.title}>{changeRequest?.request}</h1>
                      <div style={styles.statusBadge}>
                          {changeRequest?.implemented ? 'Implemented' : 'Pending'}
                      </div>
                  </div>
              </div>

              <div style={styles.grid}>
                  <div style={styles.mainContent}>
                      <section style={styles.section}>
                          <h2 style={styles.sectionTitle}>Request Details</h2>
                          <div style={styles.detailsGrid}>
                              <div style={styles.detailItem}>
                                  <span style={styles.label}>Description</span>
                                  <p style={styles.description}>{changeRequest?.description}</p>
                              </div>
                              <div style={styles.detailItem}>
                                  <span style={styles.label}>Created</span>
                                  <span style={styles.value}>
                                      {new Date(changeRequest?.date_created).toLocaleDateString()}
                                  </span>
                              </div>
                              <div style={styles.detailItem}>
                                  <span style={styles.label}>Last Updated</span>
                                  <span style={styles.value}>
                                      {new Date(changeRequest?.date_updated).toLocaleDateString()}
                                  </span>
                              </div>
                              <div style={styles.detailItem}>
                                  <span style={styles.label}>Project Name</span>
                                  <span style={styles.value}>{changeRequest?.project_name}</span>
                              </div>
                          </div>
                      </section>

                      <section style={styles.section}>
                          <div style={styles.sectionHeader}>
                              <h2 style={styles.sectionTitle}>Comments</h2>
                          </div>
                          <div style={styles.commentForm}>
                              <textarea
                                  placeholder="Add a comment..."
                                  style={styles.commentInput}
                                  value={newComment}
                                  onChange={handleCommentChange}
                              />
                              <button
                                  style={styles.addButton}
                                  onClick={handleCommentSubmit}
                              >
                                  Post Comment
                              </button>
                          </div>
                          <div style={styles.commentsList}>
                              {comments.map((comment, index) => (
                                  <div key={index} style={styles.commentCard}>
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
                      </section>
                  </div>
              </div>
          </div>
      );
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
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#2d3748',
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
    commentForm: {
        marginBottom: '24px',
    },
    commentInput: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '12px',
        minHeight: '100px',
        resize: 'vertical',
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
    },
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    commentCard: {
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    commentAuthor: {
        fontWeight: '600',
        color: '#2d3748',
    },
    commentDate: {
        color: '#718096',
        fontSize: '14px',
    },
    commentText: {
        color: '#4a5568',
        margin: 0,
    },
};

export default ChangeRequest;