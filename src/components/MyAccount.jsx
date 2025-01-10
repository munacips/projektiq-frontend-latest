import React, { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './Dashboard/DashboardCard';
import './Dashboard.css';

function MyAccount() {
    const [summary, setSummary] = useState({
        total_projects: 0,
        projects_by_status: { on_track: 0, at_risk: 0, delayed: 0 },
        upcoming_tasks_count: 0,
        overdue_tasks_count: 0,
        upcoming_issues_count: 0,
        overdue_issues_count: 0,
        issues_count: 0,
    });
    const navigate = useNavigate();
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                const response = await axios.get("http://localhost:8000/user_project_summary/", {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });
                setSummary(response.data);
            } catch (error) {
                console.error('Error fetching summary:', error);
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
                            fetchSummary();
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
        fetchSummary()
    }, [navigate,clientId, clientSecret])

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Dashboard Overview</h1>
            <div className="dashboard-grid">
                <DashboardCard 
                    icon="📊"
                    title="Projects"
                    mainStat={summary.total_projects}
                    stats={[
                        { dot: true, dotColor: '#4CAF50', label: 'On Track', value: summary.projects_by_status.on_track },
                        { dot: true, dotColor: '#FFC107', label: 'At Risk', value: summary.projects_by_status.at_risk },
                        { dot: true, dotColor: '#F44336', label: 'Delayed', value: summary.projects_by_status.delayed }
                    ]}
                    linkUrl="/projects"
                    linkText="View All Projects →"
                />

                <DashboardCard 
                    icon="✓"
                    title="Tasks"
                    mainStat={summary.total_tasks}
                    stats={[
                        { label: 'Upcoming', value: summary.upcoming_tasks_count },
                        { label: 'Overdue', value: summary.overdue_tasks_count }
                    ]}
                    linkUrl="/tasks"
                    linkText="Manage Tasks →"
                />

                <DashboardCard 
                    icon="⚠️"
                    title="Issues"
                    mainStat={summary.issues_count}
                    stats={[
                        { label: 'Upcoming', value: summary.upcoming_issues_count },
                        { label: 'Overdue', value: summary.overdue_issues_count }
                    ]}
                    linkUrl="/issues"
                    linkText="View Issues →"
                />
            </div>
        </div>
    );
}

export default MyAccount;