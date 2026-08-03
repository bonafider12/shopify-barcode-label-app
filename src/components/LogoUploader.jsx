import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, RefreshCw, Plus, Trash2, Tag, BookmarkPlus } from 'lucide-react';
import { PRESET_LOGOS } from '../data/mockProducts';

export default function LogoUploader({
  customLogo,
  setCustomLogo,
  selectedPresetId,
  setSelectedPresetId,
  logoScale = 100,
  setLogoScale,
  logoPosition = 'top-center',
  setLogoPosition
}) {
  const fileInputRef = useRef(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // 1. Persistent Custom Saved Brand Presets in localStorage
  const [customBrandPresets, setCustomBrandPresets] = useState(() => {
    const saved = localStorage.getItem('app_saved_brand_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_saved_brand_presets', JSON.stringify(customBrandPresets));
    } catch (e) {
      console.warn('localStorage brand presets save notice:', e);
    }
  }, [customBrandPresets]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target.result);
        setSelectedPresetId(null);
        setShowSaveForm(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setCustomLogo(null);
    setSelectedPresetId(PRESET_LOGOS[0].id);
    setShowSaveForm(false);
  };

  const handleSaveCurrentAsPreset = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const brandPreset = {
      id: `custom_brand_${Date.now()}`,
      name: newBrandName.trim(),
      logoData: customLogo || null,
      presetSvgId: !customLogo ? selectedPresetId : null
    };

    setCustomBrandPresets((prev) => [...prev, brandPreset]);
    setNewBrandName('');
    setShowSaveForm(false);
  };

  const handleDeleteCustomPreset = (idToDelete, e) => {
    e.stopPropagation();
    setCustomBrandPresets((prev) => prev.filter((b) => b.id !== idToDelete));
  };

  const handleSelectBrandPreset = (brand) => {
    if (brand.logoData) {
      setCustomLogo(brand.logoData);
      setSelectedPresetId(null);
    } else if (brand.presetSvgId) {
      setCustomLogo(null);
      setSelectedPresetId(brand.presetSvgId);
    } else if (brand.svg) {
      setCustomLogo(null);
      setSelectedPresetId(brand.id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Brand Logo & Graphics Presets
        </label>
        {(customLogo || selectedPresetId) && (
          <button
            onClick={clearLogo}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Reset Logo
          </button>
        )}
      </div>

      {/* Upload button or Drag area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/30 group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center gap-1">
          <Upload className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          <span className="text-xs font-medium text-gray-700">
            {customLogo ? 'Replace Active Brand Logo Image' : 'Upload Store / Brand Logo (PNG, SVG, JPG)'}
          </span>
          <span className="text-[10px] text-gray-400">High-res vector or transparent PNG recommended</span>
        </div>
      </div>

      {/* Save Brand Preset Form */}
      {(showSaveForm || customLogo) && (
        <form onSubmit={handleSaveCurrentAsPreset} className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" />
              Save Logo as Brand Preset
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Midwest Turf Tech, Segway, Brother..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="text-xs p-2 rounded-md border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none flex-1 font-medium"
            />
            <button
              type="submit"
              disabled={!newBrandName.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-3 py-2 rounded-md shrink-0 flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Save Brand
            </button>
          </div>
        </form>
      )}

      {/* Brand Presets Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Choose Brand Preset:</span>
          <span className="text-[10px] text-gray-400">{PRESET_LOGOS.length + customBrandPresets.length} presets available</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          
          {/* Custom Saved Brand Presets */}
          {customBrandPresets.map((brand) => {
            const isSelected = customLogo === brand.logoData;
            return (
              <div
                key={brand.id}
                onClick={() => handleSelectBrandPreset(brand)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  {brand.logoData ? (
                    <img src={brand.logoData} alt="" className="w-6 h-6 rounded object-contain shrink-0 border border-gray-200" />
                  ) : (
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="text-xs truncate">{brand.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustomPreset(brand.id, e)}
                    title="Delete Brand Preset"
                    className="text-gray-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Built-in Default Brand Presets */}
          {PRESET_LOGOS.map((preset) => {
            const isSelected = !customLogo && selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectBrandPreset(preset)}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div
                  className="w-10 h-5 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{ __html: preset.svg }}
                />
                <span className="text-xs truncate">{preset.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
              </button>
            );
          })}

        </div>
      </div>

      {/* Adjust Scale & Alignment Controls */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <label className="text-xs text-gray-600 font-medium block mb-1">
            Logo Scale ({logoScale}%)
          </label>
          <input
            type="range"
            min="50"
            max="180"
            value={logoScale}
            onChange={(e) => setLogoScale(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 font-medium block mb-1">Positioning</label>
          <select
            value={logoPosition}
            onChange={(e) => setLogoPosition(e.target.value)}
            className="w-full text-xs p-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="top-center">Top Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="inline-left">Inline with Title</option>
          </select>
        </div>
      </div>

    </div>
  );
}
