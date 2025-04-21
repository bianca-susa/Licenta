import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import Sidebar from "./Sidebar";
import styles from "./styles/VocabularyAnalysis.module.css";



const VocabularyAnalysis = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

    useEffect(() => {
        const correctedFilePath = localStorage.getItem("correctedFilePath");
        if (!correctedFilePath) {
            setError("Niciun fișier procesat.");
            return;
        }

        axios.get(`http://localhost:5000/analyze?correctedFile=${correctedFilePath}`)
            .then((response) => {
                console.log(response.data); // Log the response
                setStats(response.data);
            })
            .catch(() => setError("Eroare la preluarea analizei."));
    }, []);

    if (error) return <div className={styles.error}>{error}</div>;
    if (!stats) return <div className={styles.loading}>Se încarcă analiza...</div>;

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

    const {
        word_count,
        unique_words,
        uniqueness_ratio,
        most_common_words,
        filler_words,
        content_words
    } = stats;


    const uniquenessData = {
        labels: ["Cuvinte unice", "Repetiții"],
        datasets: [{
            data: [unique_words || 0, word_count - unique_words || 0],
            backgroundColor: ["#36A2EB", "#FF6384"]
        }]
    };

    const fillerData = {
        labels: ["Cuvinte importante", "Cuvinte de umplutură"],
        datasets: [{
            data: [content_words || 0, filler_words || 0],
            backgroundColor: ["#4CAF50", "#F44336"]
        }]
    };

    const wordCloudColors = [
        "#962d5e", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
        "#1abc9c", "#d35400", "#34495e", "#3dbae9", "#f468c9"
    ];


    const wordCloudData = most_common_words
        .sort((a, b) => b[1] - a[1])
        .map(([word, count]) => ({ text: word, value: count }));

    const wordCountText = "Numărul total de cuvinte din text, incluzând repetițiile.";
    const uniqueWordsText = "Numărul de cuvinte distincte utilizate în text.";
    const uniquenessRatioText = "Procentul de cuvinte unice raportat la numărul total de cuvinte. O rată mai mare sugerează un vocabular mai variat.";
    const uniquenessDataText = "Această diagramă arată proporția dintre cuvintele unice și cele repetate în text.Un număr mai mare de cuvinte unice indică un vocabular mai variat și expresiv.Repetițiile frecvente pot sugera redundanță sau lipsă de diversitate lexicală."; 
    const fillerDataText = "Această diagramă arată proporția dintre cuvintele de conținut (cele care transmit informație reală) și cuvintele de umplutură.Prea multe cuvinte de umplutură pot afecta claritatea și concizia textului.";

    return (
        <div className={styles.analysisContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2>Analiza Vocabularului</h2>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>
                            Număr de cuvinte
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                handleMouseEnter(e, wordCountText)}
                                onMouseLeave={handleMouseLeave}>
                            ⓘ
                            </span>
                        </h3>
                        <p>{word_count}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Număr de cuvinte unice
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, uniqueWordsText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <p>{unique_words}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Rata de unicitate
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, uniquenessRatioText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <p>{uniqueness_ratio}</p>
                    </div>
                </div>

                <div className={styles.charts}>
                    <div className={styles.wordCloud}>
                        <h3>Cele mai folosite cuvinte</h3>

                        {[0, 1, 2, 3].map((rowIdx) => (
                            <div key={rowIdx} className={styles.wordRow}>
                                {wordCloudData.slice(rowIdx * 3, rowIdx * 3 + 3).map((item, i) => (
                                    <span
                                        key={i}
                                        onMouseEnter={(e) => handleMouseEnter(e, `${item.text}: ${item.value} apariții`)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{
                                            fontSize: `${36 - rowIdx * 6}px`,
                                            color: wordCloudColors[rowIdx * 3 + i],
                                            margin: "0 10px",
                                            cursor: "pointer",
                                            position: "relative"
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                ))}
                            </div>
                        ))}

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

                    <div className={styles.chart}>
                        <h3>
                            Raport unicitate
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, uniquenessDataText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Pie data={uniquenessData} />
                    </div>

                    <div className={styles.chart}>
                        <h3>
                            Raport cuvinte de umplutură
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, fillerDataText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Pie data={fillerData} />
                    </div>
                </div>
                </div>
            </div>
    );
};

export default VocabularyAnalysis;
