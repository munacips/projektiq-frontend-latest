import React, { useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import MyProjects from '../components/MyProjects'
import MyAccount from '../components/MyAccount'
import MyOrganizations from '../components/MyOrganizations'
import { useNavigate } from 'react-router-dom'


function HomePage() {

  const navigate = useNavigate();

  useEffect(()=>{
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      navigate('/login')
    }
  })

  return (
    <div>
      <SearchBar/>
      <div className="main">
        <MyAccount/>
        <MyProjects/>
        <MyOrganizations/>
      </div>
    </div>
  )
}

export default HomePage