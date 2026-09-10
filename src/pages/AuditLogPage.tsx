import React from 'react';
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
}