import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Search,
  Trash2,
  CheckCircle2,
  Flame,
  Zap,
  Server,
  Filter,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function IntrusionDetectionView({
  isDarkMode,
  threatEvents = [],
  rules = [],
  isAttackActive = false,
  onToggleAttack,
  onAutoBlock,
  onClearThreats,
  totalPkts = 0
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Check if an attacker IP is actively blocked in the firewall policy rules
  const isThreatMitigated = (attackerIp) => {
    return rules.some(
      (r) =>
        (r.ip === attackerIp || (r.ip === '0.0.0.0/0' && r.port === 'ALL')) &&
        r.action === 'DROP' &&
        r.status === 'ACTIVE'
    );
  };

  // Stats Counters
  const totalThreats = threatEvents.length;
  const criticalCount = threatEvents.filter((t) => t.severity === 'CRITICAL').length;
  const highCount = threatEvents.filter((t) => t.severity === 'HIGH').length;
  const medCount = threatEvents.filter((t) => t.severity === 'MEDIUM').length;
  const lowCount = threatEvents.filter((t) => t.severity === 'LOW').length;

  const mitigatedCount = threatEvents.filter((t) => isThreatMitigated(t.attackerIp)).length;
  const activeCount = totalThreats - mitigatedCount;

  // Filtered threats
  const filteredThreats = threatEvents.filter((t) => {
    const isMitigated = isThreatMitigated(t.attackerIp);

    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      t.attackerIp.toLowerCase().includes(q) ||
      t.vector.toLowerCase().includes(q) ||
      t.signatureId.toLowerCase().includes(q) ||
      String(t.targetPort).toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);

    // Severity matching
    const matchSeverity = severityFilter === 'ALL' || t.severity === severityFilter;

    // Status matching
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !isMitigated) ||
      (statusFilter === 'MITIGATED' && isMitigated);

    return matchSearch && matchSeverity && matchStatus;
  });

  // Vector breakdowns
  const synFloodCount = threatEvents.filter((t) => t.vector.toLowerCase().includes('syn')).length;
  const portScanCount = threatEvents.filter((t) => t.vector.toLowerCase().includes('scan') || t.vector.toLowerCase().includes('recon')).length;
  const bruteForceCount = threatEvents.filter((t) => t.vector.toLowerCase().includes('brute')).length;
  const webExploitCount = threatEvents.filter((t) => t.vector.toLowerCase().includes('web') || t.vector.toLowerCase().includes('sql')).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Suricata / Heuristic Signature Engine Status */}
      <section
        className={`rounded-xl border p-5 transition-colors shadow-sm ${
          isDarkMode
            ? isAttackActive
              ? 'bg-red-950/30 border-red-900/80'
              : 'bg-slate-800 border-slate-700'
            : isAttackActive
              ? 'bg-red-50/70 border-red-200'
              : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border ${
                isAttackActive
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : isDarkMode
                    ? 'bg-slate-900 text-blue-400 border-slate-700'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Intrusion Detection System (IDS) Engine</h3>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isAttackActive
                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                      : isDarkMode
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isAttackActive ? 'ACTIVE INTRUSION DETECTED' : 'SURICATA / eBPF ENGINE ONLINE'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Continuous kernel-level heuristic sniffer matching incoming traffic against 24,510 threat signatures (OWASP, MITRE ATT&CK, ET Pro).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 text-slate-700'
              }`}
            >
              <span className="text-slate-400">Inspected Frames:</span>{' '}
              <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{totalPkts.toLocaleString()}</strong>
            </div>

            {onToggleAttack && (
              <button
                onClick={onToggleAttack}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                  isAttackActive
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm'
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/80'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{isAttackActive ? 'Stop Intrusion Simulation' : 'Simulate Live Intrusion'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Security Events */}
        <div
          className={`border p-4 rounded-xl transition-colors shadow-sm ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Security Events</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">{totalThreats}</div>
          <div className="text-[11px] text-slate-500 mt-1">Signatures triggered on wire</div>
        </div>

        {/* Critical Severity Alerts */}
        <div
          className={`border p-4 rounded-xl transition-colors shadow-sm ${
            criticalCount > 0
              ? isDarkMode
                ? 'bg-red-950/30 border-red-800/80'
                : 'bg-red-50 border-red-200'
              : isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Critical Severity Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div
            className={`text-2xl font-bold mt-2 font-mono ${
              criticalCount > 0 ? 'text-red-600 dark:text-red-400' : ''
            }`}
          >
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires immediate firewall drop</div>
        </div>

        {/* Contained / Mitigated Attackers */}
        <div
          className={`border p-4 rounded-xl transition-colors shadow-sm ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Contained Threat Vectors</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono text-emerald-600 dark:text-emerald-400">
            {mitigatedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active DROP policy rules deployed</div>
        </div>

        {/* Heuristic Inspection Latency */}
        <div
          className={`border p-4 rounded-xl transition-colors shadow-sm ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Analysis Latency</span>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono text-blue-600 dark:text-blue-400">
            0.84 <span className="text-sm font-normal text-slate-500">ms</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">eBPF XDP Wire-Speed Heuristics</div>
        </div>
      </div>

      {/* Attack Vector Distribution Radar */}
      <section
        className={`rounded-xl border p-4 transition-colors shadow-sm ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Threat Signature Breakdown by Attack Vector</h4>
          </div>
          <span className="text-slate-400 text-[11px]">Suricata Classifiers</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>TCP SYN Flood</span>
              <span className="font-mono font-bold text-red-500">{synFloodCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (synFloodCount / (totalThreats || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Port Reconnaissance</span>
              <span className="font-mono font-bold text-orange-500">{portScanCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (portScanCount / (totalThreats || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>SSH/RDP Brute-Force</span>
              <span className="font-mono font-bold text-amber-500">{bruteForceCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (bruteForceCount / (totalThreats || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Web / SQLi Exploits</span>
              <span className="font-mono font-bold text-blue-500">{webExploitCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (webExploitCount / (totalThreats || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Threat Intelligence Feed Section */}
      <section
        className={`rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* Table Header Controls */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm">Live Threat Intelligence Feed</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                activeCount > 0
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {activeCount} Active / {totalThreats} Total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {onClearThreats && (
              <button
                onClick={onClearThreats}
                disabled={threatEvents.length === 0}
                className={`p-1.5 rounded transition cursor-pointer border ${
                  threatEvents.length === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-400 border-transparent'
                    : isDarkMode
                      ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-red-400 hover:border-red-900'
                      : 'bg-white text-slate-600 border-gray-300 hover:text-red-600 hover:border-red-200'
                }`}
                title="Clear Threat Intelligence Feed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search IP, vector, signature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`rounded-md pl-8 pr-2.5 py-1 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 transition font-mono ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-white border-gray-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Filters Bar: Severity & Status Tabs */}
        <div
          className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50/70 border-gray-200'
          }`}
        >
          {/* Severity Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    isActive
                      ? sev === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : sev === 'HIGH'
                          ? 'bg-orange-600 text-white'
                          : sev === 'MEDIUM'
                            ? 'bg-amber-600 text-white'
                            : sev === 'LOW'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-white'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-gray-200'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          {/* Containment Status Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Containment:</span>
            {['ALL', 'ACTIVE', 'MITIGATED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Threat Events Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase text-slate-500 ${
                  isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <th className="py-3 px-4">Event Time</th>
                <th className="py-3 px-4">Threat ID & Sig</th>
                <th className="py-3 px-4">Attacker IP</th>
                <th className="py-3 px-4">Target Port</th>
                <th className="py-3 px-4">Attack Vector</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Mitigation Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/80' : 'divide-gray-200'}`}>
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Radio className="w-8 h-8 text-blue-500 animate-pulse" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                        {threatEvents.length === 0
                          ? 'No Malicious Intrusions Detected'
                          : 'No Security Events Matching Selected Filters'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        {threatEvents.length === 0
                          ? 'Active deep-packet inspection attached to interface eth0. Click "Simulate Live Intrusion" in the top bar to test real-time signature triggers and automated containment.'
                          : 'Try clearing your search query or switching severity filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => {
                  const isMitigated = isThreatMitigated(threat.attackerIp);

                  // Severity styling
                  let sevClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
                  if (threat.severity === 'CRITICAL') {
                    sevClass = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse';
                  } else if (threat.severity === 'HIGH') {
                    sevClass = 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800';
                  } else if (threat.severity === 'MEDIUM') {
                    sevClass = 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
                  }

                  return (
                    <tr
                      key={threat.id}
                      className={`transition ${
                        isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-50'
                      } ${!isMitigated && threat.severity === 'CRITICAL' ? 'bg-red-950/10' : ''}`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        [{threat.time}]
                      </td>

                      {/* Threat ID & Sig */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block">
                          {threat.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {threat.signatureId}
                        </span>
                      </td>

                      {/* Attacker IP */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {threat.attackerIp}
                        </span>
                        {threat.packetCount && threat.packetCount > 1 && (
                          <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                            {threat.packetCount} probes
                          </span>
                        )}
                      </td>

                      {/* Target Port */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="text-slate-800 dark:text-slate-200">
                          Port {threat.targetPort}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {threat.protocol || 'TCP'}
                        </span>
                      </td>

                      {/* Vector */}
                      <td className="py-3 px-4 max-w-xs truncate">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {threat.vector}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Confidence: {threat.confidence || 96}%
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${sevClass}`}>
                          {threat.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isMitigated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Contained</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                            <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                            <span>Uncontained</span>
                          </span>
                        )}
                      </td>

                      {/* Mitigation Action Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isMitigated ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>DROP Rule Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onAutoBlock && onAutoBlock(threat.attackerIp, threat.vector)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                            title={`Deploy DROP rule for ${threat.attackerIp}`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Auto-Block IP</span>
                          </button>
                        )}
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
  );
}
