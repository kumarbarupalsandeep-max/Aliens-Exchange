/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Emergency Account Lockdown Modal
 */

import React, { useState } from 'react';
import { AlertTriangle, X, Check, ShieldAlert } from 'lucide-react';

interface EmergencyLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockConfirmed: () => void;
}

export const EmergencyLockModal: React.FC<EmergencyLockModalProps> = ({
  isOpen,
  onClose,
  onLockConfirmed,
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleExecuteLock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/security/emergency-lock', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
        setTimeout(() => {
          onLockConfirmed();
          onClose();
          setConfirmed(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to execute lockdown:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1017] border border-rose-900/50 rounded-xl shadow-2xl p-6 space-y-4 text-xs font-mono animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#18202f] pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-white font-['Outfit'] text-sm">Emergency Account Lockdown</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 font-sans text-xs leading-relaxed">
          Triggering emergency lockdown is an irreversible safety protocol designed for active account compromises or unauthorized activity.
        </p>

        <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg space-y-2 text-[11px] text-rose-200">
          <div className="font-bold text-rose-300">The following actions will take effect immediately:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>Instantly cancel 100% of open limit and trigger orders.</li>
            <li>Terminate all external browser and mobile app sessions.</li>
            <li>Enforce an immediate 24-hour cryptographic withdrawal lock.</li>
            <li>Notify account security contacts.</li>
          </ul>
        </div>

        {confirmed && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded text-center text-xs font-bold">
            Emergency Lockdown Executed Successfully.
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#161e2c] text-slate-300 rounded hover:bg-[#1e2a3e] font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteLock}
            disabled={loading || confirmed}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded font-sans transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Locking Down...' : 'Execute Emergency Lockdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
