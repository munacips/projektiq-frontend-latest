import React, { useEffect, useState } from "react";
import axios from 'axios'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import OrganizationCard from "./OrganizationCard";

function MyOrganizations() {

    const [organizations, setOrganizations] = useState([])
    const navigate = useNavigate()
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                const response = await axios.get("http://localhost:8000/my_linked_organizations/", {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });
                console.log("Organizations : ")
                console.log(response.data)
                setOrganizations(response.data);
            } catch (error) {
                console.error('Error fetching organizations:', error);
                if (error.response && error.response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
                    const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
                    if (refreshToken) {
                        try {
                            const refreshResponse = await axios.post(
                                'http://localhost:8000/o/token/',
                                new URLSearchParams({
                                    grant_type: 'refresh_token',
                                    refresh_token: refreshToken,
                                    client_id: clientId, // Replace with your actual client ID
                                    client_secret: clientSecret, // Replace with your actual client secret
                                }),
                                {
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-CSRFToken': csrfToken, // Optional, only include if needed
                                    },
                                }
                            );

                            const newAccessToken = refreshResponse.data.access_token;
                            localStorage.setItem('accessToken', newAccessToken);

                            // Retry fetching projects with the new token
                            fetchOrganizations();
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            navigate('/login');
                        }
                    } else {
                        navigate('/');
                    }

                }
            }
        }
        fetchOrganizations()
    }, [navigate,clientId, clientSecret])
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>My Organizations</h2>
            </div>
            <div style={styles.gridContainer}>
                {organizations.map((org, index) => {
                    return <OrganizationCard key={index} organization={org} />;
                })}
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        margin: 0,
        fontSize: '28px',
        fontWeight: '600',
        color: '#2d3748',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
    },
}

export default MyOrganizations
