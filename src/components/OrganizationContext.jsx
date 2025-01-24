import React, { createContext, useState, useContext } from 'react';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);