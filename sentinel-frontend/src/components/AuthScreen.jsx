import React from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  UserCheck,
  Fingerprint,
  Smartphone,
  Sun,
  Moon,
  Mail,
  LogIn
} from 'lucide-react';

export default function AuthScreen({
  isDarkMode,
  setIsDarkMode,
  isVerifying,
  verifyStage,
  countdown,
  authTab = 'admin',
  setAuthTab,
  username = '',
  setUsername,
  password = '',
  setPassword,
  onInitiateFido,
  onPhoneBiometricLogin,
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
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Simple Theme Toggle on Login Screen */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div
        className={`w-full max-w-md rounded-xl border p-8 shadow-sm transition-colors ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
          <div
            className={`p-2.5 rounded-lg border ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Sentinel Firewall</h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Enterprise Traffic Filter & IDS Platform
            </p>
          </div>
        </div>

        {!isVerifying ? (
          <div>
            {/* Login Mode Toggle Tabs */}
            <div
              className={`grid grid-cols-2 p-1 rounded-lg border mb-5 ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setAuthTab && setAuthTab('admin')}
                className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'admin'
                    ? isDarkMode
                      ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
                      : 'bg-white text-blue-700 shadow-sm border border-gray-200'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthTab && setAuthTab('firebase')}
                className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
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
                <span>Firebase Email</span>
              </button>
            </div>

            {/* TAB 1: Admin Login (Password + WebAuthn/FIDO2) */}
            {authTab === 'admin' ? (
              <form onSubmit={onPasswordSubmit || onInitiateFido} className="space-y-4 text-xs">
                <div className="mb-2">
                  <h2 className="text-sm font-semibold mb-0.5">Admin Security Console</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Enter administrative credentials. Sign in via password or authenticate with phone biometric key.
                  </p>
                </div>

                <div>
                  <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Administrator ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter administrator ID"
                      className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Security Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  {/* Option 1: Direct Password Login */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In with Password</span>
                  </button>

                  {/* Option 2: Real Phone Biometric / Passkey WebAuthn */}
                  <button
                    type="button"
                    onClick={onPhoneBiometricLogin}
                    className={`w-full font-medium py-2.5 px-4 rounded-md border text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-900 hover:bg-slate-850 text-blue-400 border-slate-700 hover:border-blue-600'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Authenticate with Phone Biometric (WebAuthn)</span>
                  </button>

                  {/* Option 3: Mock Hardware FIDO2 Simulation */}
                  <button
                    type="button"
                    onClick={onInitiateFido}
                    className={`w-full text-xs py-2 px-3 rounded-md border font-medium transition cursor-pointer text-center ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400 hover:text-slate-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-slate-600'
                    }`}
                    title="Simulate Hardware FIDO2 Verification Flow"
                  >
                    Simulate FIDO2 Biometric Challenge
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: Firebase Email/Password Login */
              <form onSubmit={onFirebaseEmailLogin} className="space-y-4 text-xs">
                <div className="mb-2">
                  <h2 className="text-sm font-semibold mb-0.5">Firebase Authentication</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Sign in with your registered Firebase email and password.
                  </p>
                </div>

                <div>
                  <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Firebase Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={firebaseEmail}
                      onChange={(e) => setFirebaseEmail && setFirebaseEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Firebase Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={firebasePassword}
                      onChange={(e) => setFirebasePassword && setFirebasePassword(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-gray-300 text-slate-900'
                      }`}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {firebaseError && (
                  <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                    {firebaseError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isFirebaseLoading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                      isFirebaseLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isFirebaseLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Firebase Account...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In with Firebase</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Clean 'OR' Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`} />
              <span
                className={`absolute px-3 text-[11px] font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500'
                }`}
              >
                OR
              </span>
            </div>

            {/* Quick Guest Access Button (Firebase Anonymous Login) */}
            <div>
              <button
                type="button"
                onClick={onGuestLogin}
                disabled={isGuestLoading}
                className={`w-full font-medium py-2.5 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition cursor-pointer border ${
                  isDarkMode
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-200 hover:border-slate-600'
                    : 'bg-slate-50 hover:bg-slate-100 border-gray-300 text-slate-800 hover:border-gray-400'
                } ${isGuestLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isGuestLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Guest Session...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Quick Guest Access</span>
                  </>
                )}
              </button>

              {guestError && (
                <div className="mt-2 p-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs text-center">
                  {guestError}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Biometric Verification Modal / State */
          <div className="text-center py-4 space-y-5">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
              <div
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors ${
                  verifyStage === 3
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                }`}
              >
                {verifyStage === 3 ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-1">
                {verifyStage === 1 && 'Push Notification Dispatched'}
                {verifyStage === 2 && 'Confirming TouchID / FIDO2 Key'}
                {verifyStage === 3 && 'Administrative Access Authorized'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {verifyStage === 1 && 'Check your registered mobile security authenticator.'}
                {verifyStage === 2 && 'Validating cryptographic signature against hardware token...'}
                {verifyStage === 3 && 'Access granted. Redirecting to Enterprise Dashboard...'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Challenge Expires In: {countdown}s</span>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <span
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  verifyStage >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
              <span
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  verifyStage >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
              <span
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  verifyStage >= 3 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
          <span>Kernel: eBPF / XDP Mode</span>
          <span>v2.4.0-enterprise</span>
        </div>
      </div>
    </div>
  );
}
