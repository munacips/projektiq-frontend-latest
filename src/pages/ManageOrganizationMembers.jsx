import React, { useState } from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
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
  const organization = location.state.organization
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [newMember, setNewMember] = useState({ username: '', role: 'MEMBER' })
  const [editMember, setEditMember] = useState(null)
  const clientId = process.env.REACT_APP_CLIENT_ID
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET
  const navigate = useNavigate()

  const handleAddMember = () => {
    // API call to add member would go here
    setOpenAddDialog(false)
    setNewMember({ username: '', role: 'MEMBER' })
  }

  const handleRemoveMember = async (memberId) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const csrfToken = Cookies.get('csrftoken')

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

        console.log(response.data) //member removed
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login') //await handleTokenRefresh()
        }
      }
    console.log('Removing member:', memberId)
  }

  const handleRoleChange = (memberId, newRole) => {
    // API call to update member role would go here
    console.log('Updating role for member:', memberId, 'to:', newRole)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Organization Members</h1>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenAddDialog(true)}
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

      {/* Add Member Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newMember.username}
            onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
          />
          <Select
            fullWidth
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="mt-4"
          >
            <MenuItem value="MEMBER">Member</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ManageOrganizationMembers