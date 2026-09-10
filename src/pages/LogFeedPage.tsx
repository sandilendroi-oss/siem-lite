import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getLogLevelColor, cn } from '../utils/helpers';
import { format } from 'date-fns';

export default function LogFeedPage() {
  const { logs, logsPerMinute } = useData();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Advanced query parser: supports level:error, source:fw, or text search
  const filtered = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase().trim();
    if (query.startsWith('level:')) {
      const lvl = query.replace('level:', '').trim();
      return log.level === lvl;
    }
    if (query.startsWith('source:')) {
      const src = query.replace('source:', '').trim();
      return log.source.toLowerCase().includes(src);
    }
    return log.message.toLowerCase().includes(query) || (log.sourceIp && log.sourceIp.includes(query));
  });

  const exportLogsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Level,Source,SourceIP,Message"].concat(
        filtered.map(l => `"${l.timestamp}","${l.level}","${l.source}","${l.sourceIp || ''}","${l.message.replace(/"/g, '""')}"`)
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `siem_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar title="Live Log Feed" subtitle={`Advanced Query Engine • ${logsPerMinute} logs/min`} />
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
          <div className="flex-1 relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search or filter (e.g. level:error, source:fw, or IP address)..."
              className="input-field pl-10 font-mono text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="select-field w-auto" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button onClick={exportLogsCSV} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button onClick={() => setIsPaused(!isPaused)} className={isPaused ? 'btn-primary' : 'btn-secondary'}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-siem-border font-mono text-xs p-4">
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-3 py-1.5 hover:bg-gray-800/50 border-b border-gray-800/30">
              <span className="text-gray-600 w-20">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
              <span className={`w-16 uppercase font-semibold ${getLogLevelColor(log.level)}`}>[{log.level.slice(0, 4)}]</span>
              <span className="text-cyan-600 w-28 truncate">{log.source}</span>
              <span className="text-gray-300 flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};