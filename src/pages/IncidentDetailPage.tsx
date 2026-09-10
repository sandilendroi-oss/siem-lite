import React from 'react';
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
}