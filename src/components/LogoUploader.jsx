import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target.result);
        setSelectedPresetId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setCustomLogo(null);
    setSelectedPresetId(PRESET_LOGOS[0].id);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Brand Logo & Graphics
        </label>
        {(customLogo || selectedPresetId) && (
          <button
            onClick={clearLogo}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
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
            {customLogo ? 'Replace Custom Logo Image' : 'Upload Store Logo (PNG, SVG, JPG)'}
          </span>
          <span className="text-[10px] text-gray-400">High-res vector or transparent PNG recommended</span>
        </div>
      </div>

      {/* Preset Store Logos */}
      <div>
        <span className="text-xs font-medium text-gray-600 mb-2 block">Or choose a Brand Preset:</span>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_LOGOS.map((preset) => {
            const isSelected = !customLogo && selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setCustomLogo(null);
                  setSelectedPresetId(preset.id);
                }}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-medium ring-1 ring-emerald-600'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div
                  className="w-12 h-6 flex items-center justify-center shrink-0"
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
