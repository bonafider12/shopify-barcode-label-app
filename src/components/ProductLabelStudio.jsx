import React, { useState } from 'react';
import { Tag, Sliders, CheckCircle2, ShieldCheck, Printer, Eye, Palette, Layers, Plus } from 'lucide-react';
import LogoUploader from './LogoUploader';
import BarcodeRenderer from './BarcodeRenderer';
import SearchableProductSelect from './SearchableProductSelect';
import { LABEL_PRESETS } from '../data/labelPresets';
import { PRESET_LOGOS } from '../data/mockProducts';

export default function ProductLabelStudio({
  products,
  selectedProduct,
  setSelectedProduct,
  customLogo,
  setCustomLogo,
  selectedPresetId,
  setSelectedPresetId,
  onAddToPrintQueue,
  onOpenPrintModal
}) {
  // Label Design State
  const [selectedLabelPreset, setSelectedLabelPreset] = useState(LABEL_PRESETS[0]);
  const [logoScale, setLogoScale] = useState(100);
  const [logoPosition, setLogoPosition] = useState('top-center');
  
  // Custom Product Override fields
  const [productTitle, setProductTitle] = useState(selectedProduct?.title || '');
  const [variantName, setVariantName] = useState(selectedProduct?.variant || '');
  const [price, setPrice] = useState(selectedProduct?.price || 0);
  const [compareAtPrice, setCompareAtPrice] = useState(selectedProduct?.compareAtPrice || '');
  const [sku, setSku] = useState(selectedProduct?.sku || '');
  const [barcode, setBarcode] = useState(selectedProduct?.barcode || '');
  const [barcodeType, setBarcodeType] = useState(selectedProduct?.barcodeType || 'CODE128');
  const [netWeight, setNetWeight] = useState(selectedProduct?.netWeight || '');
  const [origin, setOrigin] = useState(selectedProduct?.origin || '');
  const [ecoBadge, setEcoBadge] = useState(selectedProduct?.ecoBadge || '');

  // Styling & Toggles
  const [accentColor, setAccentColor] = useState('#10b981'); // Emerald
  const [borderStyle, setBorderStyle] = useState('rounded-solid');
  const [showPrice, setShowPrice] = useState(true);
  const [showComparePrice, setShowComparePrice] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showEcoBadge, setShowEcoBadge] = useState(true);
  const [showBarcodeText, setShowBarcodeText] = useState(true);
  const [barcodeHeight, setBarcodeHeight] = useState(38);

  // Sync state when selected product changes
  const handleProductSelect = (prod) => {
    setSelectedProduct(prod);
    setProductTitle(prod.title || '');
    setVariantName(prod.variant || '');
    setPrice(prod.price || 0);
    setCompareAtPrice(prod.compareAtPrice || '');
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setBarcodeType(prod.barcodeType || 'CODE128');
    setNetWeight(prod.netWeight || '');
    setOrigin(prod.origin || '');
    setEcoBadge(prod.ecoBadge || '');
  };

  // Helper for logo SVG/Image rendering
  const renderLogo = () => {
    if (customLogo) {
      return (
        <img
          src={customLogo}
          alt="Custom Store Logo"
          style={{ height: `${(32 * logoScale) / 100}px` }}
          className="object-contain max-w-[260px] max-h-[140px]"
        />
      );
    }
    const preset = PRESET_LOGOS.find((p) => p.id === selectedPresetId) || PRESET_LOGOS[0];
    return (
      <div
        style={{ height: `${(30 * logoScale) / 100}px`, width: `${(95 * logoScale) / 100}px` }}
        className="flex items-center justify-center shrink-0 max-w-[260px]"
        dangerouslySetInnerHTML={{ __html: preset.svg }}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Controls & Designer Panel (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Product Selector with Live Autocomplete Search */}
        <SearchableProductSelect
          products={products}
          selectedProduct={selectedProduct}
          onSelectProduct={handleProductSelect}
          label="1. Select Product from Catalog"
        />

        {/* Preset Label Stock Picker */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            2. Choose Printer & Label Size
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LABEL_PRESETS.filter(p => p.category === 'Product Packaging').map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedLabelPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLabelPreset.id === preset.id
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-600'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{preset.dimensions}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600">
                    {preset.type}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 font-medium truncate">{preset.name}</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logo Uploader */}
        <LogoUploader
          customLogo={customLogo}
          setCustomLogo={setCustomLogo}
          selectedPresetId={selectedPresetId}
          setSelectedPresetId={setSelectedPresetId}
          logoScale={logoScale}
          setLogoScale={setLogoScale}
          logoPosition={logoPosition}
          setLogoPosition={setLogoPosition}
        />

        {/* Product Details Customization */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            3. Product & Packaging Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Product Title</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Variant / Size</label>
              <input
                type="text"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Compare Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Optional sale price"
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Net Weight / Vol</label>
              <input
                type="text"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Country of Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Eco / Retail Badge</label>
              <input
                type="text"
                value={ecoBadge}
                onChange={(e) => setEcoBadge(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Barcode & Styling Options */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            4. Barcode Encoding & Style Customization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Barcode Symbology</label>
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
              >
                <option value="CODE128">Code 128 (Standard SKU)</option>
                <option value="EAN13">EAN-13 (International Retail)</option>
                <option value="UPCA">UPC-A (North America Retail)</option>
                <option value="QR">2D QR Code (Product Link)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Barcode Value</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Brand Accent Color</label>
              <div className="flex items-center gap-2">
                {['#10b981', '#0284c7', '#7c3aed', '#b45309', '#0f172a', '#e11d48'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccentColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      accentColor === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Border Framing</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="rounded-solid">Sleek Rounded Border</option>
                <option value="top-accent">Top Accent Bar</option>
                <option value="heavy-retail">Heavy Retail Frame</option>
                <option value="dashed-cut">Dashed Cut Line</option>
                <option value="none">Clean Borderless</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              Show Price
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSKU}
                onChange={(e) => setShowSKU(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              Show SKU
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEcoBadge}
                onChange={(e) => setShowEcoBadge(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              Show Eco Badge
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrigin}
                onChange={(e) => setShowOrigin(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              Show Origin
            </label>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Live Visual Preview & Packaging Mockup (5 cols) */}
      <div className="lg:col-span-5 sticky top-20 space-y-6">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-white">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-slate-100">Live Packaging Label Preview</span>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 font-mono px-2 py-1 rounded-md border border-slate-700">
              {selectedLabelPreset.dimensions} ({selectedLabelPreset.type})
            </span>
          </div>

          {/* Actual Label Render Card */}
          <div className="my-6 flex items-center justify-center min-h-[220px] bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-inner">
            
            <div
              style={{
                borderColor: borderStyle === 'top-accent' ? accentColor : undefined,
                borderTopColor: borderStyle === 'top-accent' ? accentColor : undefined,
              }}
              className={`bg-white text-slate-900 p-4 transition-all duration-200 shadow-lg relative flex flex-col justify-between overflow-hidden ${
                borderStyle === 'rounded-solid'
                  ? 'rounded-xl border-2 border-gray-900'
                  : borderStyle === 'heavy-retail'
                  ? 'border-4 border-gray-900 rounded-none'
                  : borderStyle === 'dashed-cut'
                  ? 'border-2 border-dashed border-gray-400 rounded-lg'
                  : borderStyle === 'top-accent'
                  ? 'border-t-4 border-b border-x border-gray-200 rounded-lg'
                  : 'rounded-lg border border-gray-200'
              } ${
                selectedLabelPreset.id === 'avery_5163'
                  ? 'w-[360px] min-h-[190px]'
                  : 'w-[320px] min-h-[150px]'
              }`}
            >
              {/* Header Row: Logo & Eco Badge */}
              <div className={`flex items-center gap-2 mb-2 w-full ${
                logoPosition === 'top-center'
                  ? 'justify-center'
                  : logoPosition === 'top-right'
                  ? 'justify-end'
                  : 'justify-between'
              }`}>
                {logoPosition === 'top-right' && showEcoBadge && ecoBadge && (
                  <span
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }}
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap mr-auto"
                  >
                    {ecoBadge}
                  </span>
                )}
                <div className={`flex items-center ${
                  logoPosition === 'top-center'
                    ? 'justify-center'
                    : logoPosition === 'top-right'
                    ? 'justify-end'
                    : 'justify-start'
                }`}>
                  {renderLogo()}
                </div>
                {logoPosition !== 'top-right' && logoPosition !== 'top-center' && showEcoBadge && ecoBadge && (
                  <span
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }}
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap ml-auto"
                  >
                    {ecoBadge}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1 my-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight tracking-tight line-clamp-1">
                    {productTitle || 'Product Name'}
                  </h4>
                  {showPrice && (
                    <div className="text-right shrink-0">
                      <span className="font-black text-base text-gray-900">
                        ${Number(price).toFixed(2)}
                      </span>
                      {showComparePrice && compareAtPrice && (
                        <span className="text-[10px] text-gray-400 line-through block leading-none">
                          ${Number(compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                  <span>{variantName}</span>
                  {netWeight && <span className="text-[10px] text-gray-500">{netWeight}</span>}
                </div>
              </div>

              {/* Barcode & Footer info */}
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex-1 max-w-[210px]">
                  <BarcodeRenderer
                    type={barcodeType}
                    value={barcode || '123456789'}
                    showText={showBarcodeText}
                    height={barcodeHeight}
                    color="#111827"
                  />
                </div>

                <div className="text-right text-[9px] text-gray-500 font-medium space-y-0.5">
                  {showSKU && <div className="font-mono font-bold text-gray-800">SKU: {sku}</div>}
                  {showOrigin && <div className="text-gray-400">{origin}</div>}
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onAddToPrintQueue({
                product: selectedProduct,
                title: productTitle,
                variant: variantName,
                price: price,
                compareAtPrice: compareAtPrice,
                sku: sku,
                barcode: barcode,
                barcodeType: barcodeType,
                ecoBadge: ecoBadge,
                netWeight: netWeight,
                origin: origin,
                preset: selectedLabelPreset,
                customLogo: customLogo,
                selectedPresetId: selectedPresetId,
                accentColor: accentColor,
                borderStyle: borderStyle,
                quantity: 10
              })}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Label to Print Queue (10 copies)
            </button>

            <button
              onClick={onOpenPrintModal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Direct Print Label Sheet Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
