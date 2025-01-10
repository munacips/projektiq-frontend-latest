import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../components/styles.css'

function IssuePage() {

    const { id } = useParams(); // Get the issue ID from the URL
    const [issue, setIssue] = useState(null); // State to hold issue details
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate();
    const [comments, setComments] = useState([])
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
        <div>
            <header>
                <h1>Issue Tracker</h1>
            </header>
            <main>
                {loading ? (
                    <p>Loading...</p> // Show a loading message while data is being fetched
                ) : issue ? (
                    <>
                        <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', margin: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h2>{issue.issue}</h2>
                            <p>{issue.description}</p>
                            <p>Status: {issue.closed ? 'Closed' : 'Open'}</p>
                        </section>
                        <section>
                            <h3>Comments</h3>
                            <textarea
                                placeholder="Add a comment..."
                                rows="4"
                                style={{ width: '100%', marginBottom: '8px' }}
                                value={newComment}
                                onChange={handleCommentChange}
                            />
                            <button
                                style={{ padding: '8px 16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px' }}
                                onClick={handleCommentSubmit}
                            >
                                Submit
                            </button>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {comments.map((comment, index) => (
                                    <li key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', margin: '8px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <div style={{ fontWeight: 'bold', color: '#007BFF' }}>{comment.user.username}</div> {/* Username */}
                                        <small style={{ color: '#888' }}>{new Date(comment.date_created).toLocaleString()}</small> {/* Date and Time */}
                                        <p style={{ marginTop: '4px' }}>{comment.comment}</p> {/* Comment text */}
                                    </li> // Display each comment
                                ))}
                            </ul>
                        </section>
                    </>
                ) : (
                    <p>Issue not found.</p> // Handle the case where the issue could not be fetched
                )}
            </main>
        </div>
    );

}

export default IssuePage;