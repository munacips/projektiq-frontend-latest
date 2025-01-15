import { useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Cookies from 'js-cookie'
import axios from "axios";
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

function NewMember() {
    const location = useLocation();
    const navigate = useNavigate();
    const { organization } = location.state || {};
    const accessToken = localStorage.getItem('accessToken');
    const csrfToken = Cookies.get('csrftoken');
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [role, setRole] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        { value: 'ADMIN', label: 'Administrator' },
        { value: 'MANAGER', label: 'Project Manager' },
        { value: 'MEMBER', label: 'Team Member' },
        { value: 'VIEWER', label: 'Viewer' }
    ];

    const handleUserSearch = async (query) => {
        if (query.length < 2) {
            setUserSuggestions([]);
            return;
        }

        setLoading(true);
        try {
        
            const response = await axios.get(`http://localhost:8000/search_users/?query=${query}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
            console.log("Response: ", response.data);
            if (response.data && Array.isArray(response.data)) {  // Changed this condition
                console.log("Users: ", response.data);
                setUserSuggestions(response.data);  // Directly use response.data since it's already the array
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUserSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        if (!selectedUser || !role) return;

        try {
            const response = await axios.post(`http://localhost:8000/add_member_to_organization/`, {
                org_id: organization.id,
                user_id: selectedUser.id,
                role: role
            },{headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }});

            if (response.status === 201) {
                navigate(`/organization`, {
                    state: { organization }
                });
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'Failed to add member. Please try again.');
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <Paper style={styles.formContainer}>
                <Typography variant="h4" style={styles.title}>
                    Add New Member
                </Typography>
                <Typography variant="subtitle1" style={styles.subtitle}>
                    {organization?.name}
                </Typography>

                {error && (
                    <Alert severity="error" style={styles.errorAlert}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <Autocomplete
                        fullWidth
                        loading={loading}
                        options={userSuggestions}
                        getOptionLabel={(option) => option?.username || ''}
                        onChange={(_, newValue) => setSelectedUser(newValue)}
                        onInputChange={(_, newInputValue) => {
                            handleUserSearch(newInputValue);
                        }}
                        isOptionEqualToValue={(option, value) => 
                            option?.id === value?.id
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Username"
                                variant="outlined"
                                required
                            />
                        )}
                        style={styles.formField}
                    />

                    <FormControl fullWidth style={styles.formField}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            label="Role"
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        style={styles.submitButton}
                        disabled={!selectedUser || !role}
                    >
                        Add Member
                    </Button>
                </form>
            </Paper>
        </div>
    );
}

const styles = {
    pageWrapper: {
        backgroundColor: '#F3F4F6',
        minHeight: '100vh',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    formContainer: {
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        borderRadius: '12px'
    },
    title: {
        color: '#1F2937',
        marginBottom: '8px',
        fontWeight: 600
    },
    subtitle: {
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
    submitButton: {
        backgroundColor: '#4299e1',
        padding: '12px',
        marginTop: '16px',
        '&:hover': {
            backgroundColor: '#3182ce'
        }
    },
    errorAlert: {
        marginBottom: '20px',
        width: '100%'
    }
};

export default NewMember;