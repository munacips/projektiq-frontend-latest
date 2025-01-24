import React, { useState } from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useOrganization } from '../components/OrganizationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'

function ManageOrganizationMembers() {
  const location = useLocation()
  //const organization = location.state.organization
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [newMember, setNewMember] = useState({ username: '', role: 'MEMBER' })
  const [editMember, setEditMember] = useState(null)
  const clientId = process.env.REACT_APP_CLIENT_ID
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET
  const navigate = useNavigate()
  const accessToken = localStorage.getItem('accessToken')
  const csrfToken = Cookies.get('csrftoken')
  
  const { organization, setOrganization } = useOrganization();

  const fetchUpdatedOrganization = async (orgId) => {
    try {
  
      const response = await axios.get(`http://localhost:8000/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching updated organization:', error);
      throw error;
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {

        if (!accessToken) {
          navigate('/login')
          return
        }

        const response = await axios.post("http://localhost:8000/remove_member_from_organization/",{
            user_id: memberId,
            org_id: organization.id
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })
        if (response.status === 200) {
          const updatedOrganization = await fetchUpdatedOrganization(organization.id)
          setOrganization(updatedOrganization)
          console.log(response.data) //member removed
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login') //await handleTokenRefresh()
        }
      }
    console.log('Removing member:', memberId)
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
        if (!accessToken) {
          navigate('/login')
          return
        }

        const response = await axios.post("http://localhost:8000/update_member_role/",{
            user_id: memberId,
            role: newRole,
            org_id: organization.id
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        })
        if (response.status === 200) {
          const updatedOrg = await fetchUpdatedOrganization(organization.id);
          setOrganization(updatedOrg);
        }

        console.log(response.data) //role updated
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login') //await handleTokenRefresh()
        } else {
          console.error('Error updating role:', error)
        }
      }
    console.log('Updating role for member:', memberId, 'to:', newRole)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Organization Members</h1>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/new_member', { state: { organization } })}
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
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organization?.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.username}</TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={member.role === 'Admin'}
                  >
                    <MenuItem value="MEMBER">Member</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="General Manager">General Manager</MenuItem>
                    <MenuItem value="Tester">Tester</MenuItem>
                    <MenuItem value="Maintainer">Maintainer</MenuItem>
                    <MenuItem value="Developer">Developer</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(member.date_created).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {member.approved ? 'Approved' : 'Pending'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={member.role === 'Admin'}
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

export default ManageOrganizationMembers