import React, { useState } from 'react';
import { Search, Plus, CheckSquare, Square, Printer, Filter, ShoppingBag, FileSpreadsheet, Trash2 } from 'lucide-react';

export default function CatalogManager({
  products,
  setProducts,
  onBatchAddToQueue,
  onSelectProductForEdit
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set(products.map(p => p.id)));
  const [quantities, setQuantities] = useState(
    products.reduce((acc, p) => ({ ...acc, [p.id]: 10 }), {})
  );

  // New Product Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVariant, setNewVariant] = useState('');
  const [newPrice, setNewPrice] = useState(19.99);
  const [newSKU, setNewSKU] = useState('');
  const [newBarcode, setNewBarcode] = useState('');

  // Filter products
  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProductIds(next);
  };

  const handleQuantityChange = (id, val) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, parseInt(val, 10) || 1)
    }));
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const newProd = {
      id: `prod_${Date.now()}`,
      title: newTitle,
      variant: newVariant || 'Standard',
      sku: newSKU || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: newBarcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      barcodeType: 'CODE128',
      price: parseFloat(newPrice) || 19.99,
      unitPrice: `$${newPrice} / ea`,
      vendor: 'My Store',
      category: 'Custom Added',
      origin: 'Made in USA',
      location: 'Aisle 1 • Shelf A'
    };
    setProducts([newProd, ...products]);
    setSelectedProductIds(new Set([...selectedProductIds, newProd.id]));
    setQuantities(prev => ({ ...prev, [newProd.id]: 10 }));
    setShowAddModal(false);
    setNewTitle('');
    setNewVariant('');
    setNewSKU('');
    setNewBarcode('');
  };

  const handleBatchPrint = () => {
    const selectedList = products.filter((p) => selectedProductIds.has(p.id));
    const queueItems = selectedList.map((p) => ({
      product: p,
      quantity: quantities[p.id] || 10
    }));
    onBatchAddToQueue(queueItems);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Product
          </button>

          <button
            onClick={handleBatchPrint}
            disabled={selectedProductIds.size === 0}
            className={`font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              selectedProductIds.size > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            Generate Labels for Selected ({selectedProductIds.size})
          </button>
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-emerald-600">
                    {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Product Details</th>
                <th className="p-4">SKU & Barcode</th>
                <th className="p-4">Price</th>
                <th className="p-4">Location</th>
                <th className="p-4 w-32">Print Copies</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="p-4">
                      <button
                        onClick={() => toggleSelectProduct(p.id)}
                        className="text-gray-400 hover:text-emerald-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold shrink-0">
                            🏷️
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{p.title}</div>
                          <div className="text-[11px] text-gray-500">{p.variant} • {p.vendor}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <div className="font-semibold text-gray-800">{p.sku}</div>
                      <div className="text-gray-500">{p.barcode} ({p.barcodeType || 'CODE128'})</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-gray-900">${p.price.toFixed(2)}</div>
                      {p.compareAtPrice && (
                        <div className="text-[10px] text-gray-400 line-through">
                          ${p.compareAtPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {p.location || 'Aisle 1'}
                      </span>
                    </td>

                    <td className="p-4">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={quantities[p.id] || 10}
                        onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                        className="w-16 text-xs p-1.5 rounded-lg border border-gray-300 font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectProductForEdit(p)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        Customize Label
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Add New Inventory Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Artisan Honey Jar"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Variant / Size</label>
                <input
                  type="text"
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  placeholder="e.g. 500g Glass Jar"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={newSKU}
                    onChange={(e) => setNewSKU(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Barcode Code</label>
                <input
                  type="text"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
