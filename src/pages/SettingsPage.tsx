import React from 'react';
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
}