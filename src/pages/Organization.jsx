// src/pages/Organization.jsx
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

function Organization() {
    const navigate = useNavigate();
    const location = useLocation();
    const { organization } = location.state || {};
    const [upcomingProjects, setUpcomingProjects] = useState([]);
    const [pastProjects, setPastProjects] = useState([]);
    const [pendingIssues, setPendingIssues] = useState([]);

    useEffect(() => {
        if (organization) {
            const today = new Date();
            const upcoming = [];
            const past = [];
            const issues = [];

            organization.projects.forEach(project => {
                const projectDeadline = new Date(project.date_updated);
                if (projectDeadline > today) {
                    upcoming.push(project);
                } else {
                    past.push(project);
                }

                project.issues.forEach(issue => {
                    if (issue.due_date) {
                        const issueDueDate = new Date(issue.due_date);
                        if (issueDueDate > today && issueDueDate <= new Date(today.setDate(today.getDate() + 7))) {
                            issues.push(issue);
                        }
                    }
                });
            });

            setUpcomingProjects(upcoming);
            setPastProjects(past);
            setPendingIssues(issues);
        }
    }, [organization]);

    
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{organization.name}</h1>
            <p style={styles.text}>Rating: {organization.rating}</p>
            <p style={styles.text}>Active Projects: {organization.active_projects}</p>
            <p style={styles.text}>Total Members: {organization.total_members}</p>

            <h2 style={styles.sectionTitle}>All Projects</h2>
            <ul style={styles.list}>
                {organization.projects.map(project => (
                    <li key={project.id} style={styles.item}>
                        <strong>{project.name}</strong>: {project.description} <br />
                        <em>Status: {project.status}</em>
                        <h3 style={styles.sectionTitle}>Issues</h3>
                        <ul style={styles.list}>
                            {project.issues.length > 0 ? (
                                project.issues.map(issue => (
                                    <li key={issue.id} style={styles.item}>
                                        <strong>{issue.issue}</strong>: {issue.description}
                                    </li>
                                ))
                            ) : (
                                <li style={styles.item}>No issues reported.</li>
                            )}
                        </ul>
                        <h3 style={styles.sectionTitle}>Requirements</h3>
                        <ul style={styles.list}>
                            {project.requirements.length > 0 ? (
                                project.requirements.map(req => (
                                    <li key={req.id} style={styles.item}>
                                        <strong>{req.requirement}</strong>: {req.description} (Implemented: {req.implemented ? 'Yes' : 'No'})
                                    </li>
                                ))
                            ) : (
                                <li style={styles.item}>No requirements listed.</li>
                            )}
                        </ul>
                        <h3 style={styles.sectionTitle}>Change Requests</h3>
                        <ul style={styles.list}>
                            {project.change_requests.length > 0 ? (
                                project.change_requests.map(req => (
                                    <li key={req.id} style={styles.item}>
                                        <strong>{req.request}</strong>: {req.description} (Implemented: {req.implemented ? 'Yes' : 'No'})
                                    </li>
                                ))
                            ) : (
                                <li style={styles.item}>No change requests made.</li>
                            )}
                        </ul>
                    </li>
                ))}
            </ul>

            <h2 style={styles.sectionTitle}>Upcoming Projects (Next 7 Days)</h2>
            <ul style={styles.list}>
                {upcomingProjects.map(project => (
                    <li key={project.id} style={styles.item}>{project.name}</li>
                ))}
            </ul>

            <h2 style={styles.sectionTitle}>Past Projects</h2>
            <ul style={styles.list}>
                {pastProjects.map(project => (
                    <li key={project.id} style={styles.item}>{project.name}</li>
                ))}
            </ul>

            <h2 style={styles.sectionTitle}>Pending Issues (Next 7 Days)</h2>
            <ul style={styles.list}>
                {pendingIssues.map(issue => (
                    <li key={issue.id} style={styles.item}>{issue.issue}: {issue.description}</li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '2em',
        color: '#333',
    },
    text: {
        fontSize: '1.2em',
        color: '#666',
    },
    sectionTitle: {
        marginTop: '20px',
        fontSize: '1.5em',
        color: '#444',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
    item: {
        padding: '10px',
        margin: '5px 0',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
    itemHover: {
        backgroundColor: '#f0f0f0',
    },
};

export default Organization;