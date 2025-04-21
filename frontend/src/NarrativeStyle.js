import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./styles/NarrativeAnalysis.module.css";
import Sidebar from "./Sidebar";


const NarrativeAnalysis = () => {
    const [stats, setStats] = useState(null);
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
            setError("No corrected file has been processed yet.");
            return;
        }

        axios.get(`http://localhost:5000/analyze?correctedFile=${correctedFilePath}`)
            .then((response) => setStats(response.data))
            .catch((err) => setError("Failed to fetch analysis."));
    }, []);

    if (error) return <div className={styles.error}>{error}</div>;
    if (!stats) return <div className={styles.loading}>Se încarcă analiza...</div>;

    const { word_count, sentence_count, avg_sentence_length, sentence_length_distribution, sentence_types } = stats;

    // Prepare data for charts
    const barData = {
        labels: ["Număr de cuvinte", "Număr de propoziții", "Media lungimii propozițiilor"],
        datasets: [{
            label: "Writing Statistics",
            data: [word_count, sentence_count, avg_sentence_length],
            backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
        }]
    };


    // Sentence length distribution chart data
    const sentenceLengthData = {
        labels: sentence_length_distribution.map(([length]) => length + ' cuvinte'),
        datasets: [{
            label: "Distribuția lungimii propozițiilor",
            data: sentence_length_distribution.map(([, count]) => count),
            backgroundColor: "#FF5733"
        }]
    };

    const sentenceTypeData = {
        labels: ["Declarative", "Interogative", "Exclamative"],
        datasets: [
            {
                label: "Tipuri de propoziții",
                data: [
                    sentence_types.declarative,
                    sentence_types.interogative,
                    sentence_types.exclamative
                ],
                backgroundColor: ["#3498db", "#e74c3c", "#f1c40f"]
            }
        ]
    };

    const wordCountText = "Numărul total de cuvinte din text"; 
    const sentenceCountText = "Numărul total de propoziții din text"; 
    const avgSentenceLengthText = "Această medie arată câte cuvinte are o propoziție, în medie. Propozițiile mai lungi pot indica un stil complex, iar cele mai scurte – unul concis și dinamic.";
    const sentenceLengthText = "Această diagramă arată cât de variată este lungimea propozițiilor. Alternanța între propoziții scurte și lungi contribuie la ritmul și dinamismul narativ.";
    const sentenceTypeText = "Această diagramă ilustrează echilibrul între propoziții declarative, interogative și exclamative. În narațiune, un amestec echilibrat creează dialoguri vii și o voce narativă dinamică. Exclamativele transmit emoție, iar interogativele stimulează gândirea sau conflictul interior.";

    return (
        <div className={styles.analysisContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2>Analiza Stilului Narativ</h2>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>
                            Număr de cuvinte
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(
                                        e,
                                        wordCountText
                                    )
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                ⓘ
                            </span>
                        </h3>
                        <p>{word_count}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Număr de propoziții
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(
                                        e,
                                        sentenceCountText
                                    )
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                ⓘ
                            </span>
                        </h3>
                        <p>{sentence_count}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>
                            Media lungimii propozițiilor
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(
                                        e,
                                        avgSentenceLengthText
                                    )
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                ⓘ
                            </span>
                        </h3>
                        <p>{avg_sentence_length} cuvinte</p>
                    </div>
                </div>

                <div className={styles.charts}>
                    <div className={styles.chart}>
                        <h3>
                            Distribuția lungimii propozițiilor
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(
                                        e,
                                        sentenceLengthText
                                    )
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                ⓘ
                            </span>
                        </h3>

                        <Bar data={sentenceLengthData} />
                    </div>
                    <div className={styles.chart}>
                        <h3>
                            Tipuri de propoziții
                            <span
                                className={styles.infoIcon}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(
                                        e,
                                        sentenceTypeText
                                    )
                                }
                                onMouseLeave={handleMouseLeave}>
                                ⓘ
                            </span>
                        </h3>
                        <Pie data={sentenceTypeData} />
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

export default NarrativeAnalysis;
