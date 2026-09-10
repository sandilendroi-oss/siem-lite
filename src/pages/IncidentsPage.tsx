import React, { useState } from 'react';
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
      <TopBar title="Incidents" subtitle={`${incidents.length} total incidents tracked`} />
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
                <tr key={inc.id} className="hover:bg-gray-800/30 cursor-pointer group" onClick={() => navigate(`/incidents/${inc.id}`)}>
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
}