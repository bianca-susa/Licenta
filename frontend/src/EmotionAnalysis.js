import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "./Sidebar";
import styles from "./styles/EmotionAnalysis.module.css";

const EmotionAnalysis = () => {
    const [emotionData, setEmotionData] = useState(null);
    const [error, setError] = useState("");
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

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

    useEffect(() => {
        const correctedFilePath = localStorage.getItem("correctedFilePath");
        if (!correctedFilePath) {
            setError("Fișier corectat lipsă.");
            return;
        }

        axios.get(`http://localhost:5000/analyze?correctedFile=${correctedFilePath}`)
            .then((response) => {
                if (response.data.emotion_analysis) {
                    setEmotionData(response.data.emotion_analysis);
                } else {
                    setError("Datele emoționale lipsesc din analiză.");
                }
            })
            .catch(() => setError("Eroare la preluarea datelor emoționale."));
    }, []);

    if (error) return <div className={styles.error}>{error}</div>;
    if (!emotionData) return <div className={styles.loading}>Se încarcă analiza...</div>;

    const labels = emotionData.emotion_over_sentences.map((_, i) => `P${i + 1}`);
    const emotionList = Object.keys(emotionData.total_emotion_distribution);

    const valenceEmotions = ["Pozitivitate", "Negativitate"];
    const otherEmotions = emotionList.filter(e => !valenceEmotions.includes(e));

    const [topEmotion, topValue] = Object.entries(emotionData.total_emotion_distribution)
        .filter(([emotion]) => emotion !== "Pozitivitate" && emotion !== "Negativitate")
        .sort(([, a], [, b]) => b - a)[0];

    const [leastEmotion, leastValue] = Object.entries(emotionData.total_emotion_distribution)
        .filter(([emotion]) => emotion !== "Pozitivitate" && emotion !== "Negativitate")
        .sort(([, a], [, b]) => a - b)[0];

    const positivity = emotionData.total_emotion_distribution["Pozitivitate"] || 0;
    const negativity = emotionData.total_emotion_distribution["Negativitate"] || 0;
    const netBalance = positivity - negativity;

    const emotionColors = {
        Pozitivitate: "#FAEC05",
        Negativitate: "#446ADF",
        Furie: "#F32808",
        Anticipare: "#2145D6",
        Dezgust: "#0ECA2D",
        Frica: "#AC48E9",
        Bucurie: "#F9F61D",
        Tristete: "#24CCE3",
        Surpriza: "#ED5EEF",
        Incredere: "#EF9306",
    };

    const emotionLabels = {
        Pozitivitate: "Pozitivitate",
        Negativitate: "Negativitate",
        Furie: "Furie",
        Anticipare: "Anticipare",
        Dezgust: "Dezgust",
        Frica: "Frică",
        Bucurie: "Bucurie",
        Tristete: "Tristețe",
        Surpriza: "Surpriză",
        Incredere: "Încredere"
    };

    const generateLineDataset = (emotions) => {
        return emotions.map((emotion) => ({
            label: emotionLabels[emotion] || emotion,
            data: emotionData.emotion_over_sentences.map((s) => s.smoothed_scores[emotion]),
            fill: false,
            borderColor: emotionColors[emotion] || "#" + Math.floor(Math.random() * 16777215).toString(16),
            backgroundColor: emotionColors[emotion],
            tension: 0.4
        }));
    };


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    boxWidth: 12,
                    font: { size: 12 }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false
            }
        },
        interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 2,
                    callback: function (value) {
                        return value.toFixed(1);
                    }
                }
            },
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 25
                }
            }
        }
    };

    const lineDataValence = {
        labels,
        datasets: generateLineDataset(valenceEmotions),
    };

    const lineDataOther = {
        labels,
        datasets: generateLineDataset(otherEmotions),
    };

   

    const barData = {
        labels: emotionList.map(e => emotionLabels[e] || e),
        datasets: [{
            label: "Distribuție totală",
            data: emotionList.map((e) => emotionData.total_emotion_distribution[e]),
            backgroundColor: emotionList.map(e => emotionColors[e] || "#888"),
        }]
    };

    const topEmotionText = "Aceasta este emoția cu cea mai mare pondere în text. Dominanța unei emoții poate evidenția tonul narativ general sau starea emoțională a personajului principal.";
    const leastEmotionText = "Aceasta este emoția cu prezența cea mai redusă în narațiune. Lipsa sau raritatea unei emoții poate fi intenționată, pentru a menține o anumită atmosferă.";
    const netBalanceText = "Această valoare indică diferența dintre pozitivitate și negativitate. Un echilibru pozitiv poate sugera o narațiune optimistă, în timp ce unul negativ ar putea reflecta conflict sau tensiune.";
    const valenceChartText = "Acest grafic arată evoluția emoțiilor pozitive și negative pe parcursul textului. Poți activa sau dezactiva o emoție din legendă făcând click pe ea.";
    const barChartText = "Această diagramă arată frecvența totală a fiecărei emoții în text.";
    const otherEmotionsText = "Aici sunt prezentate celelalte emoții identificate în text, distribuite de-a lungul propozițiilor. Legenda este interactivă – click pe o emoție pentru a o ascunde sau afișa.";


    return (
        <div className={styles.analysisContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2>Analiza Emoțiilor</h2>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>
                            Emoția dominantă
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, topEmotionText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <p>{emotionLabels[topEmotion]} ({topValue.toFixed(1)}%)</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Emoția cel mai puțin prezentă
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, leastEmotionText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <p>{emotionLabels[leastEmotion]} ({leastValue.toFixed(1)}%)</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Echilibru emoțional
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, netBalanceText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <p>{netBalance > 0 ? "+" : ""}{netBalance.toFixed(1)}</p>
                    </div>
                </div>
                <div className={styles.charts}>
                    <div className={styles.chart}>
                        <h3>
                            Emoții Pozitive și Negative
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, valenceChartText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Line data={lineDataValence} options={chartOptions} />
                    </div>
                    <div className={styles.chart}>
                        <h3>
                            Distribuție generală a emoțiilor
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, barChartText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Bar data={barData} options={chartOptions} />
                    </div>
                   
                </div>
                <div className={styles.charts} >
                    <div className={styles.chart} style={{ maxWidth: "70%" }} >
                        <h3>
                            Alte Emoții
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, otherEmotionsText)}
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Line data={lineDataOther} options={chartOptions} />
                    </div>
                    
                    
                </div>
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

export default EmotionAnalysis;
