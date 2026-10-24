import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import IdsAlertBanner from './components/IdsAlertBanner';
import ToastNotification from './components/ToastNotification';
import LiveMonitorView from './views/LiveMonitorView';
import PolicyRulesView from './views/PolicyRulesView';
import IntrusionDetectionView from './views/IntrusionDetectionView';
import { exportFirewallReport } from './utils/reportExporter';
import { auth } from './firebase';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { api } from './services/api';
import { INITIAL_RULES, INITIAL_SPARKPOINTS, INITIAL_THREAT_EVENTS } from './constants/initialData';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Auth Mode Tab ('admin' | 'firebase')
  const [authTab, setAuthTab] = useState('admin');

  // Firebase Email/Password Authentication State
  const [firebaseEmail, setFirebaseEmail] = useState('');
  const [firebasePassword, setFirebasePassword] = useState('');
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);

  // Firebase Guest Authentication State
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState(null);

  // Top Nav & Feedback States
  const [exportOpen, setExportOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Rule Manager State - Default rule 'FW-1' ensures table is not completely empty
  const [rules, setRules] = useState(INITIAL_RULES);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [inputIp, setInputIp] = useState('');
  const [inputPort, setInputPort] = useState('');
  const [inputProtocol, setInputProtocol] = useState('TCP');
  const [inputAction, setInputAction] = useState('DROP');
  const [inputDesc, setInputDesc] = useState('');
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleActionFilter, setRuleActionFilter] = useState('ALL');

  // Live Traffic Monitor (Terminal) State - Starts empty (no dummy placeholder logs)
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logGrep, setLogGrep] = useState('');
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalBoxRef = useRef(null);

  // IDS Attack Simulation & Threat Intelligence State
  const [isAttackActive, setIsAttackActive] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);
  const [threatEvents, setThreatEvents] = useState(INITIAL_THREAT_EVENTS);

  // Analytics Telemetry State - Starts with nominal telemetry and updates with real traffic
  const [throughput, setThroughput] = useState(2.38);
  const [packetRate, setPacketRate] = useState(148200);
  const [sparkPoints, setSparkPoints] = useState(INITIAL_SPARKPOINTS);
  const logsRef = useRef(logs);
  const rulesRef = useRef(rules);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  // -------------------------------------------------------------
  // Real WebAuthn (Passkey / Phone Biometric) Authentication
  // -------------------------------------------------------------
  const handlePhoneBiometricLogin = async (e) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('⚠️ Please enter both Administrator ID and Password.');
      return;
    }

    if (username !== 'Ammar.K' || password !== 'hackAMR') {
      alert('❌ Access Denied: Invalid Username or Password!');
      return;
    }

    if (!window.PublicKeyCredential) {
      alert('⚠️ WebAuthn is not supported in this browser or environment.');
      return;
    }

    try {
      const challengeBuffer = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBuffer);

      const publicKeyCredentialRequestOptions = {
        challenge: challengeBuffer,
        timeout: 60000,
        userVerification: 'preferred'
      };

      if (window.location.hostname && !/^[0-9.]+$/.test(window.location.hostname)) {
        publicKeyCredentialRequestOptions.rpId = window.location.hostname;
      }

      console.log('Initiating WebAuthn Phone/Device biometric verification via navigator.credentials.get()...');

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (credential) {
        console.log('WebAuthn Biometric Authenticated Successfully:', credential);
        setIsLoggedIn(true);
        setToastNotification({
          title: 'Phone Biometric Verified',
          desc: `WebAuthn Passkey confirmed. Administrator ${username} authenticated.`
        });
        setTimeout(() => setToastNotification(null), 4000);
      }
    } catch (err) {
      console.warn('WebAuthn Error:', err);
      if (err.name === 'NotAllowedError') {
        alert('⚠️ WebAuthn Biometric request was cancelled or timed out.');
      } else {
        alert(`❌ WebAuthn Authentication Failed: ${err.message || 'Verification could not be completed.'}`);
      }
    }
  };

  // -------------------------------------------------------------
  // FIDO2 Mock Authentication Animation
  // -------------------------------------------------------------
  const handleInitiateFido = (e) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('⚠️ Please enter both Administrator ID and Password.');
      return;
    }

    if (username !== 'Ammar' || password !== 'hackAMR') {
      alert('❌ Access Denied: Invalid Username or Password!');
      return;
    }

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

  const handlePasswordSubmit = (e) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('⚠️ Please enter both Administrator ID and Password.');
      return;
    }

    if (username !== 'Ammar' || password !== 'hackAMR') {
      alert('❌ Access Denied: Invalid Username or Password!');
      return;
    }

    setIsLoggedIn(true);
    setToastNotification({
      title: 'Admin Session Authenticated',
      desc: `Administrator ${username} authenticated successfully.`
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsVerifying(false);
    setVerifyStage(0);
    setCriticalAlert(null);
    setGuestError(null);
    setFirebaseError(null);
  };

  // -------------------------------------------------------------
  // Firebase Email/Password Authentication
  // -------------------------------------------------------------
  const handleFirebaseEmailLogin = async (e) => {
    if (e) e.preventDefault();
    if (!firebaseEmail || !firebasePassword) {
      setFirebaseError('Please enter both email and password.');
      return;
    }

    try {
      setIsFirebaseLoading(true);
      setFirebaseError(null);
      const userCredential = await signInWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
      const user = userCredential.user;
      console.log('Firebase Email Login Successful:', user.email, user.uid);
      setIsLoggedIn(true);
      setToastNotification({
        title: 'Firebase Login Successful',
        desc: `Welcome ${user.email}! Authenticated via Firebase Email/Password.`
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err) {
      console.error('Firebase Email Login Error:', err);
      let message = err.message || 'Firebase sign-in failed. Please check your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is improperly formatted.';
      }
      setFirebaseError(message);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Quick Guest Access (Firebase Anonymous Authentication)
  // -------------------------------------------------------------
  const handleGuestLogin = async () => {
    try {
      setIsGuestLoading(true);
      setGuestError(null);
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log('Firebase Anonymous Login Successful:', user.uid);
      setIsLoggedIn(true);
      setToastNotification({
        title: 'Guest Session Granted',
        desc: `Authenticated via Firebase Anonymous Login (UID: ${user.uid.slice(0, 8)}...). Access granted.`
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err) {
      console.error('Firebase Anonymous Login Error:', err);
      setGuestError(err.message || 'Firebase anonymous sign-in failed. Please check your connection.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Dynamic Database Rule Fetching
  // -------------------------------------------------------------
  const loadRulesFromBackend = useCallback(async () => {
    setIsRulesLoading(true);
    const dbRules = await api.getRules();

    if (dbRules !== null && dbRules.length > 0) {
      setBackendStatus('connected');
      const formatted = dbRules.map((r, index) => {
        const hitsNum = Number(r.hits) || 0;
        let rawBytesNum = Number(r.raw_bytes) || 0;
        if (!rawBytesNum && r.bytes) {
          const match = String(r.bytes).match(/^([0-9.]+)\s*(B|KB|MB|GB)?/i);
          if (match) {
            const num = parseFloat(match[1]);
            const unit = (match[2] || 'B').toUpperCase();
            if (unit === 'KB') rawBytesNum = Math.round(num * 1024);
            else if (unit === 'MB') rawBytesNum = Math.round(num * 1024 * 1024);
            else if (unit === 'GB') rawBytesNum = Math.round(num * 1024 * 1024 * 1024);
            else rawBytesNum = Math.round(num);
          }
        }
        return {
          id: r.id ? (typeof r.id === 'number' ? `FW-${r.id}` : r.id) : `FW-${index + 1}`,
          rawId: r.id,
          ip: r.target_ip || r.ip || '0.0.0.0/0',
          port: r.port ? r.port.toString().toUpperCase() : 'ALL',
          protocol: r.protocol || 'TCP',
          action: (r.action || 'DROP').toUpperCase(),
          description:
            r.description || r.desc || `${r.action || 'DROP'} ${r.protocol || 'TCP'} on ${r.port || 'ALL'}`,
          hits: hitsNum,
          rawBytes: rawBytesNum,
          bytes: r.bytes || `${rawBytesNum} B`,
          status: r.status || 'ACTIVE'
        };
      });
      setRules(formatted);
    } else if (dbRules !== null) {
      setBackendStatus('connected');
      // If DB has 0 rules, preserve the default FW-1 rule so table is not empty
      setRules((prev) => (prev.length > 0 ? prev : INITIAL_RULES));
    } else {
      setBackendStatus('offline');
      // Offline fallback: keep exactly one default rule FW-1
      setRules((prev) => (prev.length > 0 ? prev : INITIAL_RULES));
    }
    setIsRulesLoading(false);
  }, []);

  // Fetch rules from backend when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadRulesFromBackend();
    }
  }, [isLoggedIn, loadRulesFromBackend]);

  // -------------------------------------------------------------
  // Live Packet Evaluation & Telemetry
  // -------------------------------------------------------------
  const generatePacket = useCallback(() => {
    const isAttackPacket = isAttackActive && Math.random() > 0.20;
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

    // Evaluate live packet against actual configured rules
    const activeRules = rulesRef.current.filter((r) => r.status === 'ACTIVE');

    // Sort rules: Specific IP rules first before wildcard (0.0.0.0/0 or ALL),
    // and specific port rules first before 'ALL'
    const sortedRules = [...activeRules].sort((a, b) => {
      const aSpecificIp = a.ip !== '0.0.0.0/0' && a.ip !== 'ALL' && a.ip !== '';
      const bSpecificIp = b.ip !== '0.0.0.0/0' && b.ip !== 'ALL' && b.ip !== '';
      if (aSpecificIp && !bSpecificIp) return -1;
      if (!aSpecificIp && bSpecificIp) return 1;

      const aSpecificPort = a.port !== 'ALL';
      const bSpecificPort = b.port !== 'ALL';
      if (aSpecificPort && !bSpecificPort) return -1;
      if (!aSpecificPort && bSpecificPort) return 1;

      return 0;
    });

    const matchRule = (r) => {
      const ipMatch = r.ip === '0.0.0.0/0' || r.ip === 'ALL' || r.ip === srcIp;
      const portMatch = r.port === 'ALL' || r.port === dstPort.toString();
      const protoClean = proto.split(' ')[0].toUpperCase();
      const protoMatch =
        !r.protocol ||
        r.protocol === 'ALL' ||
        r.protocol.toUpperCase() === protoClean ||
        proto.toUpperCase().includes(r.protocol.toUpperCase());
      return ipMatch && portMatch && protoMatch;
    };

    let action = 'ALLOW';
    let matchedRule = 'DEFAULT';

    if (isAttackPacket) {
      // 1. Check if there is an explicit user rule matching 192.168.1.105 (e.g. from Auto-Block or manual configuration)
      const explicitRule = sortedRules.find(
        (r) => (r.ip === srcIp || r.ip === '192.168.1.105') && matchRule(r)
      );

      if (explicitRule) {
        action = explicitRule.action;
        matchedRule = explicitRule.id;
      } else {
        // 2. Check if any wildcard DROP rule matches
        const wildcardDropRule = sortedRules.find((r) => r.action === 'DROP' && matchRule(r));
        if (wildcardDropRule) {
          action = 'DROP';
          matchedRule = wildcardDropRule.id;
        } else {
          // 3. Automated Threat Mitigation / IDS intercepts malicious traffic
          action = 'DROP';
          matchedRule = 'IDS-BLOCK';
        }
      }
    } else {
      // Normal traffic: Evaluate against configured rules in order of specificity
      const matched = sortedRules.find(matchRule);
      if (matched) {
        action = matched.action;
        matchedRule = matched.id;
      } else {
        action = 'ALLOW';
        matchedRule = 'DEFAULT';
      }
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
  }, [isAttackActive]);

  // Record packet hit to rule table and sync with backend
  const recordPacketHit = useCallback((matchedRuleId, pktLen) => {
    if (!matchedRuleId || matchedRuleId === 'DEFAULT' || matchedRuleId === 'IDS-BLOCK' || matchedRuleId === 'IDS-TRAP') return;

    setRules((prevRules) => {
      let targetRawId = null;
      let newHitsCount = 0;
      let formattedBytesStr = '0 B';

      const updated = prevRules.map((r) => {
        if (r.id === matchedRuleId) {
          const newHits = (r.hits || 0) + 1;
          const currentBytesNum = (r.rawBytes || 0) + pktLen;
          let bytesFormatted = `${currentBytesNum} B`;
          if (currentBytesNum > 1024 * 1024) {
            bytesFormatted = `${(currentBytesNum / (1024 * 1024)).toFixed(1)} MB`;
          } else if (currentBytesNum > 1024) {
            bytesFormatted = `${(currentBytesNum / 1024).toFixed(1)} KB`;
          }

          targetRawId = r.rawId;
          newHitsCount = newHits;
          formattedBytesStr = bytesFormatted;

          return {
            ...r,
            hits: newHits,
            rawBytes: currentBytesNum,
            bytes: bytesFormatted
          };
        }
        return r;
      });

      if (targetRawId) {
        api.updateRuleHits(targetRawId, newHitsCount, formattedBytesStr);
      }

      return updated;
    });
  }, []);

  // Real-time Threat Signature Anomaly Inspection
  const inspectPacketForThreats = useCallback((pkt) => {
    if (!pkt) return;

    const isAttackIp = pkt.srcIp === '192.168.1.105' || pkt.srcIp === '45.154.255.89' || pkt.srcIp === '185.220.101.5';
    const isSynScan = pkt.proto && pkt.proto.includes('SYN');
    const sensitivePorts = [21, 22, 23, 25, 135, 445, 1433, 3389];

    if (isAttackIp || (isSynScan && sensitivePorts.includes(pkt.dstPort)) || (isAttackActive && Math.random() > 0.3)) {
      let vector = 'TCP SYN Flood (DDoS)';
      let signatureId = 'ET-DOS-SYNFLOOD';
      let severity = 'CRITICAL';

      if (pkt.dstPort === 22) {
        vector = 'SSH Credential Brute-Force';
        signatureId = 'ET-AUTH-SSH-PROBE';
        severity = 'HIGH';
      } else if (pkt.dstPort === 3389) {
        vector = 'RDP Remote Desktop Brute-Force';
        signatureId = 'ET-AUTH-RDP-ATTACK';
        severity = 'HIGH';
      } else if (pkt.dstPort === 445 || pkt.dstPort === 135) {
        vector = 'SMB / RPC Exploit Probe (MS17-010)';
        signatureId = 'ET-EXPLOIT-SMB-PROBE';
        severity = 'CRITICAL';
      } else if (pkt.dstPort === 80 || pkt.dstPort === 8080) {
        vector = isSynScan ? 'HTTP Service Flooding' : 'Web SQLi / Directory Traversal Scan';
        signatureId = isSynScan ? 'ET-DOS-HTTP-FLOOD' : 'ET-WEB-SQLI-SCAN';
        severity = isSynScan ? 'HIGH' : 'MEDIUM';
      } else if (pkt.dstPort === 53) {
        vector = 'DNS Amplification Reflection Query';
        signatureId = 'ET-DNS-AMPLIFY';
        severity = 'MEDIUM';
      } else if ([21, 23, 25, 1433].includes(pkt.dstPort)) {
        vector = 'Reconnaissance / Service Port Scan';
        signatureId = 'ET-SCAN-PORTSWEEP';
        severity = 'HIGH';
      }

      setThreatEvents((prev) => {
        // Aggregate if same attacker and vector within 8 seconds
        const existingIdx = prev.findIndex(
          (t) => t.attackerIp === pkt.srcIp && t.vector === vector && Date.now() - t.timestamp < 8000
        );

        if (existingIdx !== -1) {
          const copy = [...prev];
          copy[existingIdx] = {
            ...copy[existingIdx],
            time: pkt.time,
            timestamp: Date.now(),
            packetCount: (copy[existingIdx].packetCount || 1) + 1
          };
          return copy;
        }

        const newThreat = {
          id: `THR-${Math.floor(1000 + Math.random() * 9000)}`,
          time: pkt.time,
          timestamp: Date.now(),
          attackerIp: pkt.srcIp,
          targetPort: pkt.dstPort,
          protocol: pkt.proto,
          vector,
          signatureId,
          severity,
          confidence: Math.floor(92 + Math.random() * 8),
          packetCount: 1
        };

        return [newThreat, ...prev.slice(0, 49)];
      });
    }
  }, [isAttackActive]);

  // Terminal Live Stream loop
  useEffect(() => {
    if (!isLoggedIn || isTerminalPaused) return;

    const intervalMs = isAttackActive ? 700 : 1800;
    const interval = setInterval(() => {
      const newPkt = generatePacket();
      setLogs((prev) => [...prev.slice(-60), newPkt]);
      recordPacketHit(newPkt.rule, newPkt.len);
      api.recordLog(newPkt);
      inspectPacketForThreats(newPkt);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLoggedIn, isTerminalPaused, isAttackActive, generatePacket, recordPacketHit, inspectPacketForThreats]);

  // Auto-scroll inside terminal container ONLY
  useEffect(() => {
    if (autoScroll && terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Dynamic Telemetry calculation loop
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const currentLogs = logsRef.current;
      const baseThroughput = isAttackActive ? 4.92 : 2.41;
      const jitterT = Number((baseThroughput + (Math.random() * 0.3 - 0.15)).toFixed(2));
      setThroughput(jitterT);

      const basePackets = isAttackActive ? 285000 : 149500;
      const jitterP = Math.floor(basePackets + (Math.random() * 10000 - 5000));
      setPacketRate(jitterP);

      setSparkPoints((prev) => {
        const recentLogs = currentLogs.slice(-20);
        const allowCount = recentLogs.filter((l) => l.action === 'ALLOW').length;
        const dropCount = recentLogs.filter((l) => l.action === 'DROP').length;
        const total = allowCount + dropCount;

        let allowRatio = total > 0 ? Math.round((allowCount / total) * 100) : 88;
        let dropRatio = total > 0 ? Math.round((dropCount / total) * 100) : 6;

        if (isAttackActive) {
          allowRatio = Math.max(35, Math.min(65, allowRatio));
          dropRatio = Math.max(45, Math.min(85, dropRatio));
        }

        const newPoint = {
          allow: Math.max(10, Math.min(95, allowRatio + Math.floor(Math.random() * 8 - 4))),
          drop: Math.max(4, Math.min(95, dropRatio + Math.floor(Math.random() * 6 - 3)))
        };

        const trimmed = prev.length >= 10 ? prev.slice(1) : prev;
        return [...trimmed, newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAttackActive]);

  // -------------------------------------------------------------
  // Rule Actions (Commit to MySQL DB / State)
  // -------------------------------------------------------------
  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!inputIp.trim() || !inputPort.trim()) return;

    const rawRule = {
      ip: inputIp.trim(),
      port: inputPort.trim().toUpperCase(),
      protocol: inputProtocol,
      action: inputAction,
      description: inputDesc.trim() || `${inputAction} ${inputProtocol} on port ${inputPort.trim()}`,
      hits: 0,
      rawBytes: 0,
      bytes: '0 B',
      status: 'ACTIVE'
    };

    const backendRes = await api.createRule(rawRule);
    let newRule;

    if (backendRes && backendRes.id) {
      setBackendStatus('connected');
      newRule = {
        ...rawRule,
        id: `FW-${backendRes.id}`,
        rawId: backendRes.id
      };
      setToastNotification({
        title: 'Rule Committed to MySQL',
        desc: `Rule ${newRule.id} saved to firewall_rules table.`
      });
    } else {
      newRule = {
        ...rawRule,
        id: `FW-${Math.floor(100 + Math.random() * 900)}`
      };
      setToastNotification({
        title: 'Rule Deployed Locally',
        desc: `Backend offline; rule ${newRule.id} saved in active memory.`
      });
    }

    setRules((prev) => [newRule, ...prev]);
    setInputIp('');
    setInputPort('');
    setInputDesc('');
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleToggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r))
    );
  };

  const handleDeleteRule = async (id) => {
    const ruleToDelete = rules.find((r) => r.id === id);
    if (ruleToDelete && ruleToDelete.rawId) {
      await api.deleteRule(ruleToDelete.rawId);
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
    setToastNotification({
      title: 'Rule Deleted',
      desc: `Rule ${id} removed from active policy.`
    });
    setTimeout(() => setToastNotification(null), 3000);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setThroughput(0.0);
    setPacketRate(0);
    setSparkPoints([]);
    setToastNotification({
      title: 'Terminal Buffer Cleared',
      desc: 'All packet frames flushed. Ready for fresh traffic.'
    });
    setTimeout(() => setToastNotification(null), 3000);
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
      const alertTime = new Date().toTimeString().split(' ')[0];
      setCriticalAlert({
        id: Date.now(),
        ip: '192.168.1.105',
        title: 'Critical Alert: Potential Port Scan / DDoS Detected from IP 192.168.1.105',
        vector: 'TCP SYN Flood / Port Scan (Ports 21-8080)',
        rate: '2,480 probes/sec threshold exceeded'
      });

      // Log initial high-priority signature into threat feed
      const initialThreat = {
        id: `THR-${Date.now().toString().slice(-4)}`,
        time: alertTime,
        timestamp: Date.now(),
        attackerIp: '192.168.1.105',
        targetPort: 'MULTI',
        protocol: 'TCP [SYN]',
        vector: 'TCP SYN Flood / Port Scan (Ports 21-8080)',
        signatureId: 'ET-DOS-SYNFLOOD-CRITICAL',
        severity: 'CRITICAL',
        confidence: 99,
        packetCount: 2480
      };
      setThreatEvents((prev) => [initialThreat, ...prev.slice(0, 49)]);
    }
  };

  const handleAutoBlock = async (ipToBlock, vectorDesc) => {
    const existing = rules.find((r) => r.ip === ipToBlock && r.action === 'DROP');
    if (!existing) {
      const mitigationRule = {
        ip: ipToBlock,
        port: 'ALL',
        protocol: 'ALL',
        action: 'DROP',
        description: vectorDesc ? `Auto-Mitigated: ${vectorDesc} from ${ipToBlock}` : `Auto-Blocked: Suspicious scanning from ${ipToBlock}`,
        hits: 1,
        rawBytes: 64,
        bytes: '64 B',
        status: 'ACTIVE'
      };

      const backendRes = await api.createRule(mitigationRule);
      const saved = {
        ...mitigationRule,
        id: backendRes && backendRes.id ? `FW-${backendRes.id}` : `FW-${Math.floor(200 + Math.random() * 700)}`,
        rawId: backendRes?.id
      };
      setRules((prev) => [saved, ...prev]);
    }
    if (criticalAlert && (criticalAlert.ip === ipToBlock || !criticalAlert.ip)) {
      setCriticalAlert(null);
    }
    setToastNotification({
      title: 'Threat Mitigated',
      desc: `Rule deployed: All traffic from ${ipToBlock} dropped.`
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleClearThreats = () => {
    setThreatEvents([]);
    setToastNotification({
      title: 'Threat Feed Flushed',
      desc: 'All security signature event logs cleared.'
    });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // -------------------------------------------------------------
  // Export & Download Handlers
  // -------------------------------------------------------------
  const handleExport = (format) => {
    exportFirewallReport(format, rules, logs, isAttackActive, threatEvents);
    setExportOpen(false);
    setToastNotification({
      title: `Telemetry Report Exported (${format.toUpperCase()})`,
      desc: `Report saved to your local Reports folder.`
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Derived Calculations
  const totalPkts = logs.length;
  const allowPkts = logs.filter((l) => l.action === 'ALLOW').length;
  const dropPkts = logs.filter((l) => l.action === 'DROP').length;

  const filteredRules = rules.filter((r) => {
    const matchSearch =
      ruleSearch === '' ||
      r.ip.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(ruleSearch.toLowerCase());
    const matchAction = ruleActionFilter === 'ALL' || r.action === ruleActionFilter;
    return matchSearch && matchAction;
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
        authTab={authTab}
        setAuthTab={setAuthTab}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        onInitiateFido={handleInitiateFido}
        onPhoneBiometricLogin={handlePhoneBiometricLogin}
        onPasswordSubmit={handlePasswordSubmit}
        firebaseEmail={firebaseEmail}
        setFirebaseEmail={setFirebaseEmail}
        firebasePassword={firebasePassword}
        setFirebasePassword={setFirebasePassword}
        onFirebaseEmailLogin={handleFirebaseEmailLogin}
        isFirebaseLoading={isFirebaseLoading}
        firebaseError={firebaseError}
        onGuestLogin={handleGuestLogin}
        isGuestLoading={isGuestLoading}
        guestError={guestError}
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
        threatsCount={threatEvents.filter((t) => !rules.some((r) => r.ip === t.attackerIp && r.action === 'DROP' && r.status === 'ACTIVE')).length}
        onLogout={handleLogout}
        currentUser={username || (authTab === 'firebase' && firebaseEmail ? firebaseEmail.split('@')[0] : 'SecOps Admin')}
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
        />

        {/* IDS Critical Alert Toast / Banner */}
        <IdsAlertBanner
          isDarkMode={isDarkMode}
          criticalAlert={criticalAlert}
          onAutoBlock={handleAutoBlock}
          onDismiss={() => setCriticalAlert(null)}
          onViewIds={() => setActiveView('ids')}
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
              logs={logs}
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
              onClearLogs={handleClearLogs}
            />
          )}

          {activeView === 'ids' && (
            <IntrusionDetectionView
              isDarkMode={isDarkMode}
              threatEvents={threatEvents}
              rules={rules}
              isAttackActive={isAttackActive}
              onToggleAttack={handleToggleAttack}
              onAutoBlock={handleAutoBlock}
              onClearThreats={handleClearThreats}
              totalPkts={totalPkts}
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
              backendStatus={backendStatus}
              isRulesLoading={isRulesLoading}
              onRefreshRules={loadRulesFromBackend}
            />
          )}
        </main>
      </div>
    </div>
  );
}
