// Polyfill global crypto for @azure/cosmos in Node.js 18
const crypto = require("crypto");
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto;
}

const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

// Only load dotenv in development (no .env file expected in production containers)
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (e) {
    // dotenv is optional in production
  }
}

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "exam_iq.db");

console.log(`📦 Starting ExamIQ server...`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`   Database: ${dbPath}`);

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`   Database initialized successfully`);

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "10mb" }));

  app.get("/healthz", (req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("Health check failed:", err.message);
      res.status(503).json({ status: "error", message: err.message });
    }
  });

  const { createUser, getUserByEmail } = require("./services/db");

  app.get("/test-db", async (req, res) => {
    try {
      const testUser = {
        id: Date.now().toString(),
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        name: "Test User"
      };
      const result = await createUser(testUser);
      res.json({ success: true, message: "Test user inserted", user: result });
    } catch (err) {
      console.error("Test DB Error:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const user = { id: Date.now().toString(), email, password, name };
      const result = await createUser(user);
      res.status(201).json({ message: "User created successfully", user: result });
    } catch (err) {
      console.error("Register Error:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ message: "Login successful", user: { id: user.id || user._rowid, email: user.email, name: user.name } });
    } catch (err) {
      console.error("Login Error:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/materials", (req, res) => {
    try {
      const materials = db.prepare("SELECT * FROM materials ORDER BY created_at DESC").all();
      res.json(materials);
    } catch (err) {
      console.error("Error fetching materials:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/materials", (req, res) => {
    try {
      const { title, subject, content, type } = req.body;
      const info = db.prepare("INSERT INTO materials (title, subject, content, type) VALUES (?, ?, ?, ?)").run(title, subject, content, type);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("Error creating material:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics", (req, res) => {
    try {
      const scores = db.prepare("SELECT * FROM scores ORDER BY created_at ASC").all();
      res.json(scores);
    } catch (err) {
      console.error("Error fetching analytics:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/scores", (req, res) => {
    try {
      const { subject, score, total } = req.body;
      db.prepare("INSERT INTO scores (subject, score, total) VALUES (?, ?, ?)").run(subject, score, total);
      res.status(201).send();
    } catch (err) {
      console.error("Error saving score:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const { generateExamContent } = require("./services/gemini");
  app.post("/api/generate", async (req, res) => {
    try {
      const { mode, input, difficulty, marks } = req.body;
      const text = await generateExamContent(mode, input, difficulty, marks);
      res.json({ text });
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "dist");
    console.log(`   Serving static frontend from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ ExamIQ server running on http://0.0.0.0:${PORT}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`🌐 Frontend (Vite) running on http://localhost:5173`);
      console.log(`👉 Open http://localhost:5173 in your browser`);
    }
  });

  const shutdown = (signal) => {
    console.log(`\n⏹️  Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log("   HTTP server closed");
      try {
        db.close();
        console.log("   Database connection closed");
      } catch (e) {}
      process.exit(0);
    });
    setTimeout(() => {
      console.error("   Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
