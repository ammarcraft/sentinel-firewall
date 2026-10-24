const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Fallback Store (Ensures 100% uptime even if MySQL is offline)
let inMemoryRules = [];
let inMemoryLogs = [];
let isDbConnected = false;

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jarvis',
  database: 'firewall_db'
});

db.connect((err) => {
  if (err) {
    console.warn('MySQL Connection Warning:', err.message);
    console.log('Operating in In-Memory / Local Mode until MySQL is online.');
    isDbConnected = false;
    return;
  }
  isDbConnected = true;
  console.log('MySQL Connected to firewall_db successfully!');

  // Ensure firewall_rules table exists
  const createRulesTableSql = `
    CREATE TABLE IF NOT EXISTS firewall_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      target_ip VARCHAR(50) NOT NULL,
      port VARCHAR(20) NOT NULL,
      protocol VARCHAR(10) DEFAULT 'TCP',
      action ENUM('ALLOW', 'DROP') NOT NULL,
      description VARCHAR(255) DEFAULT '',
      hits INT DEFAULT 0,
      bytes VARCHAR(50) DEFAULT '0 B',
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createRulesTableSql, (tableErr) => {
    if (tableErr) console.warn('Rule table check notice:', tableErr.message);
    else {
      console.log('MySQL Table "firewall_rules" verified/ready.');
      // Ensure hits and bytes columns exist if table was created previously
      db.query("ALTER TABLE firewall_rules ADD COLUMN IF NOT EXISTS hits INT DEFAULT 0", () => {});
      db.query("ALTER TABLE firewall_rules ADD COLUMN IF NOT EXISTS bytes VARCHAR(50) DEFAULT '0 B'", () => {});
    }
  });

  // Ensure firewall_logs table exists
  const createLogsTableSql = `
    CREATE TABLE IF NOT EXISTS firewall_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      time VARCHAR(30) NOT NULL,
      proto VARCHAR(30) NOT NULL,
      src_ip VARCHAR(50) NOT NULL,
      src_port INT,
      dst_ip VARCHAR(50) NOT NULL,
      dst_port INT,
      len INT,
      action ENUM('ALLOW', 'DROP') NOT NULL,
      rule_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createLogsTableSql, (logsTableErr) => {
    if (logsTableErr) console.warn('Logs table check notice:', logsTableErr.message);
    else console.log('MySQL Table "firewall_logs" verified/ready.');
  });
});

// Test API Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mysql: isDbConnected,
    database: isDbConnected ? 'firewall_db' : 'in-memory-fallback',
    rulesCount: isDbConnected ? 'querying db' : inMemoryRules.length,
    timestamp: new Date().toISOString()
  });
});

// Fetch all rules from MySQL (or in-memory)
app.get('/api/rules', (req, res) => {
  if (isDbConnected) {
    db.query('SELECT * FROM firewall_rules ORDER BY id DESC', (err, results) => {
      if (err) {
        console.warn('DB query failed, serving from memory:', err.message);
        return res.json(inMemoryRules);
      }
      res.json(results);
    });
  } else {
    res.json(inMemoryRules);
  }
});

// Add a new rule to MySQL (or in-memory)
app.post('/api/rules', (req, res) => {
  const { target_ip, port, action, protocol, description } = req.body;
  if (!target_ip || !port || !action) {
    return res.status(400).json({ error: 'target_ip, port, and action are required.' });
  }

  const proto = protocol || 'TCP';
  const desc = description || '';

  if (isDbConnected) {
    const sql = 'INSERT INTO firewall_rules (target_ip, port, protocol, action, description, hits, bytes) VALUES (?, ?, ?, ?, ?, 0, ?)';
    db.query(sql, [target_ip, port, proto, action, desc, '0 B'], (err, result) => {
      if (err) {
        console.warn('DB Insert failed, saving to memory:', err.message);
        const memRule = {
          id: inMemoryRules.length + 1,
          target_ip,
          port,
          protocol: proto,
          action,
          description: desc,
          hits: 0,
          bytes: '0 B',
          status: 'ACTIVE'
        };
        inMemoryRules.unshift(memRule);
        return res.json(memRule);
      }
      res.json({
        id: result.insertId,
        target_ip,
        port,
        protocol: proto,
        action,
        description: desc,
        hits: 0,
        bytes: '0 B',
        status: 'ACTIVE'
      });
    });
  } else {
    const memRule = {
      id: inMemoryRules.length + 1,
      target_ip,
      port,
      protocol: proto,
      action,
      description: desc,
      hits: 0,
      bytes: '0 B',
      status: 'ACTIVE'
    };
    inMemoryRules.unshift(memRule);
    res.json(memRule);
  }
});

// Update rule hit counter & volume metrics
app.patch('/api/rules/:id/hits', (req, res) => {
  const ruleId = req.params.id;
  const { hits, bytes } = req.body;

  if (isDbConnected) {
    const sql = 'UPDATE firewall_rules SET hits = ?, bytes = ? WHERE id = ?';
    db.query(sql, [hits || 0, bytes || '0 B', ruleId], (err) => {
      if (err) {
        console.warn('DB update rule hits failed:', err.message);
      }
    });
  }

  const memRule = inMemoryRules.find((r) => String(r.id) === String(ruleId));
  if (memRule) {
    memRule.hits = hits || 0;
    memRule.bytes = bytes || '0 B';
  }

  res.json({ success: true, id: ruleId, hits, bytes });
});

// Delete rule from MySQL (or in-memory)
app.delete('/api/rules/:id', (req, res) => {
  const ruleId = req.params.id;

  if (isDbConnected) {
    const sql = 'DELETE FROM firewall_rules WHERE id = ?';
    db.query(sql, [ruleId], (err) => {
      if (err) {
        console.warn('DB delete error, removing from memory:', err.message);
      }
      inMemoryRules = inMemoryRules.filter((r) => String(r.id) !== String(ruleId));
      res.json({ message: 'Rule Deleted', id: ruleId });
    });
  } else {
    inMemoryRules = inMemoryRules.filter((r) => String(r.id) !== String(ruleId));
    res.json({ message: 'Rule Deleted', id: ruleId });
  }
});

// Fetch packet logs
app.get('/api/logs', (req, res) => {
  if (isDbConnected) {
    db.query('SELECT * FROM firewall_logs ORDER BY id DESC LIMIT 100', (err, results) => {
      if (err) return res.json(inMemoryLogs);
      res.json(results);
    });
  } else {
    res.json(inMemoryLogs);
  }
});

// Append a live packet log
app.post('/api/logs', (req, res) => {
  const { time, proto, srcIp, srcPort, dstIp, dstPort, len, action, rule } = req.body;
  const newLog = {
    id: Date.now(),
    time: time || new Date().toISOString(),
    proto: proto || 'TCP',
    src_ip: srcIp || '0.0.0.0',
    src_port: srcPort || 0,
    dst_ip: dstIp || '0.0.0.0',
    dst_port: dstPort || 0,
    len: len || 64,
    action: action || 'ALLOW',
    rule_id: rule || 'DEFAULT'
  };

  inMemoryLogs.unshift(newLog);
  if (inMemoryLogs.length > 200) inMemoryLogs.pop();

  if (isDbConnected) {
    const sql =
      'INSERT INTO firewall_logs (time, proto, src_ip, src_port, dst_ip, dst_port, len, action, rule_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(
      sql,
      [newLog.time, newLog.proto, newLog.src_ip, newLog.src_port, newLog.dst_ip, newLog.dst_port, newLog.len, newLog.action, newLog.rule_id],
      () => {}
    );
  }

  res.json(newLog);
});

// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
