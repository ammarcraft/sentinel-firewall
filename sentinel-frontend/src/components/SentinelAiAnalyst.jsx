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
  Maximize2,
  Minimize2,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  HelpCircle
} from 'lucide-react';

export default function SentinelAiAnalyst({
  isOpen,
  onToggle,
  isDarkMode,
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
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'analyst',
      timestamp: new Date().toLocaleTimeString(),
      text: `Hello Operator. I am **Sentinel AI Analyst**, your automated Netfilter & eBPF forensic intelligence assistant. I am continuously correlating deep packet frames and heuristic signature feeds in real-time. Ask me anything about suspicious IPs, attack vectors, or recommended firewall hardening policies.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll chat to bottom
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

  // Derive live telemetry insights
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

  // Context-aware intelligent AI forensic response generator
  const generateForensicResponse = (query) => {
    const q = query.toLowerCase();

    // 0. Specific IP Forensics & Geolocation Dossier (Triggered by Geo Tracker or Direct IP Queries)
    const ipMatch = query.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    if ((ipMatch && !q.includes('why was ip 192.168.1.105')) || q.includes('geo') || q.includes('country') || q.includes('asn') || q.includes('dossier')) {
      const targetIp = ipMatch ? ipMatch[0] : primaryAttacker;
      const isTargetBlocked = rules.some((r) => r.ip === targetIp && r.action === 'DROP');
      const ipThreats = threatEvents.filter((t) => t.attackerIp === targetIp);
      const isTor = targetIp.includes('185.220');
      const isLinode = targetIp.includes('45.33');
      const isInternal = targetIp.startsWith('192.168.') || targetIp.startsWith('10.');

      return `### 🌐 Deep IP Forensic & Origin Geolocation Dossier

**Target Host / IP:** \`${targetIp}\`  
**Threat Status:** ${isTargetBlocked ? '🛡️ **CONTAINED (DROP Policy Enforced)**' : '⚠️ **SUSPICIOUS INGRESS / ACTIVE**'}  
**Origin Classification:** ${isInternal ? 'Internal Subnet (RFC 1918 Private LAN - Local Adversary)' : isTor ? 'Tor Anonymized Exit Node (Frankfurt, Germany - AS205100)' : isLinode ? 'Akamai / Linode Cloud VPS (Dallas, USA - AS63949)' : 'External Ingress Transit'}  

#### 📋 Ingress Heuristic Profiling:
* **Identified Vector:** ${ipThreats[0]?.vector || 'Automated TCP Port Reconnaissance & Socket Scan'}
* **Target Ports:** ${ipThreats.map((t) => t.targetPort).join(', ') || '22 (SSH), 80 (HTTP), 443 (HTTPS), 3389 (RDP)'}
* **Heuristic Confidence Score:** ${isTor ? '98%' : isInternal ? '96%' : '86%'} (High Anomaly Index)
* **Autonomous System:** ${isTor ? 'AS205100 (Tor Project Node)' : isLinode ? 'AS63949 (Linode LLC)' : isInternal ? 'Private LAN' : 'Tier-1 Carrier Gateway'}

#### 🛡️ Mitigation Recommendation:
${
  isTargetBlocked
    ? `The firewall is already dropping all packets from \`${targetIp}\` at the Netfilter ingress chain.`
    : `Execute perimeter null-route for \`${targetIp}\`. Click **Commit DROP Rule** below to isolate host.`
}`;
    }

    // 1. "Why was this IP blocked?" or specific IP question
    if (q.includes('why') && (q.includes('ip') || q.includes('blocked') || q.includes('flagged') || q.includes('192.168.1.105'))) {
      const targetIp = activeAttackerIps.find((ip) => q.includes(ip.toLowerCase())) || primaryAttacker;
      const ipThreats = threatEvents.filter((t) => t.attackerIp === targetIp);
      const isBlocked = rules.some((r) => r.ip === targetIp && r.action === 'DROP');
      const recentPackets = logs.filter((l) => l.srcIp === targetIp);

      return `### Forensic Incident Report: IP \`${targetIp}\`

**Classification:** High-Risk Adversarial Source  
**Threat Status:** ${isBlocked ? '🛡️ **CONTAINED (DROP Rule Active)**' : '⚠️ **ACTIVE / UNCONTAINED**'}  
**MITRE ATT&CK Mapping:** ${activeScenario?.mitreTechnique || 'T1498.001 (Direct Network Flood) & T1046 (Network Service Discovery)'}

#### 📋 Observed Attack Telemetry:
* **Vector Identified:** ${ipThreats[0]?.vector || (isAttackActive ? activeScenario?.name : 'Horizontal TCP SYN Flood & Port Reconnaissance')}
* **Target Ports:** ${ipThreats.map((t) => t.targetPort).join(', ') || '21, 22, 23, 80, 443, 445, 3389'}
* **Packet Volume:** Intercepted **${recentPackets.length} frames** (${recentPackets.filter((p) => p.action === 'DROP').length} dropped)
* **Protocol Fingerprint:** High-frequency \`TCP [SYN]\` frames without corresponding \`ACK\` completion, indicating half-open socket table exhaustion intent.

#### 💡 Forensic Determination:
The host exceeded the kernel heuristic threshold of **1,200 probes/sec**. ${
        isBlocked
          ? `An active firewall DROP policy is currently discarding all ingress frames at the ingress interface hook before reaching user space.`
          : `**Immediate Mitigation Recommended:** Click the **Auto-Block IP** button below or in the IDS feed to commit an iptables DROP rule.`
      }`;
    }

    // 2. "Show attack vector breakdown" or "What attacks are active?"
    if (q.includes('vector') || q.includes('breakdown') || q.includes('scenario') || q.includes('attack')) {
      const synCount = threatEvents.filter((t) => t.vector?.toLowerCase().includes('syn')).length;
      const scanCount = threatEvents.filter((t) => t.vector?.toLowerCase().includes('scan') || t.vector?.toLowerCase().includes('recon')).length;
      const bruteCount = threatEvents.filter((t) => t.vector?.toLowerCase().includes('brute')).length;

      return `### 📊 Real-Time Attack Vector & Anomaly Distribution

Current wire-speed telemetry reflects **${threatEvents.length} detected security signatures**:

| Attack Vector | Category | Severity | Probes / Sec | Containment |
| :--- | :--- | :--- | :--- | :--- |
| **TCP SYN Flood** | DoS Exhaustion | **CRITICAL** | ~2,850 pps | ${isPrimaryBlocked ? 'Contained' : 'Active'} |
| **Port Reconnaissance** | Discovery (T1046) | **HIGH** | ~1,420 pps | Active Monitoring |
| **SSH/RDP Brute-Force** | Credential Access | **HIGH** | ~480 pps | Rate-Limited |
| **DNS Reflection** | Bandwidth Saturation | **MEDIUM** | ~2,100 pps | Filtered |

**Ingress Throughput:** ${(throughput || 2.4).toFixed(2)} Gbps • **Packet Velocity:** ${(packetRate / 1000).toFixed(1)}k pps  
**Forensic Note:** Layer 4 TCP SYN floods constitute **${isAttackActive ? '78%' : '14%'}** of inbound anomalous frame distribution.`;
    }

    // 3. "What rules should I deploy?" or "Suggest mitigation"
    if (q.includes('rule') || q.includes('mitigat') || q.includes('suggest') || q.includes('recommend') || q.includes('policy')) {
      const unblockedThreats = threatEvents.filter(
        (t) => !rules.some((r) => r.ip === t.attackerIp && r.action === 'DROP')
      );

      return `### 🛡️ Sentinel AI Policy Hardening Recommendations

Based on heuristic packet inspection and zero-trust perimeter baselines:

1. **Deploy Perimeter Drop for Host \`${primaryAttacker}\`:**
   \`\`\`bash
   iptables -A INPUT -s ${primaryAttacker} -j DROP
   \`\`\`
   *Rationale:* Eliminates half-open connection memory consumption on port 443/80.

2. **SYN Flood Protection & Cookie Validation:**
   Enable TCP Syncookies in kernel sysctl to absorb SYN bursts without table depletion:
   \`net.ipv4.tcp_syncookies = 1\`

3. **Rate-Limit Administrative Ports (22 SSH, 3389 RDP):**
   Restrict management access to authorized bastion CIDR subnets rather than \`0.0.0.0/0\`.

4. **Default Gateway Status:**
   Active rule **FW-1** is permitting legitimate HTTPS (\`0.0.0.0/0:443\`) with **${rules.find((r) => r.id === 'FW-1')?.hits || 0} recorded hits**.`;
    }

    // 4. "Summarize security posture" or "Status / Health"
    if (q.includes('posture') || q.includes('health') || q.includes('summary') || q.includes('audit') || q.includes('status')) {
      const dropRate = logs.length > 0 ? Math.round((droppedLogs.length / logs.length) * 100) : 0;
      return `### 📈 Sentinel Security Posture & Health Assessment

**Operational State:** ${isAttackActive ? '🚨 **ELEVATED THREAT LEVEL (Active Intrusion)**' : '🟢 **NOMINAL SECURE BASELINE**'}  
**Kernel Inspection:** Linux Netfilter eBPF XDP Map • **Driver Latency:** 0.84ms

* **Total Monitored Packets:** ${logs.length.toLocaleString()} frames
* **Allowed vs Dropped:** ${allowedLogs.length} Allowed (**${100 - dropRate}%**) vs ${droppedLogs.length} Dropped (**${dropRate}%**)
* **Active Firewall Policies:** ${rules.length} rules loaded in kernel memory
* **IDS Signature Feed:** ${threatEvents.length} events logged across ${activeAttackerIps.length} remote host(s)
* **Firewall Containment Efficiency:** ${isPrimaryBlocked ? '100% (Attacker Dropped at Wire)' : 'Pending Drop Commitment'}`;
    }

    // 5. General Fallback with technical forensic expertise
    return `### 🔍 Sentinel Security Analysis

I evaluated your query: *"${query}"* against the active kernel socket telemetry.

* **Monitored Ingress:** ${(throughput || 2.4).toFixed(2)} Gbps on interface \`eth0\`
* **Active Rules:** ${rules.length} policies enforced (${rules.filter((r) => r.action === 'DROP').length} DROP, ${rules.filter((r) => r.action === 'ALLOW').length} ALLOW)
* **Detected Adversary Sources:** ${activeAttackerIps.join(', ') || 'None (Normal Baseline)'}
* **Heuristic Engine Status:** ${isAttackActive ? 'Under simulated intrusion pressure' : 'Nominal wire-speed monitoring'}

You can ask me to:
1. Explain specific threat signatures (e.g., *"Why was 192.168.1.105 flagged?"*)
2. Generate MITRE ATT&CK tactical breakdowns
3. Recommend firewall rules to harden the perimeter`;
  };

  const handleSendMessage = (textToSend) => {
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

    // Realistic responsive typing delay
    setTimeout(() => {
      const botResponseText = generateForensicResponse(query.trim());
      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'analyst',
        timestamp: new Date().toLocaleTimeString(),
        text: botResponseText,
        canAutoBlock: !isPrimaryBlocked && (query.toLowerCase().includes('why') || query.toLowerCase().includes('mitigat')),
        suggestedIp: primaryAttacker
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
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
    { label: '🔍 Why is 192.168.1.105 flagged?', query: 'Why was IP 192.168.1.105 flagged as malicious?' },
    { label: '📊 Attack vector breakdown', query: 'Show attack vector breakdown and threat distribution' },
    { label: '🛡️ Recommend mitigation rules', query: 'What firewall rules should I deploy to mitigate threats?' },
    { label: '📈 Security posture summary', query: 'Summarize current firewall security posture and telemetry' }
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
          title="Open Sentinel AI Analyst & Forensic Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight">Sentinel AI Analyst</span>
          {isAttackActive && (
            <span className="text-[10px] bg-white text-red-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
              Threat Active
            </span>
          )}
        </button>
      </div>

      {/* Slide-Over AI Analyst Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] flex flex-col shadow-2xl border-l transition-all duration-300 ease-in-out bg-slate-900 border-slate-800 text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Sentinel AI Analyst</h3>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    eBPF RAG Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Autonomous threat assessment & live log forensics engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                title="Reset Forensic Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close AI Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Threat Assessment Status Card */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div
              className={`p-3 rounded-xl border text-xs space-y-2 ${
                isAttackActive
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : isPrimaryBlocked
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-850 border-slate-700/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  {isAttackActive ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ) : isPrimaryBlocked ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {isAttackActive
                    ? 'Elevated Threat Condition'
                    : isPrimaryBlocked
                      ? 'Threat Contained by Policy'
                      : 'Perimeter Baseline Nominal'}
                </span>
                <span className="font-mono text-[10px]">
                  {isAttackActive ? 'Score: 98/100 (Crit)' : 'Score: 12/100 (Safe)'}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed opacity-90">
                {isAttackActive
                  ? `Active ${activeScenario?.name || 'TCP SYN flood'} incoming from ${primaryAttacker}. ${droppedLogs.length} dropped frames recorded.`
                  : isPrimaryBlocked
                    ? `Perimeter rule actively intercepting traffic from ${primaryAttacker}. Ingress is sanitized.`
                    : `Zero critical anomalies detected on interface eth0. All ${logs.length} packet frames adhering to nominal baseline.`}
              </p>

              {!isPrimaryBlocked && isAttackActive && onAutoBlock && (
                <div className="pt-1 flex items-center justify-between border-t border-red-900/60">
                  <span className="text-[10px] text-red-300 font-medium">Recommended: Drop host traffic</span>
                  <button
                    onClick={() => onAutoBlock(primaryAttacker, activeScenario?.name || 'AI-Mitigated Attack')}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Auto-Block {primaryAttacker}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs bg-slate-900/60">
            {messages.map((msg) => {
              const isBot = msg.sender === 'analyst';
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isBot ? 'items-start' : 'justify-end'}`}>
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 max-w-[88%] leading-relaxed ${
                      isBot
                        ? 'bg-slate-800 text-slate-200 border border-slate-700/80 shadow-sm'
                        : 'bg-blue-600 text-white shadow-md'
                    }`}
                  >
                    <div className="prose prose-invert prose-xs max-w-none space-y-2">
                      {msg.text.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('### ')) {
                          return (
                            <h4 key={idx} className="font-bold text-sm text-blue-400 mt-1 mb-1">
                              {paragraph.replace('### ', '')}
                            </h4>
                          );
                        }
                        if (paragraph.startsWith('#### ')) {
                          return (
                            <h5 key={idx} className="font-semibold text-xs text-slate-300 mt-2 mb-1">
                              {paragraph.replace('#### ', '')}
                            </h5>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-900 text-blue-300 font-mono text-[10px]">$1</code>')
                                .replace(/^\* (.*$)/gim, '• $1')
                            }}
                          />
                        );
                      })}
                    </div>

                    {msg.canAutoBlock && onAutoBlock && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700 flex justify-end">
                        <button
                          onClick={() => onAutoBlock(msg.suggestedIp, 'AI Suggested Drop Rule')}
                          className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Commit DROP Rule for {msg.suggestedIp}</span>
                        </button>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 font-mono text-right mt-1.5 opacity-60">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic py-2 pl-9">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span>Sentinel AI is analyzing telemetry frames...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Prompt Pills */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Suggested Forensic Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  className="text-[10px] font-medium bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask Sentinel AI about IPs, attacks, or rules..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                inputText.trim() && !isTyping
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
              }`}
              title="Send Inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
