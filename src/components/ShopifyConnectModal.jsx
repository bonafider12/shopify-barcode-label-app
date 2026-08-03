import React, { useState, useRef } from 'react';
import { ShoppingBag, Upload, Key, X, RefreshCw, Globe, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { fetchShopifyProducts } from '../utils/shopifyApi';
import { parseShopifyCSV } from '../utils/csvImporter';

export default function ShopifyConnectModal({
  isOpen,
  onClose,
  onImportProducts,
  onShowToast,
  shopifyStoreDomain,
  setShopifyStoreDomain,
  shopifyAccessToken,
  setShopifyAccessToken,
  autoSyncEnabled,
  setAutoSyncEnabled
}) {
  const [storeDomain, setStoreDomain] = useState(shopifyStoreDomain || 'midwestturftech.myshopify.com');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState(shopifyAccessToken || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'csv' | 'vercel'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleApiConnect = async (e) => {
    e.preventDefault();
    if (!clientSecret) {
      setErrorMessage('Please enter your Secret or API Token');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const liveProducts = await fetchShopifyProducts(storeDomain, clientSecret, clientId, clientSecret);
      if (liveProducts.length === 0) {
        setErrorMessage('Connected successfully, but no products were found in Midwest Turf Tech store.');
      } else {
        // Save credentials for automatic background sync
        setShopifyStoreDomain(storeDomain);
        setShopifyAccessToken(clientSecret);
        localStorage.setItem('shopify_domain', storeDomain);
        localStorage.setItem('shopify_token', clientSecret);
        if (clientId) localStorage.setItem('shopify_client_id', clientId);
        localStorage.setItem('shopify_autosync', 'true');
        setAutoSyncEnabled(true);

        onImportProducts(liveProducts);
        onShowToast(`Downloaded ${liveProducts.length} products from ${storeDomain}!`);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to download from Shopify API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const imported = parseShopifyCSV(csvText);
          if (imported.length > 0) {
            onImportProducts(imported);
            onShowToast(`Imported ${imported.length} products from Shopify CSV!`);
            onClose();
          } else {
            setErrorMessage('Could not find product rows in CSV file.');
          }
        } catch (err) {
          setErrorMessage('Error parsing CSV file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl">
              🛍️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Midwest Turf Tech Shopify Credentials</h3>
              <p className="text-xs text-slate-400">Automatic Sync via Partner App Credentials / Secret</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'api'
                ? 'border-emerald-600 text-emerald-950 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            Automatic App Sync
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-emerald-600 text-emerald-950 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Shopify CSV Import
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'vercel'
                ? 'border-emerald-600 text-emerald-950 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            Vercel Deployment
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'api' && (
            <form onSubmit={handleApiConnect} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Shopify Store Domain
                </label>
                <input
                  type="text"
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  placeholder="midwestturftech.myshopify.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. d7d38022dce1328c65822a75d61c438a"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Secret or Token (`shpss_...` or `shpat_...`)
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Paste your Secret or Token"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
                <span className="text-[10px] text-gray-500 block mt-1">
                  Accepts your Client Secret (`shpss_...`) or Admin Access Token (`shpat_...`).
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Automatic Background Downloader Active
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Automatically downloads fresh product listings whenever you open the app.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={(e) => {
                    setAutoSyncEnabled(e.target.checked);
                    localStorage.setItem('shopify_autosync', e.target.checked ? 'true' : 'false');
                  }}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Downloading Live Store Inventory...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Download & Sync Live Products Now
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-emerald-50/30 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-sm font-bold text-gray-800">
                    Upload Shopify `products_export.csv`
                  </span>
                  <span className="text-xs text-gray-500 max-w-sm">
                    Export your catalog from Shopify Admin &gt; Products &gt; Export &gt; CSV, drop it here to import.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs text-gray-700">
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800">
                <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  1-Click Vercel Online Hosting Ready
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Includes serverless proxy <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">/api/shopify.js</code> for zero CORS blocks.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
