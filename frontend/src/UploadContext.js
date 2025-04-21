import React, { createContext, useState, useContext } from "react";

const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    return (
        <UploadContext.Provider value={{ isFileUploaded, setIsFileUploaded }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => useContext(UploadContext);
