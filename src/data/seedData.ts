import { v4 as uuidv4 } from 'uuid';
import { User, Incident, Alert, LogEntry, Playbook, DetectionRule, AuditLog } from '../types';
import { subHours, subMinutes, subDays } from 'date-fns';

const now = new Date();

export const seedUsers: User[] = [
  { id: 'user-1', username: 'admin', email: 'admin@siemlite.com', role: 'admin', name: 'Sarah Chen', lastLogin: subHours(now, 1).toISOString(), createdAt: subDays(now, 90).toISOString() },
  { id: 'user-2', username: 'analyst1', email: 'jmiller@siemlite.com', role: 'analyst', name: 'James Miller', lastLogin: subHours(now, 3).toISOString(), createdAt: subDays(now, 60).toISOString() },
  { id: 'user-3', username: 'analyst2', email: 'apriya@siemlite.com', role: 'analyst', name: 'Anika Priya', lastLogin: subHours(now, 5).toISOString(), createdAt: subDays(now, 45).toISOString() },
  { id: 'user-4', username: 'viewer', email: 'bthompson@siemlite.com', role: 'viewer', name: 'Bob Thompson', lastLogin: subDays(now, 1).toISOString(), createdAt: subDays(now, 30).toISOString() },
];

export const seedIncidents: Incident[] = [
  {
    id: 'inc-001', title: 'Ransomware Attack on File Server FS-PROD-03',
    description: 'Multiple endpoints reporting encrypted files with .locked extension. File server FS-PROD-03 shows signs of active ransomware encryption.',
    severity: 'critical', status: 'investigating', assigneeId: 'user-2', source: 'EDR - CrowdStrike', category: 'Malware',
    affectedAssets: ['FS-PROD-03', 'WS-142', 'WS-155'], tags: ['ransomware', 'lateral-movement', 'priority-1'],
    timeline: [
      { id: uuidv4(), action: 'Incident Created', details: 'Auto-generated from EDR alert correlation', userId: 'system', timestamp: subHours(now, 4).toISOString() },
      { id: uuidv4(), action: 'Assigned', details: 'Assigned to James Miller', userId: 'user-1', timestamp: subHours(now, 3.5).toISOString() },
    ],
    createdAt: subHours(now, 4).toISOString(), updatedAt: subHours(now, 2).toISOString(), createdBy: 'system',
  }
];

export const seedAlerts: Alert[] = [
  { id: 'alert-001', title: 'Multiple Failed SSH Login Attempts', description: 'Detected 847 failed SSH login attempts from IP 192.168.1.100', severity: 'high', status: 'open', source: 'IDS - Suricata', sourceIp: '192.168.1.100', destIp: '10.0.1.50', rule: 'SSH_BRUTE_FORCE', count: 847, firstSeen: subMinutes(now, 30).toISOString(), lastSeen: subMinutes(now, 25).toISOString(), createdAt: subMinutes(now, 30).toISOString(), updatedAt: subMinutes(now, 25).toISOString() },
  { id: 'alert-002', title: 'Outbound Connection to Known C2 Server', description: 'Host WS-142 established connection to known C2 IP', severity: 'critical', status: 'investigating', source: 'Threat Intel Feed', sourceIp: '10.0.2.142', destIp: '185.220.101.45', rule: 'C2_COMMUNICATION', count: 23, firstSeen: subHours(now, 4).toISOString(), lastSeen: subHours(now, 2).toISOString(), incidentId: 'inc-001', createdAt: subHours(now, 4).toISOString(), updatedAt: subHours(now, 2).toISOString() }
];

export const seedRules: DetectionRule[] = [
  { id: 'rule-01', name: 'Ransomware Keyword Detector', description: 'Triggers critical alert when ransomware pattern appears in logs', severity: 'critical', sourceFilter: 'all', keyword: 'ransomware', enabled: true, triggerCount: 3, createdAt: subDays(now, 10).toISOString() },
  { id: 'rule-02', name: 'Failed Auth Spike Monitor', description: 'Detects repeated failed authentication attempts', severity: 'high', sourceFilter: 'ad-dc-01', keyword: 'Failed authentication', enabled: true, triggerCount: 12, createdAt: subDays(now, 15).toISOString() },
  { id: 'rule-03', name: 'Unauthorized Port Scan Warning', description: 'Detects unusual port scanning signatures', severity: 'medium', sourceFilter: 'ids-dmz-01', keyword: 'port scan', enabled: false, triggerCount: 0, createdAt: subDays(now, 20).toISOString() }
];

const logSources = ['fw-edge-01', 'ids-dmz-01', 'edr-agent', 'ad-dc-01', 'vpn-gw-01'];
const logMessages = [
  { level: 'info' as const, msg: 'Connection accepted from {ip} on port {port}' },
  { level: 'warning' as const, msg: 'Failed authentication attempt for user admin from {ip}' },
  { level: 'critical' as const, msg: 'Malware detected on endpoint WS-142' },
  { level: 'error' as const, msg: 'Connection refused: maximum connections reached' },
  { level: 'debug' as const, msg: 'Packet inspection: TCP {ip}:{port} [SYN]' }
];

export function generateLogEntry(timestamp?: Date): LogEntry {
  const template = logMessages[Math.floor(Math.random() * logMessages.length)];
  const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.1.100`;
  const msg = template.msg.replace('{ip}', ip).replace('{port}', String([22, 80, 443][Math.floor(Math.random() * 3)]));
  
  return {
    id: uuidv4(), timestamp: (timestamp || new Date()).toISOString(),
    source: logSources[Math.floor(Math.random() * logSources.length)],
    level: template.level, message: msg, sourceIp: ip
  };
}

export function generateInitialLogs(count: number = 50): LogEntry[] {
  return Array.from({ length: count }, (_, i) => generateLogEntry(subMinutes(now, count - i)));
}

export const seedPlaybooks: Playbook[] = [
  {
    id: 'pb-001', name: 'Ransomware Response', description: 'Automated response for ransomware detection', status: 'active',
    triggerConditions: [{ field: 'alert.severity', operator: 'equals', value: 'critical' }],
    actions: [{ id: uuidv4(), type: 'isolate_host', config: { method: 'network' }, order: 1 }, { id: uuidv4(), type: 'notify', config: { channel: 'soc-critical' }, order: 2 }],
    lastTriggered: subHours(now, 4).toISOString(), triggerCount: 3, createdAt: subDays(now, 60).toISOString(), updatedAt: subDays(now, 5).toISOString(), createdBy: 'user-1',
  }
];

export const seedAuditLogs: AuditLog[] = [
  { id: uuidv4(), userId: 'user-1', userName: 'Sarah Chen', action: 'LOGIN', resource: 'auth', details: 'Successful login', ipAddress: '10.0.0.100', timestamp: subHours(now, 1).toISOString() }
];