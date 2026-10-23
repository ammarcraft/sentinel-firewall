import React from 'react';
import { Shield, ShieldCheck, Lock, User, Fingerprint, Smartphone, Sun, Moon } from 'lucide-react';

export default function AuthScreen({
  isDarkMode,
  setIsDarkMode,
  isVerifying,
  verifyStage,
  countdown,
  username,
  setUsername,
  password,
  setPassword,
  onInitiateFido,
  onPasswordSubmit
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
          /* Standard Enterprise Login Form */
          <div>
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-1">Sign in to console</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter your administrative credentials or use biometric security key.
              </p>
            </div>

            <form onSubmit={onInitiateFido} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  Username / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                        : 'bg-white border-gray-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                        : 'bg-white border-gray-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Authenticate with Mobile Fingerprint</span>
                </button>

                <button
                  type="button"
                  onClick={onPasswordSubmit || onInitiateFido}
                  className={`w-full text-xs py-2 px-3 rounded-md border font-medium transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-slate-700'
                  }`}
                >
                  Sign In (Password Only)
                </button>
              </div>
            </form>

            <div
              className={`mt-5 p-3 rounded-md border text-xs flex items-start gap-2 ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-400'
                  : 'bg-slate-50 border-gray-200 text-slate-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span>
                FIDO2 WebAuthn authentication supported for hardware security keys and mobile devices.
              </span>
            </div>
          </div>
        ) : (
          /* FIDO2 Biometric Handshake Screen (3-Second Flow) */
          <div className="py-6 flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <Fingerprint className="w-8 h-8" />
            </div>

            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              {verifyStage === 3 ? 'Fingerprint Verified' : 'Waiting for Mobile Fingerprint Verification'}
            </h2>

            <p className={`text-xs max-w-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {verifyStage === 3
                ? 'Authentication successful. Redirecting to dashboard...'
                : 'Prompt sent to your registered mobile phone. Tap the sensor to continue.'}
            </p>

            <div
              className={`w-full h-2 rounded-full overflow-hidden mb-4 border ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <div
                className="bg-blue-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((4 - countdown) / 3) * 100}%` }}
              />
            </div>

            <div
              className={`w-full p-3 rounded-md border text-left text-xs font-mono space-y-1.5 ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>FIDO2 / WebAuthn Handshake</span>
                <span>{countdown}s remaining</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px]">
                  {verifyStage === 1 && 'Initiating WebAuthn challenge to mobile device...'}
                  {verifyStage === 2 && 'Biometric credential presented. Validating assertion...'}
                  {verifyStage === 3 && 'Hardware attestation verified. Granting session token.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
