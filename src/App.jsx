import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login"
import Project from "./pages/Project";
import Projects from "./pages/Projects";
import IssuePage from "./pages/IssuePage";
import Organization from "./pages/Organization";
import Issues from "./pages/Issues";
import Tasks from "./pages/Tasks";
import Schedule from "./pages/Schedule";
import Chat from "./pages/Chat";
import ChangeRequest from './pages/ChangeRequest';
import NewProject from './pages/NewProject';
import Task from './pages/Task';
import NewIssue from './pages/NewIssue';
import NewChangeRequest from './pages/NewChangeRequest';
import NewMember from './pages/NewMember';

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <SideBar />
        <div style={styles.mainContent}>
          <Routes>
            <Route exact path='/' element={<HomePage />}></Route>
            <Route exact path='/login' element={<Login />}></Route>
            <Route exact path="/project/:id" element={<Project />} />
            <Route exact path="/issue/:id" element={<IssuePage />} />
            <Route exah path='/change_request/:id' element={<ChangeRequest />} /> 
            <Route exact path="/issues" element={<Issues />} />
            <Route exact path="/schedule" element={<Schedule />} />
            <Route exact path="/projects" element={<Projects />} />
            <Route exact path="/organization" element={<Organization />} />
            <Route exact path="/tasks" element={<Tasks />} />
            <Route exact path="/chat" element={<Chat/>}/>
            <Route exact path="/new_project" element={<NewProject />} />
            <Route exact path="/task" element={<Task/>} />
            <Route exact path="/new_issue" element={<NewIssue />} />
            <Route exact path="/new_change_request" element={<NewChangeRequest />} />
            <Route exact path="/new_member" element={<NewMember />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
  },
  mainContent: {
    flexGrow: 1,
    marginLeft: '60px', // Adjust this value to match the width of your SideBar
    overflowY: 'auto',
  },
};

export default App;
