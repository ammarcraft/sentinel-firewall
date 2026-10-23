export const INITIAL_RULES = [
  {
    id: 'FW-101',
    ip: '192.168.1.105',
    port: 'ALL',
    protocol: 'TCP/UDP',
    action: 'DROP',
    description: 'Quarantine: High-Frequency SYN Flood & Port Scan',
    hits: 14892,
    bytes: '18.4 MB',
    status: 'ACTIVE'
  },
  {
    id: 'FW-102',
    ip: '0.0.0.0/0',
    port: '443',
    protocol: 'TCP',
    action: 'ALLOW',
    description: 'HTTPS public web gateway traffic',
    hits: 1280419,
    bytes: '1.42 GB',
    status: 'ACTIVE'
  },
  {
    id: 'FW-103',
    ip: '0.0.0.0/0',
    port: '80',
    protocol: 'TCP',
    action: 'ALLOW',
    description: 'HTTP inbound redirect to HTTPS',
    hits: 491208,
    bytes: '312 MB',
    status: 'ACTIVE'
  },
  {
    id: 'FW-104',
    ip: '45.33.32.156',
    port: '22',
    protocol: 'TCP',
    action: 'DROP',
    description: 'Block remote automated SSH brute-force scanning',
    hits: 38912,
    bytes: '4.2 MB',
    status: 'ACTIVE'
  }
];

export const INITIAL_LOGS = [
  {
    id: 'PKT-1001',
    time: '14:20:02.114',
    proto: 'TCP [ACK]',
    srcIp: '142.250.190.46',
    srcPort: 443,
    dstIp: '192.168.1.20',
    dstPort: 51240,
    len: 1420,
    ttl: 54,
    action: 'ALLOW',
    rule: 'FW-102'
  },
  {
    id: 'PKT-1002',
    time: '14:20:04.228',
    proto: 'TCP [SYN]',
    srcIp: '45.33.32.156',
    srcPort: 58122,
    dstIp: '192.168.1.20',
    dstPort: 22,
    len: 64,
    ttl: 48,
    action: 'DROP',
    rule: 'FW-104'
  },
  {
    id: 'PKT-1003',
    time: '14:20:06.381',
    proto: 'UDP [DNS]',
    srcIp: '1.1.1.1',
    srcPort: 53,
    dstIp: '192.168.1.45',
    dstPort: 49301,
    len: 128,
    ttl: 58,
    action: 'ALLOW',
    rule: 'DEFAULT'
  },
  {
    id: 'PKT-1004',
    time: '14:20:08.512',
    proto: 'TCP [ACK]',
    srcIp: '172.217.16.206',
    srcPort: 443,
    dstIp: '192.168.1.12',
    dstPort: 54109,
    len: 1140,
    ttl: 52,
    action: 'ALLOW',
    rule: 'FW-102'
  },
  {
    id: 'PKT-1005',
    time: '14:20:10.019',
    proto: 'TCP [SYN]',
    srcIp: '192.168.1.105',
    srcPort: 41203,
    dstIp: '192.168.1.5',
    dstPort: 445,
    len: 64,
    ttl: 64,
    action: 'DROP',
    rule: 'FW-101'
  }
];

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

export const QUICK_PORT_PRESETS = [
  { label: 'HTTPS (443)', port: '443', proto: 'TCP' },
  { label: 'HTTP (80)', port: '80', proto: 'TCP' },
  { label: 'SSH (22)', port: '22', proto: 'TCP' },
  { label: 'DNS (53)', port: '53', proto: 'UDP' },
  { label: 'RDP (3389)', port: '3389', proto: 'TCP' },
  { label: 'ICMP Ping', port: 'ALL', proto: 'ICMP' }
];
