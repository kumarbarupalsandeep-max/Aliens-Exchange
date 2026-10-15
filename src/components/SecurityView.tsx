/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Security, Session Protection & Account Lockdown Desk
 */

import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Globe, Lock, AlertTriangle, CheckCircle2, Key, Trash2 } from 'lucide-react';
import { SessionInfo } from '../types.ts';

interface SecurityViewProps {
  onTriggerEmergencyLock: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onTriggerEmergencyLock }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [antiPhishingCode, setAntiPhishingCode] = useState('ALIEN-SEC-8820');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [tempCode, setTempCode] = useState('ALIEN-SEC-8820');
  const [whitelistEnabled, setWhitelistEnabled] = useState(true);

  const fetchSecurityData = async () => {
    try {
      const res = await fetch('/api/security');
      const data = await res.json();
      setSessions(data.sessions || []);
      setAntiPhishingCode(data.antiPhishingCode || 'ALIEN-SEC-8820');
      setWhitelistEnabled(data.whitelistEnabled);
    } catch (err) {
      console.error('Failed to load security info:', err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleSaveAntiPhishing = (e: React.FormEvent) => {
    e.preventDefault();
    setAntiPhishingCode(tempCode);
    setIsEditingCode(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Zero-Trust Account Defense
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Security & Active Session Management</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Hardware security keys, multi-device session governance, anti-phishing codes, and emergency lockdowns.
          </p>
        </div>

        <button
          onClick={onTriggerEmergencyLock}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency Account Lockdown</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Security Controls & Anti-Phishing */}
        <div className="space-y-6">
          {/* Anti-Phishing Code Card */}
          <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#00f59b]" />
                <span>Anti-Phishing Code</span>
              </h3>
              <span className="text-[10px] text-[#00f59b] font-bold">ACTIVE</span>
            </div>

            <p className="text-slate-400 font-sans text-xs">
              This code appears on all genuine emails from Aliens Exchange to protect against phishing spoofing.
            </p>

            {isEditingCode ? (
              <form onSubmit={handleSaveAntiPhishing} className="space-y-2">
                <input
                  type="text"
                  value={tempCode}
                  onChange={(e) => setTempCode(e.target.value)}
                  className="w-full bg-[#111724] border border-[#1f2c41] rounded px-3 py-1.5 text-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCode(false)}
                    className="px-2 py-1 bg-[#182132] text-slate-300 rounded text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#00f59b] text-slate-950 font-bold rounded text-[11px]"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3 bg-[#111724] rounded-lg border border-[#1b2538]">
                <span className="text-white font-bold tracking-wider">{antiPhishingCode}</span>
                <button
                  onClick={() => setIsEditingCode(true)}
                  className="text-[11px] text-[#00e5ff] hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* 2FA & Hardware Key Status */}
          <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3">
            <h3 className="font-bold text-white font-['Outfit'] text-sm flex items-center gap-1.5 border-b border-[#18202f] pb-2">
              <Key className="w-4 h-4 text-[#00e5ff]" />
              <span>Multi-Factor Authentication</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#111724] rounded-lg border border-[#1b2538] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Hardware Key (FIDO2 / YubiKey)</div>
                  <div className="text-[10px] text-slate-400">WebAuthn Biometrics Enabled</div>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">Bound</span>
              </div>

              <div className="p-3 bg-[#111724] rounded-lg border border-[#1b2538] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">TOTP Authenticator</div>
                  <div className="text-[10px] text-slate-400">Google Authenticator</div>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">Enabled</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Whitelisting Delay */}
          <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Withdrawal Whitelist</h3>
              <input
                type="checkbox"
                checked={whitelistEnabled}
                onChange={(e) => setWhitelistEnabled(e.target.checked)}
                className="accent-[#00f59b] w-4 h-4"
              />
            </div>
            <p className="text-slate-400 font-sans text-xs">
              When enabled, funds can only be withdrawn to pre-verified whitelisted addresses. Newly added addresses incur a mandatory 24-hour security delay.
            </p>
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="lg:col-span-2 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#18202f] pb-3">
            <div>
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Active Authorized Sessions</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Review devices currently authenticated with your exchange account.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">{sessions.length} Active Sessions</span>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 bg-[#101623] border border-[#192437] rounded-xl flex flex-wrap items-center justify-between gap-3 hover:border-[#22334d] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${sess.isCurrent ? 'bg-[#00f59b]/10 text-[#00f59b]' : 'bg-slate-800 text-slate-300'}`}>
                    {sess.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="text-[9px] font-sans font-bold uppercase bg-[#00f59b]/10 text-[#00f59b] px-2 py-0.5 rounded border border-[#00f59b]/30">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {sess.browser} · IP: {sess.ipAddress} · {sess.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{sess.lastActive}</span>
                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded border border-rose-900/40 transition-colors cursor-pointer text-[11px]"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
