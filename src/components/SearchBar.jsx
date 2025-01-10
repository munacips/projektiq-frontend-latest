import React, { useState } from "react";
import axios from 'axios'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  const navigate = useNavigate()

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      const fetchResults = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken')
          const csrfToken = Cookies.get('csrftoken')

          if (!accessToken) {
            console.error('No access token found')
            navigate('/login')
            return
          }

          const response = await axios.get(`http://localhost:8000/search/?query=${encodeURIComponent(value)}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken // Include CSRF token in headers
            }
          });

          console.log("Suggestions : ")
          setSuggestions(response.data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          if (error.response && error.response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
            const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
            if (refreshToken) {
              try {
                const refreshResponse = await axios.post(
                  'http://localhost:8000/o/token/',
                  new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId, // Replace with your actual client ID
                    client_secret: clientSecret, // Replace with your actual client secret
                  }),
                  {
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'X-CSRFToken': csrfToken, // Optional, only include if needed
                    },
                  }
                );

                const newAccessToken = refreshResponse.data.access_token;
                localStorage.setItem('accessToken', newAccessToken);

                // Retry fetching projects with the new token
                fetchResults();
              } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                navigate('/login');
              }
            } else {
              navigate('/');
            }

          }
        }
      }
      fetchResults()
    } else {
      setSuggestions([]);
    }

  };

  return (
    <div>
      <form action="" style={{ width: '90vw', display: 'flex', alignItems: 'center', padding: ' 10px 10px 0 10px', paddingBottom: '0px', marginBottom: '0px' }}>
        <label htmlFor="search" style={{ display: 'none' }}>
          Search
        </label>
        <input
          type="search"
          name="search"
          id="search"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            outline: 'none'
          }}
          placeholder="Search..."
          value={searchTerm}
          onChange={handleChange}
        />
      </form>
      <div style={styles.suggestions}>
        {suggestions.length > 0 && (
          <ul style={styles.list}>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                style={{...styles.listItem, cursor: 'pointer'}} 
                onClick={() => {
                  switch(suggestion.type) {
                    case 'Project':
                      navigate(`/project/${suggestion.id}`)
                      break
                    case 'Issue':
                      navigate(`/issue/${suggestion.id}`)
                      break
                    case 'Change Request':
                      navigate(`/change_request/${suggestion.id}`)
                      break
                    case 'Organisation':
                      break
                    default:
                      navigate('/')
                  }
                }}
              >
                <strong>{suggestion.type}:</strong> {suggestion.name || suggestion.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const styles = {
  suggestions: {
    overflowY: 'auto',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '5px',
  },
  list: {
    position: 'absolute',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    width: '100%',
    zIndex: 1000,
    padding: '0',
    listStyleType: 'none',
  },
  listItem: {
    display: 'flex',
    padding: '10px',
    fontSize: '0.9em',
    borderBottom: '1px solid #ddd',
  },
  listItemLabel: {
    color: '#007bff',
  },
  listItemHover: {
    background: '#f0f0f0',
    color: '#000',
  },
};


export default SearchBar