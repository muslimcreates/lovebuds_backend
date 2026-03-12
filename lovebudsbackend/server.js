// server.js
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL / Supabase connection using environment variables
const pool = new Pool({
  user: process.env.PGUSER,       // e.g., "postgres"
  host: process.env.PGHOST,       // e.g., "db.lfpwlanmugnpfahfpzrg.supabase.co"
  database: process.env.PGDATABASE, // e.g., "postgres"
  password: process.env.PGPASSWORD, // your Supabase password
  port: process.env.PGPORT        // e.g., 5432
});

// Full registration route
app.post("/submit", async (req, res) => {
  const { username, email, phone, password, message } = req.body;
  try {
    await pool.query(
      "INSERT INTO verification (username, email, phone, password, message) VALUES ($1,$2,$3,$4,$5)",
      [username, email, phone, password, message]
    );
    res.status(200).send("Data saved!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});

// Login route (save username & password)
app.post("/login-submit", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Username and password are required");

  try {
    await pool.query(
      "INSERT INTO verification (username, password) VALUES ($1,$2)",
      [username, password]
    );
    res.status(200).send("Login info saved!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving login info");
  }
});

// Fetch all verification data (for testing)
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM verification");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

// Send message route
app.post("/send-message", async (req, res) => {
  const { sender, receiver, message } = req.body;
  if (!sender || !receiver || !message) return res.status(400).send("All fields are required");

  try {
    await pool.query(
      "INSERT INTO messages (sender, receiver, message) VALUES ($1, $2, $3)",
      [sender, receiver, message]
    );
    res.status(200).send("Message sent!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending message");
  }
});

// Get messages for a user
app.get("/messages/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE receiver = $1 ORDER BY sent_at DESC",
      [username]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching messages");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});