//import React, { useState, useEffect } from "react";
//import { useUpload } from "./UploadContext";
//import { Link } from "react-router-dom";
//import styles from "./styles/Sidebar.module.css";

//const Sidebar = () => {
//    const [isVisible, setIsVisible] = useState(false);
//    const { isFileUploaded } = useUpload();

//    useEffect(() => {
//        const uploaded = localStorage.getItem("isFileUploaded") === "true";
//        setIsFileUploaded(uploaded);
//    }, []);

//    return (
//        <div
//            className={`${styles.sidebar} ${isVisible ? styles.show : styles.hide}`}
//            onMouseEnter={() => setIsVisible(true)}
//            onMouseLeave={() => setIsVisible(false)}
//        >
//            <div className={`${styles.sidebarLabel} ${isVisible ? styles.hidden : styles.visible}`}>
//                Meniu
//            </div>

//            <h2>Meniu</h2>
//            <ul>
//                <li><Link to="/main">Pagina principal&#259;</Link></li>
//                <li className={!isFileUploaded ? styles.disabled : ""}>
//                    {isFileUploaded ? <Link to="/analysis">Analiza narativ&#259;</Link> : <span>Analiza narativ&#259;</span>}
//                </li>
//                <li className={!isFileUploaded ? styles.disabled : ""}>
//                    {isFileUploaded ? <Link to="/vocabulary">Analiza vocabularului</Link> : <span>Analiza vocabularului</span>}
//                </li>
//                <li className={!isFileUploaded ? styles.disabled : ""}>
//                    {isFileUploaded ? <Link to="/emotion">Analiza emoțională</Link> : <span>Analiza emoțională</span>}
//                </li>
//            </ul>
//        </div>
//    );
//};

//export default Sidebar;


import React, { useState, useEffect } from "react";
import { useUpload } from "./UploadContext";
import { Link } from "react-router-dom";
import styles from "./styles/Sidebar.module.css";

const Sidebar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isFileUploaded, setIsFileUploaded } = useUpload(); 

    useEffect(() => {
        const uploaded = localStorage.getItem("isFileUploaded") === "true";
        setIsFileUploaded(uploaded);
    }, [setIsFileUploaded]);

    return (
        <div
            className={`${styles.sidebar} ${isVisible ? styles.show : styles.hide}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div className={`${styles.sidebarLabel} ${isVisible ? styles.hidden : styles.visible}`}>
                Meniu
            </div>

            <h2>Meniu</h2>
            <ul>
                <li><Link to="/main">Pagina principal&#259;</Link></li>

                <li className={!isFileUploaded ? styles.disabled : ""}>
                    {isFileUploaded ? (
                        <Link to="/analysis">Analiza narativ&#259;</Link>
                    ) : (
                        <span>Analiza narativ&#259;</span>
                    )}
                </li>

                <li className={!isFileUploaded ? styles.disabled : ""}>
                    {isFileUploaded ? (
                        <Link to="/vocabulary">Analiza vocabularului</Link>
                    ) : (
                        <span>Analiza vocabularului</span>
                    )}
                </li>

                <li className={!isFileUploaded ? styles.disabled : ""}>
                    {isFileUploaded ? (
                        <Link to="/emotion">Analiza emoțională</Link>
                    ) : (
                        <span>Analiza emoțională</span>
                    )}
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
