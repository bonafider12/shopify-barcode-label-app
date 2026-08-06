import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, CheckCircle2, Share2, ShieldCheck, X, HardDrive, Laptop, AlertCircle, Cloud, RefreshCw, Copy, ExternalLink, Sparkles, Zap, Check } from 'lucide-react';
import { saveToCloudVault, loadFromCloudVault } from '../utils/cloudVault';

export default function BackupRestoreModal({
  isOpen,
  onClose,
  products,
  printQueue,
  printHistory,
  customLogo,
  onRestoreWorkspace,
  onShowToast,
  cloudVaultId,
  setCloudVaultId,
  autoCloudSync,
  setAutoCloudSync
}) {
  const fileInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [inputVaultId, setInputVaultId] = useState(cloudVaultId || '');
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    if (cloudVaultId) setInputVaultId(cloudVaultId);
  }, [cloudVaultId]);

  if (!isOpen) return null;

  const getShareableUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?vault=${cloudVaultId || inputVaultId}`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedType('link');
    onShowToast("1-Click Cloud Sync link copied to clipboard!");
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(cloudVaultId);
    setCopiedType('id');
    onShowToast("Cloud Vault ID copied!");
    setTimeout(() => setCopiedType(null), 3000);
  };

  // 1. Save directly into Live Cloud Vault
  const handleSaveToCloud = async () => {
    setErrorMsg(null);
    setIsCloudSaving(true);
    try {
      const workspaceData = {
        products,
        printQueue,
        printHistory,
        customLogo,
        shopifyDomain: localStorage.getItem('shopify_domain') || null,
        shopifyToken: localStorage.getItem('shopify_token') || null,
        shopifyClientId: localStorage.getItem('shopify_client_id') || null
      };

      const res = await saveToCloudVault(workspaceData, cloudVaultId);
      if (res.id) {
        setCloudVaultId(res.id);
        localStorage.setItem('app_cloud_vault_id', res.id);
        setInputVaultId(res.id);
      }
      onShowToast(`⚡ Saved! Your workspace is permanently stored in Cloud Vault (${res.id})`);
    } catch (err) {
      setErrorMsg("Cloud upload failed: " + err.message);
    } finally {
      setIsCloudSaving(false);
    }
  };

  // 2. Load directly from Live Cloud Vault
  const handleLoadFromCloud = async (idToUse) => {
    const targetId = idToUse || inputVaultId;
    if (!targetId || targetId.trim() === '') {
      setErrorMsg("Please enter a valid Cloud Vault ID first.");
      return;
    }
    setErrorMsg(null);
    setIsCloudLoading(true);
    try {
      const data = await loadFromCloudVault(targetId.trim());
      onRestoreWorkspace({
        products: Array.isArray(data.products) ? data.products : products,
        printQueue: Array.isArray(data.printQueue) ? data.printQueue : printQueue,
        printHistory: Array.isArray(data.printHistory) ? data.printHistory : printHistory,
        customLogo: data.customLogo !== undefined ? data.customLogo : customLogo,
        shopifyDomain: data.shopifyDomain || localStorage.getItem('shopify_domain'),
        shopifyToken: data.shopifyToken || localStorage.getItem('shopify_token'),
        shopifyClientId: data.shopifyClientId || localStorage.getItem('shopify_client_id')
      });
      setCloudVaultId(targetId.trim());
      localStorage.setItem('app_cloud_vault_id', targetId.trim());
      onShowToast(`⚡ Connected! Successfully synced labels & inventory from Cloud Vault (${targetId.trim()})`);
    } catch (err) {
      setErrorMsg("Cloud Sync error: " + err.message);
    } finally {
      setIsCloudLoading(false);
    }
  };

  // Handle Exporting Workspace to a local file
  const handleExport = () => {
    setIsExporting(true);
    try {
      const workspaceData = {
        version: "1.0.0",
        exportTimestamp: new Date().toISOString(),
        products: products || [],
        printQueue: printQueue || [],
        printHistory: printHistory || [],
        customLogo: customLogo || null,
        shopifyDomain: localStorage.getItem('shopify_domain') || null,
        shopifyToken: localStorage.getItem('shopify_token') || null,
        shopifyClientId: localStorage.getItem('shopify_client_id') || null,
        shopifyAutosync: localStorage.getItem('shopify_autosync') !== 'false'
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspaceData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("download", `turf-tech-labels-workspace-${dateStr}.turf.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onShowToast("Workspace backup downloaded!");
      setTimeout(() => setIsExporting(false), 500);
    } catch (err) {
      setErrorMsg("Error exporting workspace file: " + err.message);
      setIsExporting(false);
    }
  };

  // Handle Importing Workspace from a file
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || (typeof parsed !== 'object')) {
          throw new Error("Invalid file format. Please pick a valid workspace JSON file.");
        }

        onRestoreWorkspace({
          products: Array.isArray(parsed.products) ? parsed.products : products,
          printQueue: Array.isArray(parsed.printQueue) ? parsed.printQueue : printQueue,
          printHistory: Array.isArray(parsed.printHistory) ? parsed.printHistory : printHistory,
          customLogo: parsed.customLogo !== undefined ? parsed.customLogo : customLogo,
          shopifyDomain: parsed.shopifyDomain || localStorage.getItem('shopify_domain'),
          shopifyToken: parsed.shopifyToken || localStorage.getItem('shopify_token'),
          shopifyClientId: parsed.shopifyClientId || localStorage.getItem('shopify_client_id')
        });

        onShowToast("Workspace successfully loaded from file!");
        onClose();
      } catch (err) {
        setErrorMsg("Failed to load workspace file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              ☁️
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>Live Cloud Vault & Multi-Computer Sync</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Instant</span>
              </h3>
              <p className="text-xs text-slate-400">Save and share your label layouts across any computer directly in the app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: LIVE CLOUD VAULT (RECOMMENDED) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <h4 className="font-black text-sm text-white tracking-tight">Built-In Cloud Workspace Vault</h4>
              </div>
              {cloudVaultId ? (
                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connected: {cloudVaultId}
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 font-semibold text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
                  ⚪ Offline / Local Only
                </span>
              )}
            </div>

            {/* How-To Guide / Explanation */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-2.5">
              <div className="font-extrabold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>How do I get or use a Vault ID?</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold text-[9px] shrink-0 mt-0.5 shadow-xs">NEW</span>
                  <span>
                    <b>Don't have an ID yet?</b> Simply click <b>"🚀 Save App to Cloud Now"</b> below! The app will automatically generate your permanent 7-character Vault ID instantly without any account needed.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold text-[9px] shrink-0 mt-0.5 shadow-xs">SYNC</span>
                  <span>
                    <b>Connecting another computer or tablet?</b> Look at the computer where you already clicked Save—you'll see your Vault ID shown above under <i>Connected: [ID]</i>. Type or paste that exact ID into the box below and click <b>Connect</b>!
                  </span>
                </li>
              </ul>
            </div>

            {/* If connected, show share options */}
            {cloudVaultId && (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
                  <span>✨ 1-Click Shareable Sync Link</span>
                  <span className="text-[10px] text-slate-400 font-mono">Any device opening this loads your labels</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareableUrl()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all shrink-0"
                  >
                    {copiedType === 'link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'link' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono">
                    <b>Vault ID Key:</b> <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-bold">{cloudVaultId}</code>
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedType === 'id' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy ID</span>
                  </button>
                </div>
              </div>
            )}

            {/* Save & Load controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleSaveToCloud}
                disabled={isCloudSaving}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {isCloudSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{cloudVaultId ? 'Push Quick Cloud Update' : '🚀 Save App to Cloud Now'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Paste Vault ID..."
                  value={inputVaultId}
                  onChange={(e) => setInputVaultId(e.target.value)}
                  className="w-32 sm:flex-1 bg-slate-800 border border-slate-700 text-white text-xs px-3 py-3 rounded-xl font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleLoadFromCloud()}
                  disabled={isCloudLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs py-3 px-3.5 rounded-xl border border-slate-600 flex items-center gap-1.5 transition-all hover:bg-slate-750 shrink-0 disabled:opacity-60"
                >
                  {isCloudLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Connect</span>
                </button>
              </div>
            </div>

            {/* Auto Cloud Sync Toggle */}
            {cloudVaultId && (
              <label className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCloudSync}
                  onChange={(e) => setAutoCloudSync(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 rounded-sm bg-slate-800 border-slate-700"
                />
                <span className="text-xs font-bold text-slate-200">
                  ⚡ Auto-Sync Active: Automatically upload changes to Cloud Vault in real-time
                </span>
              </label>
            )}
          </div>

          {/* SECTION 2: OFFLINE FILE EXPORT / IMPORT (PLAN B) */}
          <div className="border border-gray-200 p-5 rounded-2xl bg-gray-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-700" />
                <h4 className="font-bold text-sm text-gray-800">Offline File Backup (Optional)</h4>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Plan B • (.turf.json)</span>
            </div>

            <p className="text-xs text-gray-600">
              If you prefer working without cloud storage, you can still manually save a local backup file to your computer or USB thumb drive.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{isExporting ? 'Exporting...' : 'Download (.turf.json)'}</span>
              </button>

              <div>
                <input
                  type="file"
                  accept=".json,.turf"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Open Offline File...</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 font-mono">
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-cyan-600" />
              Multi-Computer Real-Time Memory
            </span>
            <span>Midwest Turf Tech Retail Standard</span>
          </div>

        </div>

      </div>
    </div>
  );
}
