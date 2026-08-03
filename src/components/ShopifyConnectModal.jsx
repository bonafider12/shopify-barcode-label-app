import React, { useState, useRef } from 'react';
import { ShoppingBag, Upload, Key, X, RefreshCw, Globe, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { fetchShopifyProducts } from '../utils/shopifyApi';
import { parseShopifyCSV } from '../utils/csvImporter';

export default function ShopifyConnectModal({
  isOpen,
  onClose,
  onImportProducts,
  onShowToast
}) {
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'csv' | 'vercel'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleApiConnect = async (e) => {
    e.preventDefault();
    if (!storeDomain || !accessToken) {
      setErrorMessage('Please enter both store domain and Admin API Access Token');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const liveProducts = await fetchShopifyProducts(storeDomain, accessToken);
      if (liveProducts.length === 0) {
        setErrorMessage('Connected successfully, but no products were found in this Shopify store.');
      } else {
        onImportProducts(liveProducts);
        onShowToast(`Successfully imported ${liveProducts.length} live products from ${storeDomain}!`);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to Shopify Admin API. Verify credentials & CORS setup.');
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
          setErrorMessage('Error parsing CSV file. Make sure it is a valid Shopify Products Export CSV.');
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
              <h3 className="font-extrabold text-base text-white">Connect Shopify Store & Vercel</h3>
              <p className="text-xs text-slate-400">Sync live products & deploy your barcode app online</p>
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
            <Globe className="w-4 h-4 text-emerald-600" />
            Live Shopify Admin API
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
            Deploy to Vercel
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'api' && (
            <form onSubmit={handleApiConnect} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Shopify Store Domain (.myshopify.com)
                </label>
                <input
                  type="text"
                  placeholder="e.g. my-awesome-store.myshopify.com"
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Admin API Access Token (`shpat_...`)
                </label>
                <input
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Generated in Shopify Admin &gt; Settings &gt; Apps &gt; Develop Apps &gt; Admin API access tokens (requires `read_products` scope).
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying Shopify GraphQL API...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Fetch & Sync Live Shopify Products
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
                    Export your catalog from Shopify Admin &gt; Products &gt; Export &gt; All Products (CSV), then drop it here to import instantly!
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
                  This app includes an official <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">vercel.json</code> deployment configuration and Vite single-page build!
                </p>
              </div>

              <div className="space-y-2 font-mono bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="font-sans font-bold text-gray-900">Deployment Commands for Vercel CLI:</div>
                <div className="text-emerald-700 font-bold">npx vercel</div>
                <p className="font-sans text-gray-500 text-[11px]">
                  Or push this folder to your GitHub repo and import it directly inside your Vercel Dashboard (<a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-600 underline">vercel.com/new</a>).
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
