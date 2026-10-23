import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Key, Cpu, AlertTriangle, CheckCircle2, Smartphone, ArrowRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function AuthScreen({ onLoginSuccess }) {
  const [operatorId, setOperatorId] = useState('ADMIN-VANCE-709');
  const [passphrase, setPassphrase] = useState('••••••••••••••••');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState(0); // 0: Idle, 1: Prompted, 2: Scanning, 3: Verified
  const [countdown, setCountdown] = useState(3);
  const [scanProgress, setScanProgress] = useState(0);

  // Trigger FIDO2 simulated biometric verification flow (3 seconds)
  const initiateFidoLogin = () => {
    soundEffects.playFidoScan();
    setIsVerifying(true);
    setVerifyStage(1);
    setCountdown(3);
    setScanProgress(15);
  };

  useEffect(() => {
    let timer;
    let progressTimer;

    if (isVerifying) {
      // Stage 1 -> Stage 2
      const s1 = setTimeout(() => {
        setVerifyStage(2);
        soundEffects.playFidoScan();
      }, 700);

      // Progress bar animation
      progressTimer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + 5;
        });
      }, 150);

      // 3 second countdown
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(progressTimer);
            setScanProgress(100);
            setVerifyStage(3);
            soundEffects.playSuccess();
            setTimeout(() => {
              onLoginSuccess({
                name: 'Cmdr. Alex Vance',
                role: 'Admin',
                clearance: 'TS/SCI // CYBER-OPS',
                badgeId: 'AEGIS-SEC-091'
              });
            }, 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(s1);
        clearInterval(timer);
        clearInterval(progressTimer);
      };
    }
  }, [isVerifying, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden cyber-grid">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 text-xs font-mono text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        SECURE GATEWAY: ONLINE // TLS 1.3 // FIDO2 CERTIFIED
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Shield Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-neon-green mb-3">
            <Shield className="w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            AEGIS-DEFENSE
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              v4.19-SEC
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Active Firewall & Intrusion Detection Console
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0b121e]/90 border border-slate-800 rounded-xl shadow-2xl p-6 backdrop-blur-md relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />

          {!isVerifying ? (
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">Restricted SOC Terminal Access</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  FIDO2 / WEBAUTHN READY
                </span>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    SOC Operator ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={operatorId}
                      onChange={(e) => setOperatorId(e.target.value)}
                      className="w-full bg-[#070b12] border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="e.g. ADMIN-VANCE-709"
                    />
                    <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Session Security Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full bg-[#070b12] border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Cpu className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="pt-2">
                  {/* Primary FIDO2 / Biometric Button */}
                  <button
                    onClick={initiateFidoLogin}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-neon-green group cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>Authenticate via FIDO2 / Passkey</span>
                  </button>

                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-mono">OR MOCK OVERRIDE</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* Standard Sign In */}
                  <button
                    onClick={initiateFidoLogin}
                    className="w-full bg-slate-800/80 hover:bg-slate-750 hover:border-slate-600 border border-slate-700 text-slate-300 hover:text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-mono transition cursor-pointer"
                  >
                    <span>Operator Sign In (Standard Flow)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Security Banner */}
              <div className="mt-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Mandatory 2FA hardware token or registered mobile biometric enclave required. All sessions logged to immutable SIEM ledger.
                </span>
              </div>
            </div>
          ) : (
            /* FIDO2 Biometric Verification Modal / Simulated Loading Screen (3 Seconds) */
            <div className="py-6 flex flex-col items-center text-center animate-fadeIn">
              {/* Biometric Scanning Graphic */}
              <div className="relative mb-6">
                {/* Outer pulsing ring */}
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '8s' }} />
                
                {/* Secondary radar sweep */}
                <div className="absolute inset-1 rounded-full border border-cyan-500/50 animate-ping opacity-25" />

                {/* Fingerprint icon container */}
                <div className="absolute inset-2 rounded-full bg-slate-900/90 border border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-neon-green">
                  {verifyStage === 3 ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  ) : (
                    <div className="relative">
                      <Fingerprint className="w-12 h-12 text-emerald-400" />
                      {/* Laser scanner line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-bounce" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Header */}
              <h2 className="text-base font-bold text-white mb-1 flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 animate-pulse" />
                {verifyStage === 3
                  ? "Identity Verified! Redirecting..."
                  : "Waiting for Mobile Fingerprint Verification"}
              </h2>

              <p className="text-xs font-mono text-slate-400 mb-4 max-w-xs">
                {verifyStage === 3
                  ? "Hardware token validated. Access granted to Admin Dashboard."
                  : "Push notification dispatched to authorized mobile device (Pixel 9 Pro / Secure Enclave)."}
              </p>

              {/* Verification Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 mb-3 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              {/* Live WebAuthn Handshake telemetry */}
              <div className="w-full bg-[#070b12] border border-slate-800/80 rounded-lg p-2.5 text-left font-mono text-[10px] space-y-1 mb-4 text-slate-400">
                <div className="flex justify-between text-slate-500">
                  <span>CHALLENGE: 0x9F4C...B281</span>
                  <span>ALGO: ES256</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>
                    {verifyStage === 1 && "Awaiting user presence gesture..."}
                    {verifyStage === 2 && "Verifying cryptographic biometric signature..."}
                    {verifyStage === 3 && "ECDSA Key Pair Authenticated - OK"}
                  </span>
                </div>
                <div className="text-right text-emerald-400 font-semibold">
                  {countdown > 0 ? `Redirecting in ${countdown}s...` : "Handshake Complete"}
                </div>
              </div>

              {/* Cancel button */}
              <button
                onClick={() => setIsVerifying(false)}
                className="text-xs text-slate-500 hover:text-slate-300 underline font-mono cursor-pointer"
              >
                Cancel FIDO2 Request
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          AEGIS KERNEL // ENCRYPTED ENDPOINT PROTECTION PROTOCOL
        </div>
      </div>
    </div>
  );
}
