import React from 'react';
import { Tag, Store, Layers, ShoppingBag, Printer, Globe } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedProductsCount = 0,
  onOpenPrintModal,
  onOpenShopifyConnectModal
}) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Shopify App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-inner text-slate-950 font-black text-lg">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">Barcodes & Retail Labels</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Shopify App
                </span>
              </div>
              <p className="text-xs text-slate-400">Packaging, Barcodes & Shelf Edge Tag Studio</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('product')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'product'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Product Labels
            </button>

            <button
              onClick={() => setActiveTab('shelf')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'shelf'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Shelf Talkers & Tags
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Product Catalog
              {selectedProductsCount > 0 && (
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-1">
                  {selectedProductsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Connect Shopify Store & Print Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenShopifyConnectModal}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              Connect Shopify / Vercel
            </button>

            <button
              onClick={onOpenPrintModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Labels Sheet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
