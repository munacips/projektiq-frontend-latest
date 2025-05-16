import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProjectProtectedRoute = ({ children, allowedRoles }) => {
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const project = location.state?.project;
  console.log("ProjectProtectedRoute Project", project);

  if (!userId) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  } else if (!project) {
    // Handle case when project data is missing
    console.error("Project data is missing in location state");
    return <Navigate to="/projects" />;
  } else {
    const user = project.members.find((entry) => entry.account_id == userId);
    console.log("ProjectProtectedRoute user", user);
    const role = user ? user.role : null;
    if (!allowedRoles.includes(role)) {
      console.log("Access denied. User role:", role);
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default ProjectProtectedRoute;