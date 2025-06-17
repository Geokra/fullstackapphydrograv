const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new sqlite3.Database('./database/userdata.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS user_inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        console.log('User inputs table created or already exists.');
      }
    });
  }
});

// API endpoint to save form data
app.post('/api/submit', (req, res) => {
  const { name, email, message } = req.body;
  
  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Insert data into database
  const sql = `INSERT INTO user_inputs (name, email, message) VALUES (?, ?, ?)`;
  db.run(sql, [name, email, message], function(err) {
    if (err) {
      console.error('Error inserting data', err.message);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    
    console.log(`A new record has been inserted with rowid ${this.lastID}`);
    return res.status(201).json({ 
      message: 'Data saved successfully',
      id: this.lastID
    });
  });
});

// API endpoint to get all form submissions
app.get('/api/submissions', (req, res) => {
  const sql = `SELECT * FROM user_inputs ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching data', err.message);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
    
    return res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection when process ends
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
