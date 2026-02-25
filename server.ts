import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("department.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    level TEXT,
    matricNumber TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'student',
    joinedDate TEXT
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    date TEXT,
    category TEXT DEFAULT 'Announcement',
    imagePath TEXT,
    authorId INTEGER,
    FOREIGN KEY(authorId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    courseCode TEXT,
    level TEXT,
    fileName TEXT,
    filePath TEXT,
    uploaderId INTEGER,
    uploadDate TEXT,
    FOREIGN KEY(uploaderId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    level TEXT,
    fileName TEXT,
    filePath TEXT,
    fileType TEXT,
    uploadDate TEXT
  );
`);

// Database Migrations (Add columns if they don't exist)
try {
  db.prepare("ALTER TABLE users ADD COLUMN joinedDate TEXT").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE announcements ADD COLUMN category TEXT DEFAULT 'Announcement'").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE announcements ADD COLUMN imagePath TEXT").run();
} catch (e) {}

// Data Migrations
db.prepare("UPDATE users SET joinedDate = ? WHERE joinedDate IS NULL").run(new Date().toISOString());
db.prepare("UPDATE announcements SET category = 'Announcement' WHERE category IS NULL").run();

// Seed Admin if not exists
const adminEmail = "admin@dept.edu";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare(`
    INSERT INTO users (firstName, lastName, email, password, role, joinedDate)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run("Admin", "User", adminEmail, hashedPassword, "admin", new Date().toISOString());
  
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(
    "history",
    "Welcome to our department. We have a rich history of academic excellence..."
  );
}

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development with Vite
}));
app.use(cors());
app.use(express.json());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File Upload Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove special characters and spaces
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, Date.now() + "-" + sanitized);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, PPT, and images are allowed."), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

// --- API Routes ---

// Auth
app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, phone, level, matricNumber, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const joinedDate = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO users (firstName, lastName, email, phone, level, matricNumber, password, joinedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(firstName, lastName, email, phone, level, matricNumber, hashedPassword, joinedDate);

    res.json({ id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, firstName: user.firstName }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName } });
});

// Admin Stats
app.get("/api/admin/stats", authenticateToken, isAdmin, (req, res) => {
  const students = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any;
  const materials = db.prepare("SELECT COUNT(*) as count FROM materials").get() as any;
  const news = db.prepare("SELECT COUNT(*) as count FROM announcements WHERE category = 'News'").get() as any;
  const announcements = db.prepare("SELECT COUNT(*) as count FROM announcements WHERE category = 'Announcement'").get() as any;
  const resources = db.prepare("SELECT COUNT(*) as count FROM resources").get() as any;
  
  res.json({
    totalStudents: students.count,
    totalMaterials: materials.count,
    totalNews: news.count,
    totalAnnouncements: announcements.count,
    totalResources: resources.count
  });
});

// Admin Users
app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
  const users = db.prepare("SELECT id, firstName, lastName, email, phone, level, matricNumber, joinedDate FROM users WHERE role = 'student' ORDER BY joinedDate DESC").all();
  res.json(users);
});

app.delete("/api/admin/users/:id", authenticateToken, isAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = db.prepare("DELETE FROM users WHERE id = ? AND role = 'student'").run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Student not found or already deleted" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Materials
app.get("/api/admin/materials", authenticateToken, isAdmin, (req, res) => {
  const materials = db.prepare(`
    SELECT m.*, u.firstName || ' ' || u.lastName as uploaderName 
    FROM materials m 
    JOIN users u ON m.uploaderId = u.id 
    ORDER BY uploadDate DESC
  `).all();
  res.json(materials);
});

// History
app.get("/api/history", (req, res) => {
  const setting: any = db.prepare("SELECT value FROM settings WHERE key = 'history'").get();
  res.json({ history: setting?.value || "" });
});

app.post("/api/history", authenticateToken, isAdmin, (req, res) => {
  const { history } = req.body;
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('history', ?)").run(history);
  res.json({ success: true });
});

// Announcements / News
app.get("/api/announcements", (req, res) => {
  const announcements = db.prepare("SELECT * FROM announcements ORDER BY date DESC").all();
  res.json(announcements);
});

app.get("/api/announcements/:id", (req, res) => {
  const announcement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(req.params.id);
  if (announcement) {
    res.json(announcement);
  } else {
    res.status(404).json({ error: "Announcement not found" });
  }
});

app.post("/api/announcements", authenticateToken, isAdmin, upload.single("image"), (req: any, res) => {
  try {
    const { title, body, category } = req.body;
    const date = new Date().toISOString();
    const imagePath = req.file ? req.file.filename : null;
    
    const cleanTitle = DOMPurify.sanitize(title);
    const cleanBody = DOMPurify.sanitize(body);
    
    db.prepare("INSERT INTO announcements (title, body, date, category, imagePath, authorId) VALUES (?, ?, ?, ?, ?, ?)")
      .run(cleanTitle, cleanBody, date, category || 'Announcement', imagePath, req.user.id);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/announcements/:id", authenticateToken, isAdmin, upload.single("image"), (req: any, res) => {
  try {
    const { title, body, category } = req.body;
    const imagePath = req.file ? req.file.filename : undefined;
    
    const cleanTitle = DOMPurify.sanitize(title);
    const cleanBody = DOMPurify.sanitize(body);
    
    if (imagePath !== undefined) {
      db.prepare("UPDATE announcements SET title = ?, body = ?, category = ?, imagePath = ? WHERE id = ?")
        .run(cleanTitle, cleanBody, category, imagePath, req.params.id);
    } else {
      db.prepare("UPDATE announcements SET title = ?, body = ?, category = ? WHERE id = ?")
        .run(cleanTitle, cleanBody, category, req.params.id);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/announcements/:id", authenticateToken, isAdmin, (req, res) => {
  const announcement = db.prepare("SELECT imagePath FROM announcements WHERE id = ?").get(req.params.id) as any;
  if (announcement?.imagePath) {
    const filePath = path.join(uploadDir, announcement.imagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Materials
app.get("/api/materials", authenticateToken, (req, res) => {
  const materials = db.prepare(`
    SELECT m.*, u.firstName as uploaderName 
    FROM materials m 
    JOIN users u ON m.uploaderId = u.id 
    ORDER BY uploadDate DESC
  `).all();
  res.json(materials);
});

app.post("/api/materials", authenticateToken, upload.single("file"), (req: any, res) => {
  const { title, courseCode, level } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const uploadDate = new Date().toISOString();
  db.prepare(`
    INSERT INTO materials (title, courseCode, level, fileName, filePath, uploaderId, uploadDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, courseCode, level, file.originalname, file.filename, req.user.id, uploadDate);
  
  res.json({ success: true });
});

app.get("/api/materials/download/:filename", authenticateToken, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.delete("/api/materials/:id", authenticateToken, isAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const material: any = db.prepare("SELECT filePath FROM materials WHERE id = ?").get(id);
    if (material) {
      const filePath = path.join(uploadDir, material.filePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }
      db.prepare("DELETE FROM materials WHERE id = ?").run(id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Material not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Resources
app.get("/api/admin/resources", authenticateToken, isAdmin, (req, res) => {
  const resources = db.prepare("SELECT * FROM resources ORDER BY uploadDate DESC").all();
  res.json(resources);
});

app.post("/api/admin/resources", authenticateToken, isAdmin, upload.single("file"), (req: any, res) => {
  try {
    const { title, description, level } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const uploadDate = new Date().toISOString();
    const fileType = path.extname(file.originalname).substring(1).toUpperCase();

    const cleanTitle = DOMPurify.sanitize(title);
    const cleanDesc = DOMPurify.sanitize(description);

    db.prepare(`
      INSERT INTO resources (title, description, level, fileName, filePath, fileType, uploadDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(cleanTitle, cleanDesc, level, file.originalname, file.filename, fileType, uploadDate);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/resources/:id", authenticateToken, isAdmin, upload.single("file"), (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, level } = req.body;
    const file = req.file;

    const cleanTitle = DOMPurify.sanitize(title);
    const cleanDesc = DOMPurify.sanitize(description);

    if (file) {
      // Delete old file
      const oldResource: any = db.prepare("SELECT filePath FROM resources WHERE id = ?").get(id);
      if (oldResource) {
        const oldPath = path.join(uploadDir, oldResource.filePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const fileType = path.extname(file.originalname).substring(1).toUpperCase();
      db.prepare(`
        UPDATE resources 
        SET title = ?, description = ?, level = ?, fileName = ?, filePath = ?, fileType = ? 
        WHERE id = ?
      `).run(cleanTitle, cleanDesc, level, file.originalname, file.filename, fileType, id);
    } else {
      db.prepare(`
        UPDATE resources 
        SET title = ?, description = ?, level = ? 
        WHERE id = ?
      `).run(cleanTitle, cleanDesc, level, id);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/resources/:id", authenticateToken, isAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const resource: any = db.prepare("SELECT filePath FROM resources WHERE id = ?").get(id);
    if (resource) {
      const filePath = path.join(uploadDir, resource.filePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }
      db.prepare("DELETE FROM resources WHERE id = ?").run(id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Student Resources
app.get("/api/resources", authenticateToken, (req, res) => {
  const resources = db.prepare("SELECT * FROM resources ORDER BY uploadDate DESC").all();
  res.json(resources);
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
