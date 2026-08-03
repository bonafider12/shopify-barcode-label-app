import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Tag } from 'lucide-react';

export default function SearchableProductSelect({
  products = [],
  selectedProduct,
  onSelectProduct,
  label = "1. Select Product from Catalog"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.variant && p.variant.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.vendor && p.vendor.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 relative" ref={containerRef}>
      
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-600" />
          {label}
        </label>
        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          {products.length} products loaded
        </span>
      </div>

      {/* Selector Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-xs font-semibold p-3 rounded-xl border border-gray-300 bg-white hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none flex items-center justify-between gap-2 shadow-sm text-left transition-colors"
        >
          {selectedProduct ? (
            <div className="flex items-center gap-2.5 truncate">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt=""
                  className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <span className="text-sm">🏷️</span>
              )}
              <span className="font-bold text-gray-900 truncate">{selectedProduct.title}</span>
              <span className="text-gray-500 text-[11px] shrink-0">({selectedProduct.variant})</span>
              <span className="font-extrabold text-emerald-700 ml-auto shrink-0">
                ${Number(selectedProduct.price || 0).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Search and select a product...</span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-40 overflow-hidden flex flex-col max-h-80">
            
            {/* Search Input Box */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type product name, SKU, mower, brand, barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900 font-medium"
                />
              </div>
              <div className="text-[10px] text-gray-400 mt-1 flex justify-between px-1 font-medium">
                <span>Matching items: {filteredProducts.length}</span>
                <span>Search by name, SKU, or barcode</span>
              </div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
              {filteredProducts.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No products found matching "{searchQuery}"
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectProduct(p);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-emerald-50/60 transition-colors ${
                        isSelected ? 'bg-emerald-50 font-bold text-emerald-950' : 'text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs shrink-0">
                            🏷️
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-gray-900 truncate">{p.title}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2">
                            <span>{p.variant}</span>
                            <span>•</span>
                            <span className="font-mono">{p.sku}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-xs text-emerald-700">
                          ${Number(p.price || 0).toFixed(2)}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
