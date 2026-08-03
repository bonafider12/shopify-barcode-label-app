import React, { useState } from 'react';
import { Printer, X, LayoutGrid, RotateCcw, Check, SlidersHorizontal, Settings2 } from 'lucide-react';
import BarcodeRenderer from './BarcodeRenderer';
import { LABEL_PRESETS } from '../data/labelPresets';
import { PRESET_LOGOS } from '../data/mockProducts';

export default function PrintPreviewModal({
  isOpen,
  onClose,
  printQueue = [],
  onClearQueue
}) {
  const [selectedPreset, setSelectedPreset] = useState(LABEL_PRESETS[0]);
  const [copiesMultiplier, setCopiesMultiplier] = useState(1);
  const [showCutLines, setShowCutLines] = useState(true);

  if (!isOpen) return null;

  // Flatten print queue items according to requested quantity
  const flattenedQueue = [];
  printQueue.forEach((item) => {
    const qty = (item.quantity || 1) * copiesMultiplier;
    for (let i = 0; i < qty; i++) {
      flattenedQueue.push(item);
    }
  });

  const handlePrintTrigger = () => {
    window.print();
  };

  const renderLogo = (item) => {
    if (item.customLogo) {
      return <img src={item.customLogo} alt="Logo" className="h-5 object-contain max-w-[100px]" />;
    }
    const preset = PRESET_LOGOS.find((p) => p.id === item.selectedPresetId) || PRESET_LOGOS[0];
    return (
      <div
        className="w-16 h-5 flex items-center justify-center shrink-0"
        dangerouslySetInnerHTML={{ __html: preset.svg }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Container - hide during actual print so only #printable-area prints */}
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              🖨️
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Print Preview & Sheet Layout Engine</h2>
              <p className="text-xs text-slate-400">
                {flattenedQueue.length} labels queued ({selectedPreset.name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearQueue}
              className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Clear Queue
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Sidebar controls + Live Sheet Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Controls Sidebar (4 cols) */}
          <div className="md:col-span-4 bg-gray-50/80 p-5 border-r border-gray-200 space-y-5 overflow-y-auto">
            
            {/* Label Preset Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 block">Label Sheet Preset</label>
              <select
                value={selectedPreset.id}
                onChange={(e) => {
                  const p = LABEL_PRESETS.find((x) => x.id === e.target.value);
                  if (p) setSelectedPreset(p);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {LABEL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.dimensions})
                  </option>
                ))}
              </select>
            </div>

            {/* Copies Multiplier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 block">Queue Multiplier</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCopiesMultiplier(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      copiesMultiplier === m
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            {/* Print Options Toggles */}
            <div className="space-y-3 pt-3 border-t border-gray-200 text-xs font-medium text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="accent-emerald-600 rounded"
                />
                Show Dashed Cut Line Guides
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                Browser Print Settings Tip:
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-950">
                In the print dialog, set <strong>Margins to "None"</strong> and disable headers/footers for exact alignment on Avery & Thermal rolls.
              </p>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrintTrigger}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Labels Now
            </button>

          </div>

          {/* Live Print Sheet Preview (8 cols) */}
          <div className="md:col-span-8 p-6 bg-slate-900 overflow-y-auto flex flex-col items-center justify-start">
            <div className="text-xs text-slate-400 mb-3 font-mono">
              Visual Sheet Preview ({selectedPreset.paperSize} Format)
            </div>

            {/* Paper Sheet Representation */}
            <div
              className={`bg-white text-slate-950 shadow-2xl p-4 transition-all ${
                selectedPreset.type === 'THERMAL'
                  ? 'w-[280px] space-y-3 border-2 border-gray-300'
                  : 'w-[520px] min-h-[640px] border border-gray-300'
              }`}
            >
              <div
                className={`grid gap-2 ${
                  selectedPreset.type === 'THERMAL'
                    ? 'grid-cols-1'
                    : selectedPreset.columns === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                }`}
              >
                {flattenedQueue.slice(0, 30).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 bg-white flex flex-col justify-between overflow-hidden text-[9px] ${
                      showCutLines ? 'border border-dashed border-gray-300' : 'border border-gray-100'
                    } ${item.isShelfTalker ? 'min-h-[110px]' : 'min-h-[85px]'}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1">
                      {renderLogo(item)}
                      {item.price && (
                        <span className="font-extrabold text-[10px] text-gray-900">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="font-extrabold text-gray-900 line-clamp-1 leading-tight my-1">
                      {item.title || item.product?.title || 'Product Label'}
                    </div>

                    {/* Barcode */}
                    <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between">
                      <div className="w-full">
                        <BarcodeRenderer
                          type={item.barcodeType || 'CODE128'}
                          value={item.barcode || '123456789'}
                          showText={true}
                          height={20}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {flattenedQueue.length > 30 && (
                <div className="text-center text-[11px] text-gray-400 pt-4 font-mono">
                  + {flattenedQueue.length - 30} more labels on subsequent pages
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* PRINTABLE AREA FOR BROWSER PRINT ENGINE */}
      <div id="printable-area" className="hidden print:block print:w-full">
        <style>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: ${selectedPreset.paperSize === 'ROLL' ? 'auto' : 'letter'};
              margin: 0;
            }
            .print\\:hidden {
              display: none !important;
            }
            #printable-area {
              display: block !important;
            }
          }
        `}</style>

        <div className={`grid gap-2 p-2 ${
          selectedPreset.columns === 3
            ? 'grid-cols-3'
            : selectedPreset.columns === 2
            ? 'grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {flattenedQueue.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 bg-white text-black border ${
                showCutLines ? 'border-dashed border-gray-400' : 'border-transparent'
              } flex flex-col justify-between break-inside-avoid ${
                item.isShelfTalker ? 'h-[180px]' : 'h-[110px]'
              }`}
            >
              <div className="flex items-center justify-between">
                {renderLogo(item)}
                <span className="font-bold text-xs">${Number(item.price).toFixed(2)}</span>
              </div>
              <div className="font-bold text-xs line-clamp-1">{item.title || item.product?.title}</div>
              <div className="text-[10px] text-gray-600">{item.variant || item.product?.variant}</div>
              <div className="w-full mt-1">
                <BarcodeRenderer
                  type={item.barcodeType || 'CODE128'}
                  value={item.barcode || '123456789'}
                  showText={true}
                  height={26}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
