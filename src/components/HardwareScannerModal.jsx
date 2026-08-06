import React, { useState, useEffect, useRef } from 'react';
import { Scan, Printer, Plus, Check, X, Search, Zap, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import BarcodeRenderer from './BarcodeRenderer';

export default function HardwareScannerModal({
  isOpen,
  onClose,
  products,
  onAddToQueue,
  onSelectProductForEdit,
  onShowToast
}) {
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null); // { status: 'FOUND' | 'NOT_FOUND', product?, rawCode: string, timestamp: number }
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens or after an action
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const cleanCode = scanInput.trim();
    if (!cleanCode) return;

    // Search catalog by barcode, SKU, or Title
    const matchedProduct = products.find(
      (p) =>
        p.barcode.toString() === cleanCode ||
        p.sku.toLowerCase() === cleanCode.toLowerCase() ||
        p.title.toLowerCase().includes(cleanCode.toLowerCase())
    );

    const newResult = {
      status: matchedProduct ? 'FOUND' : 'NOT_FOUND',
      product: matchedProduct || null,
      rawCode: cleanCode,
      timestamp: Date.now()
    };

    setScannedResult(newResult);
    setScanHistory((prev) => [newResult, ...prev.slice(0, 15)]);
    setScanInput(''); // Clear immediately for next gun trigger

    // Re-focus immediately
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleQuickAdd = (qty) => {
    if (!scannedResult || !scannedResult.product) return;
    onAddToQueue({
      product: scannedResult.product,
      title: scannedResult.product.title,
      variant: scannedResult.product.variant,
      price: scannedResult.product.price,
      sku: scannedResult.product.sku,
      barcode: scannedResult.product.barcode,
      barcodeType: scannedResult.product.barcodeType || 'CODE128',
      quantity: qty
    });
    onShowToast(`Added ${qty} ${qty > 1 ? 'copies' : 'copy'} of ${scannedResult.product.title} to Queue!`);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              🔫
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Hardware Scanner & Rapid Search
                <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                  USB / BLUETOOTH READY
                </span>
              </h3>
              <p className="text-xs text-slate-400">Scan barcodes with your handheld gun or keyboard to instantly process items</p>
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
          
          {/* Active Scanner Input Box */}
          <form onSubmit={handleScanSubmit} className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Scan Barcode or Type SKU:
            </label>
            <div className="relative">
              <Scan className="w-6 h-6 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Aim scanner gun here and squeeze trigger... (Auto-Enter)"
                className="w-full text-base font-mono pl-14 pr-24 py-4 rounded-2xl border-2 border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 outline-none bg-emerald-50/30 text-gray-900 shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
              >
                Match Item
              </button>
            </div>
            <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Tip: Handheld scanner guns automatically send an Enter key after reading a barcode!
            </p>
          </form>

          {/* Current Scanned Result Banner */}
          {scannedResult ? (
            <div className={`p-5 rounded-2xl border transition-all ${
              scannedResult.status === 'FOUND'
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-amber-50 border-amber-300'
            }`}>
              {scannedResult.status === 'FOUND' ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-2xs">
                        ✅ Product Recognized
                      </span>
                      <h4 className="text-base font-black text-gray-900 mt-1.5">
                        {scannedResult.product.title}
                      </h4>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">
                        SKU: {scannedResult.product.sku} • Price: ${Number(scannedResult.product.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs shrink-0">
                      <BarcodeRenderer
                        type={scannedResult.product.barcodeType || 'CODE128'}
                        value={scannedResult.product.barcode || '12345'}
                        height={26}
                        showText={true}
                      />
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-200">
                    <button
                      onClick={() => handleQuickAdd(1)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all hover:scale-102 active:scale-95"
                    >
                      <Printer className="w-4 h-4" />
                      +1 to Print Queue
                    </button>

                    <button
                      onClick={() => handleQuickAdd(5)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all hover:scale-102 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      +5 Copies to Queue
                    </button>

                    <button
                      onClick={() => {
                        onSelectProductForEdit(scannedResult.product);
                        onClose();
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:border-emerald-600"
                    >
                      <span>Studio Customize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h4 className="font-bold text-sm">Barcode "{scannedResult.rawCode}" not found in current inventory</h4>
                  </div>
                  <p className="text-xs text-amber-700">
                    This barcode doesn't correspond to any product currently loaded. You can instantly create a brand new product entry using this scanned number!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2 bg-gray-50/50">
              <Scan className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">Waiting for first barcode read...</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Once scanned, product specs will instantly populate here with quick print triggers!
              </p>
            </div>
          )}

          {/* Recent Scans Log */}
          {scanHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Session Scan Log ({scanHistory.length})
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      if (item.product) {
                        setScannedResult(item);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.status === 'FOUND' ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-amber-500 font-bold">?</span>
                      )}
                      <span className="font-bold text-gray-800 truncate">
                        {item.product ? item.product.title : `Unrecognized Code: ${item.rawCode}`}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-gray-500 shrink-0">
                      Code: {item.rawCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
