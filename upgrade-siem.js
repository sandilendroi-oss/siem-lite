import fs from 'fs';
import path from 'path';

// 1. Vercel & Netlify config for SPA routing
const vercelConfig = `{\n  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]\n}`;
const netlifyConfig = `[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200`;

// 2. Updated Types
const typesContent = `export type UserRole = 'admin' | 'analyst' | 'viewer';
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
export interface DetectionRule { id: string; name: string; description: string; severity: Severity; sourceFilter: string; keyword: string; enabled: boolean; triggerCount: number; createdAt: string; }
export interface AuditLog { id: string; userId: string; userName: string; action: string; resource: string; resourceId?: string; details: string; ipAddress: string; timestamp: string; }
export interface DashboardMetrics { totalIncidents: number; openIncidents: number; criticalAlerts: number; totalAlerts: number; resolvedToday: number; mttr: number; logsPerMinute: number; activePlaybooks: number; activeRules: number; }`;

// 3. Seed Rules
const seedDataContent = `import { v4 as uuidv4 } from 'uuid';
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
];`;

// 4. Updated DataContext with Rule Engine
const dataContextContent = `import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Incident, Alert, LogEntry, Playbook, DetectionRule, AuditLog, DashboardMetrics } from '../types';
import { seedIncidents, seedAlerts, seedPlaybooks, seedRules, seedAuditLogs, generateInitialLogs, generateLogEntry } from '../data/seedData';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  incidents: Incident[]; alerts: Alert[]; logs: LogEntry[]; playbooks: Playbook[]; rules: DetectionRule[]; auditLogs: AuditLog[]; metrics: DashboardMetrics; isLoading: boolean; logsPerMinute: number;
  createIncident: (incident: any) => void; updateIncident: (id: string, updates: any) => void; deleteIncident: (id: string) => void;
  createAlert: (alert: any) => void; updateAlert: (id: string, updates: any) => void; deleteAlert: (id: string) => void;
  createPlaybook: (playbook: any) => void; updatePlaybook: (id: string, updates: any) => void; deletePlaybook: (id: string) => void;
  createRule: (rule: any) => void; updateRule: (id: string, updates: any) => void; deleteRule: (id: string) => void;
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
  const [rules, setRules] = useState<DetectionRule[]>(() => getStorageItem('rules', seedRules));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStorageItem('audit_logs', seedAuditLogs));
  const [logsPerMinute, setLogsPerMinute] = useState(0);
  const logCountRef = useRef(0);

  // Keep ref to rules so interval can evaluate them without closure staleness
  const rulesRef = useRef(rules);
  useEffect(() => { rulesRef.current = rules; }, [rules]);

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 1000); return () => clearTimeout(timer); }, []);
  useEffect(() => { setStorageItem('incidents', incidents); }, [incidents]);
  useEffect(() => { setStorageItem('alerts', alerts); }, [alerts]);
  useEffect(() => { setStorageItem('playbooks', playbooks); }, [playbooks]);
  useEffect(() => { setStorageItem('rules', rules); }, [rules]);
  useEffect(() => { setStorageItem('audit_logs', auditLogs); }, [auditLogs]);

  // Live log ingestion + Rule Engine evaluation
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = generateLogEntry();
      setLogs(prev => [newLog, ...prev].slice(0, 200));
      logCountRef.current++;

      // Evaluate against active detection rules
      rulesRef.current.forEach(rule => {
        if (!rule.enabled) return;
        const matchesSource = rule.sourceFilter === 'all' || newLog.source === rule.sourceFilter;
        const matchesKeyword = newLog.message.toLowerCase().includes(rule.keyword.toLowerCase());

        if (matchesSource && matchesKeyword) {
          // Auto-generate alert!
          const autoAlert: Alert = {
            id: 'alert-' + uuidv4().slice(0, 6),
            title: \`Rule Triggered: \${rule.name}\`,
            description: \`Matched log message from \${newLog.source}: "\${newLog.message}"\`,
            severity: rule.severity,
            status: 'open',
            source: newLog.source,
            sourceIp: newLog.sourceIp,
            rule: rule.name,
            count: 1,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setAlerts(prevA => [autoAlert, ...prevA]);
        }
      });
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

  const createRule = useCallback((rule: any) => {
    const newRule: DetectionRule = { ...rule, id: 'rule-' + uuidv4().slice(0, 6), triggerCount: 0, createdAt: new Date().toISOString() };
    setRules(prev => [newRule, ...prev]); addAuditLog('CREATE', 'rule', \`Created detection rule: \${rule.name}\`, newRule.id);
  }, [addAuditLog]);

  const updateRule = useCallback((id: string, updates: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    addAuditLog('UPDATE', 'rule', \`Updated detection rule: \${id}\`, id);
  }, [addAuditLog]);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    addAuditLog('DELETE', 'rule', \`Deleted detection rule: \${id}\`, id);
  }, [addAuditLog]);

  const metrics: DashboardMetrics = {
    totalIncidents: incidents.length, openIncidents: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length, totalAlerts: alerts.length,
    resolvedToday: incidents.filter(i => i.resolvedAt && new Date(i.resolvedAt).toDateString() === new Date().toDateString()).length,
    mttr: 4.2, logsPerMinute: logsPerMinute || 24, activePlaybooks: playbooks.filter(p => p.status === 'active').length,
    activeRules: rules.filter(r => r.enabled).length,
  };

  return (
    <DataContext.Provider value={{ incidents, alerts, logs, playbooks, rules, auditLogs, metrics, isLoading, createIncident, updateIncident, deleteIncident, createAlert, updateAlert, deleteAlert, createPlaybook, updatePlaybook, deletePlaybook, createRule, updateRule, deleteRule, addAuditLog, logsPerMinute }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}`;

// 5. Updated Sidebar with Rules Nav Item
const sidebarContent = `import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Incidents', path: '/incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Alerts', path: '/alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Log Feed', path: '/logs', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Detection Rules', path: '/rules', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['admin', 'analyst'] },
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
}`;

// 6. New RulesPage.tsx for Threat Detection Rule Builder
const rulesPageContent = `import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getSeverityDot, formatRelativeTime, cn } from '../utils/helpers';
import { DetectionRule, Severity } from '../types';

export default function RulesPage() {
  const { rules, createRule, updateRule, deleteRule } = useData();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('high');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRule({
      name,
      description,
      severity,
      sourceFilter,
      keyword,
      enabled: true,
    });
    setName('');
    setDescription('');
    setKeyword('');
    setShowModal(false);
  };

  return (
    <div>
      <TopBar title="Threat Detection Rules" subtitle={\`\${rules.filter(r => r.enabled).length} active custom detection rules\`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">Rules automatically evaluate incoming live logs and trigger alerts when matching threat signatures occur.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("badge", getSeverityColor(rule.severity))}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", getSeverityDot(rule.severity))}></span>
                      {rule.severity}
                    </span>
                    <button
                      onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                      className={\`badge \${rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}\`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <button onClick={() => deleteRule(rule.id)} className="text-gray-500 hover:text-red-400 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h4 className="text-base font-semibold text-gray-200 mb-1">{rule.name}</h4>
                <p className="text-xs text-gray-400 mb-4">{rule.description}</p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1 font-mono text-xs">
                  <div className="text-gray-400">Source: <span className="text-cyan-400">{rule.sourceFilter}</span></div>
                  <div className="text-gray-400">Keyword Match: <span className="text-yellow-400">"{rule.keyword}"</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
                <span>Triggered {rule.triggerCount} times</span>
                <span>Created {formatRelativeTime(rule.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card max-w-lg w-full animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Create Detection Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Rule Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Detect Unauthorized S3 Access" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="What does this rule detect?" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className="select-field">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Log Source Filter</label>
                  <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="select-field">
                    <option value="all">All Sources</option>
                    <option value="fw-edge-01">fw-edge-01</option>
                    <option value="ids-dmz-01">ids-dmz-01</option>
                    <option value="edr-agent">edr-agent</option>
                    <option value="ad-dc-01">ad-dc-01</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Keyword / Message Pattern *</label>
                <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className="input-field font-mono" placeholder="e.g. unauthorized or root" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};`;

// 7. Updated LogFeedPage with Advanced Query Search & Export CSV
const logFeedContent = `import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getLogLevelColor, cn } from '../utils/helpers';
import { format } from 'date-fns';

export default function LogFeedPage() {
  const { logs, logsPerMinute } = useData();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Advanced query parser: supports level:error, source:fw, or text search
  const filtered = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase().trim();
    if (query.startsWith('level:')) {
      const lvl = query.replace('level:', '').trim();
      return log.level === lvl;
    }
    if (query.startsWith('source:')) {
      const src = query.replace('source:', '').trim();
      return log.source.toLowerCase().includes(src);
    }
    return log.message.toLowerCase().includes(query) || (log.sourceIp && log.sourceIp.includes(query));
  });

  const exportLogsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Level,Source,SourceIP,Message"].concat(
        filtered.map(l => \`"\${l.timestamp}","\${l.level}","\${l.source}","\${l.sourceIp || ''}","\${l.message.replace(/"/g, '""')}"\`)
      ).join("\\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`siem_logs_\${Date.now()}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar title="Live Log Feed" subtitle={\`Advanced Query Engine • \${logsPerMinute} logs/min\`} />
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
          <div className="flex-1 relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search or filter (e.g. level:error, source:fw, or IP address)..."
              className="input-field pl-10 font-mono text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="select-field w-auto" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button onClick={exportLogsCSV} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button onClick={() => setIsPaused(!isPaused)} className={isPaused ? 'btn-primary' : 'btn-secondary'}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-siem-border font-mono text-xs p-4">
          {filtered.map(log => (
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
};`;

// 8. Updated Incident Detail with PDF Print / Report Export
const incidentDetailContent = `import React from 'react';
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

  const exportPDFReport = () => {
    window.print();
  };

  return (
    <div>
      <TopBar title={incident.id.toUpperCase()} subtitle={incident.title} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate('/incidents')} className="text-sm text-blue-400 hover:text-blue-300">← Back to Incidents</button>
          <button onClick={exportPDFReport} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Export PDF Report
          </button>
        </div>

        <div className="card">
          <div className="flex gap-3 mb-4">
            <span className={cn("badge", getSeverityColor(incident.severity))}>{incident.severity}</span>
            <span className={cn("badge", getStatusColor(incident.status))}>{incident.status}</span>
            <span className="badge bg-gray-800 text-gray-300">{incident.category}</span>
          </div>
          <h2 className="text-xl font-bold mb-2">{incident.title}</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{incident.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Affected Assets</h3>
            <div className="flex flex-wrap gap-2">
              {incident.affectedAssets.map(asset => (
                <span key={asset} className="px-3 py-1 bg-gray-800 text-cyan-400 font-mono rounded text-xs">{asset}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {incident.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded text-xs">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Incident Timeline</h3>
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
}`;

// 9. Updated App.tsx routing for Rules Page
const appContent = `import React from 'react';
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
import RulesPage from './pages/RulesPage';
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
        <Route path="/rules" element={<RulesPage />} />
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
}`;

// Write files
fs.writeFileSync('vercel.json', vercelConfig, 'utf8');
fs.writeFileSync('netlify.toml', netlifyConfig, 'utf8');
fs.writeFileSync('src/types/index.ts', typesContent, 'utf8');
fs.writeFileSync('src/data/seedData.ts', seedDataContent, 'utf8');
fs.writeFileSync('src/contexts/DataContext.tsx', dataContextContent, 'utf8');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarContent, 'utf8');
fs.writeFileSync('src/pages/RulesPage.tsx', rulesPageContent, 'utf8');
fs.writeFileSync('src/pages/LogFeedPage.tsx', logFeedContent, 'utf8');
fs.writeFileSync('src/pages/IncidentDetailPage.tsx', incidentDetailContent, 'utf8');
fs.writeFileSync('src/App.tsx', appContent, 'utf8');

console.log('\n SUCCESS! Added Vercel/Netlify config, Threat Detection Rule Builder, Advanced Query Log Search, and PDF/CSV Export!\n');