import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldX, 
  Plus, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  XCircle
} from 'lucide-react';
import { COMMON_PORTS } from '../constants/initialData';
import { soundEffects } from '../utils/audio';

export default function RuleManager({ rules, onAddRule, onDeleteRule, onToggleRule }) {
  const [targetIp, setTargetIp] = useState('');
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState('TCP');
  const [action, setAction] = useState('DROP'); // Default to DROP for security posture
  const [description, setDescription] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');

  const handleQuickPort = (p, defaultProto) => {
    setPort(p);
    if (defaultProto) setProtocol(defaultProto);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!targetIp.trim()) {
      setFormError('Target IP is required (e.g. 192.168.1.105 or 0.0.0.0/0)');
      return;
    }

    if (!port.trim()) {
      setFormError('Port is required (e.g. 443, 80, 22, or ALL)');
      return;
    }

    const newRule = {
      id: `FW-${Math.floor(100 + Math.random() * 900)}`,
      targetIp: targetIp.trim(),
      port: port.trim().toUpperCase(),
      protocol: protocol,
      action: action,
      description: description.trim() || `User Policy: ${action} ${protocol} on Port ${port}`,
      hits: 0,
      createdAt: 'Just now',
      status: 'ACTIVE',
      priority: action === 'DROP' ? 'HIGH' : 'MEDIUM'
    };

    onAddRule(newRule);
    soundEffects.playSuccess();

    // Reset form fields
    setTargetIp('');
    setPort('');
    setDescription('');
  };

  const filteredRules = rules.filter(rule => {
    const matchesAction = filterAction === 'ALL' || rule.action === filterAction;
    const matchesSearch = 
      rule.targetIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.port.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="bg-[#0b121e]/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-sm">
      {/* Component Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              ACTIVE RULE ENGINE
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {rules.length} Policies
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Deterministic Packet Filtering // Netfilter iptables Hook
            </p>
          </div>
        </div>

        {/* Action Counters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            {rules.filter(r => r.action === 'ALLOW').length} ALLOW
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-400">
            {rules.filter(r => r.action === 'DROP').length} DROP
          </span>
        </div>
      </div>

      {/* Form Section to Input Target IP, Port, Action */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-slate-800 bg-[#070d17]/80 space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          Deploy New Firewall Filter Rule
        </div>

        {formError && (
          <div className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Target IP */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Target IP / Subnet
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.105"
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              className="w-full bg-[#0b121e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Port */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Target Port
            </label>
            <input
              type="text"
              placeholder="e.g. 443, 80, ALL"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full bg-[#0b121e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Protocol */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Protocol
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full bg-[#0b121e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
              <option value="ALL">ANY / ALL</option>
            </select>
          </div>

          {/* Action (ALLOW / DROP) */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Action Policy
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAction('ALLOW')}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                  action === 'ALLOW'
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400 shadow-neon-green'
                    : 'bg-slate-900 text-slate-400 border-slate-750 hover:border-slate-600'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ALLOW</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('DROP')}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                  action === 'DROP'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-neon-red'
                    : 'bg-slate-900 text-slate-400 border-slate-750 hover:border-slate-600'
                }`}
              >
                <ShieldX className="w-3.5 h-3.5" />
                <span>DROP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Port Pills & Description */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500">Quick Ports:</span>
            {COMMON_PORTS.slice(0, 5).map((cp) => (
              <button
                type="button"
                key={cp.port}
                onClick={() => handleQuickPort(cp.port, cp.defaultProto)}
                className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                {cp.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-neon-green transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Commit Rule</span>
          </button>
        </div>
      </form>

      {/* Rules Controls & Filter Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search by IP or Port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#070d17] border border-slate-700 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setFilterAction('ALL')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filterAction === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterAction('ALLOW')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filterAction === 'ALLOW' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Allow
            </button>
            <button
              onClick={() => setFilterAction('DROP')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filterAction === 'DROP' ? 'bg-rose-950 text-rose-400' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Drop
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing {filteredRules.length} of {rules.length} active filters
        </div>
      </div>

      {/* Active Rules Table */}
      <div className="flex-1 overflow-x-auto terminal-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#070d17]/90 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">Rule ID</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Target IP</th>
              <th className="py-2.5 px-3">Port</th>
              <th className="py-2.5 px-3">Proto</th>
              <th className="py-2.5 px-3">Hits</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-500 font-mono text-xs">
                  No firewall rules match current query.
                </td>
              </tr>
            ) : (
              filteredRules.map((rule) => {
                const isAllow = rule.action === 'ALLOW';
                const isSuspended = rule.status === 'PAUSED';

                return (
                  <tr 
                    key={rule.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSuspended ? 'opacity-50' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-2.5 px-3 text-slate-400 font-semibold">
                      {rule.id}
                    </td>

                    {/* Action Badge */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                        isAllow
                          ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700/60 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                          : 'bg-rose-950/70 text-rose-400 border-rose-700/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                      }`}>
                        {isAllow ? <ShieldCheck className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                        {rule.action}
                      </span>
                    </td>

                    {/* Target IP */}
                    <td className="py-2.5 px-3 text-slate-200 font-bold">
                      {rule.targetIp}
                    </td>

                    {/* Port */}
                    <td className="py-2.5 px-3 text-cyan-400">
                      {rule.port}
                    </td>

                    {/* Protocol */}
                    <td className="py-2.5 px-3 text-slate-400">
                      {rule.protocol}
                    </td>

                    {/* Hits */}
                    <td className="py-2.5 px-3 text-slate-400">
                      <span className="text-slate-300 font-medium">{rule.hits.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 ml-1">pkts</span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          rule.status === 'ACTIVE'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {rule.status}
                      </button>
                    </td>

                    {/* Delete action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        title="Remove Policy"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
