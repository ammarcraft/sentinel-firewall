import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Trash2,
  Terminal,
  Activity,
  Zap,
  KeyRound,
  Settings,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function SentinelAiAnalyst({
  isOpen,
  onToggle,
  isDarkMode = false,
  logs = [],
  rules = [],
  threatEvents = [],
  isAttackActive = false,
  activeScenario = null,
  throughput = 2.38,
  packetRate = 148200,
  onAutoBlock,
  externalQuery = null,
  onClearExternalQuery = null
}) {
  // Messages State
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'analyst',
      timestamp: new Date().toLocaleTimeString(),
      text: `Hello Operator. I am **Sentinel AI Analyst**, your autonomous SecOps & Netfilter forensic intelligence copilot. I am actively correlating kernel socket telemetry, heuristic threat signatures, and packet frames in real-time.

You can ask me to perform deep packet investigations, analyze suspicious IPs, or recommend iptables policy hardening.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // API Key Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('sentinel_ai_provider') || 'local');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sentinel_ai_key') || '');
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Handle external queries dispatched from IP Geo Tracker or Threat Feed
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      handleSendMessage(externalQuery.trim());
      if (onClearExternalQuery) onClearExternalQuery();
    }
  }, [externalQuery]);

  // Derived real-time telemetry metrics
  const droppedLogs = logs.filter((l) => l.action === 'DROP');
  const allowedLogs = logs.filter((l) => l.action === 'ALLOW');
  const activeAttackerIps = [
    ...new Set(
      threatEvents.map((t) => t.attackerIp).concat(isAttackActive && activeScenario ? [activeScenario.attackerIp] : [])
    )
  ];
  const primaryAttacker = activeAttackerIps[0] || '192.168.1.105';
  const isPrimaryBlocked = rules.some(
    (r) => (r.ip === primaryAttacker || r.ip === '0.0.0.0/0') && r.action === 'DROP' && r.status === 'ACTIVE'
  );

  // Save API Key Configuration
  const handleSaveApiSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('sentinel_ai_provider', aiProvider);
    localStorage.setItem('sentinel_ai_key', apiKey.trim());
    setApiSaveSuccess(true);
    setTimeout(() => {
      setApiSaveSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  // -------------------------------------------------------------
  // Real LLM API Dispatch (Google Gemini / Gemma or DeepSeek)
  // -------------------------------------------------------------
  const queryExternalLLM = async (userPrompt) => {
    const cleanKey = (apiKey || '').trim();
    if (!cleanKey || aiProvider === 'local') return null;

    const liveContext = `
[SYSTEM CONTEXT: Sentinel Netfilter Linux Firewall Kernel]
- Primary Ingress Attacker: ${primaryAttacker} (${isPrimaryBlocked ? 'CONTAINED via DROP rule' : 'ACTIVE / UNCONTAINED'})
- Active Packet Rate: ${(packetRate / 1000).toFixed(1)}k pps | Wire Throughput: ${throughput} Gbps
- Monitored Frames: ${logs.length} Total (${droppedLogs.length} Dropped, ${allowedLogs.length} Allowed)
- Active Netfilter Rules: ${rules.map((r) => `${r.id}: ${r.ip}:${r.port} [${r.action}]`).join(', ')}
- Heuristic IDS Signatures: ${threatEvents.slice(0, 5).map((t) => `${t.vector} (${t.severity}) from ${t.attackerIp} on port ${t.targetPort}`).join('; ') || 'Baseline Normal'}
- Simulation Engine: ${isAttackActive ? `Active ${activeScenario?.name || 'SYN Flood'}` : 'Passive Wire-Speed Capture'}

Analyze the operator's query professionally as an elite Senior SecOps Engineer. Be technical, direct, and concise. Format with clear Markdown headings and code blocks. If firewall mitigation is needed, provide exact \`iptables -A INPUT ...\` commands.`;

    try {
      if (aiProvider === 'gemini' || aiProvider === 'gemma') {
        // Google AI Studio API (Gemini / Gemma)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${liveContext}\n\nOperator Query: ${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600
            }
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else if (aiProvider === 'deepseek') {
        // DeepSeek API
        const endpoint = 'https://api.deepseek.com/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cleanKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: liveContext },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content;
      }
    } catch (err) {
      console.warn('External AI API call failed, falling back to local forensic engine:', err);
      return null;
    }
  };

  // -------------------------------------------------------------
  // Advanced Local Forensic Intelligence Engine (Zero Latency Fallback)
  // -------------------------------------------------------------
  const generateLocalForensicResponse = (query) => {
    const q = query.toLowerCase();

    // Match IP address query
    const ipMatch = query.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    if (ipMatch || q.includes('geo') || q.includes('country') || q.includes('who') || q.includes('ip') || q.includes('attacker')) {
      const targetIp = ipMatch ? ipMatch[0] : primaryAttacker;
      const isTargetBlocked = rules.some((r) => r.ip === targetIp && r.action === 'DROP');
      const ipThreats = threatEvents.filter((t) => t.attackerIp === targetIp);
      const isInternal = targetIp.startsWith('192.168.') || targetIp.startsWith('10.');
      const isTor = targetIp.includes('185.220');

      return `### 🌐 Ingress Forensic Dossier: \`${targetIp}\`

**Host Assessment:** ${isTargetBlocked ? '🛡️ **CONTAINED (DROP Rule Active)**' : '⚠️ **SUSPICIOUS / ACTIVE ADVERSARY**'}  
**Origin Classification:** ${isInternal ? 'Internal Subnet (RFC 1918 Private LAN - Local Adversary Host)' : isTor ? 'Tor Exit Node (Frankfurt, Germany - AS205100)' : 'External Ingress Transit'}  
**Threat Vector:** ${ipThreats[0]?.vector || (isAttackActive ? activeScenario?.name : 'Horizontal TCP SYN Flood & Port Reconnaissance')}  
**Targeted Ports:** ${ipThreats.map((t) => t.targetPort).join(', ') || '443 (HTTPS), 80 (HTTP), 22 (SSH)'}

#### 📋 Technical Determination:
Kernel socket probes detected high-velocity TCP connection initiation frames without completion handshakes.
* **Observed Velocity:** ~${isAttackActive ? '2,850' : '480'} frames/sec
* **MITRE ATT&CK:** T1498.001 (Direct Network Flood)

#### 🛡️ Recommended Policy Action:
${
  isTargetBlocked
    ? `Host \`${targetIp}\` is already isolated at the Netfilter ingress chain.`
    : `Execute perimeter null-route for host \`${targetIp}\`. Click the **Commit DROP Rule** button below.`
}`;
    }

    // Mitigation & Rules Query
    if (q.includes('rule') || q.includes('mitigat') || q.includes('block') || q.includes('iptables') || q.includes('harden')) {
      return `### 🛡️ Sentinel Netfilter Hardening Directives

Based on active deep packet correlation:

1. **Perimeter Drop Directive for Attacker \`${primaryAttacker}\`:**
   \`\`\`bash
   # Null-route all inbound frames from adversary host
   iptables -A INPUT -s ${primaryAttacker} -j DROP
   \`\`\`

2. **SYN Flood Cookie Defense:**
   \`\`\`bash
   # Prevent socket table memory exhaustion in kernel sysctl
   sysctl -w net.ipv4.tcp_syncookies=1
   \`\`\`

3. **Rate Limit Inbound Handshakes on Port 443:**
   \`\`\`bash
   iptables -A INPUT -p tcp --dport 443 -m state --state NEW -m limit --limit 50/s --limit-burst 100 -j ACCEPT
   \`\`\`

Active rule **FW-1** (\`0.0.0.0/0:443 ALLOW\`) is operating with **${rules.find((r) => r.id === 'FW-1')?.hits || 0} recorded hits**.`;
    }

    // Health / Status / Traffic Audit Query
    if (q.includes('status') || q.includes('audit') || q.includes('posture') || q.includes('traffic') || q.includes('safe') || q.includes('health')) {
      const dropPct = logs.length > 0 ? Math.round((droppedLogs.length / logs.length) * 100) : 0;
      return `### 📈 Wire-Speed Telemetry & Security Audit

* **System Status:** ${isAttackActive ? '🚨 **ELEVATED INTRUSION PRESSURE**' : '🟢 **NOMINAL SECURE BASELINE**'}
* **Throughput:** ${(throughput || 2.4).toFixed(2)} Gbps @ ${(packetRate / 1000).toFixed(1)}k pps
* **Processed Frames:** ${logs.length} Total (${droppedLogs.length} Dropped [${dropPct}%], ${allowedLogs.length} Allowed)
* **Active Firewall Rules:** ${rules.length} policies enforced in kernel memory
* **IDS Signature Feeds:** ${threatEvents.length} events logged across ${activeAttackerIps.length} remote host(s)
* **Adversary Containment:** ${isPrimaryBlocked ? '100% (Attacker Null-Routed)' : 'Action Required: Pending Drop Commitment'}`;
    }

    // General Technical Security Query Fallback
    return `### 🔍 Sentinel Security Intelligence

Analysis of query: *"${query}"* against active wire telemetry:

* **Active Ingress Attacker:** \`${primaryAttacker}\` (${isPrimaryBlocked ? 'BLOCKED' : 'MONITORED'})
* **Monitored Interface:** \`eth0\` / Host Primary Interface
* **Firewall Rules Enforced:** ${rules.length} active Netfilter rules (${rules.filter((r) => r.action === 'DROP').length} DROP, ${rules.filter((r) => r.action === 'ALLOW').length} ALLOW)
* **Traffic Filter Status:** ${isAttackActive ? 'Active attack scenario in progress' : 'Passive wire-speed capture'}

Ask me:
1. *"Why is 192.168.1.105 flagged?"*
2. *"What firewall rules should I deploy?"*
3. *"Perform live traffic audit"*`;
  };

  // -------------------------------------------------------------
  // Send Message Handler
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: query.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 1. Try real external LLM API if key is configured
    let aiResponseText = null;
    if (apiKey && aiProvider !== 'local') {
      aiResponseText = await queryExternalLLM(query.trim());
    }

    // 2. Fall back to local forensic engine if no key or API failed
    if (!aiResponseText) {
      await new Promise((res) => setTimeout(res, 350));
      aiResponseText = generateLocalForensicResponse(query.trim());
    }

    const botMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'analyst',
      timestamp: new Date().toLocaleTimeString(),
      text: aiResponseText,
      canAutoBlock:
        !isPrimaryBlocked &&
        (query.toLowerCase().includes('why') ||
          query.toLowerCase().includes('mitigat') ||
          query.toLowerCase().includes('block') ||
          query.toLowerCase().includes('who') ||
          query.toLowerCase().includes('192.168.1.105')),
      suggestedIp: primaryAttacker
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'analyst',
        timestamp: new Date().toLocaleTimeString(),
        text: `Forensic audit session reset. Ready for new live packet queries, threat assessments, or policy hardening requests.`
      }
    ]);
  };

  const quickPromptChips = [
    { label: '🔍 Investigate 192.168.1.105', query: 'Why was IP 192.168.1.105 flagged as malicious?' },
    { label: '🛡️ Generate iptables rules', query: 'What firewall rules should I deploy to mitigate threats?' },
    { label: '📊 Real-time attack breakdown', query: 'Show attack vector breakdown and threat distribution' },
    { label: '📈 Wire-speed audit summary', query: 'Summarize current firewall security posture and telemetry' }
  ];

  return (
    <>
      {/* Floating Trigger Widget in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 cursor-pointer border active:scale-95 ${
            isOpen
              ? 'bg-slate-900 text-slate-100 border-slate-700'
              : isAttackActive
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 ring-4 ring-red-500/30 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30 hover:shadow-blue-500/25 ring-2 ring-blue-500/20'
          }`}
          title="Open Sentinel AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight">Sentinel Copilot</span>
          {isAttackActive && (
            <span className="text-[10px] bg-white text-red-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
              Threat Active
            </span>
          )}
        </button>
      </div>

      {/* Slide-Over AI Copilot Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[490px] flex flex-col shadow-2xl border-l transition-all duration-300 ease-in-out bg-slate-900 border-slate-800 text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Sentinel AI Copilot</h3>
                  <span
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      apiKey && aiProvider !== 'local'
                        ? 'text-amber-400 bg-amber-950/60 border-amber-800/80'
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {apiKey && aiProvider !== 'local' ? `${aiProvider.toUpperCase()} LLM` : 'Local Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Autonomous threat assessment & live wire-speed forensics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  showSettings ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Configure LLM API Key (Gemma / Gemini / DeepSeek)"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                title="Reset Chat Stream"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
                title="Close Copilot Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Settings Popover (When user clicks Gear) */}
          {showSettings && (
            <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Intelligence Provider Settings</span>
                </span>
                <span className="text-[10px] text-slate-400">Gemma / Gemini / DeepSeek</span>
              </div>

              <form onSubmit={handleSaveApiSettings} className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'local', label: 'Local Engine' },
                    { id: 'gemini', label: 'Gemma / Gemini' },
                    { id: 'deepseek', label: 'DeepSeek' }
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setAiProvider(prov.id)}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border transition cursor-pointer ${
                        aiProvider === prov.id
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>

                {aiProvider !== 'local' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {aiProvider === 'gemini' ? 'Google AI Studio API Key (Gemini / Gemma):' : 'DeepSeek API Key:'}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    {apiSaveSuccess ? '✅ Settings saved!' : 'Stored safely in local browser storage'}
                  </span>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Save Provider
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Real-Time Live Status Bar */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Primary Attacker:</span>
              <span className="font-mono font-bold text-red-400">{primaryAttacker}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Dropped:</span>
              <span className="font-mono font-bold text-red-500">{droppedLogs.length} pkts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Rate:</span>
              <span className="font-mono font-bold text-emerald-400">{(packetRate / 1000).toFixed(1)}k pps</span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
            {messages.map((msg) => {
              const isAnalyst = msg.sender === 'analyst';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAnalyst ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    <span>{isAnalyst ? 'Sentinel Copilot' : 'Operator'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-line ${
                      isAnalyst
                        ? 'bg-slate-950/90 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white shadow-md'
                    }`}
                  >
                    {msg.text}

                    {/* 1-Click Action to Commit DROP Rule directly from AI response */}
                    {isAnalyst && msg.canAutoBlock && onAutoBlock && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-red-400 font-mono">
                          Adversary: {msg.suggestedIp || primaryAttacker}
                        </span>
                        <button
                          onClick={() =>
                            onAutoBlock(
                              msg.suggestedIp || primaryAttacker,
                              'AI Copilot Direct Mitigation'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Commit DROP Rule</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-400 text-xs w-36">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Correlating telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPromptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Query Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Copilot (e.g. 'Why is 192.168.1.105 flagged?')..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
