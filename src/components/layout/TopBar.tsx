import React from 'react';
import { useData } from '../../contexts/DataContext';

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { metrics } = useData();

  return (
    <header className="bg-siem-darker/50 backdrop-blur-sm border-b border-siem-border px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 font-medium">{metrics.criticalAlerts} Critical</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-orange-400 font-medium">{metrics.openIncidents} Open</span>
            </div>
          </div>
          <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {metrics.criticalAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>}
          </button>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
}