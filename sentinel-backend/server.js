const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jarvis',
  database: 'firewall_db'
});

db.connect((err) => {
  if (err) {
    console.error('DB Connection Failed:', err);
    return;
  }
  console.log('MySQL Connected to firewall_db successfully!');
});

// Test API Route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is live!' });
});

// Fetch all rules from MySQL
app.get('/api/rules', (req, res) => {
  db.query('SELECT * FROM firewall_rules', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new rule to MySQL
app.post('/api/rules', (req, res) => {
  const { target_ip, port, action } = req.body;
  const sql = 'INSERT INTO firewall_rules (target_ip, port, action) VALUES (?, ?, ?)';
  db.query(sql, [target_ip, port, action], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, target_ip, port, action });
  });
});
// Delete rule from MySQL
app.delete('/api/rules/:id', (req, res) => {
  const sql = 'DELETE FROM firewall_rules WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Rule Deleted' });
  });
});
// START SERVER (Yeh hai app.listen)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});