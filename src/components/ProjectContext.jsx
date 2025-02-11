import React, { createContext, useState, useContext } from 'react';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);