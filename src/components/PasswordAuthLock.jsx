import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function PasswordAuthLock({
  isUnlocked,
  onUnlockSuccess,
  storedPasscode = 'scooter1',
  onUpdatePasscode
}) {
  const [inputPasscode, setInputPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  if (isUnlocked && !showSettingsModal) return null;

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (inputPasscode === storedPasscode) {
      setErrorMessage('');
      onUnlockSuccess();
    } else {
      setErrorMessage('Incorrect Passcode. Default passcode is admin123');
    }
  };

  const handleChangePasscodeSubmit = (e) => {
    e.preventDefault();
    if (oldPass !== storedPasscode) {
      setSettingsError('Current passcode is incorrect');
      return;
    }
    if (newPass.length < 4) {
      setSettingsError('New passcode must be at least 4 characters');
      return;
    }
    if (newPass !== confirmPass) {
      setSettingsError('New passcode and confirmation do not match');
      return;
    }

    onUpdatePasscode(newPass);
    setSettingsSuccess('Passcode updated successfully!');
    setSettingsError('');
    setTimeout(() => {
      setShowSettingsModal(false);
      setSettingsSuccess('');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }, 1500);
  };

  // Render Lock Screen if not unlocked
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        
        {/* Decorative ambient background blur */}
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative text-white">
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Shopify Label Studio Protected</h2>
            <p className="text-xs text-slate-400">
              Enter your master passcode to access barcode label design & printing tools.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Master Passcode</label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  autoFocus
                  className="w-full text-sm p-3.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1.5">
                Default Master Passcode: <code className="text-emerald-400 font-bold bg-slate-800 px-1 py-0.5 rounded">scooter1</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 text-sm"
            >
              <Key className="w-4 h-4" />
              Unlock App Workspace
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Protected with Passcode Authorization Engine
          </div>

        </div>

      </div>
    );
  }

  // Render Change Passcode Modal if invoked while unlocked
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-200 text-gray-900">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-gray-900">Change Security Passcode</h3>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {settingsError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        {settingsSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePasscodeSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Current Passcode</label>
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="e.g. admin123"
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">New Passcode</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new master passcode"
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Confirm New Passcode</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Re-enter new passcode"
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow"
            >
              Update Passcode
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
