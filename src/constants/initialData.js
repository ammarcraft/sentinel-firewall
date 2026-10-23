// Initial mock datasets and configurations for AEGIS Firewall & IDS Simulator

export const INITIAL_RULES = [
  {
    id: "FW-101",
    targetIp: "192.168.1.105",
    port: "ALL",
    protocol: "TCP/UDP",
    action: "DROP",
    description: "Quarantine: Port Scan & High-Frequency SYN Flooding",
    hits: 14892,
    createdAt: "2m ago",
    status: "ACTIVE",
    priority: "HIGH"
  },
  {
    id: "FW-102",
    targetIp: "0.0.0.0/0",
    port: "443",
    protocol: "TCP",
    action: "ALLOW",
    description: "Core Ingress: TLS/HTTPS Public Production Gateway",
    hits: 1280419,
    createdAt: "1d ago",
    status: "ACTIVE",
    priority: "MEDIUM"
  },
  {
    id: "FW-103",
    targetIp: "0.0.0.0/0",
    port: "80",
    protocol: "TCP",
    action: "ALLOW",
    description: "Edge Ingress: HTTP Port 80 Redirect to HTTPS",
    hits: 491208,
    createdAt: "1d ago",
    status: "ACTIVE",
    priority: "LOW"
  },
  {
    id: "FW-104",
    targetIp: "45.33.32.156",
    port: "22",
    protocol: "TCP",
    action: "DROP",
    description: "Threat Intel: Malicious Automated SSH Brute Force Scanner",
    hits: 38912,
    createdAt: "4h ago",
    status: "ACTIVE",
    priority: "HIGH"
  }
];

export const MOCK_IP_POOL = [
  { ip: "142.250.190.46", geo: "US (Cloudflare CDN)", reputation: "clean" },
  { ip: "172.217.16.206", geo: "US (Google Edge)", reputation: "clean" },
  { ip: "104.244.42.1", geo: "IE (Transit Level3)", reputation: "clean" },
  { ip: "185.199.108.153", geo: "NL (Fastly Edge)", reputation: "clean" },
  { ip: "20.112.52.29", geo: "DE (Azure Hub)", reputation: "clean" },
  { ip: "54.239.28.85", geo: "US (AWS Virginia)", reputation: "clean" },
  { ip: "198.51.100.42", geo: "FR (OVH Cloud)", reputation: "clean" },
  { ip: "91.240.118.172", geo: "RU (Known Botnet C2)", reputation: "suspicious" },
  { ip: "103.145.13.88", geo: "HK (Tor Exit Node)", reputation: "suspicious" },
  { ip: "192.168.1.105", geo: "LAN (Internal Threat Node)", reputation: "malicious" }
];

export const COMMON_PORTS = [
  { port: "443", label: "443 (HTTPS)", defaultProto: "TCP" },
  { port: "80", label: "80 (HTTP)", defaultProto: "TCP" },
  { port: "22", label: "22 (SSH)", defaultProto: "TCP" },
  { port: "53", label: "53 (DNS)", defaultProto: "UDP" },
  { port: "8080", label: "8080 (PROXY/DEV)", defaultProto: "TCP" },
  { port: "3389", label: "3389 (RDP)", defaultProto: "TCP" },
  { port: "ALL", label: "ALL PORTS", defaultProto: "ALL" }
];
