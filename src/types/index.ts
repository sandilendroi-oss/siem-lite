export type UserRole = 'admin' | 'analyst' | 'viewer';
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
export interface DashboardMetrics { totalIncidents: number; openIncidents: number; criticalAlerts: number; totalAlerts: number; resolvedToday: number; mttr: number; logsPerMinute: number; activePlaybooks: number; activeRules: number; }