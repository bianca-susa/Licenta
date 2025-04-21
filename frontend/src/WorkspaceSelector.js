import React from "react";
import styles from "./styles/WorkspaceSelector.module.css"; // Adjust as needed

const WorkspaceSelector = ({ workspaces, onSelectWorkspace, onCreateWorkspace }) => {
    return (
        <div className={styles.workspaceSelectorContainer}>
            <h3>Selecteaz� Workspace</h3>
            <div className={styles.workspaceList}>
                {workspaces && workspaces.length > 0 ? (
                    workspaces.map((workspace) => (
                        <button
                            key={workspace.id}
                            className={styles.workspaceButton}
                            onClick={() => onSelectWorkspace(workspace.id)}
                        >
                            {workspace.name}
                        </button>
                    ))
                ) : (
                    <p>Nu ai niciun workspace creat. Creeaz� unul pentru a �ncepe.</p>
                )}
            </div>

            <button className={styles.createWorkspaceButton} onClick={onCreateWorkspace}>
                Creeaz� un Workspace Nou
            </button>
        </div>
    );
};

export default WorkspaceSelector;
