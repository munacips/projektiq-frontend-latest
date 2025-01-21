import React from 'react'
import { useNavigate } from 'react-router-dom'

function OrganizationCard({organization}) {
    const navigate = useNavigate()

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h3 style={styles.title}>{organization.name}</h3>
                <div style={styles.stats}>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Active Projects</span>
                        <span style={styles.statValue}>{organization.active_projects}</span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Members</span>
                        <span style={styles.statValue}>{organization.total_members}</span>
                    </div>
                </div>
            </div>
            
            <div style={styles.footer}>
                <button 
                    style={styles.viewButton} 
                    onClick={() => navigate('/organization', { state: { organization: organization } })}
                >
                    View Organization
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
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
        '&:hover': {
            transform: 'translateY(-4px)',
        },
    },
    header: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
    },
    stats: {
        display: 'flex',
        gap: '24px',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#718096',
    },
    statValue: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#4299e1',
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

export default OrganizationCard
