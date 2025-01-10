import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Issues() {

    const [issues, setIssues] = useState(null); // State to hold issues details
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const markAsDone = async (id) => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const csrfToken = Cookies.get('csrftoken')
            const response = await axios.put(`http://localhost:8000/my_issues/`, 
                {
                    id: id 
                }, 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                }
            );
            
            if (response.status === 200) {
                window.alert("Marked as done!")
                setKey(prevKey => prevKey + 1);
            }
        } catch (error) {
            console.log("Error updating issue, ", error)
        }
    }


    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken')
                const csrfToken = Cookies.get('csrftoken')

                if (!accessToken) {
                    console.error('No access token found')
                    navigate('/login')
                    return
                }

                const response = await axios.get(`http://localhost:8000/my_issues/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                    }
                });

                setIssues(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching issues:', error);
                if (error.response && error.response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
                    const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
                    if (refreshToken) {
                        try {
                            const refreshResponse = await axios.post('http://localhost:8000/o/token/',
                                { refresh_token: refreshToken },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': csrfToken // Include CSRF token in headers
                                    }
                                }
                            );

                            const newAccessToken = refreshResponse.data.access;
                            localStorage.setItem('accessToken', newAccessToken);

                            fetchIssues();
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            navigate('/');
                        }
                    } else {
                        navigate('/');
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        fetchIssues()
    }, [navigate,key])

    return (
        <div style={styles.container}>
            {loading ? (
                <p style={styles.loading}>Loading issues...</p>
            ) : (
                <>
                    <h1>Issues</h1>
                    <ul style={styles.taskList}>
                        {issues && issues.length > 0 ? (
                            issues
                                .filter(issue => !issue.closed) // Filter out implemented issues
                                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                .map(issue => (
                                <li key={issue.id} style={styles.taskItem}>
                                    <b>{issue.issue}</b> <i>{issue.project_name}</i><br />
                                    <small>{issue.description}</small><br />
                                    <small>Assigned by : {issue.assigned_by} on {new Date(issue.date_created).toDateString()}</small><br />
                                    <small><i>{issue.attendants_names.join(', ')}</i></small><br />
                                    {new Date() > new Date(issue.due_date) ? (
                                        <small style={styles.due}>Due date : {new Date(issue.due_date).toDateString()}</small>
                                    ) : (
                                        <small style={styles.notdue} >Due date : {new Date(issue.due_date).toDateString()}</small>
                                    )} <br />
                                    <button style={styles.button} onClick={()=>{markAsDone(issue.id)}} >Mark as done</button> <button style={styles.button} onClick={()=>{navigate(`/issue/${issue.id}`)}}>Open</button>
                                </li>
                            ))
                        ) : (
                            <p style={styles.noTasks}>No issues available.</p>
                        )}
                    </ul>
                    <h2>Issues Done</h2>
                    <ul style={styles.taskList}>
                        {issues && issues.length > 0 ? (
                            issues
                                .filter(issue => issue.closed) // Filter out implemented issues
                                .sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated))
                                .map(issue => (
                                <li key={issue.id} style={styles.taskItem}>
                                    <b>{issue.issue}</b> <i>{issue.project_name}</i><br />
                                    <small>{issue.description}</small><br />
                                    <small>Assigned by : {issue.assigned_by} on {new Date(issue.date_created).toDateString()}</small><br />
                                    <small>Done on : {new Date(issue.date_updated).toDateString()}</small><br />
                                    <button style={styles.button} onClick={()=>{navigate(`/issue/${issue.id}`)}}>Open</button>
                                
                                </li>
                            ))
                        ) : (
                            <p style={styles.noTasks}>No issues available.</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    )
}
const issue  = {
    "id": 3,
    "issue": "No Total",
    "description": "No Total",
    "project": 3,
    "project_name": "Loan Management",
    "date_created": "2024-11-21T09:18:48.021347Z",
    "date_updated": "2024-11-21T09:18:48.021347Z",
    "assigned_to": null,
    "attendants": [
        1
    ],
    "attendants_names": [
        "munacips"
    ],
    "due_date": null,
    "assigned_by": null,
    "closed": false,
    "comments": [
        {
            "id": 19,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "tttt",
            "date_created": "2024-11-27T09:24:40.538844Z",
            "date_updated": "2024-11-27T09:24:40.538844Z"
        },
        {
            "id": 18,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "hello",
            "date_created": "2024-11-27T09:22:47.480398Z",
            "date_updated": "2024-11-27T09:22:47.480398Z"
        },
        {
            "id": 17,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "Hie, How are you",
            "date_created": "2024-11-27T09:22:38.270250Z",
            "date_updated": "2024-11-27T09:22:38.270250Z"
        },
        {
            "id": 16,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "Hie, How are you",
            "date_created": "2024-11-27T09:17:22.417434Z",
            "date_updated": "2024-11-27T09:17:22.417434Z"
        },
        {
            "id": 15,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "HIe",
            "date_created": "2024-11-27T09:14:32.944445Z",
            "date_updated": "2024-11-27T09:14:32.944445Z"
        },
        {
            "id": 14,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "tyy",
            "date_created": "2024-11-27T09:12:16.686395Z",
            "date_updated": "2024-11-27T09:12:16.686395Z"
        },
        {
            "id": 13,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "bhe",
            "date_created": "2024-11-27T09:11:37.598254Z",
            "date_updated": "2024-11-27T09:11:37.598254Z"
        },
        {
            "id": 12,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "ui",
            "date_created": "2024-11-27T09:08:07.725927Z",
            "date_updated": "2024-11-27T09:08:07.725927Z"
        },
        {
            "id": 11,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "ui",
            "date_created": "2024-11-27T09:07:10.855746Z",
            "date_updated": "2024-11-27T09:07:10.855746Z"
        },
        {
            "id": 10,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "yoooooooo",
            "date_created": "2024-11-27T09:03:52.513652Z",
            "date_updated": "2024-11-27T09:03:52.513652Z"
        },
        {
            "id": 9,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "ee",
            "date_created": "2024-11-27T08:33:52.571528Z",
            "date_updated": "2024-11-27T08:33:52.571528Z"
        },
        {
            "id": 8,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "hello, Jussie",
            "date_created": "2024-11-27T08:25:50.366196Z",
            "date_updated": "2024-11-27T08:25:50.366196Z"
        },
        {
            "id": 7,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "Hello, how are you, wahala:",
            "date_created": "2024-11-27T08:19:45.266777Z",
            "date_updated": "2024-11-27T08:19:45.266777Z"
        },
        {
            "id": 6,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "Hello, how are you, wahala, 99999",
            "date_created": "2024-11-27T08:19:13.294793Z",
            "date_updated": "2024-11-27T08:19:13.294793Z"
        },
        {
            "id": 5,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "When was this logged here",
            "date_created": "2024-11-27T07:40:42.221120Z",
            "date_updated": "2024-11-27T07:40:42.221120Z"
        },
        {
            "id": 1,
            "parent": null,
            "issue": {
                "id": 3,
                "issue": "No Total",
                "description": "No Total",
                "date_created": "2024-11-21T09:18:48.021347Z",
                "date_updated": "2024-11-21T09:18:48.021347Z",
                "due_date": null,
                "closed": false,
                "project": 3,
                "assigned_to": null,
                "assigned_by": null,
                "attendants": [
                    1
                ]
            },
            "user": {
                "id": 1,
                "password": "pbkdf2_sha256$870000$q2njwf33Cym3wd4p9wwdN6$xe6QvrbRbcx6xYn5Td9Emygfa8P36ooJvbPlruiKL2E=",
                "last_login": "2024-12-02T06:22:50.469881Z",
                "is_superuser": true,
                "username": "munacips",
                "first_name": "",
                "last_name": "",
                "email": "munacips@gmail.com",
                "is_staff": true,
                "is_active": true,
                "date_joined": "2024-10-28T06:57:36.191981Z",
                "phone_number": null,
                "date_of_birth": null,
                "groups": [],
                "user_permissions": []
            },
            "comment": "Can you please elaborate",
            "date_created": "2024-11-27T07:33:56.456289Z",
            "date_updated": "2024-11-27T07:33:56.456289Z"
        }
    ]
}
const styles = {
    due: {
        textDecoration: 'line-through',
        color: 'red'
    },
    notdue: {
        color: 'green'
    },
    container: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    loading: {
        fontSize: '18px',
        color: '#555',
    },
    taskList: {
        listStyleType: 'none',
        padding: 0,
    },
    taskItem: {
        padding: '10px',
        margin: '5px 0',
        backgroundColor: '#fff',
        borderRadius: '3px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    noTasks: {
        color: '#888',
        fontStyle: 'italic',
    },
    button: {
        marginTop: 'auto',
        padding: '5px 10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none'
    },
};



export default Issues
