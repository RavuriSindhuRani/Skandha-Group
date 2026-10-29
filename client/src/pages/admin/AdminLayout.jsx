import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminChangePassword } from '../../api/client';
import {
  Layers,
  CalendarCheck,
  LogOut,
  ExternalLink,
  KeyRound,
  ShieldAlert,
  Menu,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminLayout() {
  const { adminUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(adminUser?.mustChangePassword || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const menuItems = [
    { label: 'Plots Inventory', path: '/admin/plots', icon: Layers },
    { label: 'Booking Details', path: '/admin/bookings', icon: CalendarCheck }
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await adminChangePassword(currentPassword, newPassword);
      if (res.success) {
        setPwdSuccess('Password updated successfully!');
        setTimeout(() => setShowPasswordModal(false), 1200);
      } else {
        setPwdError(res.error || 'Failed to update password');
      }
    } catch (err) {
      setPwdError(err.message || 'Error updating password');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <Link to="/admin/plots" className="flex items-center gap-3">
              <img
                src="/assets/skandha_logo.svg"
                alt="Skandha Admin"
                className="h-10 w-auto object-contain"
              />
              <div>
                <div className="font-serif font-bold text-sm text-slate-900 leading-tight">
                  Admin Portal
                </div>
                <div className="text-[10px] font-medium text-emerald-700">
                  Kadthal Venture
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 lg:hidden text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const currentFull = location.pathname + location.search;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin' && !location.search
                  : item.path.includes('?')
                  ? currentFull === item.path
                  : location.pathname === item.path && !location.search;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-50 text-brand-orange border border-orange-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="font-bold text-slate-900 truncate">{adminUser?.username}</div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">{adminUser?.role}</div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              title="Change Password"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-orange transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-brand-orange p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            Skandha Group Master Real-Estate Portal &bull; Kadthal Project
          </div>

          <div className="flex items-center gap-4">
            {adminUser?.mustChangePassword && (
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Action: Change Seed Password</span>
              </button>
            )}

            <div className="text-xs text-slate-600 font-medium">
              Logged in as <strong className="text-slate-900">{adminUser?.email}</strong>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Update Admin Password
              </h3>
              {!adminUser?.mustChangePassword && (
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {pwdError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
                {pwdSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                {!adminUser?.mustChangePassword && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 text-xs font-bold border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
