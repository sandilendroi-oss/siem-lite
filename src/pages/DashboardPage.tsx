import React from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { getSeverityDot, getStatusColor, formatRelativeTime, cn } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280'];

export default function DashboardPage() {
  const { incidents, alerts, metrics, isLoading } = useData();
  const { users } = useAuth();

  if (isLoading) return <LoadingSpinner text="Loading security dashboard..." />;

  const severityDist = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length },
  ].filter(d => d.value > 0);

  const timelineData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(11 - i * 2).toString().padStart(2, '0')}:00`, alerts: Math.floor(Math.random() * 10) + 1, incidents: Math.floor(Math.random() * 3),
  })).reverse();

  const statusData = [
    { name: 'New', count: incidents.filter(i => i.status === 'new').length },
    { name: 'Investigating', count: incidents.filter(i => i.status === 'investigating').length },
    { name: 'Contained', count: incidents.filter(i => i.status === 'contained').length },
    { name: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length },
  ];

  const recentIncidents = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  return (
    <div>
      <TopBar title="Security Dashboard" subtitle="Real-time threat monitoring & incident overview" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Open Incidents" value={metrics.openIncidents} total={metrics.totalIncidents} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" color="orange" trend="+2 today" />
          <MetricCard title="Critical Alerts" value={metrics.criticalAlerts} total={metrics.totalAlerts} icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" color="red" trend="Requires attention" />
          <MetricCard title="Logs Ingested" value={metrics.logsPerMinute} icon="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="green" trend="per minute" />
          <MetricCard title="Active Playbooks" value={metrics.activePlaybooks} icon="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="blue" trend="Automated responses" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Alert & Incident Activity (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="alerts" stroke="#3b82f6" fill="url(#alertGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="incidents" stroke="#f97316" fill="url(#incGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Alert Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {severityDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {severityDist.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span><span className="text-gray-400">{item.name} ({item.value})</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incident Pipeline</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-300">Recent Incidents</h3><Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link></div>
            <div className="space-y-3">
              {recentIncidents.map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                  <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getSeverityDot(inc.severity))}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400 truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("badge text-[10px]", getStatusColor(inc.status))}>{inc.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-gray-500">{formatRelativeTime(inc.createdAt)}</span>
                      <span className="text-[10px] text-gray-600">• {getUserName(inc.assigneeId)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, total, icon, color, trend }: any) {
  const colorClasses: Record<string, string> = {
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400', orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400', blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
  };
  const iconBg: Record<string, string> = { red: 'bg-red-500/20 text-red-400', orange: 'bg-orange-500/20 text-orange-400', green: 'bg-emerald-500/20 text-emerald-400', blue: 'bg-blue-500/20 text-blue-400' };

  return (
    <div className={cn("bg-gradient-to-br border rounded-xl p-5", colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-100">{value} {total !== undefined && <span className="text-lg text-gray-500 font-normal">/{total}</span>}</p>
          <p className="text-[11px] text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl", iconBg[color])}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg></div>
      </div>
    </div>
  );
}