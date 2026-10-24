// Sentinel Firewall - Initial Constants

// Exactly one default rule 'FW-1' so the rules table is never completely empty
export const INITIAL_RULES = [
  {
    id: 'FW-1',
    rawId: 1,
    ip: '0.0.0.0/0',
    port: '443',
    protocol: 'TCP',
    action: 'ALLOW',
    description: 'Default HTTPS Gateway: Allow encrypted outbound/inbound traffic',
    hits: 0,
    rawBytes: 0,
    bytes: '0 B',
    status: 'ACTIVE'
  }
];

export const INITIAL_LOGS = [];

export const INITIAL_SPARKPOINTS = [
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
];

// Quick Port Configuration Presets for the Rule Creation Form
export const QUICK_PORT_PRESETS = [
  { label: 'HTTPS (443)', port: '443', proto: 'TCP' },
  { label: 'HTTP (80)', port: '80', proto: 'TCP' },
  { label: 'SSH (22)', port: '22', proto: 'TCP' },
  { label: 'DNS (53)', port: '53', proto: 'UDP' },
  { label: 'RDP (3389)', port: '3389', proto: 'TCP' },
  { label: 'ICMP Ping', port: 'ALL', proto: 'ICMP' }
];
