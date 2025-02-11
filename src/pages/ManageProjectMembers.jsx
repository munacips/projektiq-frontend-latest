import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
} from '@mui/material'
import { useProject } from '../components/ProjectContext'

function ManageProjectMembers() {
  const location = useLocation()
  //const project = location.state?.project || {}
  const navigate = useNavigate()
  const accessToken = localStorage.getItem('accessToken')
  const csrfToken = Cookies.get('csrftoken')

  const { project, setProject } = useProject()

  useEffect(() => {
    if (location.state?.project) {
      setProject(location.state.project)
    }
  }, [location.state])

  useEffect(()=>{
    
  },[project, setProject])


  const fetchUpdatedProject = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:8000/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching updated project:', error)
      throw error
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await axios.post("http://localhost:8000/remove_member_from_project/", {
        user_id: memberId,
        project_id: project.id
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      })
      if (response.status === 200) {
        const updatedProject = await fetchUpdatedProject(project.id)
        setProject(updatedProject)
        navigate(`/manage_project_members`,{state : {project : updatedProject }})
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const response = await axios.post("http://localhost:8000/update_project_member_role/", {
        user_id: memberId,
        role: newRole,
        project_id: project.id
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      })
      if (response.status === 200) {
        const updatedProject = await fetchUpdatedProject(project.id)
        // Update local state or trigger a refresh
        setProject(updatedProject)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Project Members</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/new_project_member', { state: { project } })}
        >
          Add Member
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Date Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project?.members?.map((member) => (
              <TableRow key={member.account_id}>
                <TableCell>{member.username}</TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.account_id, e.target.value)}
                    disabled={member.role === 'Project Manager' || member.role === 'General Manager'}
                  >
                    <MenuItem value="Project Manager">Project Manager</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Tester">Tester</MenuItem>
                    <MenuItem value="Maintainer">Maintainer</MenuItem>
                    <MenuItem value="Member">Member</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(member.date_created).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveMember(member.account_id)}
                    disabled={member.role === 'Project Manager'}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default ManageProjectMembers