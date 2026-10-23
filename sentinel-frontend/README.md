# Sentinel Firewall - Frontend Web Application

A high-fidelity, enterprise-grade Cybersecurity Active Firewall & IDS Simulator frontend dashboard built with **React 19**, **Tailwind CSS v4**, and **Lucide React**.

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run
1. Navigate to the project directory:
   ```bash
   cd sentinel-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📁 Project Architecture & Structure

```
sentinel-frontend/
├── index.html                 # HTML entry with Inter font & favicon
├── package.json               # Dependencies & build scripts
├── vite.config.js             # Vite 8 config with Tailwind v4 & Reports exporter middleware
├── README.md                  # Project documentation & setup instructions
├── .gitignore                 # Standard node/dist gitignore
└── src/
    ├── main.jsx               # React 19 root entry point
    ├── index.css              # Tailwind CSS styling and custom scrollbar rules
    ├── App.jsx                # Main orchestration component managing global state
    ├── constants/
    │   └── initialData.js     # Default rules, packet frames, presets, and sparklines
    ├── components/
    │   ├── AuthScreen.jsx     # FIDO2 / WebAuthn biometric login & 3-sec verification flow
    │   ├── Sidebar.jsx        # Enterprise Left Navigation Sidebar with view switches
    │   ├── Navbar.jsx         # Top navigation with Mode toggle, Attack button, & Export dropdown
    │   ├── IdsAlertBanner.jsx # Real-time intrusion detection banner with Auto-Block IP
    │   ├── ToastNotification.jsx # Notification toast displaying local Reports directory path
    │   ├── LiveTrafficTerminal.jsx # Isolated scroll terminal with grep & protocol filters
    │   ├── AnalyticsPanel.jsx # Live telemetry, gauge meters, and SVG sparkline chart
    │   └── RuleManager.jsx    # Full-width policy engine table with quick port presets
    ├── views/
    │   ├── LiveMonitorView.jsx # View 1: 12-column grid uniting Terminal & Analytics
    │   └── PolicyRulesView.jsx # View 2: Full-width Netfilter rules management
    └── utils/
        └── reportExporter.js  # CSV/PDF report builders, disk save API & browser download
```

---

## 🛡️ Key Features

1. **Mock FIDO2 / WebAuthn Biometric Authentication**:
   - Hardware security key & mobile fingerprint verification.
   - 3-second realistic cryptographic handshake sequence.

2. **Enterprise Left Navigation Sidebar**:
   - Clean view switching between **Live Monitor** and **Policy & Rules**.
   - Live packet counter badges and CPU/Memory engine health indicators.

3. **Live Traffic Terminal**:
   - High-density packet stream using clean monospace typography.
   - **Isolated Internal Scrolling**: auto-scroll happens exclusively inside the terminal container, never hijacking main window scrolling.
   - Packet search (`grep`), protocol filters (`ALL`, `ALLOWED`, `DROPPED`), and stream pause/resume controls.

4. **Policy & Rules Engine (Zero Horizontal Scrolling)**:
   - Full-width table layout displaying Rule ID, Action, Target IP/CIDR, Port, Protocol, Hits, Volume, and State.
   - Add Rule form with 1-click Quick Presets (`HTTPS 443`, `HTTP 80`, `SSH 22`, `DNS 53`, `RDP 3389`, `ICMP Ping`).
   - Instant Active/Paused toggle and Delete action.

5. **Simulate Attack Toggle**:
   - Proper On/Off toggle: click once to simulate a TCP SYN Flood / Port Scan from `192.168.1.105` (with IDS Critical Alert and 900ms packet interval).
   - Click "Stop Attack" to immediately revert traffic rates and packet inspection back to normal baseline.
   - One-click "Auto-Block IP" creates an immediate `DROP` rule for the offending IP.

6. **Report Generation & Direct Disk Save**:
   - **Packet Logs (.csv)**: Exports full telemetry, active rules, and packet logs.
   - **Security Summary (.pdf)**: Generates a standard PDF 1.4 enterprise audit report.
   - Files are saved directly to the local disk directory (`Reports/`) via the built-in Vite server middleware and simultaneously triggered for browser download.

7. **Light / Dark Enterprise Theme**:
   - Clean, professional styling modeled after Grafana and AWS console.
   - Flat, muted standard colors (Tailwind `green-600` and `red-600`, slate palettes, zero neon glows).
