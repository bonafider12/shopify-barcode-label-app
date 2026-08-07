import React, { useState } from 'react';
import { Store, MapPin, DollarSign, QrCode, Tag, Award, Sparkles, Printer, Plus, Eye, Zap, Link, FileText, Wifi, MessageSquare, Mail } from 'lucide-react';
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
  const [printQty, setPrintQty] = useState(4); // Default quantity for shelf edge tags

  const createCurrentShelfPayload = (qty) => ({
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
    qrLabel: qrLabel || 'Scan Specs',
    preset: selectedShelfPreset,
    customLogo: customLogo,
    selectedPresetId: selectedPresetId,
    isShelfTalker: true,
    showPrice: showPrice,
    quantity: Number(qty) || 1
  });

  const handleInstantQuickPrint = () => {
    onAddToPrintQueue(createCurrentShelfPayload(printQty));
    onOpenPrintModal();
  };

  // Form Fields
  const [productTitle, setProductTitle] = useState(selectedProduct?.title || '');
  const [variantName, setVariantName] = useState(selectedProduct?.variant || '');
  const [price, setPrice] = useState(selectedProduct?.price || 0);
  const [compareAtPrice, setCompareAtPrice] = useState(selectedProduct?.compareAtPrice || '');
  const [unitPrice, setUnitPrice] = useState(selectedProduct?.unitPrice || '');
  const [location, setLocation] = useState(selectedProduct?.location || '');
  const [promoBadge, setPromoBadge] = useState('');
  const [barcode, setBarcode] = useState(selectedProduct?.barcode || '');
  const [qrUrl, setQrUrl] = useState(selectedProduct?.qrUrl || '');
  const [vendor, setVendor] = useState(selectedProduct?.vendor || '');

  // Styling
  const [headerTheme, setHeaderTheme] = useState('dark-emerald');
  const [showQR, setShowQR] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showUnitPrice, setShowUnitPrice] = useState(true);
  const [showCompareSave, setShowCompareSave] = useState(true);

  // Multi-Purpose QR Action State
  const [qrMode, setQrMode] = useState('URL'); // 'URL' | 'MANUAL' | 'WIFI' | 'SMS' | 'EMAIL'
  const [qrLabel, setQrLabel] = useState('Scan Specs');
  const [manualUrl, setManualUrl] = useState('https://manuals.midwestturftech.com/parts-diagram.pdf');
  const [wifiSsid, setWifiSsid] = useState('MidwestTurf-Guest');
  const [wifiPass, setWifiPass] = useState('TurfTech2026!');
  const [smsPhone, setSmsPhone] = useState('18005558873');
  const [smsText, setSmsText] = useState('Hello Service Desk, I need maintenance assistance with this item!');
  const [emailTo, setEmailTo] = useState('service@midwestturftech.com');
  const [emailSub, setEmailSub] = useState('Warranty & Parts Inquiry');

  const updateQrConfig = (mode, overrideVals = {}) => {
    setQrMode(mode);
    const mUrl = overrideVals.manualUrl ?? manualUrl;
    const wSsid = overrideVals.wifiSsid ?? wifiSsid;
    const wPass = overrideVals.wifiPass ?? wifiPass;
    const sPhone = overrideVals.smsPhone ?? smsPhone;
    const sText = overrideVals.smsText ?? smsText;
    const eTo = overrideVals.emailTo ?? emailTo;
    const eSub = overrideVals.emailSub ?? emailSub;
    const uUrl = overrideVals.url ?? qrUrl;

    if (mode === 'URL') {
      setQrLabel('Scan Specs');
      if (overrideVals.url !== undefined) setQrUrl(uUrl);
    } else if (mode === 'MANUAL') {
      setQrLabel('Scan Manual');
      setQrUrl(mUrl);
    } else if (mode === 'WIFI') {
      setQrLabel('Scan WiFi');
      setQrUrl(`WIFI:T:WPA;S:${wSsid};P:${wPass};;`);
    } else if (mode === 'SMS') {
      setQrLabel('Scan SMS');
      setQrUrl(`sms:${sPhone}?body=${encodeURIComponent(sText)}`);
    } else if (mode === 'EMAIL') {
      setQrLabel('Scan Support');
      setQrUrl(`mailto:${eTo}?subject=${encodeURIComponent(eSub)}`);
    }
  };

  // Sync selected product
  const handleProductSelect = (prod) => {
    setSelectedProduct(prod);
    setProductTitle(prod.title || '');
    setVariantName(prod.variant || '');
    setPrice(prod.price || 0);
    setCompareAtPrice(prod.compareAtPrice || '');
    setUnitPrice(prod.unitPrice || '');
    setLocation(prod.location || '');
    setBarcode(prod.barcode || '');
    setQrUrl(prod.qrUrl || '');
    setVendor(prod.vendor || '');
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700 block">Shelf Price ($)</label>
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="accent-emerald-600 rounded" />
                  Show
                </label>
              </div>
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

        {/* 📱 Multi-Purpose QR Code Action Suite */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-600" />
              Multi-Purpose QR Code Action Suite
            </h3>
            <span className="text-[10px] font-black bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
              ⚡ 1-TAP PRESETS
            </span>
          </div>

          {/* Preset Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateQrConfig('URL')}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                qrMode === 'URL'
                  ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-900 shadow-sm'
                  : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <Link className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Shop / Web Link</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Standard store page URL</p>
            </button>

            <button
              type="button"
              onClick={() => updateQrConfig('MANUAL')}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                qrMode === 'MANUAL'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 shadow-sm'
                  : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Service Manual</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Parts diagrams & PDF specs</p>
            </button>

            <button
              type="button"
              onClick={() => updateQrConfig('WIFI')}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                qrMode === 'WIFI'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <Wifi className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Shop Guest WiFi</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">1-tap instant connection</p>
            </button>

            <button
              type="button"
              onClick={() => updateQrConfig('SMS')}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                qrMode === 'SMS'
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-900 shadow-sm'
                  : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Support SMS Text</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Opens pre-written help text</p>
            </button>

            <button
              type="button"
              onClick={() => updateQrConfig('EMAIL')}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                qrMode === 'EMAIL'
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-900 shadow-sm'
                  : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Email Service Desk</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Warranty & reorder inquiries</p>
            </button>

            <div className="p-2 rounded-xl bg-slate-900 text-slate-300 flex flex-col justify-center border border-slate-800">
              <div className="text-[10px] uppercase font-black text-emerald-400 text-center">
                <span>Tag QR Footer Label:</span>
              </div>
              <input
                type="text"
                value={qrLabel}
                onChange={(e) => setQrLabel(e.target.value)}
                maxLength={16}
                title="Customize text shown below QR code"
                className="bg-slate-800 text-white font-extrabold text-xs px-2 py-1 rounded border border-slate-700 mt-1 w-full focus:outline-none focus:ring-1 focus:ring-emerald-400 text-center shadow-inner"
              />
            </div>
          </div>

          {/* Dynamic Configuration Inputs based on Selected Mode */}
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200/80 space-y-3">
            {qrMode === 'URL' && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Store / Product Web Address (URL):</label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => {
                    setQrUrl(e.target.value);
                  }}
                  placeholder="https://yourstore.com/products/item"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-cyan-900 font-medium"
                />
              </div>
            )}

            {qrMode === 'MANUAL' && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Service / Technical Manual Address (PDF/DOC URL):</label>
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => {
                    setManualUrl(e.target.value);
                    updateQrConfig('MANUAL', { manualUrl: e.target.value });
                  }}
                  placeholder="https://manuals.yourdomain.com/diagrams/part-sheet.pdf"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-emerald-900 font-medium"
                />
                <p className="text-[10px] text-gray-500 mt-1.5 font-medium">💡 Customers or technicians scan to open equipment diagrams and maintenance guides instantly on their phone!</p>
              </div>
            )}

            {qrMode === 'WIFI' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">WiFi Network Name (SSID):</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => {
                      setWifiSsid(e.target.value);
                      updateQrConfig('WIFI', { wifiSsid: e.target.value });
                    }}
                    placeholder="MidwestTurf-Guest"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">WiFi Network Password:</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => {
                      setWifiPass(e.target.value);
                      updateQrConfig('WIFI', { wifiPass: e.target.value });
                    }}
                    placeholder="Password123!"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-amber-800 font-medium"
                  />
                </div>
                <p className="sm:col-span-2 text-[10px] text-gray-500 font-medium">💡 When anyone points their iPhone or Android camera at this tag, their phone prompts: <span className="font-extrabold text-amber-700">"Join {wifiSsid} Network"</span> instantly without typing passwords!</p>
              </div>
            )}

            {qrMode === 'SMS' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Shop Support Phone Number:</label>
                  <input
                    type="text"
                    value={smsPhone}
                    onChange={(e) => {
                      setSmsPhone(e.target.value);
                      updateQrConfig('SMS', { smsPhone: e.target.value });
                    }}
                    placeholder="18005558873 or 555-123-4567"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-rose-500 outline-none font-mono text-rose-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Pre-Filled SMS Message Body:</label>
                  <input
                    type="text"
                    value={smsText}
                    onChange={(e) => {
                      setSmsText(e.target.value);
                      updateQrConfig('SMS', { smsText: e.target.value });
                    }}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-rose-500 outline-none font-medium text-gray-800"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-medium">💡 Scanning opens their phone's messaging app addressed to your shop with this pre-written service inquiry ready to send!</p>
              </div>
            )}

            {qrMode === 'EMAIL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Support Email Address:</label>
                  <input
                    type="text"
                    value={emailTo}
                    onChange={(e) => {
                      setEmailTo(e.target.value);
                      updateQrConfig('EMAIL', { emailTo: e.target.value });
                    }}
                    placeholder="service@midwestturftech.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 outline-none font-mono text-purple-900 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Default Email Subject:</label>
                  <input
                    type="text"
                    value={emailSub}
                    onChange={(e) => {
                      setEmailSub(e.target.value);
                      updateQrConfig('EMAIL', { emailSub: e.target.value });
                    }}
                    placeholder="Warranty / Part Inquiry"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-800"
                  />
                </div>
                <p className="sm:col-span-2 text-[10px] text-gray-500 font-medium">💡 Scanning launches their email app directly addressed to your service desk for warranty claims or maintenance appointments!</p>
              </div>
            )}
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
                {showPrice && (
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
                )}

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
                        value={qrUrl || 'https://shopify.com'}
                        showText={false}
                        height={34}
                      />
                      <span className="text-[8px] font-black text-gray-600 uppercase mt-0.5 tracking-tight">{qrLabel || 'Scan Specs'}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Employee Speed Toolbar: One-Tap Quantity Preset Chips & Quick Print */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 mb-2.5">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">FAST SELECT</span>
                  Select Copies:
                </span>
                <span className="text-emerald-400 font-mono text-xs font-black">{printQty} {printQty === 1 ? 'copy' : 'copies'} selected</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 4, 8, 12, 24, 48].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPrintQty(num)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all border ${
                      printQty === num
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-400/20 scale-105'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700/70 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-bold">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={printQty}
                    onChange={(e) => setPrintQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 bg-transparent text-white text-right font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-700/70">
              <button
                onClick={handleInstantQuickPrint}
                className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>⚡ Quick Print ({printQty}x Now)</span>
              </button>

              <button
                onClick={() => onAddToPrintQueue(createCurrentShelfPayload(printQty))}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 px-4 rounded-xl border border-slate-600 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add to Queue ({printQty}x)</span>
              </button>
            </div>
            
            <button
              onClick={onOpenPrintModal}
              className="w-full bg-slate-900/80 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold py-2 px-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Print Engine / Batch Queue Manager</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
