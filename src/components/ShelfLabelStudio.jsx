import React, { useState } from 'react';
import { Store, MapPin, DollarSign, QrCode, Tag, Award, Sparkles, Printer, Plus, Eye } from 'lucide-react';
import BarcodeRenderer from './BarcodeRenderer';
import SearchableProductSelect from './SearchableProductSelect';
import { LABEL_PRESETS } from '../data/labelPresets';
import { PRESET_LOGOS } from '../data/mockProducts';

export default function ShelfLabelStudio({
  products,
  selectedProduct,
  setSelectedProduct,
  customLogo,
  selectedPresetId,
  onAddToPrintQueue,
  onOpenPrintModal
}) {
  const shelfPresets = LABEL_PRESETS.filter((p) => p.category === 'Shelf Edge Label');
  const [selectedShelfPreset, setSelectedShelfPreset] = useState(shelfPresets[0]);

  // Form Fields
  const [productTitle, setProductTitle] = useState(selectedProduct?.title || '');
  const [variantName, setVariantName] = useState(selectedProduct?.variant || '');
  const [price, setPrice] = useState(selectedProduct?.price || 8.99);
  const [compareAtPrice, setCompareAtPrice] = useState(selectedProduct?.compareAtPrice || 10.99);
  const [unitPrice, setUnitPrice] = useState(selectedProduct?.unitPrice || '$0.56 / fl oz');
  const [location, setLocation] = useState(selectedProduct?.location || 'Aisle 3 • Shelf B • Bin 04');
  const [promoBadge, setPromoBadge] = useState('SPECIAL OFFER');
  const [barcode, setBarcode] = useState(selectedProduct?.barcode || '850012948012');
  const [qrUrl, setQrUrl] = useState(selectedProduct?.qrUrl || 'https://myshopify-store.com/products/green-juice');
  const [vendor, setVendor] = useState(selectedProduct?.vendor || 'Verdant Organics');

  // Styling
  const [headerTheme, setHeaderTheme] = useState('dark-emerald'); // 'dark-emerald', 'amber-gold', 'midnight-navy', 'crimson-sale'
  const [showQR, setShowQR] = useState(true);
  const [showUnitPrice, setShowUnitPrice] = useState(true);
  const [showCompareSave, setShowCompareSave] = useState(true);

  // Sync selected product
  const handleProductSelect = (prod) => {
    setSelectedProduct(prod);
    setProductTitle(prod.title);
    setVariantName(prod.variant);
    setPrice(prod.price);
    setCompareAtPrice(prod.compareAtPrice || '');
    setUnitPrice(prod.unitPrice || `$${(prod.price / 16).toFixed(2)} / oz`);
    setLocation(prod.location || 'Aisle 1 • Shelf A');
    setBarcode(prod.barcode);
    setQrUrl(prod.qrUrl || `https://store.com/products/${prod.id}`);
    setVendor(prod.vendor || 'Store Brand');
  };

  const getSavingsAmount = () => {
    if (compareAtPrice && compareAtPrice > price) {
      return (compareAtPrice - price).toFixed(2);
    }
    return null;
  };

  const renderLogo = () => {
    if (customLogo) {
      return <img src={customLogo} alt="Logo" className="h-5 object-contain max-w-[100px]" />;
    }
    const preset = PRESET_LOGOS.find((p) => p.id === selectedPresetId) || PRESET_LOGOS[0];
    return (
      <div
        className="w-16 h-5 flex items-center justify-center shrink-0"
        dangerouslySetInnerHTML={{ __html: preset.svg }}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Controls (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Searchable Product Picker */}
        <SearchableProductSelect
          products={products}
          selectedProduct={selectedProduct}
          onSelectProduct={handleProductSelect}
          label="Select Item for Shelf Edge Tag"
        />

        {/* Shelf Tag Presets */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            Shelf Tag Format & Size
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shelfPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedShelfPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedShelfPreset.id === preset.id
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-600'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{preset.dimensions}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 font-semibold text-emerald-800">
                    Shelf Tag
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 font-medium truncate">{preset.name}</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shelf Pricing & Location Info */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Shelf Pricing & Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Product Name</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Brand / Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Shelf Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Was / Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Optional strike-through"
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Unit Price ($/unit)</label>
              <input
                type="text"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="e.g. $0.56 / oz"
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Aisle & Shelf Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle 3 • Shelf B"
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Promo Callout Banner</label>
              <select
                value={promoBadge}
                onChange={(e) => setPromoBadge(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              >
                <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                <option value="LOW PRICE EVERYDAY">LOW PRICE EVERYDAY</option>
                <option value="STAFF PICK">STAFF PICK</option>
                <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                <option value="ORGANIC CHOICE">ORGANIC CHOICE</option>
                <option value="CLEARANCE">CLEARANCE</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Header Theme</label>
              <select
                value={headerTheme}
                onChange={(e) => setHeaderTheme(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="dark-emerald">Dark Emerald (Retail Standard)</option>
                <option value="crimson-sale">Crimson Red (Sale / Promo)</option>
                <option value="amber-gold">Amber Gold (Premium / Organic)</option>
                <option value="midnight-navy">Midnight Navy (Clean Modern)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Live Visual Preview of Shelf Talker Tag (5 cols) */}
      <div className="lg:col-span-5 sticky top-20 space-y-6">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-white">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-slate-100">Shelf Talker / Edge Tag Preview</span>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 font-mono px-2 py-1 rounded-md border border-slate-700">
              {selectedShelfPreset.dimensions}
            </span>
          </div>

          {/* Actual Shelf Label Card Render */}
          <div className="my-6 flex items-center justify-center min-h-[250px] bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-inner">
            
            <div className="w-[360px] bg-white text-slate-950 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-900 flex flex-col justify-between">
              
              {/* Header Banner */}
              <div className={`p-2.5 flex items-center justify-between text-white ${
                headerTheme === 'dark-emerald'
                  ? 'bg-emerald-700'
                  : headerTheme === 'crimson-sale'
                  ? 'bg-rose-700'
                  : headerTheme === 'amber-gold'
                  ? 'bg-amber-600'
                  : 'bg-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  {renderLogo()}
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-90">
                    {vendor}
                  </span>
                </div>
                {promoBadge && (
                  <span className="bg-white/20 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                    {promoBadge}
                  </span>
                )}
              </div>

              {/* Body Content */}
              <div className="p-3.5 space-y-2">
                <h3 className="font-black text-sm text-gray-900 leading-snug tracking-tight">
                  {productTitle}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">{variantName}</p>

                {/* Massive Price Section */}
                <div className="flex items-end justify-between my-2 pt-1 border-t border-b border-gray-100 pb-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-gray-900 leading-none">
                        ${Number(price).toFixed(2)}
                      </span>
                      {compareAtPrice && compareAtPrice > price && (
                        <span className="text-xs text-gray-400 line-through font-semibold">
                          ${Number(compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {showUnitPrice && unitPrice && (
                      <span className="text-[10px] font-bold text-gray-500 block mt-1">
                        UNIT PRICE: {unitPrice}
                      </span>
                    )}
                  </div>

                  {/* Savings Discount Badge */}
                  {getSavingsAmount() && (
                    <div className="bg-rose-600 text-white text-right px-2 py-1 rounded-lg">
                      <span className="text-[9px] font-bold block uppercase leading-tight">SAVE</span>
                      <span className="text-xs font-black leading-tight">${getSavingsAmount()}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Location Tag & QR Code */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{location}</span>
                    </div>
                    <div className="text-[9px] font-mono text-gray-400">SKU: {selectedProduct?.sku || 'SKU-001'}</div>
                  </div>

                  {showQR && (
                    <div className="flex flex-col items-center">
                      <BarcodeRenderer
                        type="QR"
                        value={qrUrl}
                        showText={false}
                        height={34}
                      />
                      <span className="text-[8px] font-semibold text-gray-400 uppercase mt-0.5">Scan Specs</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onAddToPrintQueue({
                product: selectedProduct,
                title: productTitle,
                variant: variantName,
                price: price,
                compareAtPrice: compareAtPrice,
                unitPrice: unitPrice,
                location: location,
                promoBadge: promoBadge,
                vendor: vendor,
                headerTheme: headerTheme,
                qrUrl: qrUrl,
                preset: selectedShelfPreset,
                customLogo: customLogo,
                selectedPresetId: selectedPresetId,
                isShelfTalker: true,
                quantity: 4
              })}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Shelf Tags to Queue (4 copies)
            </button>

            <button
              onClick={onOpenPrintModal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Direct Print Shelf Tags Sheet
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
