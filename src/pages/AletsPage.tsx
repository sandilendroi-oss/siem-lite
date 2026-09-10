import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getSeverityDot, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';

export default function AlertsPage() {
  const { alerts } = useData();

  return (
    <div>
      <TopBar title="Alert Triage" subtitle={`${alerts.length} total alerts`} />
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
}