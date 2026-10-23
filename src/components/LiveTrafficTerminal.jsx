import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Pause, 
  Trash2, 
  ArrowDownCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Radio
} from 'lucide-react';
import { MOCK_IP_POOL } from '../constants/initialData';
import { soundEffects } from '../utils/audio';

export default function LiveTrafficTerminal({ 
  rules, 
  isAttackActive, 
  onAttackIntercepted 
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, ALLOWED, BLOCKED
  const [searchTerm, setSearchTerm] = useState('');
  const [packetCount, setPacketCount] = useState(6);
  const terminalEndRef = useRef(null);

  // Helper to generate simulated packet
  const generatePacket = useCallback((forceAttack = false) => {
    const isAttackPacket = forceAttack || (isAttackActive && Math.random() > 0.35);
    
    // Choose source IP
    let srcIp;
    let dstPort;
    let protocol = 'TCP';
    const packetSize = Math.floor(64 + Math.random() * 1400);

    if (isAttackPacket) {
      srcIp = '192.168.1.105'; // Attacking IP specified in prompt
      // Port scan probes
      const attackPorts = [21, 22, 23, 25, 80, 135, 443, 445, 1433, 3389, 8080, 9200];
      dstPort = attackPorts[Math.floor(Math.random() * attackPorts.length)];
      protocol = Math.random() > 0.2 ? 'TCP' : 'UDP';
    } else {
      const randomSrc = MOCK_IP_POOL[Math.floor(Math.random() * (MOCK_IP_POOL.length - 1))];
      srcIp = randomSrc.ip;
      const normalPorts = [443, 80, 53, 8080, 22];
      dstPort = normalPorts[Math.floor(Math.random() * normalPorts.length)];
      protocol = dstPort === 53 ? 'UDP' : 'TCP';
    }

    const dstIp = '10.0.4.' + (10 + Math.floor(Math.random() * 80));
    const srcPort = Math.floor(1024 + Math.random() * 64000);

    // Determine Action based on firewall rules
    let action = 'ALLOW';
    let matchedRule = null;

    // Check if any active rule matches
    for (const rule of rules) {
      if (rule.status !== 'ACTIVE') continue;

      const ipMatches = rule.targetIp === '0.0.0.0/0' || rule.targetIp === srcIp;
      const portMatches = rule.port === 'ALL' || rule.port === dstPort.toString();
      const protoMatches = rule.protocol === 'ALL' || rule.protocol.includes(protocol);

      if (ipMatches && portMatches && protoMatches) {
        action = rule.action;
        matchedRule = rule.id;
        break;
      }
    }

    // If source is the attack IP and no specific rule allowed it, default to DROP for IDS demonstration
    if (isAttackPacket && action !== 'ALLOW') {
      action = 'DROP';
      matchedRule = matchedRule || 'IDS-ANOMALY-RULE';
    }

    const now = new Date();
    const timeString = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    // Play subtle audio packet sound
    soundEffects.playTerminalPacket(action === 'DROP');

    return {
      id: `PKT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: timeString,
      srcIp,
      srcPort,
      dstIp,
      dstPort,
      protocol,
      size: packetSize,
      action: action, // 'ALLOW' or 'DROP'
      rule: matchedRule || 'DEFAULT_GATEWAY',
      flag: isAttackPacket ? 'SYN_FLOOD_PROBE' : (action === 'DROP' ? 'RST_REJECT' : 'ACK_ESTABLISHED')
    };
  }, [isAttackActive, rules]);

  // Seed initial packets with lazy useState initialization
  const [logs, setLogs] = useState(() => [
    {
      id: 'PKT-INIT-1',
      timestamp: '22:24:10.104',
      srcIp: '142.250.190.46',
      srcPort: 443,
      dstIp: '10.0.4.12',
      dstPort: 52140,
      protocol: 'TCP',
      size: 1420,
      action: 'ALLOW',
      rule: 'FW-102',
      flag: 'ACK_ESTABLISHED'
    },
    {
      id: 'PKT-INIT-2',
      timestamp: '22:24:12.115',
      srcIp: '45.33.32.156',
      srcPort: 59301,
      dstIp: '10.0.4.15',
      dstPort: 22,
      protocol: 'TCP',
      size: 64,
      action: 'DROP',
      rule: 'FW-104',
      flag: 'RST_REJECT'
    },
    {
      id: 'PKT-INIT-3',
      timestamp: '22:24:14.208',
      srcIp: '185.199.108.153',
      srcPort: 443,
      dstIp: '10.0.4.88',
      dstPort: 49122,
      protocol: 'TCP',
      size: 1120,
      action: 'ALLOW',
      rule: 'FW-102',
      flag: 'ACK_ESTABLISHED'
    },
    {
      id: 'PKT-INIT-4',
      timestamp: '22:24:16.340',
      srcIp: '104.244.42.1',
      srcPort: 80,
      dstIp: '10.0.4.18',
      dstPort: 53102,
      protocol: 'TCP',
      size: 512,
      action: 'ALLOW',
      rule: 'FW-103',
      flag: 'ACK_ESTABLISHED'
    },
    {
      id: 'PKT-INIT-5',
      timestamp: '22:24:18.490',
      srcIp: '20.112.52.29',
      srcPort: 443,
      dstIp: '10.0.4.24',
      dstPort: 58821,
      protocol: 'TCP',
      size: 1380,
      action: 'ALLOW',
      rule: 'FW-102',
      flag: 'ACK_ESTABLISHED'
    },
    {
      id: 'PKT-INIT-6',
      timestamp: '22:24:20.612',
      srcIp: '91.240.118.172',
      srcPort: 41209,
      dstIp: '10.0.4.11',
      dstPort: 22,
      protocol: 'TCP',
      size: 64,
      action: 'DROP',
      rule: 'FW-104',
      flag: 'RST_REJECT'
    }
  ]);

  // Main packet generation interval: runs every 2 seconds as required!
  useEffect(() => {
    if (isPaused) return;

    // When attack is active, we push packets slightly faster (800ms) to show the simulated barrage,
    // otherwise exact 2000ms cadence requested in the prompt.
    const intervalMs = isAttackActive ? 800 : 2000;

    const interval = setInterval(() => {
      const newPacket = generatePacket();
      setLogs((prev) => {
        const updated = [...prev, newPacket];
        if (updated.length > 120) {
          return updated.slice(updated.length - 120);
        }
        return updated;
      });
      setPacketCount((c) => c + 1);

      if (isAttackActive && onAttackIntercepted && newPacket.srcIp === '192.168.1.105') {
        onAttackIntercepted(newPacket);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPaused, isAttackActive, generatePacket, onAttackIntercepted]);

  // Auto-scroll handler
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = 
      filterType === 'ALL' || 
      (filterType === 'ALLOWED' && log.action === 'ALLOW') ||
      (filterType === 'BLOCKED' && log.action === 'DROP');
    
    const matchesSearch = 
      searchTerm === '' ||
      log.srcIp.includes(searchTerm) ||
      log.dstPort.toString().includes(searchTerm) ||
      log.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.flag.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full font-mono text-xs">
      
      {/* Terminal Top Window Chrome */}
      <div className="bg-[#0d1424] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        {/* Terminal Title & Window Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600" />
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60 text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-xs tracking-wide">
              NETFILTER_DAEMON // eth0:promisc
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              BUFFER: 2.0s TICK
            </span>
          </div>
        </div>

        {/* Status indicator & Total counter */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>PACKETS: <strong className="text-white">{packetCount}</strong></span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
              className={`p-1 rounded cursor-pointer transition ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
              className={`p-1 rounded cursor-pointer transition ${
                autoScroll 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearLogs}
              title="Clear Terminal Feed"
              className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Subheader Filter Bar */}
      <div className="bg-[#090f1a] px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase">Stream Filter:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterType('ALLOWED')}
              className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                filterType === 'ALLOWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-emerald-500/70 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ALLOWED (Green)
            </button>
            <button
              onClick={() => setFilterType('BLOCKED')}
              className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                filterType === 'BLOCKED' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-rose-500/70 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              BLOCKED (Red)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="grep IP / port..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#050811] border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500 w-32"
          />
        </div>
      </div>

      {/* Terminal Body with Packet Stream */}
      <div className="flex-1 p-3 overflow-y-auto terminal-scroll bg-[#050811] space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-600 font-mono">
            {isPaused ? '[STREAM PAUSED - CLICK PLAY TO RESUME]' : '[AWAITING NETWORK PACKETS...]'}
          </div>
        ) : (
          filteredLogs.map((pkt) => {
            const isDrop = pkt.action === 'DROP';

            return (
              <div
                key={pkt.id}
                className={`flex flex-wrap items-baseline gap-x-2.5 py-1 px-2 rounded font-mono text-[11px] leading-relaxed transition-all duration-150 ${
                  isDrop
                    ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-2 border-rose-500 text-rose-400'
                    : 'bg-emerald-950/15 hover:bg-emerald-950/30 border-l-2 border-emerald-500 text-emerald-400'
                }`}
              >
                {/* Timestamp */}
                <span className="text-slate-500 text-[10px]">
                  [{pkt.timestamp}]
                </span>

                {/* Action Flag: Vibrant Green for Allowed, Red for Blocked */}
                <span
                  className={`px-1.5 py-0.2 rounded font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 ${
                    isDrop
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-700/80'
                      : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/80'
                  }`}
                >
                  {isDrop ? (
                    <>
                      <ShieldAlert className="w-2.5 h-2.5 text-rose-300" />
                      BLOCKED
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
                      ALLOWED
                    </>
                  )}
                </span>

                {/* Protocol */}
                <span className="text-cyan-400 font-semibold text-[10px]">
                  {pkt.protocol}
                </span>

                {/* Routing Flow: Source -> Destination */}
                <span className="text-slate-300">
                  <strong className={pkt.srcIp === '192.168.1.105' ? 'text-rose-400 font-extrabold underline' : 'text-slate-200'}>
                    {pkt.srcIp}:{pkt.srcPort}
                  </strong>
                  <span className="text-slate-600 mx-1.5">➔</span>
                  <span className="text-slate-300">{pkt.dstIp}:{pkt.dstPort}</span>
                </span>

                {/* Payload telemetry */}
                <span className="text-slate-500 text-[10px]">
                  len={pkt.size}B
                </span>

                {/* Signature / Rule tag */}
                <span className={`text-[10px] font-mono ${
                  isDrop ? 'text-rose-400/90' : 'text-emerald-400/90'
                }`}>
                  [{pkt.flag}]
                </span>

                {pkt.rule && (
                  <span className="text-[9px] text-slate-500 ml-auto">
                    {pkt.rule}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Interactive Status Bar */}
      <div className="bg-[#0d1424] px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">$</span>
          <span className="text-slate-300">aegis-kernel</span>
          <span className="text-slate-500">::</span>
          <span className="text-cyan-400">packet-inspection-engine</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>SAMPLING: 2000ms</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>SOCKETS: RAW_SOCK</span>
        </div>
      </div>
    </div>
  );
}
