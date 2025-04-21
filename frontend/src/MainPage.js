import React, { useState, useEffect } from "react";
import { useUpload } from "./UploadContext";
import axios from "axios";
import styles from "./styles/MainPage.module.css";
import Sidebar from "./Sidebar";

const MainPage = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [downloadLink, setDownloadLink] = useState("");
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
    const { setIsFileUploaded } = useUpload();


    useEffect(() => {
        localStorage.removeItem("isFileUploaded");
    }, []);

    const handleMouseEnter = (event, text) => {
        const rect = event.target.getBoundingClientRect();
        setTooltip({
            visible: true,
            text,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Selectează un document Word (.docx) mai întâi.");
            return;
        }

        setMessage("Se procesează documentul...");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(response.data);
            window.alert(response.data);
            const { correctedFile } = response.data;

            // Store corrected file path for analysis
            localStorage.setItem("correctedFilePath", correctedFile);
            localStorage.setItem("isFileUploaded", "true");
            setIsFileUploaded(true);

            // Set download link
            setDownloadLink(`http://localhost:5000/download?file=${correctedFile}&t=${new Date().getTime()}`);

                setMessage("Procesare completă! Acum poți să explorezi statistici detaliate despre text din meniu.");

        } catch (err) {
            console.log(err);
            setMessage("Eroare la procesarea documentului.");
        }
    };

    const grammarCheckingText = "Încarcă un fișier Word (.docx) pentru a-l corecta automat. După procesare, vei putea descărca versiunea corectată și explora statistici detaliate despre stilul și emoțiile din text în meniul din stânga.";

    return (
        <div className={styles.mainContainer}>
            <Sidebar />
            <div className={styles.mainBox}>
                <h2>
                    Corectare gramatical&#259;
                    <span
                        className={styles.infoIcon}
                        onMouseEnter={(e) =>
                            handleMouseEnter(
                                e,
                                grammarCheckingText
                            )
                        }
                        onMouseLeave={handleMouseLeave}
                    >
                        ⓘ
                    </span>
                </h2>
                <input type="file" accept=".docx" onChange={handleFileChange} />
                <button className={styles.uploadButton} onClick={handleUpload}>&#206;ncarc&#259;</button>
                <p>{message}</p>

                {downloadLink && (
                    <a href={downloadLink}>
                        <button className={styles.downloadButton}>Descarc&#259; documentul corectat</button>
                    </a>
                )}

                {tooltip.visible && (
                    <div
                        className={styles.tooltip}
                        style={{
                            top: tooltip.y + window.scrollY,
                            left: tooltip.x,
                            position: "absolute"
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MainPage;

