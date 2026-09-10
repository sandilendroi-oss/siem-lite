import React from 'react';
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
}