Set-Content -Path "src/contexts/DataContext.tsx" -Value @'
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { setStorageItem('incidents', incidents); }, [incidents]);
  useEffect(() => { setStorageItem('alerts', alerts); }, [alerts]);
  useEffect(() => { setStorageItem('playbooks', playbooks); }, [playbooks]);
  useEffect(() => { setStorageItem('audit_logs', auditLogs); }, [auditLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [generateLogEntry(), ...prev].slice(0, 200));
      logCountRef.current++;
    }, 2000 + Math.random() * 3000);

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
    setIncidents(prev => [newIncident, ...prev]);
    addAuditLog('CREATE', 'incident', `Created incident: ${incident.title}`, newIncident.id);
  }, [user, addAuditLog]);

  const updateIncident = useCallback((id: string, updates: any) => {
    setIncidents(prev => prev.map(inc => inc.id !== id ? inc : { ...inc, ...updates, updatedAt: new Date().toISOString() }));
    addAuditLog('UPDATE', 'incident', `Updated incident: ${id}`, id);
  }, [addAuditLog]);

  const deleteIncident = useCallback((id: string) => { setIncidents(prev => prev.filter(inc => inc.id !== id)); addAuditLog('DELETE', 'incident', `Deleted incident: ${id}`, id); }, [addAuditLog]);

  const createAlert = useCallback((alert: any) => {
    const newAlert = { ...alert, id: 'alert-' + uuidv4().slice(0, 6), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setAlerts(prev => [newAlert, ...prev]); addAuditLog('CREATE', 'alert', `Created alert: ${alert.title}`, newAlert.id);
  }, [addAuditLog]);

  const updateAlert = useCallback((id: string, updates: any) => { setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)); addAuditLog('UPDATE', 'alert', `Updated alert: ${id}`, id); }, [addAuditLog]);
  const deleteAlert = useCallback((id: string) => { setAlerts(prev => prev.filter(a => a.id !== id)); addAuditLog('DELETE', 'alert', `Deleted alert: ${id}`, id); }, [addAuditLog]);

  const createPlaybook = useCallback((playbook: any) => {
    const newPlaybook = { ...playbook, id: 'pb-' + uuidv4().slice(0, 6), triggerCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: user?.id || 'system' };
    setPlaybooks(prev => [newPlaybook, ...prev]); addAuditLog('CREATE', 'playbook', `Created playbook: ${playbook.name}`, newPlaybook.id);
  }, [user, addAuditLog]);

  const updatePlaybook = useCallback((id: string, updates: any) => { setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)); addAuditLog('UPDATE', 'playbook', `Updated playbook: ${id}`, id); }, [addAuditLog]);
  const deletePlaybook = useCallback((id: string) => { setPlaybooks(prev => prev.filter(p => p.id !== id)); addAuditLog('DELETE', 'playbook', `Deleted playbook: ${id}`, id); }, [addAuditLog]);

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
}
'@