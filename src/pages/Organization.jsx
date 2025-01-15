// src/pages/Organization.jsx
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";

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

    const primaryColor = "#4299e1"; // Main purple theme
    const secondaryColor = "#4F46E5";
    
    const handleAddMember = () => {
        // Implement member addition logic
    };

    const handleAddProject = () => {
        // Implement project addition logic
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <div style={styles.headerContent}>
                        <div style={styles.orgTitleSection}>
                            <div style={styles.orgInfo}>
                                <h1 style={styles.orgName}>{organization.name}</h1>
                                <p style={styles.orgDescription}>
                                    {organization.description || "No description available"}
                                </p>
                            </div>
                            <div style={styles.orgActions}>
                                <Tooltip title="Add Member">
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={()=>{navigate('/new_member', { state: { organization } })}}
                                        style={styles.actionButton}
                                    >
                                        Add Member
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Add Project">
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddProject}
                                        style={styles.actionButton}
                                    >
                                        New Project
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>

                        <div style={styles.statsContainer}>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>📊</span>
                                <span style={styles.statNumber}>{organization.active_projects}</span>
                                <span style={styles.statLabel}>Active Projects</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>👥</span>
                                <span style={styles.statNumber}>{organization.total_members}</span>
                                <span style={styles.statLabel}>Team Members</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>🎯</span>
                                <span style={styles.statNumber}>{pendingIssues.length}</span>
                                <span style={styles.statLabel}>Pending Issues</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section style={styles.quickView}>
                    <div style={styles.upcomingSection}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>
                                <span style={styles.titleIcon}>📅</span>
                                Upcoming Projects
                            </h2>
                            <IconButton color="primary">
                                <EditIcon />
                            </IconButton>
                        </div>
                        <div style={styles.upcomingGrid}>
                            {upcomingProjects.map(project => (
                                <div key={project.id} style={styles.upcomingCard}>
                                    <div style={styles.projectHeader}>
                                        <h3 style={styles.projectName}>{project.name}</h3>
                                        <span style={styles.projectStatus(project.status)}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p style={styles.projectDesc}>{project.description}</p>
                                    <div style={styles.projectMeta}>
                                        <span style={styles.metaItem}>
                                            🔄 Updated: {new Date(project.date_updated).toLocaleDateString()}
                                        </span>
                                        <span style={styles.metaItem}>
                                            ⚠️ Issues: {project.issues.length}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.issuesSection}>
                        <h2 style={styles.sectionTitle}>
                            <span style={styles.titleIcon}>⚠️</span>
                            Critical Issues
                        </h2>
                        <div style={styles.issuesGrid}>
                            {pendingIssues.map(issue => (
                                <div key={issue.id} style={styles.issueCard}>
                                    <div style={styles.issuePriority(issue.priority)}>
                                        {issue.priority || 'Medium'}
                                    </div>
                                    <h4 style={styles.issueTitle}>{issue.issue}</h4>
                                    <p style={styles.issueDesc}>{issue.description}</p>
                                    <div style={styles.issueFooter}>
                                        <span style={styles.dueDate}>
                                            Due: {new Date(issue.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={styles.projectsSection}>
                    <h2 style={styles.sectionTitle}>
                        <span style={styles.titleIcon}>📂</span>
                        All Projects
                    </h2>
                    <div style={styles.projectsGrid}>
                        {organization.projects.map(project => (
                            <div key={project.id} style={styles.projectCard}>
                                <div style={styles.projectCardHeader}>
                                    <h3 style={styles.projectCardTitle}>{project.name}</h3>
                                    <span style={styles.projectStatus(project.status)}>
                                        {project.status}
                                    </span>
                                </div>
                                <div style={styles.projectContent}>
                                    <p style={styles.projectCardDesc}>{project.description}</p>
                                    <div style={styles.metricsGrid}>
                                        <div style={styles.metric}>
                                            <span style={styles.metricLabel}>Issues</span>
                                            <span style={styles.metricValue}>{project.issues.length}</span>
                                        </div>
                                        <div style={styles.metric}>
                                            <span style={styles.metricLabel}>Requirements</span>
                                            <span style={styles.metricValue}>{project.requirements.length}</span>
                                        </div>
                                        <div style={styles.metric}>
                                            <span style={styles.metricLabel}>Changes</span>
                                            <span style={styles.metricValue}>{project.change_requests.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        backgroundColor: '#F3F4F6',
        minHeight: '100vh',
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
    },
    header: {
        background: 'linear-gradient(135deg, #4299e1 0%, #4F46E5 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    orgTitleSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
    },
    orgInfo: {
        flex: 1,
    },
    orgName: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '8px',
    },
    orgDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.1rem',
        maxWidth: '600px',
    },
    orgActions: {
        display: 'flex',
        gap: '12px',
    },
    actionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    projectCardTitle:{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333333',
        marginBottom: '12px',
    },
    projectCard: {
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
        },
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    statCard: {
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '4px',
    },
    projectStatus: (status) => ({
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
        background: status === 'Active' ? '#34d399' : '#cbd5e1',
        color: status === 'Active' ? '#064e3b' : '#475569',
    }),
    projectsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        marginTop: '24px',
    },
    projectCardHeader: {
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectCardDesc: {
        fontSize: '1rem',
        color: '#6b7280',
        marginTop: '12px',
        padding: '0 20px',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '16px',
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
    },
    metric: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    metricLabel: {
        fontSize: '0.875rem',
        color: '#64748b',
    },
};

export default Organization;