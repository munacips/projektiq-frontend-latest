import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const tokenUrl = "http://localhost:8000/o/token/";
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
    const grantType = "password";

    const data = new URLSearchParams();
    data.append("grant_type", grantType);
    data.append("username", username);
    data.append("password", password);
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);

    const getUserId = async (username, accessToken) => {
        try {
            const csrfToken = Cookies.get("csrftoken");
            const response = await axios.post(`http://localhost:8000/userid/`, 
                { "username": username },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                }
            );
            
            // Check if the response has the expected structure
            if (response.data && response.data.id) {
                return response.data.id;
            } else {
                throw new Error("User ID not found in response");
            }
        } catch (error) {
            console.error("Error fetching user ID:", error);
            throw error; // Re-throw to allow the calling function to handle it
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(tokenUrl, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                const { access_token, refresh_token } = response.data;
                storeUsername(username);
                storeTokens(access_token, refresh_token);
                const userId = await getUserId(username, access_token);
                localStorage.setItem('userId', userId);
                navigate('/');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 400) {
                    setErrorMessage('Invalid username or password');
                } else if (error.response.data && error.response.data.detail) {
                    setErrorMessage(error.response.data.detail);
                } else {
                    setErrorMessage(`Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                setErrorMessage('No response from server. Please check your connection.');
            } else {
                setErrorMessage(`Error: ${error.message}`);
            }
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Please sign in to continue</p>

                {errorMessage && <div style={styles.error}>{errorMessage}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? (
                            <div style={styles.loadingContainer}>
                                <div style={styles.spinner}></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div style={styles.signupLink}>
                    <p>Don't have an account? <span style={styles.link} onClick={() => navigate('/signup')}>Sign up</span></p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '24px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    button: {
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        opacity: props => props.disabled ? 0.7 : 1,
    },
    error: {
        backgroundColor: '#fff3f3',
        color: '#ff4444',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        borderTopColor: 'white',
        animation: 'spin 1s ease-in-out infinite',
        display: 'inline-block',
    },
    signupLink: {
        marginTop: '20px',
        textAlign: 'center',
    },
    link: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    '@keyframes spin': {
        to: { transform: 'rotate(360deg)' }
    }
};

const storeTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

const storeUsername = (username) => {
    localStorage.setItem('username', username);
};

export default Login;