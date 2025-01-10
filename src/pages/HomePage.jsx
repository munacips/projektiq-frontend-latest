import React from 'react'
import SearchBar from '../components/SearchBar'
import MyProjects from '../components/MyProjects'
import MyAccount from '../components/MyAccount'
import MyOrganizations from '../components/MyOrganizations'


function HomePage() {
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