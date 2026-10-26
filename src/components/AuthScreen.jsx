import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  Sun,
  Moon,
  Mail,
  LogIn,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Radio
} from 'lucide-react';

export default function AuthScreen({
  isDarkMode,
  setIsDarkMode,
  authTab = 'admin',
  setAuthTab,
  username = '',
  setUsername,
  password = '',
  setPassword,
  onPasswordSubmit,
  firebaseEmail = '',
  setFirebaseEmail,
  firebasePassword = '',
  setFirebasePassword,
  onFirebaseEmailLogin,
  isFirebaseLoading = false,
  firebaseError = null,
  onGuestLogin,
  isGuestLoading = false,
  guestError = null
}) {
  const [adminError, setAdminError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminFormSubmit = (e) => {
    e.preventDefault();
    setAdminError(null);

    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      setAdminError('Please enter both Administrator ID and Security Passphrase.');
      return;
    }

    if (cleanUser !== 'Ammar' || cleanPass !== 'hackAMR') {
      setAdminError('Access Denied: Invalid Administrator ID or Password.');
      return;
    }

    setIsSubmitting(true);
    if (onPasswordSubmit) {
      onPasswordSubmit(e);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
              : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div
        className={`w-full max-w-md rounded-2xl border p-8 shadow-xl transition-colors relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Subtle Accent Glow */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            authTab === 'admin' ? 'from-blue-600 via-indigo-600 to-cyan-500' : 'from-amber-500 via-orange-500 to-amber-600'
          }`}
        />

        {/* Brand / Logo Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div
            className={`p-3 rounded-xl border ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Sentinel Firewall</h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              SecOps Defense & Intrusion Detection Console
            </p>
          </div>
        </div>

        {/* Login Mode Toggle Tabs */}
        <div
          className={`grid grid-cols-2 p-1 rounded-xl border mb-6 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (setAuthTab) setAuthTab('admin');
              setAdminError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
              authTab === 'admin'
                ? isDarkMode
                  ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
                  : 'bg-white text-blue-700 shadow-sm border border-gray-200'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Administrator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (setAuthTab) setAuthTab('firebase');
              setAdminError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
              authTab === 'firebase'
                ? isDarkMode
                  ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                  : 'bg-white text-amber-700 shadow-sm border border-gray-200'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Firebase Auth</span>
          </button>
        </div>

        {/* TAB 1: Administrator Login (Strict Ammar / hackAMR, No Security Key Prompt) */}
        {authTab === 'admin' && (
          <form onSubmit={handleAdminFormSubmit} className="space-y-4 text-xs">
            <div className="mb-2">
              <h2 className="text-sm font-semibold mb-0.5">Admin Security Portal</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sign in with Administrator credentials to unlock firewall management.
              </p>
            </div>

            {/* Error Notification */}
            {adminError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Administrator Username */}
            <div>
              <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Administrator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (adminError) setAdminError(null);
                  }}
                  placeholder="Enter administrator ID"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Security Passphrase */}
            <div>
              <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Security Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (adminError) setAdminError(null);
                  }}
                  placeholder="Enter security passphrase"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Sign In Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Firebase Email / Password Authentication */}
        {authTab === 'firebase' && (
          <form onSubmit={onFirebaseEmailLogin} className="space-y-4 text-xs">
            <div className="mb-2">
              <h2 className="text-sm font-semibold mb-0.5">Firebase Authentication</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sign in using your Firebase enterprise cloud identity.
              </p>
            </div>

            {/* Firebase Error */}
            {firebaseError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{firebaseError}</span>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={firebaseEmail}
                  onChange={(e) => setFirebaseEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Firebase Password */}
            <div>
              <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={firebasePassword}
                  onChange={(e) => setFirebasePassword(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isFirebaseLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isFirebaseLoading ? 'Authenticating...' : 'Sign In with Firebase'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Guest SecOps Read-Only Access */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 text-center">
          {guestError && (
            <p className="text-[11px] text-red-500 mb-2">{guestError}</p>
          )}
          <button
            type="button"
            onClick={onGuestLogin}
            disabled={isGuestLoading}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-slate-700'
            }`}
          >
            <span>{isGuestLoading ? 'Connecting...' : 'Continue as Guest Operator (Read-Only Demo)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
