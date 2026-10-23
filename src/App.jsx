import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Fingerprint,
  User,
  Download,
  ChevronDown,
  Trash2,
  Plus,
  Play,
  Pause,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Activity,
  Cpu,
  Wifi,
  Search,
  FileText,
  FileSpreadsheet,
  Smartphone,
  X,
  Sun,
  Moon,
  SlidersHorizontal,
  Folder,
  FolderArchive
} from 'lucide-react';

export default function App() {
  // -------------------------------------------------------------
  // Theme State: Default is Light Mode
  // -------------------------------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);

  // -------------------------------------------------------------
  // View State: Controlled by Left Sidebar ('monitor' | 'rules')
  // -------------------------------------------------------------
  const [activeView, setActiveView] = useState('monitor');

  // -------------------------------------------------------------
  // Authentication & FIDO2 Verification State
  // -------------------------------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState(0); // 0: Idle, 1: Dispatched, 2: Cryptographic Signature, 3: Verified
  const [countdown, setCountdown] = useState(3);
  const [username, setUsername] = useState('admin@sentinel.local');
  const [password, setPassword] = useState('••••••••••••••••');

  // Top Nav & Feedback States
  const [exportOpen, setExportOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // -------------------------------------------------------------
  // Rule Manager State
  // -------------------------------------------------------------
  const [rules, setRules] = useState([]);

useEffect(() => {
  fetch('http://localhost:5000/api/rules')
    .then(res => res.json())
    .then(data => {
      const dbRules = data.map(r => ({
        id: `FW-${r.id}`, ip: r.target_ip, port: r.port, protocol: 'TCP/UDP', action: r.action, description: 'Loaded from MySQL', hits: 0, bytes: '0 B', status: 'ACTIVE'
      }));
      setRules(dbRules.reverse());
    }).catch(err => console.error(err));
}, []);

  const [inputIp, setInputIp] = useState('');
  const [inputPort, setInputPort] = useState('');
  const [inputProtocol, setInputProtocol] = useState('TCP');
  const [inputAction, setInputAction] = useState('DROP');
  const [inputDesc, setInputDesc] = useState('');
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleActionFilter, setRuleActionFilter] = useState('ALL');

  // -------------------------------------------------------------
  // Live Traffic Monitor (Terminal) State & Container Ref
  // -------------------------------------------------------------
  const [logs, setLogs] = useState(() => [
    {
      id: 'PKT-1001',
      time: '14:20:02.114',
      proto: 'TCP [ACK]',
      srcIp: '142.250.190.46',
      srcPort: 443,
      dstIp: '192.168.1.20',
      dstPort: 51240,
      len: 1420,
      ttl: 54,
      action: 'ALLOW',
      rule: 'FW-102'
    },
    {
      id: 'PKT-1002',
      time: '14:20:04.228',
      proto: 'TCP [SYN]',
      srcIp: '45.33.32.156',
      srcPort: 58122,
      dstIp: '192.168.1.20',
      dstPort: 22,
      len: 64,
      ttl: 48,
      action: 'DROP',
      rule: 'FW-104'
    },
    {
      id: 'PKT-1003',
      time: '14:20:06.381',
      proto: 'UDP [DNS]',
      srcIp: '1.1.1.1',
      srcPort: 53,
      dstIp: '192.168.1.45',
      dstPort: 49301,
      len: 128,
      ttl: 58,
      action: 'ALLOW',
      rule: 'DEFAULT'
    },
    {
      id: 'PKT-1004',
      time: '14:20:08.512',
      proto: 'TCP [ACK]',
      srcIp: '172.217.16.206',
      srcPort: 443,
      dstIp: '192.168.1.32',
      dstPort: 53810,
      len: 1380,
      ttl: 56,
      action: 'ALLOW',
      rule: 'FW-102'
    }
  ]);
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logGrep, setLogGrep] = useState('');
  
  // Ref on the scrollable terminal container (prevents window scrolling)
  const terminalBoxRef = useRef(null);

  // -------------------------------------------------------------
  // IDS Attack Simulation State (Proper On/Off Toggle)
  // -------------------------------------------------------------
  const [isAttackActive, setIsAttackActive] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);

  // -------------------------------------------------------------
  // Analytics Telemetry State
  // -------------------------------------------------------------
  const [throughput, setThroughput] = useState(2.38);
  const [packetRate, setPacketRate] = useState(148200);
  const [sparkPoints, setSparkPoints] = useState([
    { allow: 82, drop: 4 },
    { allow: 86, drop: 5 },
    { allow: 79, drop: 6 },
    { allow: 91, drop: 3 },
    { allow: 88, drop: 5 },
    { allow: 94, drop: 4 },
    { allow: 84, drop: 7 },
    { allow: 89, drop: 5 },
    { allow: 92, drop: 4 },
    { allow: 95, drop: 6 }
  ]);

  // Handle Login Click -> Initiates 3-second FIDO2 flow
  const handleInitiateFido = (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setVerifyStage(1);
    setCountdown(3);
  };

  // 3-Second FIDO2 Verification Timer
  useEffect(() => {
    if (!isVerifying) return;

    const s2 = setTimeout(() => {
      setVerifyStage(2);
    }, 1000);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setVerifyStage(3);
          setTimeout(() => {
            setIsVerifying(false);
            setIsLoggedIn(true);
          }, 350);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(s2);
      clearInterval(timer);
    };
  }, [isVerifying]);

  // Packet Generator function
  const generatePacket = useCallback(() => {
    const isAttackPacket = isAttackActive && Math.random() > 0.35;
    let srcIp;
    let dstPort;
    let proto = 'TCP';
    let len = Math.floor(64 + Math.random() * 1400);

    if (isAttackPacket) {
      srcIp = '192.168.1.105';
      const scanPorts = [21, 22, 23, 25, 80, 135, 443, 445, 1433, 3389, 8080];
      dstPort = scanPorts[Math.floor(Math.random() * scanPorts.length)];
      proto = 'TCP [SYN]';
      len = 64;
    } else {
      const normalIps = ['142.250.190.46', '172.217.16.206', '104.244.42.1', '185.199.108.153', '20.112.52.29'];
      const normalPorts = [443, 80, 22, 53, 8080];
      srcIp = normalIps[Math.floor(Math.random() * normalIps.length)];
      dstPort = normalPorts[Math.floor(Math.random() * normalPorts.length)];
      proto = dstPort === 53 ? 'UDP [DNS]' : 'TCP [ACK]';
    }

    const dstIp = '192.168.1.' + Math.floor(10 + Math.random() * 80);
    const srcPort = Math.floor(1024 + Math.random() * 64000);

    // Evaluate rules
    let action = 'ALLOW';
    let matchedRule = 'DEFAULT';

    for (const r of rules) {
      if (r.status !== 'ACTIVE') continue;
      const ipMatch = r.ip === '0.0.0.0/0' || r.ip === srcIp;
      const portMatch = r.port === 'ALL' || r.port === dstPort.toString();
      if (ipMatch && portMatch) {
        action = r.action;
        matchedRule = r.id;
        break;
      }
    }

    if (isAttackPacket && action !== 'ALLOW') {
      action = 'DROP';
      matchedRule = matchedRule === 'DEFAULT' ? 'IDS-TRAP' : matchedRule;
    }

    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    return {
      id: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: timeStr,
      proto,
      srcIp,
      srcPort,
      dstIp,
      dstPort,
      len,
      ttl: Math.floor(48 + Math.random() * 16),
      action,
      rule: matchedRule
    };
  }, [isAttackActive, rules]);

  // Terminal interval: pushes packet logs every 2 seconds (or 900ms when attack active)
  useEffect(() => {
    if (!isLoggedIn || isTerminalPaused) return;

    const intervalMs = isAttackActive ? 900 : 2000;
    const interval = setInterval(() => {
      const newPkt = generatePacket();
      setLogs((prev) => [...prev.slice(-45), newPkt]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLoggedIn, isTerminalPaused, isAttackActive, generatePacket]);

  // Auto-scroll bug fix: Scrolls ONLY the terminal container internally. Does NOT hijack window scroll.
  useEffect(() => {
    if (autoScroll && terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Telemetry jitter loop
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      const baseThroughput = isAttackActive ? 4.92 : 2.41;
      const jitterT = Number((baseThroughput + (Math.random() * 0.3 - 0.15)).toFixed(2));
      setThroughput(jitterT);

      const basePackets = isAttackActive ? 285000 : 149500;
      const jitterP = Math.floor(basePackets + (Math.random() * 10000 - 5000));
      setPacketRate(jitterP);

      setSparkPoints((prev) => {
        const nextAllow = Math.floor(75 + Math.random() * 20);
        const nextDrop = isAttackActive
          ? Math.floor(50 + Math.random() * 45)
          : Math.floor(2 + Math.random() * 8);
        return [...prev.slice(1), { allow: nextAllow, drop: nextDrop }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAttackActive]);

  // Handle Add Rule
const handleAddRule = (e) => {
  e.preventDefault();
  if (!inputIp.trim() || !inputPort.trim()) return;

  const payload = { target_ip: inputIp.trim(), port: inputPort.trim().toUpperCase(), action: inputAction };

  fetch('http://localhost:5000/api/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(savedRule => {
    const newRule = {
      id: `FW-${savedRule.id}`, ip: savedRule.target_ip, port: savedRule.port, protocol: inputProtocol, action: savedRule.action, description: inputDesc.trim() || `Rule: ${inputAction}`, hits: 0, bytes: '0 B', status: 'ACTIVE'
    };
    setRules([newRule, ...rules]);
    setInputIp(''); setInputPort(''); setInputDesc('');
    setToastNotification({ title: 'Rule Added', desc: `Saved to MySQL DB` });
    setTimeout(() => setToastNotification(null), 3500);
  });
};

  // Toggle Rule Status
  const handleToggleRule = (id) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r)));
  };

  // Delete Rule
const handleDeleteRule = (id) => {
  const dbId = id.replace('FW-', '');
  fetch(`http://localhost:5000/api/rules/${dbId}`, { method: 'DELETE' })
  .then(() => {
    setRules(rules.filter((r) => r.id !== id));
  }).catch(err => console.error(err));
};
  // -------------------------------------------------------------
  // 3. Proper On/Off Toggle for Simulate Attack
  // -------------------------------------------------------------
  const handleToggleAttack = () => {
    if (isAttackActive) {
      // Revert immediately back to normal
      setIsAttackActive(false);
      setCriticalAlert(null);
      setToastNotification({
        title: 'Attack Simulation Stopped',
        desc: 'Network traffic rate and packet inspection restored to normal baseline.'
      });
      setTimeout(() => setToastNotification(null), 3000);
    } else {
      // Engage attack simulation
      setIsAttackActive(true);
      setCriticalAlert({
        id: Date.now(),
        ip: '192.168.1.105',
        title: 'Critical Alert: Potential Port Scan / DDoS Detected from IP 192.168.1.105',
        vector: 'TCP SYN Flood / Port Scan (Ports 21-8080)',
        rate: '2,480 probes/sec threshold exceeded'
      });
    }
  };

  // Auto-Block IP from Alert
  const handleAutoBlock = (ipToBlock) => {
    const existing = rules.find((r) => r.ip === ipToBlock && r.action === 'DROP');
    if (!existing) {
      const mitigationRule = {
        id: `FW-${Math.floor(200 + Math.random() * 700)}`,
        ip: ipToBlock,
        port: 'ALL',
        protocol: 'ALL',
        action: 'DROP',
        description: `Auto-Blocked: Suspicious scanning from ${ipToBlock}`,
        hits: 1840,
        bytes: '118 KB',
        status: 'ACTIVE'
      };
      setRules([mitigationRule, ...rules]);
    }
    setCriticalAlert(null);
    setToastNotification({
      title: 'IP Blocked',
      desc: `Rule added: Traffic from ${ipToBlock} will now be dropped.`
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Live packet counts and telemetry
  const totalPkts = logs.length;
  const allowPkts = logs.filter((l) => l.action === 'ALLOW').length;
  const dropPkts = logs.filter((l) => l.action === 'DROP').length;
  const allowPct = totalPkts > 0 ? ((allowPkts / totalPkts) * 100).toFixed(1) : '0.0';
  const dropPct = totalPkts > 0 ? ((dropPkts / totalPkts) * 100).toFixed(1) : '0.0';

  // Minimal standard PDF 1.4 generator for Sentinel Security Audit Report
  const generateAuditPdf = (lines) => {
    let streamContent = 'BT\n/F1 9 Tf\n36 750 Td\n13 TL\n';
    for (let i = 0; i < lines.length; i++) {
      const s = String(lines[i]).split('\\').join('\\\\').split('(').join('\\(').split(')').join('\\)');
      if (i === 0) {
        streamContent += `(${s}) Tj\n`;
      } else {
        streamContent += `T*\n(${s}) Tj\n`;
      }
    }
    streamContent += 'ET\n';

    const streamLen = new TextEncoder().encode(streamContent).length;
    let body = '%PDF-1.4\n';
    const offsets = [];

    const addObj = (str) => {
      offsets.push(body.length);
      body += str + '\n';
    };

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
    addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj');
    addObj('5 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + streamContent + 'endstream\nendobj');

    const startXref = body.length;
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 0; i < offsets.length; i++) {
      xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    const trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + startXref + '\n%%EOF\n';
    return body + xref + trailer;
  };

  // Export report handler: writes directly to C:\Users\ammar\OneDrive\Desktop\Firewall\Reports AND downloads in browser
  const handleExport = async (format) => {
    setExportOpen(false);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    let filename = '';
    let content = '';
    let mimeType = '';

    if (format === 'CSV') {
      filename = `sentinel_firewall_logs_${timestampStr}.csv`;
      mimeType = 'text/csv;charset=utf-8;';

      const csvLines = [
        '# ============================================================================== #',
        '# SENTINEL FIREWALL - TRAFFIC INSPECTION & POLICY AUDIT LOG                       #',
        `# Generated At: ${now.toISOString()}                                      #`,
        '# Target Path: C:\\Users\\ammar\\OneDrive\\Desktop\\Firewall\\Reports              #',
        `# Operational Status: ${isAttackActive ? 'ATTACK SIMULATION ACTIVE' : 'NORMAL OPERATIONAL BASELINE'}               #`,
        `# Telemetry Summary: Total=${totalPkts} | Allowed=${allowPkts} (${allowPct}%) | Dropped=${dropPkts} (${dropPct}%)   #`,
        '# ============================================================================== #',
        '',
        '--- [SECTION 1: ACTIVE FIREWALL RULES] ---',
        'Rule_ID,Target_IP,Port,Protocol,Action,Description,Hits,Bytes,Status',
        ...rules.map(
          (r) =>
            `"${r.id}","${r.ip}","${r.port}","${r.protocol}","${r.action}","${r.description.replace(/"/g, '""')}","${r.hits}","${r.bytes}","${r.status}"`
        ),
        '',
        '--- [SECTION 2: LIVE PACKET INSPECTION LOGS] ---',
        'Timestamp,Packet_ID,Protocol,Source_IP,Source_Port,Dest_IP,Dest_Port,Length_Bytes,TTL,Action,Rule_ID',
        ...logs.map(
          (l) =>
            `"${l.time}","${l.id}","${l.proto}","${l.srcIp}","${l.srcPort}","${l.dstIp}","${l.dstPort}","${l.len}","${l.ttl}","${l.action}","${l.rule}"`
        )
      ];
      content = csvLines.join('\r\n');
    } else {
      filename = `sentinel_security_audit_${timestampStr}.pdf`;
      mimeType = 'application/pdf';

      const pdfLines = [
        '========================================================================',
        '         SENTINEL FIREWALL & IDS - ENTERPRISE AUDIT REPORT              ',
        '========================================================================',
        `Generated At   : ${now.toLocaleString()}`,
        `Save Directory : C:\\Users\\ammar\\OneDrive\\Desktop\\Firewall\\Reports`,
        `Firewall State : ${isAttackActive ? 'ATTACK SIMULATION ACTIVE' : 'NORMAL BASELINE OPERATIONAL'}`,
        `Total Packets  : ${totalPkts}`,
        `Allowed        : ${allowPkts} (${allowPct}%)`,
        `Dropped        : ${dropPkts} (${dropPct}%)`,
        `Active Rules   : ${rules.length} policies enforced`,
        '------------------------------------------------------------------------',
        'SECTION 1: ACTIVE FIREWALL RULES',
        '------------------------------------------------------------------------',
        ...rules.map(
          (r) =>
            `[${r.id}] ${r.action.padEnd(5)} | Proto: ${r.protocol.padEnd(4)} | Port: ${String(r.port).padEnd(5)} | IP: ${r.ip.padEnd(15)} | Hits: ${r.hits}`
        ),
        '------------------------------------------------------------------------',
        'SECTION 2: RECENT PACKET LOGS (SAMPLE)',
        '------------------------------------------------------------------------',
        ...logs.slice(0, 18).map(
          (l) =>
            `${l.time} | ${l.id} | ${l.action.padEnd(5)} | ${l.proto.padEnd(10)} | ${l.srcIp}:${l.srcPort} -> ${l.dstIp}:${l.dstPort}`
        ),
        '========================================================================',
        '                       END OF AUDIT REPORT                              ',
        '========================================================================'
      ];
      content = generateAuditPdf(pdfLines);
    }

    // 1. Save directly to C:\Users\ammar\OneDrive\Desktop\Firewall\Reports via local dev server
    let savedPath = `C:\\Users\\ammar\\OneDrive\\Desktop\\Firewall\\Reports\\${filename}`;
    try {
      const response = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content })
      });
      const data = await response.json();
      if (data.success && data.path) {
        savedPath = data.path;
      }
    } catch (err) {
      console.warn('Direct file save to Reports directory warning:', err);
    }

    // 2. Trigger browser download
    try {
      const blob = new Blob([content], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.warn('Browser download trigger warning:', err);
    }

    // 3. User notification showing exact folder path
    setToastNotification({
      title: `Report Exported & Saved (${format})`,
      desc: `Saved directly to local Reports directory and downloaded.`,
      filename: filename,
      fullPath: savedPath
    });
    setTimeout(() => setToastNotification(null), 6500);
  };

  const handleDownloadProjectZip = () => {
    setExportOpen(false);
    const link = document.createElement('a');
    link.href = '/sentinel-frontend.zip';
    link.download = 'sentinel-frontend.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastNotification({
      title: 'Project ZIP Downloaded',
      desc: 'sentinel-frontend.zip downloaded. Also located in project root & Reports directory.',
      filename: 'sentinel-frontend.zip',
      fullPath: 'C:\\Users\\ammar\\OneDrive\\Desktop\\Firewall\\sentinel-frontend.zip'
    });
    setTimeout(() => setToastNotification(null), 6500);
  };

  const setQuickPort = (p, proto = 'TCP') => {
    setInputPort(p);
    setInputProtocol(proto);
  };

  const filteredRules = rules.filter((r) => {
    const matchAction = ruleActionFilter === 'ALL' || r.action === ruleActionFilter;
    const matchSearch =
      r.ip.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.port.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(ruleSearch.toLowerCase());
    return matchAction && matchSearch;
  });

  const filteredLogs = logs.filter((l) => {
    const matchFilter =
      logFilter === 'ALL' ||
      (logFilter === 'ALLOWED' && l.action === 'ALLOW') ||
      (logFilter === 'DROPPED' && l.action === 'DROP');
    const matchGrep =
      logGrep === '' ||
      l.srcIp.includes(logGrep) ||
      l.dstPort.toString().includes(logGrep) ||
      l.proto.toLowerCase().includes(logGrep.toLowerCase());
    return matchFilter && matchGrep;
  });

  // -------------------------------------------------------------
  // Authentication UI: Mock FIDO2 / WebAuthn Biometric Screen
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {/* Simple Theme Toggle on Login Screen */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border mb-3 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sentinel Firewall</h1>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Local Network Administration Console
            </p>
          </div>

          {/* Login Card */}
          <div className={`rounded-xl border p-6 shadow-sm transition-colors ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            
            {!isVerifying ? (
              <div>
                <div className={`flex items-center justify-between pb-4 mb-5 border-b ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Administrator Login</span>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    isDarkMode
                      ? 'bg-green-950/40 text-green-400 border-green-800/60'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    WebAuthn Ready
                  </span>
                </div>

                <form onSubmit={handleInitiateFido} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                        required
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>Authenticate with Mobile Fingerprint</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInitiateFido}
                      className={`w-full text-xs py-2 px-3 rounded-md border font-medium transition cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-slate-700'
                      }`}
                    >
                      Sign In (Password Only)
                    </button>
                  </div>
                </form>

                <div className={`mt-5 p-3 rounded-md border text-xs flex items-start gap-2 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-400'
                    : 'bg-slate-50 border-gray-200 text-slate-600'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    FIDO2 WebAuthn authentication supported for hardware security keys and mobile devices.
                  </span>
                </div>
              </div>
            ) : (
              /* FIDO2 Biometric Handshake Screen (3-Second Flow) */
              <div className="py-6 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-blue-400'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <Fingerprint className="w-8 h-8" />
                </div>

                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  {verifyStage === 3 ? 'Fingerprint Verified' : 'Waiting for Mobile Fingerprint Verification'}
                </h2>

                <p className={`text-xs max-w-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {verifyStage === 3
                    ? 'Authentication successful. Redirecting to dashboard...'
                    : 'Prompt sent to your registered mobile phone. Tap the sensor to continue.'}
                </p>

                <div className={`w-full h-2 rounded-full overflow-hidden mb-4 border ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'
                }`}>
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${((4 - countdown) / 3) * 100}%` }}
                  />
                </div>

                <div className={`w-full rounded-md border p-3 text-left text-xs space-y-1.5 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-gray-200 text-slate-700'
                }`}>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>CHALLENGE: 0x8F3A...E24B</span>
                    <span>ALGO: ECDSA-ES256</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium text-xs">
                    <span>
                      {verifyStage === 1 && 'Sending prompt to mobile device...'}
                      {verifyStage === 2 && 'Verifying biometric signature...'}
                      {verifyStage === 3 && 'Signature valid (200 OK)'}
                    </span>
                  </div>
                  <div className="text-right text-green-600 font-semibold text-xs">
                    {countdown > 0 ? `Loading in ${countdown}s...` : 'Complete'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            Sentinel Firewall Prototype
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* -------------------------------------------------------------
          1. Left Navigation Sidebar (Enterprise View Controller)
      -------------------------------------------------------------- */}
      <aside className={`w-64 border-r flex flex-col shrink-0 transition-colors z-30 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        
        {/* Brand Header */}
        <div className={`h-16 px-5 border-b flex items-center gap-3 ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <div className={`p-1.5 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block">Sentinel Firewall</span>
            <span className={`text-[11px] flex items-center gap-1.5 font-medium ${
              isAttackActive ? 'text-red-600' : 'text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAttackActive ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`} />
              {isAttackActive ? 'Attack Active' : 'Status: Normal'}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="p-3 space-y-1.5 flex-1">
          <div className="text-[10px] font-semibold uppercase text-slate-400 px-3 py-1 tracking-wider">
            Views
          </div>

          {/* View 1: Live Monitor */}
          <button
            onClick={() => setActiveView('monitor')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
              activeView === 'monitor'
                ? isDarkMode
                  ? 'bg-slate-800 text-blue-400 border-slate-700'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>Live Monitor</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-slate-600'
            }`}>
              {totalPkts} pkts
            </span>
          </button>

          {/* View 2: Policy & Rules */}
          <button
            onClick={() => setActiveView('rules')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
              activeView === 'rules'
                ? isDarkMode
                  ? 'bg-slate-800 text-blue-400 border-slate-700'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Policy & Rules</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-slate-600'
            }`}>
              {rules.length} rules
            </span>
          </button>
        </div>

        {/* Sidebar Footer with User Details & Logout */}
        <div className={`p-3.5 border-t ${
          isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-gray-200 text-slate-700'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold leading-tight">Admin User</div>
                <div className="text-[11px] text-blue-600 font-medium">Role: Admin</div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                setIsAttackActive(false);
                setCriticalAlert(null);
              }}
              title="Log Out"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* -------------------------------------------------------------
          Main Content Column
      -------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className={`h-16 border-b px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-xs'
        }`}>
          {/* View Title & Quick Metadata */}
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-base tracking-tight">
              {activeView === 'monitor' ? 'Live Traffic Monitor & Telemetry' : 'Firewall Policy & Filtering Rules'}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded border ${
              isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-gray-100 text-slate-600 border-gray-200'
            }`}>
              Interface: eth0 (Local)
            </span>
          </div>

          {/* Right Controls: Simulate Attack (Toggle) + Theme Switch + Export Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* 3. Proper On/Off Toggle for Simulate Attack */}
            <button
              onClick={handleToggleAttack}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isAttackActive
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/80'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAttackActive ? 'Stop Attack' : 'Simulate Attack'}</span>
            </button>

            {/* Light/Dark Mode Toggle Switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Light/Dark Theme"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                  : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Export Reports Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`border text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-gray-50 border-gray-300 text-slate-700'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className={`absolute right-0 mt-1 w-64 rounded-md shadow-lg border p-1 z-50 text-xs ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                      <span>Report Formats</span>
                      <span className="text-[10px] text-green-600 font-normal">Direct Disk Save</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <button
                        onClick={() => handleExport('CSV')}
                        className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 cursor-pointer transition ${
                          isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-slate-700'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">Packet Logs (.csv)</div>
                          <div className="text-[10px] text-slate-400">All captured packets & active rules</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('PDF')}
                        className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 cursor-pointer transition ${
                          isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">Security Summary (.pdf)</div>
                          <div className="text-[10px] text-slate-400">Firewall audit & threat metrics</div>
                        </div>
                      </button>
                      <button
                        onClick={handleDownloadProjectZip}
                        className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 cursor-pointer transition border-t border-gray-100 dark:border-slate-700/60 ${
                          isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-slate-700'
                        }`}
                      >
                        <FolderArchive className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">Full Project Source (.zip)</div>
                          <div className="text-[10px] text-slate-400">Complete React + Tailwind project</div>
                        </div>
                      </button>
                    </div>
                    <div className="mt-1 pt-2 px-3 py-2 text-[10px] border-t border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/50 rounded-b">
                      <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                        <Folder className="w-3.5 h-3.5 text-blue-600" />
                        <span>Saved to local folder:</span>
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 dark:text-slate-400 select-all break-all">
                        C:\Users\ammar\OneDrive\Desktop\Firewall\Reports
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* IDS Critical Alert Toast / Banner */}
        {criticalAlert && (
          <div className={`border-b px-6 py-3 transition-colors ${
            isDarkMode ? 'bg-red-950/60 border-red-900/80 text-red-100' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-red-600 text-white">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wide">
                    {criticalAlert.title}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    Vector: {criticalAlert.vector} • Threshold: {criticalAlert.rate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAutoBlock(criticalAlert.ip)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Auto-Block IP (Add DROP Rule)</span>
                </button>
                <button
                  onClick={() => setCriticalAlert(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastNotification && (
          <div className={`fixed bottom-6 right-6 z-50 rounded-lg border p-4 shadow-xl flex items-start gap-3 text-xs max-w-md ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
          }`}>
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white">{toastNotification.title}</div>
              <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {toastNotification.desc}
              </div>
              {toastNotification.filename && (
                <div className={`mt-2 p-2 rounded text-[10px] border flex flex-col gap-1 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-slate-700'
                }`}>
                  <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5" /> File Path:
                  </span>
                  <span className="font-mono select-all break-all text-[9.5px]">
                    {toastNotification.fullPath || `C:\\Users\\ammar\\OneDrive\\Desktop\\Firewall\\Reports\\${toastNotification.filename}`}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* -----------------------------------------------------------
              VIEW 1: 'Live Monitor' (Live Traffic Terminal + Analytics)
          ------------------------------------------------------------ */}
          {activeView === 'monitor' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[640px]">
              
              {/* Terminal Section (xl:col-span-7) */}
              <section className={`xl:col-span-7 rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                {/* Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    <h3 className="font-semibold text-sm">
                      Live Traffic Terminal
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 mr-2">
                      Packets: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{totalPkts}</strong>
                    </span>
                    <button
                      onClick={() => setIsTerminalPaused(!isTerminalPaused)}
                      className={`p-1.5 rounded text-xs transition cursor-pointer border ${
                        isTerminalPaused
                          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700'
                          : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      title={isTerminalPaused ? 'Resume Stream' : 'Pause Stream'}
                    >
                      {isTerminalPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`p-1.5 rounded text-xs transition cursor-pointer border ${
                        autoScroll
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700'
                          : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-white text-slate-400 border-gray-300'
                      }`}
                      title="Auto-scroll"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setLogs([])}
                      className={`p-1.5 rounded text-xs transition cursor-pointer border ${
                        isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-red-400' : 'bg-white text-slate-400 border-gray-300 hover:text-red-600'
                      }`}
                      title="Clear Log Buffer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className={`p-3 border-b flex items-center justify-between gap-2 text-xs ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Filter:</span>
                    <button
                      onClick={() => setLogFilter('ALL')}
                      className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                        logFilter === 'ALL'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setLogFilter('ALLOWED')}
                      className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                        logFilter === 'ALLOWED'
                          ? 'bg-green-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ALLOWED
                    </button>
                    <button
                      onClick={() => setLogFilter('DROPPED')}
                      className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                        logFilter === 'DROPPED'
                          ? 'bg-red-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      DROPPED
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="grep IP / port..."
                      value={logGrep}
                      onChange={(e) => setLogGrep(e.target.value)}
                      className={`rounded-md px-2.5 py-1 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 transition font-mono ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Terminal Window (Strictly Monospace, auto-scrolls internally) */}
                <div className="p-3 flex-1 flex flex-col">
                  <div
                    ref={terminalBoxRef}
                    className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-3.5 font-mono text-xs flex-1 overflow-y-auto custom-scrollbar space-y-1 select-text min-h-[460px] max-h-[580px]"
                  >
                    {filteredLogs.length === 0 ? (
                      <div className="text-center py-20 text-slate-500">
                        {isTerminalPaused ? '[FEED PAUSED - CLICK PLAY TO RESUME]' : '[AWAITING NETWORK FRAMES (2000ms CADENCE)...]'}
                      </div>
                    ) : (
                      filteredLogs.map((pkt) => {
                        const isDrop = pkt.action === 'DROP';
                        return (
                          <div
                            key={pkt.id}
                            className={`flex flex-wrap items-baseline gap-x-2 py-0.5 px-1.5 rounded ${
                              isDrop
                                ? 'bg-red-950/25 hover:bg-red-950/40'
                                : 'bg-green-950/20 hover:bg-green-950/35'
                            }`}
                          >
                            <span className="text-slate-500 text-[11px]">[{pkt.time}]</span>
                            <span
                              className={`font-bold px-1 rounded text-[11px] ${
                                isDrop
                                  ? 'text-red-400 bg-red-950/60'
                                  : 'text-green-400 bg-green-950/60'
                              }`}
                            >
                              {isDrop ? '[DROP]' : '[ALLOW]'}
                            </span>
                            <span className="text-blue-400 font-semibold">{pkt.proto}</span>
                            <span className="text-slate-300">
                              <strong className={pkt.srcIp === '192.168.1.105' ? 'text-red-400 font-bold underline' : 'text-slate-200'}>
                                {pkt.srcIp}:{pkt.srcPort}
                              </strong>
                              <span className="text-slate-500 mx-1">➔</span>
                              <span>{pkt.dstIp}:{pkt.dstPort}</span>
                            </span>
                            <span className="text-slate-500 text-[11px]">len={pkt.len}B</span>
                            <span className="text-slate-500 text-[11px]">ttl={pkt.ttl}</span>
                            <span className="text-slate-400 text-[11px] ml-auto">
                              {pkt.rule}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Terminal Footer */}
                <div className={`p-2.5 border-t flex items-center justify-between text-xs text-slate-500 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    <span>Interface eth0 (Local Promiscuous)</span>
                  </div>
                  <div>Interval: {isAttackActive ? '900ms (Active Attack)' : '2000ms (Normal)'}</div>
                </div>
              </section>

              {/* Analytics Section (xl:col-span-5) */}
              <section className={`xl:col-span-5 rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                {/* Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">
                      Telemetry & Analytics Dashboard
                    </h3>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-gray-100 text-slate-700 border-gray-200'
                  }`}>
                    Live Stream
                  </span>
                </div>

                <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                  {/* 4 Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`border p-3.5 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>Ingress Wire</span>
                        <Wifi className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold mt-1">
                        {throughput} <span className="text-xs font-normal text-slate-500">Gbps</span>
                      </div>
                      <div className="text-[11px] text-green-600 font-medium mt-0.5">
                        {isAttackActive ? '+140% Spike' : 'Nominal Wire-Speed'}
                      </div>
                    </div>

                    <div className={`border p-3.5 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>Packet Rate</span>
                        <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold mt-1">
                        {(packetRate / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">pps</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Inbound Packets
                      </div>
                    </div>

                    <div className={`border p-3.5 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-slate-500">
                        Allowed Packets
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-500 mt-1">
                        {allowPkts}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Permitted Ingress
                      </div>
                    </div>

                    <div className={`border p-3.5 rounded-lg transition-colors ${
                      isAttackActive
                        ? isDarkMode ? 'bg-red-950/40 border-red-800' : 'bg-red-50 border-red-200'
                        : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-slate-500">
                        Dropped / Blocked
                      </div>
                      <div className={`text-lg font-bold mt-1 ${isAttackActive ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {dropPkts}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isAttackActive ? 'Attack Blocked' : 'Rules Enforced'}
                      </div>
                    </div>
                  </div>

                  {/* Real-Time SVG Sparkline Chart */}
                  <div className={`border p-4 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Traffic Volume (Allowed vs Dropped)
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <span className="w-2 h-0.5 bg-green-600 inline-block" /> Allow
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <span className="w-2 h-0.5 bg-red-600 inline-block" /> Drop
                        </span>
                      </div>
                    </div>

                    <div className="h-28 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <line x1="0" y1="25" x2="300" y2="25" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
                        <line x1="0" y1="75" x2="300" y2="75" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />

                        {(() => {
                          const points = sparkPoints.map((p, idx) => {
                            const x = (idx / (sparkPoints.length - 1)) * 300;
                            const y = 100 - p.allow;
                            return `${x},${y}`;
                          }).join(' ');
                          return (
                            <polyline
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          );
                        })()}

                        {(() => {
                          const points = sparkPoints.map((p, idx) => {
                            const x = (idx / (sparkPoints.length - 1)) * 300;
                            const y = 100 - p.drop;
                            return `${x},${y}`;
                          }).join(' ');
                          return (
                            <polyline
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Port Distribution Breakdown */}
                  <div className={`border p-4 rounded-lg space-y-3 text-xs transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Port Traffic Distribution</span>
                      <span className="text-slate-500 font-normal">Layer 4 Analysis</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>Port 443 (HTTPS)</span>
                        <span className="font-medium">52%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div className="bg-green-600 h-full rounded-full" style={{ width: '52%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>Port 80 (HTTP)</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>Port 22 (SSH)</span>
                        <span className={`font-medium ${isAttackActive ? 'text-red-600 font-bold' : ''}`}>
                          {isAttackActive ? '38% (Burst)' : '14%'}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full ${isAttackActive ? 'bg-red-600' : 'bg-amber-600'}`}
                          style={{ width: isAttackActive ? '38%' : '14%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kernel Hooks Table */}
                  <div className={`border p-4 rounded-lg text-xs space-y-1.5 transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Kernel Hooks Status
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>PREROUTING Chain:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>INPUT Chain:</span>
                      <span className="text-green-600 font-medium">Enforcing</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>FORWARD Chain:</span>
                      <span className="text-green-600 font-medium">Stateful Inspection</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* -----------------------------------------------------------
              VIEW 2: 'Policy & Rules' (Full Width, Zero Horizontal Scroll)
          ------------------------------------------------------------ */}
          {activeView === 'rules' && (
            <div className="w-full space-y-6">
              
              {/* Rule Manager Component in Full Width */}
              <section className={`w-full rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                {/* Header */}
                <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-base">
                        Firewall Policy & Filtering Rules Engine
                      </h3>
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Deterministic packet filtering configuration applied to Linux Netfilter / iptables chains.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      isDarkMode
                        ? 'bg-green-950/40 text-green-400 border-green-800/60'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {rules.filter((r) => r.action === 'ALLOW').length} ALLOW Rules
                    </span>
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      isDarkMode
                        ? 'bg-red-950/40 text-red-400 border-red-800/60'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {rules.filter((r) => r.action === 'DROP').length} DROP Rules
                    </span>
                  </div>
                </div>

                {/* Full-Width Rule Input Form */}
                <form onSubmit={handleAddRule} className={`p-5 border-b space-y-4 ${
                  isDarkMode ? 'border-slate-700 bg-slate-850' : 'border-gray-200 bg-slate-50/60'
                }`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Deploy New Filtering Rule
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Target IP / Subnet CIDR</label>
                      <input
                        type="text"
                        placeholder="e.g. 192.168.1.105 or 10.0.0.0/24"
                        value={inputIp}
                        onChange={(e) => setInputIp(e.target.value)}
                        className={`w-full rounded-md px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Target Port</label>
                      <input
                        type="text"
                        placeholder="e.g. 80, 443, 22, ALL"
                        value={inputPort}
                        onChange={(e) => setInputPort(e.target.value)}
                        className={`w-full rounded-md px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Protocol</label>
                      <select
                        value={inputProtocol}
                        onChange={(e) => setInputProtocol(e.target.value)}
                        className={`w-full rounded-md px-2.5 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      >
                        <option value="TCP">TCP</option>
                        <option value="UDP">UDP</option>
                        <option value="ICMP">ICMP</option>
                        <option value="ALL">ALL / ANY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Action Policy</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInputAction('ALLOW')}
                          className={`py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
                            inputAction === 'ALLOW'
                              ? 'bg-green-600 text-white border-green-600'
                              : isDarkMode
                                ? 'bg-slate-900 text-slate-400 border-slate-700'
                                : 'bg-white text-slate-600 border-gray-300'
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputAction('DROP')}
                          className={`py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
                            inputAction === 'DROP'
                              ? 'bg-red-600 text-white border-red-600'
                              : isDarkMode
                                ? 'bg-slate-900 text-slate-400 border-slate-700'
                                : 'bg-white text-slate-600 border-gray-300'
                          }`}
                        >
                          DROP
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Policy Label / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Block malicious port scanner"
                        value={inputDesc}
                        onChange={(e) => setInputDesc(e.target.value)}
                        className={`w-full rounded-md px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Form Footer with Presets & Submit */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">Quick Presets:</span>
                      <button type="button" onClick={() => setQuickPort('443', 'TCP')} className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                      }`}>443 (HTTPS)</button>
                      <button type="button" onClick={() => setQuickPort('80', 'TCP')} className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                      }`}>80 (HTTP)</button>
                      <button type="button" onClick={() => setQuickPort('22', 'TCP')} className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                      }`}>22 (SSH)</button>
                      <button type="button" onClick={() => setQuickPort('53', 'UDP')} className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                      }`}>53 (DNS)</button>
                      <button type="button" onClick={() => setQuickPort('ALL', 'ALL')} className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                      }`}>ALL PORTS</button>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Commit Rule</span>
                    </button>
                  </div>
                </form>

                {/* Filter and Search Bar */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search active rules by IP, port, or description..."
                      value={ruleSearch}
                      onChange={(e) => setRuleSearch(e.target.value)}
                      className={`w-full rounded-md pl-9 pr-3 py-1.5 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Filter Action:</span>
                    <button
                      onClick={() => setRuleActionFilter('ALL')}
                      className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                        ruleActionFilter === 'ALL'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({rules.length})
                    </button>
                    <button
                      onClick={() => setRuleActionFilter('ALLOW')}
                      className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                        ruleActionFilter === 'ALLOW'
                          ? 'bg-green-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Allow ({rules.filter(r => r.action === 'ALLOW').length})
                    </button>
                    <button
                      onClick={() => setRuleActionFilter('DROP')}
                      className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                        ruleActionFilter === 'DROP'
                          ? 'bg-red-600 text-white'
                          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Drop ({rules.filter(r => r.action === 'DROP').length})
                    </button>
                  </div>
                </div>

                {/* Full-Width Rules Table (Zero Horizontal Scrolling) */}
                <div className="w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] font-semibold uppercase text-slate-500 ${
                        isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <th className="py-3 px-4">Rule ID</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Target Prefix</th>
                        <th className="py-3 px-4">Port</th>
                        <th className="py-3 px-4">Protocol</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Hit Count</th>
                        <th className="py-3 px-4">Volume</th>
                        <th className="py-3 px-4">State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/80' : 'divide-gray-200'}`}>
                      {filteredRules.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="py-12 text-center text-slate-500 text-sm">
                            No rules found matching "{ruleSearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredRules.map((rule) => {
                          const isAllow = rule.action === 'ALLOW';
                          return (
                            <tr key={rule.id} className={`transition ${
                              isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-50'
                            }`}>
                              <td className="py-3 px-4 font-semibold text-slate-500 font-mono">{rule.id}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                                    isAllow
                                      ? isDarkMode
                                        ? 'bg-green-950/40 text-green-400 border-green-800/60'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                      : isDarkMode
                                        ? 'bg-red-950/40 text-red-400 border-red-800/60'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {rule.action}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium font-mono text-slate-900 dark:text-slate-100">{rule.ip}</td>
                              <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{rule.port}</td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{rule.protocol}</td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{rule.description}</td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                                {rule.hits.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{rule.bytes}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleRule(rule.id)}
                                  className={`text-[11px] px-2.5 py-1 rounded border transition cursor-pointer font-medium ${
                                    rule.status === 'ACTIVE'
                                      ? isDarkMode
                                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                                        : 'bg-gray-100 text-slate-700 border-gray-200 hover:bg-gray-200'
                                      : isDarkMode
                                        ? 'bg-slate-900 text-slate-500 border-slate-800'
                                        : 'bg-gray-50 text-slate-400 border-gray-200'
                                  }`}
                                >
                                  {rule.status}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                                  title="Delete Rule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          )}

        </main>

        {/* Footer */}
        <footer className={`border-t py-3.5 px-6 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">Sentinel Firewall</span>
            <span>&copy; 2026</span>
            <span>//</span>
            <span>Local Administration Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FIDO2 WebAuthn Protected</span>
            <span>Telemetry Stream: Active</span>
            <span>System Healthy</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
