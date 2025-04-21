// WorkspacePage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from './WorkspaceContext';
import EmotionAnalysis from './EmotionAnalysis'; // Example analysis component

const WorkspacePage = () => {
    const { workspaceId } = useParams(); // Get workspace from URL
    const { workspaces, setWorkspace } = useWorkspace();
    const [correctedFiles, setCorrectedFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (workspaceId && workspaces[workspaceId]) {
            // Load data for the selected workspace
            const { correctedFiles, analysisResults } = workspaces[workspaceId];
            setCorrectedFiles(correctedFiles);
        } else {
            setError('Workspace not found!');
        }
    }, [workspaceId, workspaces]);

    return (
        <div>
            <h1>Workspace: {workspaceId}</h1>
            {error && <p>{error}</p>}
            <h2>Corrected Files</h2>
            <ul>
                {correctedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                ))}
            </ul>

            {/* Display analysis results or other components based on workspace data */}
            <EmotionAnalysis workspaceId={workspaceId} />
        </div>
    );
};

export default WorkspacePage;
