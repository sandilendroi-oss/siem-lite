import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('analyst');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(loginUsername, loginPassword);
    if (!success) setError('Invalid username or password.');
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: regName,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      role: regRole,
    });

    if (!result.success) {
      setError(result.error || 'Failed to create account.');
    }
    setIsLoading(false);
  };

  const quickLogin = async (user: string, pass: string) => {
    setIsSignUp(false);
    setLoginUsername(user);
    setLoginPassword(pass);
    setError('');
    setIsLoading(true);
    const success = await login(user, pass);
    if (!success) setError('Login failed');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-siem-dark flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SIEM Lite</h1>
          <p className="text-gray-500 text-sm mt-1">Security Incident & Threat Tracker</p>
        </div>

        {/* Card Header Switcher */}
        <div className="card">
          <div className="flex border-b border-gray-700/60 mb-6 pb-2 gap-4">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                !isSignUp ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                isSignUp ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {!isSignUp ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="input-field"
                  placeholder="e.g. admin or analyst1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Create Account Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="input-field py-2"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="input-field py-2"
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Username *</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    className="input-field py-2"
                    placeholder="johndoe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="select-field py-2"
                  >
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Password *</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="input-field py-2"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  className="input-field py-2"
                  placeholder="Re-enter password"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Quick Login Demo Accounts */}
        <div className="mt-5 card p-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-2.5">Or Quick Login with Demo Accounts</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('admin', 'admin123')}
              disabled={isLoading}
              className="p-2 bg-gray-800/60 hover:bg-gray-800 rounded-lg text-left transition-colors border border-gray-700/50"
            >
              <div className="text-xs font-bold text-red-400">Admin</div>
              <div className="text-[10px] text-gray-500">admin / admin123</div>
            </button>
            <button
              onClick={() => quickLogin('analyst1', 'analyst123')}
              disabled={isLoading}
              className="p-2 bg-gray-800/60 hover:bg-gray-800 rounded-lg text-left transition-colors border border-gray-700/50"
            >
              <div className="text-xs font-bold text-blue-400">Analyst</div>
              <div className="text-[10px] text-gray-500">analyst1 / analyst123</div>
            </button>
            <button
              onClick={() => quickLogin('viewer', 'viewer123')}
              disabled={isLoading}
              className="p-2 bg-gray-800/60 hover:bg-gray-800 rounded-lg text-left transition-colors border border-gray-700/50"
            >
              <div className="text-xs font-bold text-gray-400">Viewer</div>
              <div className="text-[10px] text-gray-500">viewer / viewer123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
