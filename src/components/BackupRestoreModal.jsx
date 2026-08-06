import React, { useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, Share2, ShieldCheck, X, HardDrive, Laptop, AlertCircle } from 'lucide-react';

export default function BackupRestoreModal({
  isOpen,
  onClose,
  products,
  printQueue,
  printHistory,
  customLogo,
  onRestoreWorkspace,
  onShowToast
}) {
  const fileInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Handle Exporting Workspace to a file
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

      onShowToast("Workspace backup downloaded! You can share this file with coworkers.");
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

        // Restore into App state & localStorage
        onRestoreWorkspace({
          products: Array.isArray(parsed.products) ? parsed.products : products,
          printQueue: Array.isArray(parsed.printQueue) ? parsed.printQueue : printQueue,
          printHistory: Array.isArray(parsed.printHistory) ? parsed.printHistory : printHistory,
          customLogo: parsed.customLogo !== undefined ? parsed.customLogo : customLogo,
          shopifyDomain: parsed.shopifyDomain || localStorage.getItem('shopify_domain'),
          shopifyToken: parsed.shopifyToken || localStorage.getItem('shopify_token'),
          shopifyClientId: parsed.shopifyClientId || localStorage.getItem('shopify_client_id')
        });

        onShowToast("Workspace successfully loaded onto this device!");
        onClose();
      } catch (err) {
        setErrorMsg("Failed to load workspace file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              💾
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Share Workspace Across Computers</h3>
              <p className="text-xs text-slate-400">Export & Import products, labels & history between devices</p>
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
        <div className="p-6 space-y-6">
          
          <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 text-xs">
            <Laptop className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-emerald-950">How to share labels with other computers:</span>
              <p className="text-emerald-800 leading-relaxed">
                Click <b>Export Backup File</b> on your computer to save all your custom labels, brand logos, print queues, and products into a single lightweight file. Drop that file into email, Google Drive, or a thumb drive and click <b>Import Backup</b> on any other computer to instantly load everything!
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            
            {/* EXPORT BUTTON CARD */}
            <div className="border border-gray-200 hover:border-gray-300 p-5 rounded-2xl bg-gray-50/70 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-gray-900">Export Workspace Backup</h4>
                </div>
                <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                  {products.length} Items • {printQueue.length} Queued
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Downloads a single <code className="bg-gray-200 text-gray-800 px-1 rounded">.turf.json</code> file containing 100% of your current app data and label layouts.
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-all hover:scale-101 active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                {isExporting ? 'Exporting File...' : 'Download Backup File (.turf.json)'}
              </button>
            </div>

            {/* IMPORT BUTTON CARD */}
            <div className="border border-gray-200 hover:border-gray-300 p-5 rounded-2xl bg-gray-50/70 transition-all space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-gray-900">Import Workspace from File</h4>
              </div>
              <p className="text-xs text-gray-600">
                Load a previously saved backup file onto this computer or browser. This will restore all saved designs and print queues immediately.
              </p>
              <input
                type="file"
                accept=".json,.turf"
                ref={fileInputRef}
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-101 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Open & Restore Backup File...
              </button>
            </div>

          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 font-mono">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              Local Storage Sync Active
            </span>
            <span>Zero Server Setup Needed</span>
          </div>

        </div>

      </div>
    </div>
  );
}
