import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const OrganizationProtectedRoute = ({ children, allowedRoles }) => {
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const organization = location.state?.organization;
  console.log("OrganizationProtectedRoute Project", organization);

  if (!userId) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  } else if (!organization) {
    // Handle case when organization data is missing
    console.error("Organization data is missing in location state");
    return <Navigate to="/" />;
  } else {
    const user = organization.members.find((entry) => entry.account_id == userId);
    console.log("OrganizationProtectedRoute user", user);
    const role = user ? user.role : null;
    if (!allowedRoles.includes(role)) {
      console.log("Access denied. User role:", role);
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default OrganizationProtectedRoute;