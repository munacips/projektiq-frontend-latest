import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MemberCard from '../components/MemberCard';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Alert
} from "@mui/material";

function ProjectManagePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state?.project || {}
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgSuggestions, setOrgSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgName, setOrgName] = useState('');
  const accessToken = localStorage.getItem('accessToken');
  const csrfToken = Cookies.get('csrftoken');

  console.log("Loading Project data")
  console.log(`Project Data : ${project}`)


  const handleOrgSearch = async (code) => {
    if (code.length !== 8) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/search_organizations/?query=${code}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });
      
      if (response.data && response.data.id) {
        setSelectedOrg(response.data);
        setOrgName(response.data.name);
      } else {
        setSelectedOrg(null);
        setOrgName('');
        setError('No organization found with this code');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setSelectedOrg(null);
      setOrgName('');
      setError('Error searching for organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedOrg ) return;

    try {
      const response = await axios.post(`http://localhost:8000/invite_organization_to_project/`, {
        project_id: project.id,
        organization_id: selectedOrg.id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });

      if (response.status === 201) {
        setShowOrgModal(false);
        // Refresh project data

        alert('Organization invited successfully');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to invite organization. Please try again.');
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{project.name || 'Project Management'}</h1>
        <div style={styles.buttonGroup}>
          <button style={styles.addButton} onClick={()=>{navigate('/project_logs',{state : {project}})}}>Project Logs</button>
          <button style={styles.addButton} onClick={()=>{navigate('/new_project_member',{state : {project}})}}>Add Team Member</button>
          <button style={styles.addButton} onClick={()=>{navigate('/new_issue',{state : {project}})}} >Create Issue</button>
          <button style={styles.addButton} onClick={()=>{navigate('/new_task',{state : {project}})}} >Create Task</button>
          <button style={styles.addButton} onClick={()=> setShowOrgModal(true)} >Invite Organisation</button>

          {/* <button style={styles.addButton}>Add Comment</button> */}
        </div>
      </div>

      <div style={{
        ...styles.orgModal,
        display: showOrgModal ? 'flex' : 'none'
      }}>
        <div style={styles.modalOverlay} onClick={() => setShowOrgModal(false)}></div>
        <Paper style={styles.formContainer}>
          <Typography variant="h4" style={styles.modalTitle}>
            Invite Organization
          </Typography>
          <Typography variant="subtitle1" style={styles.modalSubtitle}>
            {project?.name}
          </Typography>

          {error && (
            <Alert severity="error" style={styles.errorAlert}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <TextField
              fullWidth
              label="Organization Code"
              variant="outlined"
              value={orgCode || ''}
              onChange={(e) => {
                const code = e.target.value;
                setOrgCode(code);
                if (code.length === 8) {
                  handleOrgSearch(code);
                } else {
                  setSelectedOrg(null);
                  setOrgName('');
                }
              }}
              required
              style={styles.formField}
            />
            
            <TextField
              fullWidth
              label="Organization Name"
              variant="outlined"
              value={orgName || ''}
              disabled
              style={styles.formField}
            />

            <div style={styles.buttonContainer}>
              <Button
                variant="outlined"
                onClick={() => setShowOrgModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                style={styles.submitButton}
                disabled={!selectedOrg }
              >
                Invite Organization
              </Button>
            </div>
          </form>
        </Paper>
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
            {project.issues && project.issues.length > 0 ? (
              project.issues
                .filter(issue => issue.status !== 'Closed' && issue.status !== 'Resolved')
                .map(issue => (
                  <div key={issue.id} style={styles.card} onClick={() => navigate(`/issues/${issue.id}`)}>
                    <div style={styles.cardHeader}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(issue.status)
                      }}>
                        {issue.status}
                      </span>
                      <span style={styles.priorityBadge}>
                        {issue.priority}
                      </span>
                    </div>
                    <h3 style={styles.cardTitle}>{issue.title}</h3>
                    <p style={styles.cardDescription}>
                      {issue.description.length > 100 
                        ? `${issue.description.substring(0, 100)}...` 
                        : issue.description}
                    </p>
                    <div style={styles.cardFooter}>
                      <div style={styles.assigneeInfo}>
                        <span style={styles.assigneeAvatar}>
                          {issue.assigned_to ? issue.assigned_to.username.charAt(0).toUpperCase() : '?'}
                        </span>
                        <span style={styles.assigneeName}>
                          {issue.assigned_to ? issue.assigned_to.username : 'Unassigned'}
                        </span>
                      </div>
                      <span style={styles.dueDate}>
                        {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div style={styles.emptyState}>
                <p>No active issues for this project</p>
                <button 
                  style={styles.createButton}
                  onClick={() => navigate(`/projects/${project.id}/create-issue`)}
                >
                  Create New Issue
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  if (!status) return '#718096'; // Default gray for undefined status

  switch (status.toLowerCase()) {
    case 'in progress':
      return '#3182ce'; // Blue
    case 'todo':
      return '#718096'; // Gray
    case 'blocked':
      return '#e53e3e'; // Red
    case 'review':
      return '#d69e2e'; // Yellow
    case 'testing':
      return '#8a5cf6'; // Purple
    default:
      return '#718096'; // Default gray
  }
};

const styles = {
  orgModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    borderRadius: '12px',
    zIndex: 1001,
    position: 'relative',
  },
  modalTitle: {
    color: '#1F2937',
    marginBottom: '8px',
    fontWeight: 600
  },
  modalSubtitle: {
    color: '#6B7280',
    marginBottom: '24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formField: {
    marginBottom: '16px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px',
  },
  submitButton: {
    backgroundColor: '#4299e1',
    padding: '12px 24px',
    '&:hover': {
      backgroundColor: '#3182ce'
    }
  },
  cancelButton: {
    padding: '12px 24px',
  },
  errorAlert: {
    marginBottom: '20px',
    width: '100%'
  },
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  assigneeInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#4299e1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    marginRight: '8px',
  },
  assigneeName: {
    fontSize: '12px',
    color: '#666',
  },
  dueDate: {
    fontSize: '12px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    gridColumn: '1 / -1',
  },
  createButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#3182ce',
    },
  },
}

export default ProjectManagePage
