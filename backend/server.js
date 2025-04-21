require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const originalName = file.originalname.replace(/\s+/g, "_"); 
        cb(null, originalName);
    },
});

const upload = multer({ storage: storage });


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// User Registration
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hashedPassword]
        );
        res.json({ user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found. Would you like to create an account?" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/upload", upload.single("file"), (req, res) => {
    const filePath = req.file.path;
    //const correctedFilePath = path.join(__dirname, "corrected.docx");

    const inputFilename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const correctedFilePath = path.join(__dirname, Buffer.from(`${inputFilename}_corrected.docx`, 'latin1').toString('utf8'));


    console.log(correctedFilePath);

    const pythonProcess = spawn("python", ["process_document.py", filePath]);

    pythonProcess.on("close", (code) => {
        if (code === 0 && fs.existsSync(correctedFilePath)) {
            console.log("Corrected file saved at:", correctedFilePath);
            res.json({ correctedFile: correctedFilePath });
        } else {
            console.error("Error: Corrected file not found or process failed.");
            res.status(500).json({ error: "Error processing file." });
        }
    });
});




app.get("/analyze", (req, res) => {
    const { correctedFile } = req.query;  // Use the corrected file path
    console.log("Corrected file path received:", correctedFile); // Log the received path

    if (!correctedFile) {
        return res.status(400).json({ error: "No file specified." });
    }

    // Check if correctedFile path is valid and exists
    if (!fs.existsSync(correctedFile)) {
        console.error("Corrected file not found:", correctedFile); // Log if file doesn't exist
        return res.status(404).json({ error: "Corrected file not found." });
    }

    const pythonProcess = spawn("python", ["narrative_style.py", correctedFile]);

    let pythonOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`[PYTHON ERROR]: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
        console.log("Python script finished with code:", code);

        if (!pythonOutput) {
            console.error("Python output is empty.");
            return res.status(500).json({ error: "No output from Python script." });
        }

        try {
            const parsedOutput = JSON.parse(pythonOutput);
            res.json(parsedOutput);
        } catch (err) {
            console.error("Failed to parse Python output:", err);
            console.error("Raw Python output:", pythonOutput);
            return res.status(500).json({ error: "Failed to parse Python output." });
        }
    });
});



app.get("/download", (req, res) => {
    const filePath = req.query.file;
    console.log("Attempting to download:", filePath);

    if (!filePath || !fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return res.status(404).json({ error: "File not found." });
    }

    const originalFilename = path.basename(filePath);
    res.download(filePath, originalFilename);

});

app.get("/workspaces/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM workspaces WHERE user_id = $1 ORDER BY uploaded_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching workspaces" });
    }
});

app.post("/workspaces/:id/favorite", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE workspaces 
             SET favorite = NOT favorite 
             WHERE id = $1 
             RETURNING favorite`,
            [id]
        );
        res.json({ favorite: result.rows[0].favorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not update favorite status" });
    }
});

app.delete("/workspaces/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT stored_filename, corrected_filename FROM workspaces WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const { stored_filename, corrected_filename } = result.rows[0];

        // Delete physical files
        const uploadedPath = path.join(__dirname, "uploads", stored_filename);
        const correctedPath = path.join(__dirname, "corrected", corrected_filename);

        if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
        if (fs.existsSync(correctedPath)) fs.unlinkSync(correctedPath);

        // Delete from DB
        await pool.query(`DELETE FROM workspaces WHERE id = $1`, [id]);

        res.json({ message: "Workspace deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete workspace" });
    }
});





app.listen(port, () => console.log(`Server running on port ${port}`));
