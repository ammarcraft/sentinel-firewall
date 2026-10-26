import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  ExternalLink,
  Bot,
  Flame,
  ArrowUpRight,
  Crosshair,
  MapPin,
  RefreshCw,
  Server,
  HardDrive,
  Database,
  Move,
  RotateCcw,
  Layers
} from 'lucide-react';

// Known Threat Intelligence & GeoIP Catalog
const STATIC_GEOIP_DB = {
  '192.168.1.105': {
    country: 'Internal Subnet (LAN)',
    city: 'Local Workstation',
    countryCode: 'LAN',
    flag: '🏠',
    lat: 37.7749,
    lon: -122.4194,
    asn: 'RFC 1918 Private LAN',
    org: 'Adversary Testing Host (Kali Linux)',
    threatLevel: 'CRITICAL',
    threatScore: 98,
    category: 'TCP SYN Flood (DDoS)'
  },
  '103.21.244.0': {
    country: 'India',
    city: 'Mumbai',
    countryCode: 'IN',
    flag: '🇮🇳',
    lat: 19.076,
    lon: 72.8777,
    asn: 'AS55836 Reliance Jio Infocomm',
    org: 'Mumbai Core Internet Exchange',
    threatLevel: 'LOW',
    threatScore: 18,
    category: 'Secure API Transit'
  },
  '45.154.255.89': {
    country: 'Netherlands',
    city: 'Amsterdam',
    countryCode: 'NL',
    flag: '🇳🇱',
    lat: 52.3676,
    lon: 4.9041,
    asn: 'AS208046',
    org: 'HostPalace Web Services',
    threatLevel: 'CRITICAL',
    threatScore: 94,
    category: 'Port Reconnaissance & Probe'
  },
  '185.220.101.5': {
    country: 'Germany',
    city: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    lat: 50.1109,
    lon: 8.6821,
    asn: 'AS205100',
    org: 'Tor Project Exit Relay',
    threatLevel: 'CRITICAL',
    threatScore: 95,
    category: 'Anonymized Proxy Infiltration'
  },
  '104.244.42.1': {
    country: 'United States',
    city: 'San Francisco, CA',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 37.7749,
    lon: -122.4194,
    asn: 'AS13414',
    org: 'Twitter / X Global Net',
    threatLevel: 'LOW',
    threatScore: 12,
    category: 'HTTPS Web Telemetry'
  },
  '151.101.65.140': {
    country: 'Ireland',
    city: 'Dublin',
    countryCode: 'IE',
    flag: '🇮🇪',
    lat: 53.3498,
    lon: -6.2603,
    asn: 'AS54113',
    org: 'Fastly Edge CDN Gateway',
    threatLevel: 'LOW',
    threatScore: 15,
    category: 'CDN Content Delivery'
  },
  '8.8.8.8': {
    country: 'United States',
    city: 'Mountain View, CA',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 37.422,
    lon: -122.0841,
    asn: 'AS15169',
    org: 'Google LLC Anycast DNS',
    threatLevel: 'BENIGN',
    threatScore: 4,
    category: 'Recursive DNS Query'
  },
  '1.1.1.1': {
    country: 'Australia',
    city: 'Sydney / Anycast',
    countryCode: 'AU',
    flag: '🇦🇺',
    lat: -33.8688,
    lon: 151.2093,
    asn: 'AS13335',
    org: 'Cloudflare Edge Anycast',
    threatLevel: 'BENIGN',
    threatScore: 5,
    category: 'Secure Public Resolver'
  },
  '198.51.100.42': {
    country: 'Japan',
    city: 'Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    lat: 35.6762,
    lon: 139.6503,
    asn: 'AS2914',
    org: 'NTT Communications',
    threatLevel: 'HIGH',
    threatScore: 78,
    category: 'Automated Port Sweep'
  },
  '194.26.29.112': {
    country: 'Russia',
    city: 'Moscow',
    countryCode: 'RU',
    flag: '🇷🇺',
    lat: 55.7558,
    lon: 37.6173,
    asn: 'AS44050',
    org: 'VDSina Hosting Cloud',
    threatLevel: 'CRITICAL',
    threatScore: 92,
    category: 'Credential Stuffing Botnet'
  }
};

// Host Firewall Target Node Location
const FIREWALL_HOST_NODE = {
  name: 'Sentinel Gateway Node',
  lat: 51.5074,
  lon: -0.1278,
  city: 'London / Frankfurt Hub',
  country: 'United Kingdom'
};

// Internal Protected LAN Assets for the Topology Mesh Graph
const INTERNAL_LAN_NODES = [
  {
    id: 'lan-gw',
    name: '192.168.1.1',
    label: 'Core LAN Gateway',
    role: 'Router / Switch Interface',
    status: 'SECURE',
    icon: 'router'
  },
  {
    id: 'lan-db',
    name: '192.168.1.10',
    label: 'Database Cluster',
    role: 'MySQL :3306 (Internal Only)',
    status: 'SECURE',
    icon: 'db'
  },
  {
    id: 'lan-web',
    name: '192.168.1.42',
    label: 'Production Web App',
    role: 'HTTPS :443 (Protected Ingress)',
    status: 'FILTERED',
    icon: 'server'
  },
  {
    id: 'lan-sec',
    name: '192.168.1.88',
    label: 'SecOps Console',
    role: 'Admin Workstation (Ammar)',
    status: 'AUTHENTICATED',
    icon: 'desktop'
  }
];

// Convert Lat/Lon to SVG Map Coordinates (Equirectangular Projection 900x450)
function projectCoords(lat, lon, width = 900, height = 450) {
  const x = (lon + 180) * (width / 360);
  const y = (-lat + 90) * (height / 180);
  return { x: Math.max(15, Math.min(width - 15, x)), y: Math.max(15, Math.min(height - 15, y)) };
}

// Generate fallback GeoIP for unknown dynamic IP
function resolveIpGeo(ip) {
  if (STATIC_GEOIP_DB[ip]) return STATIC_GEOIP_DB[ip];

  // Hash-based deterministic fallback for any real live packet IP
  const parts = ip.split('.').map((p) => parseInt(p, 10) || 0);
  const hash = parts.reduce((acc, curr) => acc * 31 + curr, 0);

  const fallbackRegions = [
    { country: 'India', city: 'Mumbai', code: 'IN', flag: '🇮🇳', lat: 19.076, lon: 72.8777, asn: 'AS55836 Reliance Jio' },
    { country: 'United States', city: 'Ashburn, VA', code: 'US', flag: '🇺🇸', lat: 39.0438, lon: -77.4874, asn: 'AS14618 Amazon.com' },
    { country: 'Germany', city: 'Frankfurt', code: 'DE', flag: '🇩🇪', lat: 50.1109, lon: 8.6821, asn: 'AS24940 Hetzner Online' },
    { country: 'Singapore', city: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.3521, lon: 103.8198, asn: 'AS13335 Cloudflare APAC' },
    { country: 'United Kingdom', city: 'London', code: 'GB', flag: '🇬🇧', lat: 51.5074, lon: -0.1278, asn: 'AS2856 British Telecom' },
    { country: 'France', city: 'Paris', code: 'FR', flag: '🇫🇷', lat: 48.8566, lon: 2.3522, asn: 'AS16276 OVHcloud' },
    { country: 'Japan', city: 'Tokyo', code: 'JP', flag: '🇯🇵', lat: 35.6762, lon: 139.6503, asn: 'AS2516 KDDI Corp' }
  ];

  const region = fallbackRegions[Math.abs(hash) % fallbackRegions.length];
  const isPrivate = ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip === '127.0.0.1';

  return {
    country: isPrivate ? 'Internal Subnet' : region.country,
    city: isPrivate ? 'Local Interface' : region.city,
    countryCode: isPrivate ? 'LAN' : region.code,
    flag: isPrivate ? '🏠' : region.flag,
    lat: isPrivate ? 51.5074 : region.lat + ((hash % 10) * 0.4),
    lon: isPrivate ? -0.1278 : region.lon + (((hash >> 2) % 10) * 0.4),
    asn: isPrivate ? 'Private LAN' : region.asn,
    org: isPrivate ? 'Host Intranet' : `${region.country} Internet Exchange`,
    threatLevel: isPrivate ? 'MEDIUM' : hash % 5 === 0 ? 'HIGH' : 'LOW',
    threatScore: isPrivate ? 45 : hash % 100,
    category: isPrivate ? 'Local Traffic' : 'External Transit'
  };
}

export default function IpGeoTracker({
  isDarkMode = false,
  logs = [],
  threatEvents = [],
  rules = [],
  onAutoBlock,
  onOpenAiQuery
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  // Visualizer Mode: 'map' (Geopolitical Map) vs 'graph' (Draggable Network Topology Mesh)
  const [visualizerMode, setVisualizerMode] = useState('graph');

  // Ref for the SVG canvas to compute exact drag coordinates
  const svgRef = useRef(null);

  // Dragging state for Interactive Topology Mesh Graph
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Aggregate unique IPs seen across recent live logs and threat events
  const trackedNodes = useMemo(() => {
    const ipMap = new Map();

    // Always ensure Mumbai, India node is readily available for inspection
    const mumbaiGeo = STATIC_GEOIP_DB['103.21.244.0'];
    ipMap.set('103.21.244.0', {
      ip: '103.21.244.0',
      geo: mumbaiGeo,
      packetCount: 88,
      threatSeverity: mumbaiGeo.threatLevel,
      threatScore: mumbaiGeo.threatScore,
      vector: mumbaiGeo.category,
      firstSeen: 'Live Transit',
      isThreatEvent: false
    });

    // Ingest threat events first (high fidelity attacker telemetry)
    threatEvents.forEach((t) => {
      if (!t.attackerIp) return;
      const geo = resolveIpGeo(t.attackerIp);
      ipMap.set(t.attackerIp, {
        ip: t.attackerIp,
        geo,
        packetCount: 150,
        threatSeverity: t.severity || geo.threatLevel,
        threatScore: Math.max(geo.threatScore, t.severity === 'CRITICAL' ? 95 : 75),
        vector: t.attackVector || geo.category,
        firstSeen: t.time || 'Active',
        isThreatEvent: true
      });
    });

    // Ingest packet logs
    logs.forEach((l) => {
      if (!l.srcIp) return;
      const existing = ipMap.get(l.srcIp);
      const geo = resolveIpGeo(l.srcIp);
      const count = existing ? existing.packetCount + 1 : 1;

      if (existing) {
        existing.packetCount = count;
      } else {
        ipMap.set(l.srcIp, {
          ip: l.srcIp,
          geo,
          packetCount: 1,
          threatSeverity: geo.threatLevel,
          threatScore: geo.threatScore,
          vector: geo.category,
          firstSeen: l.time || 'Live',
          isThreatEvent: false
        });
      }
    });

    // Supply standard threat IPs if list is still small
    if (ipMap.size < 4) {
      Object.keys(STATIC_GEOIP_DB).forEach((ip) => {
        const geo = STATIC_GEOIP_DB[ip];
        if (!ipMap.has(ip)) {
          ipMap.set(ip, {
            ip,
            geo,
            packetCount: Math.floor(40 + Math.random() * 200),
            threatSeverity: geo.threatLevel,
            threatScore: geo.threatScore,
            vector: geo.category,
            firstSeen: 'Telemetry Feed',
            isThreatEvent: geo.threatLevel === 'CRITICAL' || geo.threatLevel === 'HIGH'
          });
        }
      });
    }

    return Array.from(ipMap.values()).sort((a, b) => b.threatScore - a.threatScore);
  }, [logs, threatEvents]);

  // Filtered nodes based on search & severity
  const filteredNodes = useMemo(() => {
    return trackedNodes.filter((node) => {
      const matchSearch =
        searchQuery === '' ||
        node.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.geo.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.geo.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.geo.org.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity =
        severityFilter === 'ALL' ||
        (severityFilter === 'CRITICAL' && (node.threatSeverity === 'CRITICAL' || node.threatScore >= 80)) ||
        (severityFilter === 'HIGH' && (node.threatSeverity === 'HIGH' || (node.threatScore >= 60 && node.threatScore < 80))) ||
        (severityFilter === 'LOW' && (node.threatSeverity === 'LOW' || node.threatSeverity === 'BENIGN' || node.threatScore < 60));

      return matchSearch && matchSeverity;
    });
  }, [trackedNodes, searchQuery, severityFilter]);

  // Compute default balanced topology coordinates
  const calculateDefaultTopology = useCallback(() => {
    const positions = {};

    // Center Core Firewall Gateway
    positions['sentinel-core'] = { x: 450, y: 235 };

    // Ingress / Origin Nodes placed along the left arc
    const leftNodes = filteredNodes.slice(0, 8);
    const totalLeft = leftNodes.length;
    leftNodes.forEach((node, idx) => {
      const angle = (idx / Math.max(1, totalLeft - 1)) * Math.PI * 0.75 - Math.PI * 0.375;
      const radius = 290 + (idx % 2 === 0 ? 30 : -20);
      const x = Math.round(450 - Math.cos(angle) * radius);
      const y = Math.round(235 + Math.sin(angle) * radius);
      positions[node.ip] = { x: Math.max(70, Math.min(320, x)), y: Math.max(50, Math.min(420, y)) };
    });

    // Internal Protected LAN Nodes placed along the right arc
    INTERNAL_LAN_NODES.forEach((lan, idx) => {
      const angle = (idx / (INTERNAL_LAN_NODES.length - 1)) * Math.PI * 0.6 - Math.PI * 0.3;
      const radius = 280;
      const x = Math.round(450 + Math.cos(angle) * radius);
      const y = Math.round(235 + Math.sin(angle) * radius);
      positions[lan.id] = { x: Math.max(680, Math.min(840, x)), y: Math.max(60, Math.min(410, y)) };
    });

    return positions;
  }, [filteredNodes]);

  // Synchronize positions when filteredNodes change or on initial mount
  useEffect(() => {
    setNodePositions((prev) => {
      const defaults = calculateDefaultTopology();
      const updated = { ...defaults };
      // Preserve nodes that were already manually dragged by user
      Object.keys(prev).forEach((id) => {
        if (prev[id]) {
          updated[id] = prev[id];
        }
      });
      return updated;
    });
  }, [calculateDefaultTopology]);

  // Reset topology layout to clean default arrangement
  const handleResetLayout = () => {
    setNodePositions(calculateDefaultTopology());
  };

  // -------------------------------------------------------------
  // Pointer Event Handlers for Dragging Topology Nodes
  // -------------------------------------------------------------
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  };

  const handlePointerDown = (e, nodeId) => {
    e.stopPropagation();
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {
      // Ignore fallback
    }
    setDraggedNodeId(nodeId);
  };

  const handlePointerMove = (e) => {
    if (!draggedNodeId) return;
    const coords = getSvgCoordinates(e);
    if (!coords) return;

    // Constrain within viewBox (0, 0, 900, 480)
    const clampedX = Math.max(40, Math.min(860, Math.round(coords.x)));
    const clampedY = Math.max(40, Math.min(440, Math.round(coords.y)));

    setNodePositions((prev) => ({
      ...prev,
      [draggedNodeId]: { x: clampedX, y: clampedY }
    }));
  };

  const handlePointerUp = (e) => {
    if (draggedNodeId) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore fallback
      }
      setDraggedNodeId(null);
    }
  };

  // Host firewall coordinates on equirectangular map
  const hostProjected = projectCoords(FIREWALL_HOST_NODE.lat, FIREWALL_HOST_NODE.lon);

  // Statistics
  const totalNodes = trackedNodes.length;
  const criticalNodes = trackedNodes.filter((n) => n.threatSeverity === 'CRITICAL' || n.threatScore >= 80).length;
  const foreignNodes = trackedNodes.filter((n) => n.geo.countryCode !== 'LAN').length;
  const blockedIps = rules.filter((r) => r.action === 'DROP' && r.status === 'ACTIVE').map((r) => r.ip);

  // Center Sentinel Core position for topology graph
  const centerPos = nodePositions['sentinel-core'] || { x: 450, y: 235 };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
              Tracked Origin Nodes
            </span>
            <div className={`text-2xl font-bold font-mono mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {totalNodes}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Real-time IP geolocations</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase text-red-400 block tracking-wider">
              Critical Threat Origins
            </span>
            <div className="text-2xl font-bold font-mono text-red-500 mt-1">{criticalNodes}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Scanners & DDoS actors</span>
          </div>
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
              Cross-Border Nodes
            </span>
            <div className="text-2xl font-bold font-mono text-amber-500 mt-1">{foreignNodes}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">International ASNs</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Crosshair className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase text-emerald-400 block tracking-wider">
              Firewall Block Enforcement
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">{blockedIps.length} Rules</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Active DROP policies</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Visualizer Card with Mode Switcher (World Map vs Topology Graph) */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Visualizer Toolbar */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between flex-wrap gap-3 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-gray-200 bg-slate-50'
          }`}
        >
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => setVisualizerMode('graph')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  visualizerMode === 'graph'
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Network Topology Graph</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-400/25 text-blue-100 hidden sm:inline">
                  DRAGGABLE
                </span>
              </button>

              <button
                onClick={() => setVisualizerMode('map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  visualizerMode === 'map'
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>World Geo Map</span>
              </button>
            </div>

            {visualizerMode === 'graph' && (
              <button
                onClick={handleResetLayout}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-100'
                }`}
                title="Reset Nodes to Balanced Default Layout"
              >
                <RotateCcw className="w-3 h-3 text-blue-400" />
                <span className="hidden sm:inline">Reset Layout</span>
              </button>
            )}
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" /> Sentinel Gateway
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" /> Adversary / Blocked
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Allowed Transit
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Protected LAN
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="relative w-full aspect-[16/9] min-h-[460px] max-h-[560px] bg-slate-950 flex items-center justify-center overflow-hidden select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Cyber Grid Radar Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #3b82f6 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          />

          <svg ref={svgRef} viewBox="0 0 900 480" className="w-full h-full select-none">
            <defs>
              {/* Radial Gradients */}
              <radialGradient id="firewallPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="criticalPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Edge Gradients */}
              <linearGradient id="edgeRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="edgeGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="edgeLan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
              </linearGradient>

              {/* Glowing Drop Shadows */}
              <filter id="glowDrop" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.6" />
              </filter>
              <filter id="glowAllow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
              </filter>
              <filter id="glowCore" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#6366f1" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* ------------------------------------------------------------- */}
            {/* VIEW A: INTERACTIVE TOPOLOGY MESH GRAPH (DRAGGABLE NODES)     */}
            {/* ------------------------------------------------------------- */}
            {visualizerMode === 'graph' && (
              <g>
                {/* Background Reticle Rings centered on Firewall Core */}
                <g stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="3,6" opacity="0.25">
                  <circle cx={centerPos.x} cy={centerPos.y} r="140" fill="none" />
                  <circle cx={centerPos.x} cy={centerPos.y} r="280" fill="none" />
                  <line x1={centerPos.x} y1="0" x2={centerPos.x} y2="480" strokeDasharray="2,6" opacity="0.15" />
                  <line x1="0" y1={centerPos.y} x2="900" y2={centerPos.y} strokeDasharray="2,6" opacity="0.15" />
                </g>

                {/* 1. EDGES: Ingress Origin Nodes -> Sentinel Firewall Core */}
                {filteredNodes.slice(0, 8).map((node) => {
                  const pos = nodePositions[node.ip] || { x: 160, y: 240 };
                  const isBlocked = blockedIps.includes(node.ip);
                  const isCrit = node.threatSeverity === 'CRITICAL' || node.threatScore >= 80;
                  const isSelected = selectedNode && selectedNode.ip === node.ip;

                  // Smooth cubic bezier curve from node to core
                  const midX = (pos.x + centerPos.x) / 2;
                  const pathData = `M ${pos.x} ${pos.y} C ${midX} ${pos.y}, ${midX} ${centerPos.y}, ${centerPos.x} ${centerPos.y}`;

                  return (
                    <g key={`edge-${node.ip}`}>
                      {/* Base Link Line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isCrit || isBlocked ? 'url(#edgeRed)' : 'url(#edgeGreen)'}
                        strokeWidth={isSelected ? 3 : isCrit ? 2 : 1.2}
                        strokeDasharray={isCrit || isBlocked ? '6,4' : 'none'}
                        opacity={isSelected ? 1 : isCrit ? 0.85 : 0.45}
                        className={isCrit ? 'animate-pulse' : ''}
                      />

                      {/* Traveling Animated Data Packet Particle along the curve */}
                      <circle r={isCrit ? 3.5 : 2.5} fill={isCrit || isBlocked ? '#ef4444' : '#10b981'}>
                        <animateMotion path={pathData} dur={isCrit ? '1.8s' : '3.2s'} repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}

                {/* 2. EDGES: Sentinel Firewall Core -> Protected Internal LAN Assets */}
                {INTERNAL_LAN_NODES.map((lan) => {
                  const pos = nodePositions[lan.id] || { x: 750, y: 240 };
                  const midX = (centerPos.x + pos.x) / 2;
                  const pathData = `M ${centerPos.x} ${centerPos.y} C ${midX} ${centerPos.y}, ${midX} ${pos.y}, ${pos.x} ${pos.y}`;

                  return (
                    <g key={`lan-edge-${lan.id}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="url(#edgeLan)"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        opacity="0.5"
                      />
                      {/* Safe filtered packet pulse */}
                      <circle r="2.5" fill="#38bdf8">
                        <animateMotion path={pathData} dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}

                {/* 3. CENTER NODE: SENTINEL FIREWALL ENGINE (CORE GATEWAY) */}
                <g
                  transform={`translate(${centerPos.x}, ${centerPos.y})`}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => handlePointerDown(e, 'sentinel-core')}
                >
                  <circle r="42" fill="url(#coreHalo)" />
                  <circle r="26" fill="url(#firewallPulse)" className="animate-ping" opacity="0.3" />
                  <circle
                    r="22"
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    filter="url(#glowCore)"
                    className="transition-transform hover:scale-105"
                  />
                  {/* Shield Icon Graphic */}
                  <path
                    d="M-8,-7 L8,-7 L8,1 C8,6 0,11 0,11 C0,11 -8,6 -8,1 Z"
                    fill="#4f46e5"
                    stroke="#c7d2fe"
                    strokeWidth="1.2"
                  />

                  {/* Core Node Label Card */}
                  <g transform="translate(0, 36)">
                    <rect
                      x="-70"
                      y="-11"
                      width="140"
                      height="22"
                      rx="6"
                      fill="#020617"
                      stroke="#6366f1"
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#e0e7ff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      letterSpacing="0.5"
                    >
                      🛡️ SENTINEL CORE
                    </text>
                  </g>
                </g>

                {/* 4. DRAGGABLE SATELLITE NODES: INGRESS TRAFFIC & THREAT ORIGINS */}
                {filteredNodes.slice(0, 8).map((node) => {
                  const pos = nodePositions[node.ip] || { x: 150, y: 240 };
                  const isBlocked = blockedIps.includes(node.ip);
                  const isCrit = node.threatSeverity === 'CRITICAL' || node.threatScore >= 80;
                  const isHigh = node.threatSeverity === 'HIGH' || (node.threatScore >= 60 && node.threatScore < 80);
                  const isSelected = selectedNode && selectedNode.ip === node.ip;
                  const isBeingDragged = draggedNodeId === node.ip;

                  const strokeColor = isBlocked ? '#64748b' : isCrit ? '#ef4444' : isHigh ? '#f59e0b' : '#10b981';
                  const fillColor = isCrit ? '#450a0a' : isBlocked ? '#1e293b' : '#064e3b';

                  return (
                    <g
                      key={`topo-node-${node.ip}`}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-grab active:cursor-grabbing group select-none"
                      onPointerDown={(e) => handlePointerDown(e, node.ip)}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNodeId(node.ip)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {/* Critical Threat Warning Ring */}
                      {isCrit && !isBlocked && (
                        <circle r="22" fill="url(#criticalPulse)" className="animate-ping" opacity="0.5" />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={isSelected || isBeingDragged ? 16 : isCrit ? 14 : 12}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected || isBeingDragged ? 2.5 : 1.5}
                        filter={isCrit ? 'url(#glowDrop)' : 'url(#glowAllow)'}
                        className="transition-all duration-150"
                      />

                      {/* Inner Indicator Glyph */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {isCrit ? '!' : node.geo.countryCode?.slice(0, 2) || 'IP'}
                      </text>

                      {/* Prominent High-Contrast Node Label */}
                      <g transform="translate(0, -22)">
                        <rect
                          x="-65"
                          y="-16"
                          width="130"
                          height="20"
                          rx="4"
                          fill="#020617"
                          stroke={isSelected ? '#3b82f6' : strokeColor}
                          strokeWidth={isSelected ? 1.5 : 0.8}
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.ip}
                        </text>
                      </g>

                      {/* Sub-label: City / Location Badge (Always crisp & bright) */}
                      <g transform="translate(0, 28)">
                        <rect
                          x="-55"
                          y="-8"
                          width="110"
                          height="16"
                          rx="3"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="0.6"
                          opacity="0.9"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {node.geo.city || 'Transit Node'}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* 5. DRAGGABLE PROTECTED INTERNAL LAN ASSETS */}
                {INTERNAL_LAN_NODES.map((lan) => {
                  const pos = nodePositions[lan.id] || { x: 750, y: 240 };
                  const isBeingDragged = draggedNodeId === lan.id;

                  return (
                    <g
                      key={`lan-node-${lan.id}`}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-grab active:cursor-grabbing select-none"
                      onPointerDown={(e) => handlePointerDown(e, lan.id)}
                    >
                      <circle
                        r={isBeingDragged ? 16 : 13}
                        fill="#0c4a6e"
                        stroke="#38bdf8"
                        strokeWidth="1.8"
                        className="transition-all"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#e0f2fe"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        LAN
                      </text>

                      {/* LAN Asset Label Card */}
                      <g transform="translate(0, -20)">
                        <rect
                          x="-60"
                          y="-14"
                          width="120"
                          height="18"
                          rx="4"
                          fill="#020617"
                          stroke="#0284c7"
                          strokeWidth="0.8"
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="-2"
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {lan.name}
                        </text>
                      </g>

                      {/* Role Subtitle */}
                      <g transform="translate(0, 24)">
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#7dd3fc"
                          fontSize="8"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {lan.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW B: GEOPOLITICAL CYBER WORLD MAP                          */}
            {/* ------------------------------------------------------------- */}
            {visualizerMode === 'map' && (
              <g>
                {/* High-Fidelity Cyber World Continents Geo Vector Canvas */}
                <g fill="#1e293b" stroke="#334155" strokeWidth="0.8" opacity="0.75" className="transition-colors">
                  {/* North America & Canada */}
                  <path d="M70,55 L130,45 L175,40 L220,45 L255,60 L285,85 L275,115 L245,135 L260,165 L225,185 L180,215 L160,225 L145,190 L120,180 L90,145 L75,100 Z" />
                  {/* Greenland */}
                  <path d="M290,30 L345,25 L365,55 L320,80 L285,60 Z" />
                  {/* Central America & Caribbean */}
                  <path d="M160,225 L185,240 L210,255 L200,265 L175,255 L155,235 Z" />
                  {/* South America */}
                  <path d="M205,260 L245,255 L285,275 L310,320 L290,370 L260,420 L235,425 L215,360 L195,300 L190,270 Z" />
                  {/* British Isles */}
                  <path d="M420,80 L435,75 L440,95 L425,105 Z M410,90 L420,88 L418,102 L408,100 Z" />
                  {/* Western & Eastern Europe */}
                  <path d="M435,95 L480,80 L520,75 L540,110 L515,130 L480,140 L445,145 L435,120 Z" />
                  {/* Scandinavia */}
                  <path d="M465,40 L495,35 L510,65 L480,80 L465,60 Z" />
                  {/* Africa */}
                  <path d="M425,150 L515,145 L545,210 L540,270 L500,350 L465,365 L445,340 L420,240 L405,185 Z" />
                  {/* Madagascar */}
                  <path d="M555,305 L570,315 L560,355 L545,345 Z" />
                  {/* Russia & Northern Asia */}
                  <path d="M525,75 L620,60 L720,55 L810,65 L840,95 L795,130 L720,135 L620,130 L540,110 Z" />
                  {/* Middle East */}
                  <path d="M515,145 L565,150 L585,195 L550,215 L525,185 Z" />
                  {/* South Asia / India */}
                  <path d="M585,160 L645,165 L660,215 L625,265 L600,240 L585,195 Z" />
                  {/* East Asia & China */}
                  <path d="M625,130 L745,135 L770,180 L735,230 L665,225 L635,175 Z" />
                  {/* Southeast Asia */}
                  <path d="M690,225 L735,235 L725,275 L695,265 Z" />
                  {/* Japan Archipelago */}
                  <path d="M790,135 L815,150 L805,185 L785,175 Z" />
                  {/* Australia */}
                  <path d="M710,295 L785,290 L825,335 L800,395 L745,400 L705,360 L695,320 Z" />
                  {/* New Zealand */}
                  <path d="M845,385 L865,395 L850,430 L835,420 Z" />
                </g>

                {/* Coordinate Grid & Radar Reticles */}
                <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.25">
                  <line x1="0" y1="225" x2="900" y2="225" />
                  <line x1="0" y1="112" x2="900" y2="112" />
                  <line x1="0" y1="337" x2="900" y2="337" />
                  <line x1="225" y1="0" x2="225" y2="450" />
                  <line x1="450" y1="0" x2="450" y2="450" />
                  <line x1="675" y1="0" x2="675" y2="450" />
                </g>

                {/* Radar Rings Radiating from Sentinel Host */}
                <g stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="2,4" opacity="0.3">
                  <circle cx={hostProjected.x} cy={hostProjected.y} r="60" fill="none" />
                  <circle cx={hostProjected.x} cy={hostProjected.y} r="140" fill="none" />
                  <circle cx={hostProjected.x} cy={hostProjected.y} r="240" fill="none" />
                </g>

                {/* Traffic Arcs to Sentinel Firewall Gateway */}
                {filteredNodes.map((node) => {
                  const origin = projectCoords(node.geo.lat, node.geo.lon);
                  const isCrit = node.threatSeverity === 'CRITICAL' || node.threatScore >= 80;
                  const isBlocked = blockedIps.includes(node.ip);
                  const isSelected = selectedNode && selectedNode.ip === node.ip;

                  const midX = (origin.x + hostProjected.x) / 2;
                  const midY = Math.min(origin.y, hostProjected.y) - 35;
                  const pathData = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${hostProjected.x} ${hostProjected.y}`;

                  return (
                    <g key={`arc-${node.ip}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isCrit || isBlocked ? 'url(#edgeRed)' : 'url(#edgeGreen)'}
                        strokeWidth={isSelected ? 2.5 : isCrit ? 1.5 : 0.8}
                        strokeDasharray={isCrit || isBlocked ? '4,4' : 'none'}
                        opacity={isSelected ? 1 : isCrit ? 0.75 : 0.35}
                      />
                    </g>
                  );
                })}

                {/* Firewall Host Gateway Node */}
                <g transform={`translate(${hostProjected.x}, ${hostProjected.y})`}>
                  <circle r="18" fill="url(#firewallPulse)" className="animate-ping" opacity="0.4" />
                  <circle r="8" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
                  <text y="-12" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    SENTINEL-EDGE
                  </text>
                </g>

                {/* Map Ingress Origin Nodes with Staggered Non-Overlapping Labels */}
                {filteredNodes.map((node, index) => {
                  const pt = projectCoords(node.geo.lat, node.geo.lon);
                  const isCrit = node.threatSeverity === 'CRITICAL' || node.threatScore >= 80;
                  const isHigh = node.threatSeverity === 'HIGH' || (node.threatScore >= 60 && node.threatScore < 80);
                  const isBlocked = blockedIps.includes(node.ip);
                  const isSelected = selectedNode && selectedNode.ip === node.ip;

                  const markerColor = isBlocked ? '#64748b' : isCrit ? '#ef4444' : isHigh ? '#f59e0b' : '#10b981';

                  // Stagger label Y-offset so nearby European/Asian nodes never collide labels
                  const labelYOffset = index % 2 === 0 ? -12 : 16;

                  return (
                    <g
                      key={`map-node-${node.ip}`}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Critical Ping Ring */}
                      {isCrit && !isBlocked && (
                        <circle r="16" fill="url(#criticalPulse)" className="animate-ping" opacity="0.6" />
                      )}

                      {/* Node Circle */}
                      <circle
                        r={isSelected ? 7 : isCrit ? 5.5 : 4}
                        fill={markerColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1}
                      />

                      {/* Clean Non-colliding Label on Selection or High Threat */}
                      {(isSelected || isCrit) && (
                        <g transform={`translate(0, ${labelYOffset})`}>
                          <rect
                            x="-45"
                            y="-11"
                            width="90"
                            height="15"
                            rx="3"
                            fill="#020617"
                            stroke={markerColor}
                            strokeWidth="0.8"
                            opacity="0.95"
                          />
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {node.ip}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Canvas Mode Info Overlay Pill */}
          <div className="absolute top-3 left-4 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-200 flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {visualizerMode === 'graph'
                ? 'Interactive Topology Mesh: Click & Drag any node to reposition'
                : 'Geopolitical Cyber Radar: Live Global Attack Origin Map'}
            </span>
          </div>
        </div>

        {/* 3. Node Detail Drawer / Inspection Bar (When a node is selected) */}
        {selectedNode && (
          <div
            className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 transition ${
              isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-blue-50/80 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* Country Badge */}
              <div className="flex flex-col items-center justify-center min-w-[42px] px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs">
                <span>{selectedNode.geo.countryCode || 'NET'}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedNode.ip}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedNode.threatScore >= 80
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : selectedNode.threatScore >= 60
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    Threat Score: {selectedNode.threatScore}/100
                  </span>
                  {blockedIps.includes(selectedNode.ip) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                      BLOCKED / DROP
                    </span>
                  )}
                </div>

                {/* Location text rendered with bright high-contrast color */}
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  <strong className={isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'}>
                    {selectedNode.geo.city}, {selectedNode.geo.country}
                  </strong>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className={isDarkMode ? 'text-slate-300 font-mono text-[11px]' : 'text-slate-600 font-mono text-[11px]'}>
                    {selectedNode.geo.asn}
                  </span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {selectedNode.geo.org}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions for Selected Node */}
            <div className="flex items-center gap-2">
              {/* Ask Sentinel AI Button */}
              {onOpenAiQuery && (
                <button
                  onClick={() =>
                    onOpenAiQuery(
                      `Perform forensic threat analysis for IP ${selectedNode.ip} originating from ${selectedNode.geo.city}, ${selectedNode.geo.country} (${selectedNode.geo.org}). Threat Vector: ${selectedNode.vector}.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Analyst</span>
                </button>
              )}

              {/* Commit Drop Rule Button */}
              {onAutoBlock && !blockedIps.includes(selectedNode.ip) && (
                <button
                  onClick={() => onAutoBlock(selectedNode.ip, `Geo-Threat Block: ${selectedNode.vector}`)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-sm transition cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Auto-Drop IP</span>
                </button>
              )}

              <button
                onClick={() => setSelectedNode(null)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'border-gray-300 text-slate-600 hover:bg-gray-100'
                }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Ingress Nodes Inventory Table & Search Controls */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Controls Toolbar */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-gray-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Geolocated Ingress Nodes & Threat Origins ({filteredNodes.length})
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP, Mumbai, Country, ASN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 w-52 sm:w-64 transition ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1">
              {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer border ${
                    severityFilter === lvl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isDarkMode
                        ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                        : 'border-gray-200 text-slate-600 hover:bg-gray-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nodes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-400' : 'bg-gray-100/70 border-gray-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="py-3.5 px-4">Origin Node / IP</th>
                <th className="py-3.5 px-4">Location & Country</th>
                <th className="py-3.5 px-4">Autonomous System / ISP</th>
                <th className="py-3.5 px-4">Threat Assessment</th>
                <th className="py-3.5 px-4">Volume</th>
                <th className="py-3.5 px-4 text-right">Defense Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`py-8 text-center font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No ingress nodes match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredNodes.map((node) => {
                  const isBlocked = blockedIps.includes(node.ip);
                  const isCrit = node.threatScore >= 80;
                  const isHigh = node.threatScore >= 60 && node.threatScore < 80;

                  return (
                    <tr
                      key={node.ip}
                      onClick={() => setSelectedNode(node)}
                      className={`transition cursor-pointer ${
                        selectedNode?.ip === node.ip
                          ? isDarkMode
                            ? 'bg-blue-900/35'
                            : 'bg-blue-50'
                          : isDarkMode
                            ? 'hover:bg-slate-800/60'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* IP & Status */}
                      <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isBlocked ? 'bg-slate-500' : isCrit ? 'bg-red-500 animate-pulse' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className={isDarkMode ? 'text-slate-100 font-bold' : 'text-slate-900 font-bold'}>
                          {node.ip}
                        </span>
                      </td>

                      {/* Location & Flag / Country Pill - High Visibility */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            {node.geo.countryCode || 'NET'}
                          </span>
                          <span className={`font-semibold text-xs ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {node.geo.city}, {node.geo.country}
                          </span>
                        </div>
                      </td>

                      {/* ASN / ISP - High Contrast */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`font-mono text-[11px] block ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {node.geo.asn}
                        </span>
                        <span className={`text-[11px] block truncate max-w-[210px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {node.geo.org}
                        </span>
                      </td>

                      {/* Threat Assessment */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCrit
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isHigh
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {node.threatSeverity} ({node.threatScore})
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 truncate max-w-[180px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {node.vector}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                          {node.packetCount} pkts
                        </span>
                      </td>

                      {/* Direct Defense Mitigation Action */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenAiQuery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAiQuery(
                                  `Forensic analysis of IP ${node.ip} originating from ${node.geo.city}, ${node.geo.country}`
                                );
                              }}
                              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition cursor-pointer"
                              title="Query AI Analyst"
                            >
                              <Bot className="w-4 h-4" />
                            </button>
                          )}

                          {isBlocked ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-700/60 text-slate-300">
                              DROPPED
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAutoBlock(node.ip, `Geo-Defended: ${node.vector}`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-sm cursor-pointer"
                              title="Commit Immediate DROP Rule"
                            >
                              Drop IP
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
