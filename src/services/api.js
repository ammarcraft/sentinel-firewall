// Sentinel Firewall - Backend API Service
// Connects dynamically to Node/Express backend on port 5000 and MySQL database

const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Check backend server and database status
  async checkStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return { connected: false, error: `HTTP ${res.status}` };
      const data = await res.json();
      return { connected: true, ...data };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  },

  // Fetch live rules from MySQL database via backend
  async getRules() {
    try {
      const res = await fetch(`${API_BASE}/rules`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Backend /api/rules unreachable:', err.message);
      return null;
    }
  },

  // Insert a new firewall rule into MySQL database
  async createRule(ruleData) {
    try {
      const res = await fetch(`${API_BASE}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_ip: ruleData.ip,
          port: ruleData.port,
          protocol: ruleData.protocol || 'TCP',
          action: ruleData.action || 'DROP',
          description: ruleData.description || ''
        }),
        signal: AbortSignal.timeout(3500)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend POST /api/rules failed:', err.message);
      return null;
    }
  },

  // Delete a rule from MySQL database by ID
  async deleteRule(id) {
    try {
      const res = await fetch(`${API_BASE}/rules/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3500)
      });
      return res.ok;
    } catch (err) {
      console.warn(`Backend DELETE /api/rules/${id} failed:`, err.message);
      return false;
    }
  },

  // Update rule hit counter & volume metrics
  async updateRuleHits(id, hits, bytes) {
    try {
      await fetch(`${API_BASE}/rules/${id}/hits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hits, bytes }),
        signal: AbortSignal.timeout(1500)
      });
    } catch {
      // Ignore background hit sync failure
    }
  },

  // Fetch captured packets/logs from backend
  async getLogs() {
    try {
      const res = await fetch(`${API_BASE}/logs`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return null;
    }
  },

  // Post a captured packet to backend
  async recordLog(packet) {
    try {
      await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
        signal: AbortSignal.timeout(1500)
      });
    } catch {
      // Ignore background log sync failure
    }
  }
};
