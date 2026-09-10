import { Severity, IncidentStatus, AlertStatus } from '../types';

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
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}