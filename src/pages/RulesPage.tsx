import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useData } from '../contexts/DataContext';
import { getSeverityColor, getSeverityDot, formatRelativeTime, cn } from '../utils/helpers';
import { DetectionRule, Severity } from '../types';

export default function RulesPage() {
  const { rules, createRule, updateRule, deleteRule } = useData();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('high');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRule({
      name,
      description,
      severity,
      sourceFilter,
      keyword,
      enabled: true,
    });
    setName('');
    setDescription('');
    setKeyword('');
    setShowModal(false);
  };

  return (
    <div>
      <TopBar title="Threat Detection Rules" subtitle={`${rules.filter(r => r.enabled).length} active custom detection rules`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">Rules automatically evaluate incoming live logs and trigger alerts when matching threat signatures occur.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("badge", getSeverityColor(rule.severity))}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", getSeverityDot(rule.severity))}></span>
                      {rule.severity}
                    </span>
                    <button
                      onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                      className={`badge ${rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <button onClick={() => deleteRule(rule.id)} className="text-gray-500 hover:text-red-400 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h4 className="text-base font-semibold text-gray-200 mb-1">{rule.name}</h4>
                <p className="text-xs text-gray-400 mb-4">{rule.description}</p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1 font-mono text-xs">
                  <div className="text-gray-400">Source: <span className="text-cyan-400">{rule.sourceFilter}</span></div>
                  <div className="text-gray-400">Keyword Match: <span className="text-yellow-400">"{rule.keyword}"</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
                <span>Triggered {rule.triggerCount} times</span>
                <span>Created {formatRelativeTime(rule.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card max-w-lg w-full animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Create Detection Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Rule Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Detect Unauthorized S3 Access" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="What does this rule detect?" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className="select-field">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Log Source Filter</label>
                  <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="select-field">
                    <option value="all">All Sources</option>
                    <option value="fw-edge-01">fw-edge-01</option>
                    <option value="ids-dmz-01">ids-dmz-01</option>
                    <option value="edr-agent">edr-agent</option>
                    <option value="ad-dc-01">ad-dc-01</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Keyword / Message Pattern *</label>
                <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className="input-field font-mono" placeholder="e.g. unauthorized or root" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};