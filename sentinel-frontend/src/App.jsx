import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import IdsAlertBanner from './components/IdsAlertBanner';
import ToastNotification from './components/ToastNotification';
import LiveMonitorView from './views/LiveMonitorView';
import PolicyRulesView from './views/PolicyRulesView';
import { exportFirewallReport } from './utils/reportExporter';
import {
  INITIAL_RULES,
  INITIAL_LOGS,
  INITIAL_SPARKPOINTS
} from './constants/initialData';

export default function App() {
  // Theme State: Default is Light Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // View State: Controlled by Left Sidebar ('monitor' | 'rules')
  const [activeView, setActiveView] = useState('monitor');

  // Authentication & FIDO2 Verification State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState(0); // 0: Idle, 1: Dispatched, 2: Cryptographic Signature, 3: Verified
  const [countdown, setCountdown] = useState(3);
  const [username, setUsername] = useState('admin@sentinel.local');
  const [password, setPassword] = useState('••••••••••••••••');

  // Top Nav & Feedback States
  const [exportOpen, setExportOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Rule Manager State
  const [rules, setRules] = useState(INITIAL_RULES);
  const [inputIp, setInputIp] = useState('');
  const [inputPort, setInputPort] = useState('');
  const [inputProtocol, setInputProtocol] = useState('TCP');
  const [inputAction, setInputAction] = useState('DROP');
  const [inputDesc, setInputDesc] = useState('');
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleActionFilter, setRuleActionFilter] = useState('ALL');

  // Live Traffic Monitor (Terminal) State & Container Ref
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logGrep, setLogGrep] = useState('');
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalBoxRef = useRef(null);

  // IDS Attack Simulation State
  const [isAttackActive, setIsAttackActive] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);

  // Analytics Telemetry State
  const [throughput, setThroughput] = useState(2.38);
  const [packetRate, setPacketRate] = useState(148200);
  const [sparkPoints, setSparkPoints] = useState(INITIAL_SPARKPOINTS);

  // -------------------------------------------------------------
  // FIDO2 Authentication Logic
  // -------------------------------------------------------------
  const handleInitiateFido = (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setVerifyStage(1);
    setCountdown(3);
  };

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsVerifying(false);
    setVerifyStage(0);
    setCriticalAlert(null);
  };

  // -------------------------------------------------------------
  // Live Packet Generator Loop
  // -------------------------------------------------------------
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

  // Terminal interval
  useEffect(() => {
    if (!isLoggedIn || isTerminalPaused) return;

    const intervalMs = isAttackActive ? 900 : 2000;
    const interval = setInterval(() => {
      const newPkt = generatePacket();
      setLogs((prev) => [...prev.slice(-45), newPkt]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLoggedIn, isTerminalPaused, isAttackActive, generatePacket]);

  // Auto-scroll inside terminal container ONLY (prevents window scroll hijacking)
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

  // -------------------------------------------------------------
  // Rule Actions
  // -------------------------------------------------------------
  const handleAddRule = (e) => {
    e.preventDefault();
    if (!inputIp.trim() || !inputPort.trim()) return;

    const newRule = {
      id: `FW-${Math.floor(100 + Math.random() * 900)}`,
      ip: inputIp.trim(),
      port: inputPort.trim().toUpperCase(),
      protocol: inputProtocol,
      action: inputAction,
      description: inputDesc.trim() || `Rule: ${inputAction} ${inputProtocol} on port ${inputPort}`,
      hits: 0,
      bytes: '0 B',
      status: 'ACTIVE'
    };

    setRules([newRule, ...rules]);
    setInputIp('');
    setInputPort('');
    setInputDesc('');

    setToastNotification({
      title: 'Rule Added',
      desc: `Rule ${newRule.id} saved and applied.`
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleToggleRule = (id) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r)));
  };

  const handleDeleteRule = (id) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const setQuickPort = (p, proto = 'TCP') => {
    setInputPort(p);
    setInputProtocol(proto);
  };

  // -------------------------------------------------------------
  // Attack Simulation On/Off Toggle
  // -------------------------------------------------------------
  const handleToggleAttack = () => {
    if (isAttackActive) {
      setIsAttackActive(false);
      setCriticalAlert(null);
      setToastNotification({
        title: 'Attack Simulation Stopped',
        desc: 'Network traffic rate and packet inspection restored to normal baseline.'
      });
      setTimeout(() => setToastNotification(null), 3000);
    } else {
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

  // -------------------------------------------------------------
  // Reports Export Handler (CSV / PDF to Reports/ and browser download)
  // -------------------------------------------------------------
  const totalPkts = logs.length;
  const allowPkts = logs.filter((l) => l.action === 'ALLOW').length;
  const dropPkts = logs.filter((l) => l.action === 'DROP').length;
  const allowPct = totalPkts > 0 ? ((allowPkts / totalPkts) * 100).toFixed(1) : '0.0';
  const dropPct = totalPkts > 0 ? ((dropPkts / totalPkts) * 100).toFixed(1) : '0.0';

  const handleExport = async (format) => {
    setExportOpen(false);

    const stats = { totalPkts, allowPkts, dropPkts, allowPct, dropPct };
    const result = await exportFirewallReport({
      format,
      logs,
      rules,
      stats,
      isAttackActive
    });

    setToastNotification({
      title: `Report Exported & Saved (${format})`,
      desc: `Saved directly to local Reports directory and downloaded.`,
      filename: result.filename,
      fullPath: result.savedPath
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
      fullPath: 'sentinel-frontend.zip'
    });
    setTimeout(() => setToastNotification(null), 6500);
  };

  // -------------------------------------------------------------
  // Filtered Rules & Logs
  // -------------------------------------------------------------
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
  // Unauthenticated Screen
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <AuthScreen
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isVerifying={isVerifying}
        verifyStage={verifyStage}
        countdown={countdown}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        onInitiateFido={handleInitiateFido}
      />
    );
  }

  // -------------------------------------------------------------
  // Main Enterprise Dashboard with Left Sidebar
  // -------------------------------------------------------------
  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
        isAttackActive={isAttackActive}
        totalPkts={totalPkts}
        rulesCount={rules.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          activeView={activeView}
          isAttackActive={isAttackActive}
          onToggleAttack={handleToggleAttack}
          exportOpen={exportOpen}
          setExportOpen={setExportOpen}
          onExport={handleExport}
          onDownloadZip={handleDownloadProjectZip}
        />

        {/* IDS Critical Alert Toast / Banner */}
        <IdsAlertBanner
          isDarkMode={isDarkMode}
          criticalAlert={criticalAlert}
          onAutoBlock={handleAutoBlock}
          onDismiss={() => setCriticalAlert(null)}
        />

        {/* Global Toast Notification */}
        <ToastNotification
          isDarkMode={isDarkMode}
          toast={toastNotification}
          onClose={() => setToastNotification(null)}
        />

        {/* Main View Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeView === 'monitor' && (
            <LiveMonitorView
              isDarkMode={isDarkMode}
              filteredLogs={filteredLogs}
              totalPkts={totalPkts}
              isTerminalPaused={isTerminalPaused}
              setIsTerminalPaused={setIsTerminalPaused}
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              logGrep={logGrep}
              setLogGrep={setLogGrep}
              isAttackActive={isAttackActive}
              terminalBoxRef={terminalBoxRef}
              throughput={throughput}
              packetRate={packetRate}
              allowPkts={allowPkts}
              dropPkts={dropPkts}
              sparkPoints={sparkPoints}
            />
          )}

          {activeView === 'rules' && (
            <PolicyRulesView
              isDarkMode={isDarkMode}
              rules={rules}
              filteredRules={filteredRules}
              inputIp={inputIp}
              setInputIp={setInputIp}
              inputPort={inputPort}
              setInputPort={setInputPort}
              inputProtocol={inputProtocol}
              setInputProtocol={setInputProtocol}
              inputAction={inputAction}
              setInputAction={setInputAction}
              inputDesc={inputDesc}
              setInputDesc={setInputDesc}
              ruleSearch={ruleSearch}
              setRuleSearch={setRuleSearch}
              ruleActionFilter={ruleActionFilter}
              setRuleActionFilter={setRuleActionFilter}
              onAddRule={handleAddRule}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
              onQuickPort={setQuickPort}
            />
          )}
        </main>
      </div>
    </div>
  );
}
