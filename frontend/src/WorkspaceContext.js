// WorkspaceContext.js
import React, { createContext, useContext, useState } from 'react';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
    return useContext(WorkspaceContext);
};

export const WorkspaceProvider = ({ children }) => {
    const [workspaceId, setWorkspaceId] = useState(localStorage.getItem("workspaceId") || null); // Use localStorage if available
    const [workspaces, setWorkspaces] = useState(JSON.parse(localStorage.getItem("workspaces")) || []); // Retrieve workspaces from localStorage

    const createWorkspace = (newWorkspace) => {
        const updatedWorkspaces = [...workspaces, newWorkspace];
        setWorkspaces(updatedWorkspaces);
        localStorage.setItem("workspaces", JSON.stringify(updatedWorkspaces)); // Save updated workspaces to localStorage
    };

    return (
        <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId, workspaces, createWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
