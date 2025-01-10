import React from 'react'
import { useNavigate } from 'react-router-dom'

function ProjectCard({ project }) {
    const deadline = new Date(project.project_deadline)
    const isValidDate = !isNaN(deadline.getTime())
    const navigate = useNavigate()
    const isOverdue = new Date() > deadline

    const getStatusColor = (status) => {
        const statusColors = {
            'Requirements': '#3498db',  // Blue
            'Design': '#9b59b6',        // Purple
            'Development': '#f1c40f',   // Yellow
            'Testing': '#e67e22',       // Orange
            'Deployment': '#2ecc71',    // Green
            'Maintenance': '#1abc9c',   // Turquoise
            'Closed': '#95a5a6',        // Gray
            'Cancelled': '#e74c3c',     // Red
            'Other': '#34495e'          // Dark Blue
        }
        return statusColors[status] || '#34495e'
    }

    return (
        <div style={styles.card} onClick={() => navigate(`/project/${project.id}`)}>
            <div style={styles.header}>
                <h3 style={styles.title}>{project.project_name}</h3>
                <div style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(project.project_status),
                    color: '#ffffff'
                }}>
                    {project.project_status}
                </div>
            </div>
            
            <div style={styles.organizations}>
                {project.organization_names.map((org, index) => (
                    <span key={index} style={styles.orgBadge}>{org}</span>
                ))}
            </div>

            <div style={styles.infoSection}>
                <div style={styles.infoRow}>
                    <span style={styles.label}>Project Manager</span>
                    <span style={styles.value}>{project.project_manager}</span>
                </div>
                
                <div style={styles.infoRow}>
                    <span style={styles.label}>Active Members</span>
                    <span style={styles.value}>{project.active_members}</span>
                </div>

                <div style={styles.infoRow}>
                    <span style={styles.label}>Due Date</span>
                    <span style={isOverdue ? styles.overdueDate : styles.dueDate}>
                        {isValidDate ? deadline.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) : 'No date set'}
                    </span>
                </div>

                <div style={styles.infoRow}>
                    <span style={styles.label}>Role</span>
                    <span style={styles.value}>{project.role}</span>
                </div>
            </div>

            <div style={styles.footer}>
                <button style={styles.viewButton}>
                    View Details
                </button>
            </div>
        </div>
    )
}

const styles = {
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#2d3748',
        flex: 1,
    },
    badge: {
        backgroundColor: '#e2e8f0',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#4a5568',
    },
    organizations: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px',
    },
    orgBadge: {
        backgroundColor: '#edf2f7',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#4a5568',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: '#718096',
        fontSize: '14px',
    },
    value: {
        color: '#2d3748',
        fontWeight: '500',
        fontSize: '14px',
    },
    dueDate: {
        color: '#38a169',
        fontWeight: '500',
        fontSize: '14px',
    },
    overdueDate: {
        color: '#e53e3e',
        fontWeight: '500',
        fontSize: '14px',
    },
    footer: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    viewButton: {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#3182ce',
        },
    },
}

export default ProjectCard;