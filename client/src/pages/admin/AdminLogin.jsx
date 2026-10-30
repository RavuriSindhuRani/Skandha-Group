import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminBootstrap } from '../../api/client';
import { Lock, Mail, User, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // One-time Bootstrap setup state
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [showBootstrapSecret, setShowBootstrapSecret] = useState(false);
  const [showBootstrapPassword, setShowBootstrapPassword] = useState(false);
  const [bootstrapData, setBootstrapData] = useState({
    secretKey: '',
    username: 'admin',
    email: 'admin@skandhagroup.com',
    password: ''
  });
  const [bootstrapMsg, setBootstrapMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminBootstrap(bootstrapData);
      if (res.success) {
        setBootstrapMsg('Admin setup successful! Logging in...');
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        setError(res.error || 'Bootstrap setup failed');
      }
    } catch (err) {
      setError(err.message || 'Setup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Top Back to Website link */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between px-1">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-orange transition-colors group"
          title="Return to main public website"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Website</span>
        </a>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 p-8 text-center border-b border-orange-100">
          <img
            src="/assets/skandha_logo.svg"
            alt="Skandha Group"
            className="h-12 w-auto mx-auto object-contain"
          />
          <h2 className="text-xl font-serif font-bold text-slate-900 mt-4">
            Authorized Admin Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Skandha Group Project Control Center
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {bootstrapMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              {bootstrapMsg}
            </div>
          )}

          {!showBootstrap ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin or admin@skandhagroup.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Default: admin@123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-sm shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Admin Portal</span>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>First time setup?</span>
                <button
                  type="button"
                  onClick={() => setShowBootstrap(true)}
                  className="text-brand-orange font-semibold hover:underline"
                >
                  One-Time Secret Bootstrap
                </button>
              </div>
            </form>
          ) : (
            /* Bootstrap Form */
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl">
                Enter your one-time <code>ADMIN_BOOTSTRAP_SECRET</code> to initialize the initial superadmin.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bootstrap Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showBootstrapSecret ? 'text' : 'password'}
                    required
                    placeholder="Enter secret from server env"
                    value={bootstrapData.secretKey}
                    onChange={(e) => setBootstrapData({ ...bootstrapData, secretKey: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBootstrapSecret(!showBootstrapSecret)}
                    tabIndex={-1}
                    aria-label={showBootstrapSecret ? 'Hide secret' : 'Show secret'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showBootstrapSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={bootstrapData.username}
                  onChange={(e) => setBootstrapData({ ...bootstrapData, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={bootstrapData.email}
                  onChange={(e) => setBootstrapData({ ...bootstrapData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Set Master Password (min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showBootstrapPassword ? 'text' : 'password'}
                    required
                    placeholder="Create secure password"
                    value={bootstrapData.password}
                    onChange={(e) => setBootstrapData({ ...bootstrapData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBootstrapPassword(!showBootstrapPassword)}
                    tabIndex={-1}
                    aria-label={showBootstrapPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showBootstrapPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBootstrap(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Initialize Admin'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
