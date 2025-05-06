import React from 'react'
import { FaClock, FaHome, FaTachometerAlt, FaToolbox, FaTimesCircle, FaScroll } from 'react-icons/fa'
import { FaCheck } from 'react-icons/fa'
import { FaGear, FaMessage } from 'react-icons/fa6'
import SideBarItem from './SideBarItem'
import { colors } from '@mui/material'

function SideBar() {
  return (
    <div>
      <nav style={styling}>
        <SideBarItem item={<FaHome size={30}/>} label={"Home"} url="/"/> <br/>
        <SideBarItem item={<FaGear size={30}/>} label={"Projects"} url = "/projects"/> <br/>
        <SideBarItem item={<FaCheck size={30}/>} label={"Tasks"} url = "/tasks"/> <br/>
        <SideBarItem item={<FaToolbox size={30}/>} label={"Issues"} url = "/issues"/> <br/>
        <SideBarItem item={<FaClock size={30}/>} label={"Schedule"} url = "/schedule"/> <br/>
        <SideBarItem item={<FaMessage size={30}/>} label={"Chat"} url = "/chat"/> <br/>
        <SideBarItem item={<FaScroll size={30}/>} label={"Timelogs"} url = "/timelogs"/> <br/>
        <SideBarItem item={<FaTachometerAlt size={30}/>} label={"Analytics"} url = "/analytics"/> <br/>
      </nav>
    </div>
  )
}

const styling = {
    display: 'block',
    flexDirection : 'column',
    backgroundColor : '#007bff',
    height: '100vw',
    width: 'fit-content',
    listStyleType: 'none',
    textAlign: 'center',
    padding: '0 5px',
    position: 'fixed',
    top: '0',
    left: '0',
    zIndex: '1000',
}

export default SideBar
