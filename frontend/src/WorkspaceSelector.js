import React from "react";
import styles from "./styles/WorkspaceSelector.module.css"; // Adjust as needed

const WorkspaceSelector = ({ workspaces, onSelectWorkspace, onCreateWorkspace }) => {
    return (
        <div className={styles.workspaceSelectorContainer}>
            <h3>Selecteazã Workspace</h3>
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
                    <p>Nu ai niciun workspace creat. Creeazã unul pentru a începe.</p>
                )}
            </div>

            <button className={styles.createWorkspaceButton} onClick={onCreateWorkspace}>
                Creeazã un Workspace Nou
            </button>
        </div>
    );
};

export default WorkspaceSelector;
