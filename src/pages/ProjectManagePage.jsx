import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MemberCard from '../components/MemberCard';

function ProjectManagePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state?.project || {}
  console.log("Loading Project data")
  console.log(`Project Data : ${project}`)
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{project.name || 'Project Management'}</h1>
        <div style={styles.buttonGroup}>
          <button style={styles.addButton} onClick={()=>{navigate('/new_project_member',{state : {project}})}}>Add Team Member</button>
          <button style={styles.addButton} onClick={()=>{navigate('/new_issue',{state : {project}})}} >Create Issue</button>
          {/* <button style={styles.addButton}>Add Comment</button> */}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Project Details</h2>
          <div style={styles.detailCard}>
            <p style={styles.description}>{project.description || 'No description available'}</p>
          </div>
        </div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Team Members</h2>
            <div style={styles.grid}>
              {project.members && (
                <>
                  {/* Display Project Manager/Admin first */}
                  {project.members
                    .filter(member => 
                      member.role === 'Project Manager' || member.role === 'Admin'
                    )
                    .map(member => (
                      <MemberCard
                        key={member.account_id}
                        name={member.username}
                        role={member.role}
                      />
                    ))}

                  {/* Display up to 5 other members */}
                  {project.members
                    .filter(member => 
                      member.role !== 'Project Manager' && member.role !== 'Admin'
                    )
                    .slice(0, 5)
                    .map(member => (
                      <MemberCard
                        key={member.account_id}
                        name={member.username}
                        role={member.role}
                      />
                    ))}

                  {/* Show View All button if more than 6 members total */}

                    <button
                      variant="outlined"
                      onClick={() => navigate(`/manage_project_members`,{state : {project}})}
                      style={styles.viewAllButton}
                    >
                      View All Members ({project.members.length})
                    </button>

                </>
              )}
            </div>
          </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Active Issues</h2>
          <div style={styles.grid}>
            {/* Issues cards will go here */}
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  addButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  description: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.6',
    margin: 0,
  },
  viewAllButton: {
    width: '100%',
    height: '100%',
    minHeight: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
export default ProjectManagePage

