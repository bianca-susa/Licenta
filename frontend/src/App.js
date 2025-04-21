import React, { useState, useEffect } from "react";
import { UploadProvider } from "./UploadContext.js";
import { WorkspaceProvider } from "./WorkspaceContext.js";
import Typed from "typed.js";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./MainPage.js";
import styles from "./styles/Login.module.css";
import NarrativeStyle from "./NarrativeStyle.js";
import VocabularyAnalysis from "./VocabularyAnalysis.js";
import EmotionAnalysis from "./EmotionAnalysis.js";
import WorkspacePage from './WorkspacePage';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showSignUp, setShowSignUp] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const typed = new Typed(".auto-type", {
            strings: ["Bun venit!", isSignUp ? "Sign Up" : "Login"],
            typeSpeed: 150,
            backSpeed: 150,
            loop: false,
        });

        return () => {
            typed.destroy();
        };
    }, [isSignUp]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            if (isSignUp) {
                const res = await axios.post("http://localhost:5000/register", { email, password });
                setMessage("Cont creat cu succes! Acum te poți autentifica.");
                setIsSignUp(false); // După sign-up, revine la login
            } else {
                const res = await axios.post("http://localhost:5000/login", { email, password });
                setMessage("Autentificare reușită!");
                localStorage.setItem("token", res.data.token);
                navigate("/main");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "A apărut o eroare!");
        }
    };

    return (
        <div className={styles.loginBackground}>
            <div className={styles.loginBox}>
                <h2><span className="auto-type"></span></h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Parolă"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">{isSignUp ? "Înregistrează-te" : "Login"}</button>
                </form>
                <p>{message}</p>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className={styles.signupButton}
                >
                    {isSignUp ? "Ai deja cont? Login" : "Nu ai cont? Înregistrează-te"}
                </button>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <WorkspaceProvider>
        <UploadProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/analysis" element={<NarrativeStyle />} />
                <Route path="/vocabulary" element={<VocabularyAnalysis />} />
                <Route path="/emotion" element={<EmotionAnalysis />} />
                <Route path="/workspace/:workspaceId" component={WorkspacePage} />
            </Routes>
            </Router>
            </UploadProvider>
        </WorkspaceProvider>
    );
};

export default App;
