import React from 'react';
import { ShieldCheck, Plus, Search, Trash2, RefreshCw, Database } from 'lucide-react';
import { QUICK_PORT_PRESETS } from '../constants/initialData';

export default function RuleManager({
  isDarkMode,
  rules = [],
  filteredRules = [],
  inputIp,
  setInputIp,
  inputPort,
  setInputPort,
  inputProtocol,
  setInputProtocol,
  inputAction,
  setInputAction,
  inputDesc,
  setInputDesc,
  ruleSearch,
  setRuleSearch,
  ruleActionFilter,
  setRuleActionFilter,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onQuickPort,
  backendStatus = 'checking',
  isRulesLoading = false,
  onRefreshRules
}) {
  const allowCount = rules.filter((r) => r.action === 'ALLOW').length;
  const dropCount = rules.filter((r) => r.action === 'DROP').length;

  return (
    <section
      className={`w-full rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">Firewall Policy & Filtering Rules Engine</h3>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Deterministic packet filtering configuration connected directly to MySQL database & Linux Netfilter map.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Database Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border text-xs ${
              backendStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : backendStatus === 'offline'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {backendStatus === 'connected'
                ? 'MySQL DB Connected'
                : backendStatus === 'offline'
                  ? 'Local Mode (MySQL Offline)'
                  : 'Checking DB...'}
            </span>
          </div>

          {onRefreshRules && (
            <button
              onClick={onRefreshRules}
              disabled={isRulesLoading}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium border transition cursor-pointer text-xs ${
                isDarkMode
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-750'
                  : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
              }`}
              title="Refresh Rules from MySQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRulesLoading ? 'animate-spin text-blue-500' : ''}`} />
              <span>Refresh</span>
            </button>
          )}

          <span
            className={`px-2.5 py-1 rounded font-medium border ${
              isDarkMode
                ? 'bg-green-950/40 text-green-400 border-green-800/60'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}
          >
            {allowCount} ALLOW
          </span>
          <span
            className={`px-2.5 py-1 rounded font-medium border ${
              isDarkMode
                ? 'bg-red-950/40 text-red-400 border-red-800/60'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {dropCount} DROP
          </span>
        </div>
      </div>

      {/* Full-Width Rule Input Form */}
      <form
        onSubmit={onAddRule}
        className={`p-5 border-b space-y-4 ${
          isDarkMode ? 'border-slate-700 bg-slate-850' : 'border-gray-200 bg-slate-50/60'
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          Deploy New Filtering Rule
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              Target IP / Subnet CIDR
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.105 or 0.0.0.0/0"
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
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              Rule Description / Memo
            </label>
            <input
              type="text"
              placeholder="e.g. Block brute force scanner"
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

        {/* Quick Port Preset Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Quick Port Presets:</span>
            {QUICK_PORT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onQuickPort(p.port, p.proto)}
                className={`px-2 py-0.5 rounded text-[11px] border transition cursor-pointer font-medium ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Commit Rule to Database</span>
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search rules by IP, port, or description..."
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
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({rules.length})
          </button>
          <button
            onClick={() => setRuleActionFilter('ALLOW')}
            className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
              ruleActionFilter === 'ALLOW'
                ? 'bg-green-600 text-white'
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Allow ({allowCount})
          </button>
          <button
            onClick={() => setRuleActionFilter('DROP')}
            className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
              ruleActionFilter === 'DROP'
                ? 'bg-red-600 text-white'
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Drop ({dropCount})
          </button>
        </div>
      </div>

      {/* Full-Width Rules Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`border-b text-[11px] font-semibold uppercase text-slate-500 ${
                isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
              }`}
            >
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
                <td colSpan="10" className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-slate-400" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      {ruleSearch ? `No rules matching "${ruleSearch}"` : 'No Active Firewall Rules Found'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      {rules.length === 0
                        ? 'The policy engine is empty. Use the deployment form above to configure and commit real packet filtering rules to the database.'
                        : 'Try adjusting your search query or action filter.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRules.map((rule) => {
                const isAllow = rule.action === 'ALLOW';
                return (
                  <tr
                    key={rule.id}
                    className={`transition ${isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-50'}`}
                  >
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
                    <td className="py-3 px-4 font-medium font-mono text-slate-900 dark:text-slate-100">
                      {rule.ip}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{rule.port}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{rule.protocol}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rule.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {(rule.hits || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                      {rule.bytes || '0 B'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className={`text-[11px] px-2.5 py-1 rounded border transition cursor-pointer font-medium ${
                          rule.status === 'ACTIVE'
                            ? isDarkMode
                              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
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
                        onClick={() => onDeleteRule(rule.id)}
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
  );
}
