import fs from 'fs';
import path from 'path';

const files = {
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { scrollbar-width: thin; scrollbar-color: #374151 #111827; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: #111827; }
  *::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 3px; }
}

@layer components {
  .btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-secondary { @apply bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm; }
  .btn-danger { @apply bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm border border-red-600/30; }
  .btn-success { @apply bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm border border-emerald-600/30; }
  .card { @apply bg-siem-card border border-siem-border rounded-xl p-6; }
  .input-field { @apply bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full text-sm; }
  .select-field { @apply bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full text-sm appearance-none cursor-pointer; }
  .badge { @apply px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1; }
}`,

  'src/types/index.ts': `export type UserRole = 'admin' | 'analyst' | 'viewer';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'new' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
export type PlaybookStatus = 'active' | 'inactive' | 'draft';

export interface User { id: string; username: string; email: string; role: UserRole; name: string; avatar?: string; lastLogin?: string; createdAt: string; }
export interface Incident { id: string; title: string; description: string; severity: Severity; status: IncidentStatus; assigneeId?: string; source: string; category: string; affectedAssets: string[]; tags: string[]; timeline: TimelineEntry[]; createdAt: string; updatedAt: string; resolvedAt?: string; createdBy: string; }
export interface TimelineEntry { id: string; action: string; details: string; userId: string; timestamp: string; }
export interface Alert { id: string; title: string; description: string; severity: Severity; status: AlertStatus; source: string; sourceIp?: string; destIp?: string; rule: string; count: number; firstSeen: string; lastSeen: string; incidentId?: string; createdAt: string; updatedAt: string; }
export interface LogEntry { id: string; timestamp: string; source: string; level: 'debug' | 'info' | 'warning' | 'error' | 'critical'; message: string; sourceIp?: string; destIp?: string; protocol?: string; port?: number; rawLog?: string; metadata?: Record<string, string>; }
export interface Playbook { id: string; name: string; description: string; status: PlaybookStatus; triggerConditions: TriggerCondition[]; actions: PlaybookAction[]; lastTriggered?: string; triggerCount: number; createdAt: string; updatedAt: string; createdBy: string; }
export interface TriggerCondition { field: string; operator: 'equals' | 'contains' | 'greater_than' | 'less_than'; value: string; }
export interface PlaybookAction { id: string; type: 'notify' | 'block_ip' | 'isolate_host' | 'create_incident' | 'escalate' | 'run_scan'; config: Record<string, string>; order: number; }
export interface AuditLog { id: string; userId: string; userName: string; action: string; resource: string; resourceId?: string; details: string; ipAddress: string; timestamp: string; }
export interface DashboardMetrics { totalIncidents: number; openIncidents: number; criticalAlerts: number; totalAlerts: number; resolvedToday: number; mttr: number; logsPerMinute: number; activePlaybooks: number; }`,

  'src/utils/storage.ts': `const STORAGE_PREFIX = 'siem_lite_';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}`,

  'src/utils/helpers.ts': `import { Severity, IncidentStatus, AlertStatus } from '../types';

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'info': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getSeverityDot(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    case 'info': return 'bg-gray-500';
  }
}

export function getStatusColor(status: IncidentStatus | AlertStatus): string {
  switch (status) {
    case 'new': case 'open': return 'bg-blue-500/20 text-blue-400';
    case 'investigating': return 'bg-purple-500/20 text-purple-400';
    case 'acknowledged': return 'bg-indigo-500/20 text-indigo-400';
    case 'contained': return 'bg-amber-500/20 text-amber-400';
    case 'resolved': return 'bg-emerald-500/20 text-emerald-400';
    case 'closed': return 'bg-gray-500/20 text-gray-400';
    case 'false_positive': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

export function getLogLevelColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-400';
    case 'error': return 'text-orange-400';
    case 'warning': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    case 'debug': return 'text-gray-500';
    default: return 'text-gray-400';
  }
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return \`\${diffMin}m ago\`;
  if (diffHour < 24) return \`\${diffHour}h ago\`;
  if (diffDay < 7) return \`\${diffDay}d ago\`;
  return d.toLocaleDateString();
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}`,

  'src/data/seedData.ts': `import { v4 as uuidv4 } from 'uuid';
import { User, Incident, Alert, LogEntry, Playbook, AuditLog } from '../types';
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
    description: 'Multiple endpoints reporting encrypted files with .locked extension. File server FS-PROD-03 shows signs of active ransomware encryption. Lateral movement detected from workstation WS-142.',
    severity: 'critical', status: 'investigating', assigneeId: 'user-2', source: 'EDR - CrowdStrike', category: 'Malware',
    affectedAssets: ['FS-PROD-03', 'WS-142', 'WS-155'], tags: ['ransomware', 'lateral-movement', 'priority-1'],
    timeline: [
      { id: uuidv4(), action: 'Incident Created', details: 'Auto-generated from EDR alert correlation', userId: 'system', timestamp: subHours(now, 4).toISOString() },
      { id: uuidv4(), action: 'Assigned', details: 'Assigned to James Miller', userId: 'user-1', timestamp: subHours(now, 3.5).toISOString() },
    ],
    createdAt: subHours(now, 4).toISOString(), updatedAt: subHours(now, 2).toISOString(), createdBy: 'system',
  },
  {
    id: 'inc-002', title: 'Brute Force Attack Against VPN Gateway',
    description: 'Over 15,000 failed authentication attempts detected against the corporate VPN gateway from multiple source IPs.',
    severity: 'high', status: 'contained', assigneeId: 'user-3', source: 'Firewall - Palo Alto', category: 'Credential Attack',
    affectedAssets: ['VPN-GW-01'], tags: ['brute-force', 'vpn'],
    timeline: [
      { id: uuidv4(), action: 'Incident Created', details: 'Threshold alert triggered', userId: 'system', timestamp: subHours(now, 8).toISOString() },
      { id: uuidv4(), action: 'Containment', details: 'Blocked top 50 source IPs at firewall.', userId: 'user-3', timestamp: subHours(now, 6).toISOString() },
    ],
    createdAt: subHours(now, 8).toISOString(), updatedAt: subHours(now, 6).toISOString(), createdBy: 'system',
  }
];

export const seedAlerts: Alert[] = [
  { id: 'alert-001', title: 'Multiple Failed SSH Login Attempts', description: 'Detected 847 failed SSH login attempts from IP 192.168.1.100', severity: 'high', status: 'open', source: 'IDS - Suricata', sourceIp: '192.168.1.100', destIp: '10.0.1.50', rule: 'SSH_BRUTE_FORCE', count: 847, firstSeen: subMinutes(now, 30).toISOString(), lastSeen: subMinutes(now, 25).toISOString(), createdAt: subMinutes(now, 30).toISOString(), updatedAt: subMinutes(now, 25).toISOString() },
  { id: 'alert-002', title: 'Outbound Connection to Known C2 Server', description: 'Host WS-142 established connection to known C2 IP', severity: 'critical', status: 'investigating', source: 'Threat Intel Feed', sourceIp: '10.0.2.142', destIp: '185.220.101.45', rule: 'C2_COMMUNICATION', count: 23, firstSeen: subHours(now, 4).toISOString(), lastSeen: subHours(now, 2).toISOString(), incidentId: 'inc-001', createdAt: subHours(now, 4).toISOString(), updatedAt: subHours(now, 2).toISOString() },
  { id: 'alert-003', title: 'Anomalous Data Transfer Volume', description: 'Unusual outbound data transfer of 2.3GB detected', severity: 'critical', status: 'open', source: 'NetFlow', sourceIp: '10.0.5.88', destIp: '8.8.8.8', rule: 'DATA_EXFIL', count: 1, firstSeen: subMinutes(now, 45).toISOString(), lastSeen: subMinutes(now, 10).toISOString(), createdAt: subMinutes(now, 45).toISOString(), updatedAt: subMinutes(now, 10).toISOString() }
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
  const ip = \`\${Math.floor(Math.random() * 223) + 1}.\${Math.floor(Math.random() * 255)}.1.100\`;
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
];`,

  'src/contexts/AuthContext.tsx': `import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '../types';
import { seedUsers } from '../data/seedData';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = { admin: 3, analyst: 2, viewer: 1 };
const credentials: Record<string, string> = { admin: 'admin123', analyst1: 'analyst123', analyst2: 'analyst123', viewer: 'viewer123' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStorageItem<User | null>('current_user', null));
  const [users] = useState<User[]>(seedUsers);

  useEffect(() => { if (user) setStorageItem('current_user', user); }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (credentials[username] && credentials[username] === password) {
      const foundUser = users.find(u => u.username === username);
      if (foundUser) {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        setStorageItem('current_user', updatedUser);
        return true;
      }
    }
    return false;
  }, [users]);

  const logout = useCallback(() => { setUser(null); removeStorageItem('current_user'); }, []);

  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, users, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}`,

  'src/contexts/DataContext.tsx': `import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Incident, Alert, LogEntry, Playbook, AuditLog, DashboardMetrics } from '../types';
import { seedIncidents, seedAlerts, seedPlaybooks, seedAuditLogs, generateInitialLogs, generateLogEntry } from '../data/seedData';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  incidents: Incident[]; alerts: Alert[]; logs: LogEntry[]; playbooks: Playbook[]; auditLogs: AuditLog[]; metrics: DashboardMetrics; isLoading: boolean; logsPerMinute: number;
  createIncident: (incident: any) => void; updateIncident: (id: string, updates: any) => void; deleteIncident: (id: string) => void;
  createAlert: (alert: any) => void; updateAlert: (id: string, updates: any) => void; deleteAlert: (id: string) => void;
  createPlaybook: (playbook: any) => void; updatePlaybook: (id: string, updates: any) => void; deletePlaybook: (id: string) => void;
  addAuditLog: (action: string, resource: string, details: string, resourceId?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>(() => getStorageItem('incidents', seedIncidents));
  const [alerts, setAlerts] = useState<Alert[]>(() => getStorageItem('alerts', seedAlerts));
  const [logs, setLogs] = useState<LogEntry[]>(() => getStorageItem('logs', generateInitialLogs()));
  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => getStorageItem('playbooks', seedPlaybooks));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStorageItem('audit_logs', seedAuditLogs));
  const [logsPerMinute, setLogsPerMinute] = useState(0);
  const logCountRef = useRef(0);

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 1000); return () => clearTimeout(timer); }, []);
  useEffect(() => { setStorageItem('incidents', incidents); }, [incidents]);
  useEffect(() => { setStorageItem('alerts', alerts); }, [alerts]);
  useEffect(() => { setStorageItem('playbooks', playbooks); }, [playbooks]);
  useEffect(() => { setStorageItem('audit_logs', auditLogs); }, [auditLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [generateLogEntry(), ...prev].slice(0, 200));
      logCountRef.current++;
    }, 2500);

    const metricsInterval = setInterval(() => {
      setLogsPerMinute(logCountRef.current * 12);
      logCountRef.current = 0;
    }, 5000);

    return () => { clearInterval(interval); clearInterval(metricsInterval); };
  }, []);

  const addAuditLog = useCallback((action: string, resource: string, details: string, resourceId?: string) => {
    const entry: AuditLog = { id: uuidv4(), userId: user?.id || 'system', userName: user?.name || 'System', action, resource, resourceId, details, ipAddress: '10.0.0.' + Math.floor(Math.random() * 254 + 1), timestamp: new Date().toISOString() };
    setAuditLogs(prev => [entry, ...prev]);
  }, [user]);

  const createIncident = useCallback((incident: any) => {
    const newIncident = { ...incident, id: 'inc-' + uuidv4().slice(0, 6), timeline: [{ id: uuidv4(), action: 'Incident Created', details: 'Created by ' + (user?.name || 'System'), userId: user?.id || 'system', timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: user?.id || 'system' };
    setIncidents(prev => [newIncident, ...prev]); addAuditLog('CREATE', 'incident', \`Created incident: \${incident.title}\`, newIncident.id);
  }, [user, addAuditLog]);

  const updateIncident = useCallback((id: string, updates: any) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
    addAuditLog('UPDATE', 'incident', \`Updated incident: \${id}\`, id);
  }, [addAuditLog]);

  const deleteIncident = useCallback((id: string) => { setIncidents(prev => prev.filter(i => i.id !== id)); addAuditLog('DELETE', 'incident', \`Deleted incident: \${id}\`, id); }, [addAuditLog]);

  const createAlert = useCallback((alert: any) => {
    const newAlert = { ...alert, id: 'alert-' + uuidv4().slice(0, 6), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setAlerts(prev => [newAlert, ...prev]); addAuditLog('CREATE', 'alert', \`Created alert: \${alert.title}\`, newAlert.id);
  }, [addAuditLog]);

  const updateAlert = useCallback((id: string, updates: any) => { setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)); addAuditLog('UPDATE', 'alert', \`Updated alert: \${id}\`, id); }, [addAuditLog]);
  const deleteAlert = useCallback((id: string) => { setAlerts(prev => prev.filter(a => a.id !== id)); addAuditLog('DELETE', 'alert', \`Deleted alert: \${id}\`, id); }, [addAuditLog]);

  const createPlaybook = useCallback((playbook: any) => {
    const newPlaybook = { ...playbook, id: 'pb-' + uuidv4().slice(0, 6), triggerCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: user?.id || 'system' };
    setPlaybooks(prev => [newPlaybook, ...prev]); addAuditLog('CREATE', 'playbook', \`Created playbook: \${playbook.name}\`, newPlaybook.id);
  }, [user, addAuditLog]);

  const updatePlaybook = useCallback((id: string, updates: any) => { setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)); addAuditLog('UPDATE', 'playbook', \`Updated playbook: \${id}\`, id); }, [addAuditLog]);
  const deletePlaybook = useCallback((id: string) => { setPlaybooks(prev => prev.filter(p => p.id !== id)); addAuditLog('DELETE', 'playbook', \`Deleted playbook: \${id}\`, id); }, [addAuditLog]);

  const metrics: DashboardMetrics = {
    totalIncidents: incidents.length, openIncidents: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length, totalAlerts: alerts.length,
    resolvedToday: incidents.filter(i => i.resolvedAt && new Date(i.resolvedAt).toDateString() === new Date().toDateString()).length,
    mttr: 4.2, logsPerMinute: logsPerMinute || 24, activePlaybooks: playbooks.filter(p => p.status === 'active').length,
  };

  return (
    <DataContext.Provider value={{ incidents, alerts, logs, playbooks, auditLogs, metrics, isLoading, createIncident, updateIncident, deleteIncident, createAlert, updateAlert, deleteAlert, createPlaybook, updatePlaybook, deletePlaybook, addAuditLog, logsPerMinute }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}`,

  'src/components/common/LoadingSpinner.tsx': `import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  );
}`,

  'src/components/common/EmptyState.tsx': `import React from 'react';

interface EmptyStateProps { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode; }

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon || (
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-4">{description}</p>
      {action}
    </div>
  );
}`,

  'src/components/common/Modal.tsx': `import React, { useEffect } from 'react';

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={\`relative bg-siem-card border border-siem-border rounded-xl shadow-2xl w-full animate-fade-in overflow-hidden \${sizeClasses[size]}\`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-siem-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}`,

  'src/components/common/ConfirmDialog.tsx': `import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; danger?: boolean; }

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-400 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>{confirmText}</button>
      </div>
    </Modal>
  );
}`,

  'src/components/layout/Sidebar.tsx': `import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Incidents', path: '/incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Alerts', path: '/alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Log Feed', path: '/logs', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Playbooks', path: '/playbooks', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin', 'analyst'] },
  { name: 'Audit Log', path: '/audit', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['admin'] },
  { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { metrics } = useData();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;
  const filteredNav = navigation.filter(nav => nav.roles.includes(user.role));

  const getBadge = (name: string) => {
    if (name === 'Incidents') return metrics.openIncidents > 0 ? metrics.openIncidents : undefined;
    if (name === 'Alerts') return metrics.criticalAlerts > 0 ? metrics.criticalAlerts : undefined;
    return undefined;
  };

  return (
    <aside className={\`flex flex-col bg-siem-darker border-r border-siem-border h-screen sticky top-0 transition-all duration-300 z-50 \${collapsed ? "w-16" : "w-64"}\`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-siem-border">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SIEM Lite</h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">Security Operations Center</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 hover:bg-gray-800 rounded transition-colors">
          <svg className={\`w-4 h-4 text-gray-500 transition-transform \${collapsed && "rotate-180"}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-siem-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-medium">LIVE</span>
            <span className="text-xs text-gray-500 ml-auto">{metrics.logsPerMinute} logs/min</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredNav.map((item) => {
          const badge = getBadge(item.name);
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative \${isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"}\`} title={collapsed ? item.name : undefined}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r" />}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
              {!collapsed && (
                <>
                  <span className="animate-fade-in">{item.name}</span>
                  {badge !== undefined && <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
                </>
              )}
              {collapsed && badge !== undefined && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-siem-border p-3">
        <div className={\`flex items-center gap-3 \${collapsed && "justify-center"}\`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">{user.name.split(' ').map(n => n[0]).join('')}</div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-300" title="Logout">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}`,

  'src/components/layout/TopBar.tsx': `import React from 'react';
import { useData } from '../../contexts/DataContext';

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { metrics } = useData();

  return (
    <header className="bg-siem-darker/50 backdrop-blur-sm border-b border-siem-border px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 font-medium">{metrics.criticalAlerts} Critical</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-orange-400 font-medium">{metrics.openIncidents} Open</span>
            </div>
          </div>
          <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {metrics.criticalAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>}
          </button>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
}`,

  'src/components/layout/AppLayout.tsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-siem-dark">
        <Outlet />
      </main>
    </div>
  );
}`,

  'src/pages/LoginPage.tsx': `import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    const success = await login(username, password);
    if (!success) setError('Invalid credentials. Try a demo account below.');
    setIsLoading(false);
  };

  const quickLogin = async (user: string, pass: string) => {
    setUsername(user); setPassword(pass); setError(''); setIsLoading(true);
    const success = await login(user, pass);
    if (!success) setError('Login failed');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-siem-dark flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SIEM Lite</h1>
          <p className="text-gray-500 mt-1">Security Incident & Threat Tracker</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="Enter username" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Enter password" required />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">{error}</div>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="mt-6 card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Login (Demo Accounts)</h3>
          <div className="space-y-2">
            {[
              { user: 'admin', pass: 'admin123', role: 'Admin', desc: 'Full access to all features' },
              { user: 'analyst1', pass: 'analyst123', role: 'Analyst', desc: 'Incident & alert management' },
              { user: 'viewer', pass: 'viewer123', role: 'Viewer', desc: 'Read-only access' },
            ].map(({ user, pass, role, desc }) => (
              <button key={user} onClick={() => quickLogin(user, pass)} disabled={isLoading} className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold group-hover:bg-blue-500/30 transition-colors">{role[0]}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{user} <span className="text-gray-500">/ {pass}</span></div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <span className="badge bg-gray-700 text-gray-400">{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/DashboardPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { getSeverityDot, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280'];

export default function DashboardPage() {
  const { incidents, alerts, metrics, isLoading } = useData();
  const { users } = useAuth();

  if (isLoading) return <LoadingSpinner text="Loading security dashboard..." />;

  const severityDist = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length },
  ].filter(d => d.value > 0);

  const timelineData = Array.from({ length: 12 }, (_, i) => ({
    hour: \`\${(11 - i * 2).toString().padStart(2, '0')}:00\`, alerts: Math.floor(Math.random() * 10) + 1, incidents: Math.floor(Math.random() * 3),
  })).reverse();

  const statusData = [
    { name: 'New', count: incidents.filter(i => i.status === 'new').length },
    { name: 'Investigating', count: incidents.filter(i => i.status === 'investigating').length },
    { name: 'Contained', count: incidents.filter(i => i.status === 'contained').length },
    { name: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length },
  ];

  const recentIncidents = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  return (
    <div>
      <TopBar title="Security Dashboard" subtitle="Real-time threat monitoring & incident overview" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Open Incidents" value={metrics.openIncidents} total={metrics.totalIncidents} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" color="orange" trend="+2 today" />
          <MetricCard title="Critical Alerts" value={metrics.criticalAlerts} total={metrics.totalAlerts} icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" color="red" trend="Requires attention" />
          <MetricCard title="Logs Ingested" value={metrics.logsPerMinute} icon="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="green" trend="per minute" />
          <MetricCard title="Active Playbooks" value={metrics.activePlaybooks} icon="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="blue" trend="Automated responses" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Alert & Incident Activity (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="alerts" stroke="#3b82f6" fill="url(#alertGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="incidents" stroke="#f97316" fill="url(#incGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Alert Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {severityDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {severityDist.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span><span className="text-gray-400">{item.name} ({item.value})</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incident Pipeline</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-300">Recent Incidents</h3><Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link></div>
            <div className="space-y-3">
              {recentIncidents.map(inc => (
                <Link key={inc.id} to={\`/incidents/\${inc.id}\`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                  <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getSeverityDot(inc.severity))}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400 truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("badge text-[10px]", getStatusColor(inc.status))}>{inc.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-gray-500">{formatRelativeTime(inc.createdAt)}</span>
                      <span className="text-[10px] text-gray-600">• {getUserName(inc.assigneeId)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, total, icon, color, trend }: any) {
  const colorClasses: Record<string, string> = {
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400', orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400', blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
  };
  const iconBg: Record<string, string> = { red: 'bg-red-500/20 text-red-400', orange: 'bg-orange-500/20 text-orange-400', green: 'bg-emerald-500/20 text-emerald-400', blue: 'bg-blue-500/20 text-blue-400' };

  return (
    <div className={cn("bg-gradient-to-br border rounded-xl p-5", colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-100">{value} {total !== undefined && <span className="text-lg text-gray-500 font-normal">/{total}</span>}</p>
          <p className="text-[11px] text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl", iconBg[color])}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg></div>
      </div>
    </div>
  );
}`,

  'src/pages/IncidentsPage.tsx': `import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getSeverityDot, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function IncidentsPage() {
  const { incidents } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = incidents.filter(inc => inc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <TopBar title="Incidents" subtitle={\`\${incidents.length} total incidents tracked\`} />
      <div className="p-6">
        <div className="mb-6 relative">
          <input type="text" placeholder="Search incidents..." className="input-field" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-siem-border">
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3 pl-4">Severity</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Incident</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-siem-border">
              {filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-800/30 cursor-pointer group" onClick={() => navigate(\`/incidents/\${inc.id}\`)}>
                  <td className="py-3 pl-4">
                    <span className={cn("badge", getSeverityColor(inc.severity))}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", getSeverityDot(inc.severity))}></span>{inc.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400">{inc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inc.id} • {inc.category}</p>
                  </td>
                  <td className="py-3"><span className={cn("badge", getStatusColor(inc.status))}>{inc.status}</span></td>
                  <td className="py-3"><span className="text-xs text-gray-500">{formatRelativeTime(inc.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/IncidentDetailPage.tsx': `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents } = useData();

  const incident = incidents.find(i => i.id === id);
  if (!incident) return <div className="p-6 text-center text-gray-500">Incident not found</div>;

  return (
    <div>
      <TopBar title={incident.id.toUpperCase()} subtitle={incident.title} />
      <div className="p-6 space-y-6">
        <button onClick={() => navigate('/incidents')} className="text-sm text-blue-400 hover:text-blue-300">← Back to Incidents</button>
        <div className="card">
          <div className="flex gap-3 mb-4">
            <span className={cn("badge", getSeverityColor(incident.severity))}>{incident.severity}</span>
            <span className={cn("badge", getStatusColor(incident.status))}>{incident.status}</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">{incident.title}</h2>
          <p className="text-sm text-gray-400">{incident.description}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Timeline</h3>
          <div className="space-y-4">
            {incident.timeline.map((entry: any) => (
              <div key={entry.id} className="pb-4 border-b border-gray-800">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-200">{entry.action}</span>
                  <span className="text-xs text-gray-500">{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{entry.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/AlertsPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getSeverityDot, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';

export default function AlertsPage() {
  const { alerts } = useData();

  return (
    <div>
      <TopBar title="Alert Triage" subtitle={\`\${alerts.length} total alerts\`} />
      <div className="p-6 space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className="card p-4">
            <div className="flex items-start gap-3">
              <span className={cn("w-2.5 h-2.5 rounded-full mt-1", getSeverityDot(alert.severity))}></span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">{alert.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={cn("badge", getSeverityColor(alert.severity))}>{alert.severity}</span>
                    <span className={cn("badge", getStatusColor(alert.status))}>{alert.status}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-gray-500">
                  <span>Rule: {alert.rule}</span>
                  <span>Source: {alert.source}</span>
                  <span className="ml-auto">{formatRelativeTime(alert.lastSeen)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'src/pages/LogFeedPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getLogLevelColor } from '../utils/helpers';
import { format } from 'date-fns';

export default function LogFeedPage() {
  const { logs, logsPerMinute } = useData();

  return (
    <div className="h-full flex flex-col">
      <TopBar title="Live Log Feed" subtitle={\`\${logsPerMinute} logs/min\`} />
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-siem-border font-mono text-xs p-4">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-3 py-1.5 hover:bg-gray-800/50 border-b border-gray-800/30">
              <span className="text-gray-600 w-20">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
              <span className={\`w-16 uppercase font-semibold \${getLogLevelColor(log.level)}\`}>[{log.level.slice(0, 4)}]</span>
              <span className="text-cyan-600 w-28 truncate">{log.source}</span>
              <span className="text-gray-300 flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/PlaybooksPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';

export default function PlaybooksPage() {
  const { playbooks } = useData();

  return (
    <div>
      <TopBar title="Playbooks" subtitle="Automated response configurations" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {playbooks.map(pb => (
          <div key={pb.id} className="card">
            <div className="flex justify-between mb-2">
              <span className="badge bg-emerald-500/20 text-emerald-400">{pb.status}</span>
              <span className="text-xs text-gray-500">Triggered: {pb.triggerCount}</span>
            </div>
            <h4 className="text-base font-semibold text-gray-200 mb-1">{pb.name}</h4>
            <p className="text-xs text-gray-500">{pb.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'src/pages/AuditLogPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { formatRelativeTime } from '../utils/helpers';

export default function AuditLogPage() {
  const { auditLogs } = useData();

  return (
    <div>
      <TopBar title="Audit Log" subtitle="System activity trail" />
      <div className="p-6 space-y-2">
        {auditLogs.map(log => (
          <div key={log.id} className="card p-4 flex items-center gap-4">
            <div className="px-2 py-1 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 w-24 text-center">{log.action}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{log.userName} <span className="text-gray-500 font-normal">performed action on</span> {log.resource}</p>
              <p className="text-xs text-gray-400 mt-1">{log.details}</p>
            </div>
            <span className="text-xs text-gray-500">{formatRelativeTime(log.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'src/pages/SettingsPage.tsx': `import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <TopBar title="Settings" subtitle="System configuration" />
      <div className="p-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Your Profile</h3>
          <p className="text-lg font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-400 mb-2">{user?.email}</p>
          <span className="badge bg-blue-500/20 text-blue-400">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}`,

  'src/App.tsx': `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AlertsPage from './pages/AlertsPage';
import LogFeedPage from './pages/LogFeedPage';
import PlaybooksPage from './pages/PlaybooksPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><DataProvider><AppLayout /></DataProvider></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/logs" element={<LogFeedPage />} />
        <Route path="/playbooks" element={<PlaybooksPage />} />
        <Route path="/audit" element={<AuditLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}`,

  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`
};

let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  count++;
}

console.log(`\n SUCCESS! Created ${count} project files automatically.\n`);