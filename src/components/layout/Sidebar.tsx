import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Incidents', path: '/incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Alerts', path: '/alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Log Feed', path: '/logs', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'analyst', 'viewer'] },
  { name: 'Detection Rules', path: '/rules', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['admin', 'analyst'] },
  { name: 'Playbooks', path: '/playbooks', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin', 'analyst'] },
  { name: 'Audit Log', path: '/audit', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['admin'] },
  { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { metrics } = useData();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;
  const filteredNav = navigation.filter(nav => nav.roles.includes(user.role));

  const getBadge = (name: string) => {
    if (name === 'Incidents') return metrics.openIncidents > 0 ? metrics.openIncidents : undefined;
    if (name === 'Alerts') return metrics.criticalAlerts > 0 ? metrics.criticalAlerts : undefined;
    return undefined;
  };

  return (
    <aside className={`flex flex-col bg-siem-darker border-r border-siem-border h-screen sticky top-0 transition-all duration-300 z-50 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-siem-border">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SIEM Lite</h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">Security Operations Center</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 hover:bg-gray-800 rounded transition-colors">
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${collapsed && "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-siem-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-medium">LIVE</span>
            <span className="text-xs text-gray-500 ml-auto">{metrics.logsPerMinute} logs/min</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredNav.map((item) => {
          const badge = getBadge(item.name);
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"}`} title={collapsed ? item.name : undefined}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r" />}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
              {!collapsed && (
                <>
                  <span className="animate-fade-in">{item.name}</span>
                  {badge !== undefined && <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
                </>
              )}
              {collapsed && badge !== undefined && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-siem-border p-3">
        <div className={`flex items-center gap-3 ${collapsed && "justify-center"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">{user.name.split(' ').map(n => n[0]).join('')}</div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-300" title="Logout">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}