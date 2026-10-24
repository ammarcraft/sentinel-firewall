// Minimal standard PDF 1.4 generator for Sentinel Security Audit Report
export function generateAuditPdf(lines) {
  let streamContent = 'BT\n/F1 9 Tf\n36 750 Td\n13 TL\n';
  for (let i = 0; i < lines.length; i++) {
    const s = String(lines[i])
      .split('\\')
      .join('\\\\')
      .split('(')
      .join('\\(')
      .split(')')
      .join('\\)');
    if (i === 0) {
      streamContent += `(${s}) Tj\n`;
    } else {
      streamContent += `T*\n(${s}) Tj\n`;
    }
  }
  streamContent += 'ET\n';

  const streamLen = new TextEncoder().encode(streamContent).length;
  let body = '%PDF-1.4\n';
  const offsets = [];

  const addObj = (str) => {
    offsets.push(body.length);
    body += str + '\n';
  };

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj');
  addObj('5 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + streamContent + 'endstream\nendobj');

  const startXref = body.length;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + startXref + '\n%%EOF\n';
  return body + xref + trailer;
}

export async function exportFirewallReport({ format, logs, rules, stats, isAttackActive }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  let filename = '';
  let content = '';
  let mimeType = '';

  const { totalPkts, allowPkts, dropPkts, allowPct, dropPct } = stats;

  if (format === 'CSV') {
    filename = `sentinel_firewall_logs_${timestampStr}.csv`;
    mimeType = 'text/csv;charset=utf-8;';

    const csvLines = [
      '# ============================================================================== #',
      '# SENTINEL FIREWALL - TRAFFIC INSPECTION & POLICY AUDIT LOG                       #',
      `# Generated At: ${now.toISOString()}                                      #`,
      '# Target Path: Reports directory                                                #',
      `# Operational Status: ${isAttackActive ? 'ATTACK SIMULATION ACTIVE' : 'NORMAL OPERATIONAL BASELINE'}               #`,
      `# Telemetry Summary: Total=${totalPkts} | Allowed=${allowPkts} (${allowPct}%) | Dropped=${dropPkts} (${dropPct}%)   #`,
      '# ============================================================================== #',
      '',
      '--- [SECTION 1: ACTIVE FIREWALL RULES] ---',
      'Rule_ID,Target_IP,Port,Protocol,Action,Description,Hits,Bytes,Status',
      ...rules.map(
        (r) =>
          `"${r.id}","${r.ip}","${r.port}","${r.protocol}","${r.action}","${r.description.replace(/"/g, '""')}","${r.hits}","${r.bytes}","${r.status}"`
      ),
      '',
      '--- [SECTION 2: LIVE PACKET INSPECTION LOGS] ---',
      'Timestamp,Packet_ID,Protocol,Source_IP,Source_Port,Dest_IP,Dest_Port,Length_Bytes,TTL,Action,Rule_ID',
      ...logs.map(
        (l) =>
          `"${l.time}","${l.id}","${l.proto}","${l.srcIp}","${l.srcPort}","${l.dstIp}","${l.dstPort}","${l.len}","${l.ttl}","${l.action}","${l.rule}"`
      )
    ];
    content = csvLines.join('\r\n');
  } else {
    filename = `sentinel_security_audit_${timestampStr}.pdf`;
    mimeType = 'application/pdf';

    const pdfLines = [
      '========================================================================',
      '         SENTINEL FIREWALL & IDS - ENTERPRISE AUDIT REPORT              ',
      '========================================================================',
      `Generated At   : ${now.toLocaleString()}`,
      `Save Directory : Reports\\`,
      `Firewall State : ${isAttackActive ? 'ATTACK SIMULATION ACTIVE' : 'NORMAL BASELINE OPERATIONAL'}`,
      `Total Packets  : ${totalPkts}`,
      `Allowed        : ${allowPkts} (${allowPct}%)`,
      `Dropped        : ${dropPkts} (${dropPct}%)`,
      `Active Rules   : ${rules.length} policies enforced`,
      '------------------------------------------------------------------------',
      'SECTION 1: ACTIVE FIREWALL RULES',
      '------------------------------------------------------------------------',
      ...rules.map(
        (r) =>
          `[${r.id}] ${r.action.padEnd(5)} | Proto: ${r.protocol.padEnd(4)} | Port: ${String(r.port).padEnd(5)} | IP: ${r.ip.padEnd(15)} | Hits: ${r.hits}`
      ),
      '------------------------------------------------------------------------',
      'SECTION 2: RECENT PACKET LOGS (SAMPLE)',
      '------------------------------------------------------------------------',
      ...logs.slice(0, 18).map(
        (l) =>
          `${l.time} | ${l.id} | ${l.action.padEnd(5)} | ${l.proto.padEnd(10)} | ${l.srcIp}:${l.srcPort} -> ${l.dstIp}:${l.dstPort}`
      ),
      '========================================================================',
      '                       END OF AUDIT REPORT                              ',
      '========================================================================'
    ];
    content = generateAuditPdf(pdfLines);
  }

  // 1. Direct local disk save via server API
  let savedPath = `Reports\\${filename}`;
  try {
    const response = await fetch('/api/save-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content })
    });
    const data = await response.json();
    if (data.success && data.path) {
      savedPath = data.path;
    }
  } catch (err) {
    console.warn('Local file save warning:', err);
  }

  // 2. Browser file download blob trigger
  try {
    const blob = new Blob([content], { type: mimeType });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.warn('Browser download warning:', err);
  }

  return { filename, savedPath, format };
}
