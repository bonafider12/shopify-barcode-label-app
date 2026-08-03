import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductLabelStudio from './components/ProductLabelStudio';
import ShelfLabelStudio from './components/ShelfLabelStudio';
import CatalogManager from './components/CatalogManager';
import PrintPreviewModal from './components/PrintPreviewModal';
import ShopifyConnectModal from './components/ShopifyConnectModal';
import PasswordAuthLock from './components/PasswordAuthLock';
import { MOCK_PRODUCTS, PRESET_LOGOS } from './data/mockProducts';
import { CheckCircle2, Printer, Sparkles, Globe, Lock } from 'lucide-react';

export default function App() {
  // Password Protection Auth State
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('app_unlocked') === 'true';
  });
  const [storedPasscode, setStoredPasscode] = useState(() => {
    return localStorage.getItem('app_passcode') || 'admin123';
  });

  const [activeTab, setActiveTab] = useState('product'); // 'product' | 'shelf' | 'catalog'
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [customLogo, setCustomLogo] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_LOGOS[0].id);

  // Modals state
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Print Queue
  const [printQueue, setPrintQueue] = useState([
    {
      product: MOCK_PRODUCTS[0],
      title: MOCK_PRODUCTS[0].title,
      variant: MOCK_PRODUCTS[0].variant,
      price: MOCK_PRODUCTS[0].price,
      sku: MOCK_PRODUCTS[0].sku,
      barcode: MOCK_PRODUCTS[0].barcode,
      barcodeType: MOCK_PRODUCTS[0].barcodeType,
      selectedPresetId: PRESET_LOGOS[0].id,
      quantity: 10
    }
  ]);

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('app_unlocked', 'true');
    showToast('App workspace unlocked successfully!');
  };

  const handleLockApp = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('app_unlocked');
    showToast('App workspace locked.');
  };

  const handleUpdatePasscode = (newPass) => {
    setStoredPasscode(newPass);
    localStorage.setItem('app_passcode', newPass);
    showToast('Master passcode updated!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToPrintQueue = (labelItem) => {
    setPrintQueue((prev) => [...prev, labelItem]);
    showToast(`Added label (${labelItem.quantity || 1} copies) to Print Queue!`);
  };

  const handleRemoveItemFromQueue = (indexToRemove) => {
    setPrintQueue((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    showToast('Removed label design from Print Queue.');
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct?.id === productId) {
      const remaining = products.filter((p) => p.id !== productId);
      if (remaining.length > 0) setSelectedProduct(remaining[0]);
    }
    showToast('Product deleted from inventory catalog.');
  };

  const handleBatchAddToQueue = (items) => {
    const formatted = items.map((item) => ({
      product: item.product,
      title: item.product.title,
      variant: item.product.variant,
      price: item.product.price,
      sku: item.product.sku,
      barcode: item.product.barcode,
      barcodeType: item.product.barcodeType || 'CODE128',
      selectedPresetId: selectedPresetId,
      customLogo: customLogo,
      quantity: item.quantity
    }));
    setPrintQueue((prev) => [...prev, ...formatted]);
    showToast(`Added ${items.length} product labels to Print Queue!`);
    setIsPrintModalOpen(true);
  };

  const handleImportShopifyProducts = (newProducts) => {
    setProducts(newProducts);
    if (newProducts.length > 0) {
      setSelectedProduct(newProducts[0]);
    }
    setActiveTab('catalog');
  };

  const handleSelectProductForEdit = (prod) => {
    setSelectedProduct(prod);
    setActiveTab('product');
  };

  // If locked, render Password Lock Overlay Screen
  if (!isUnlocked) {
    return (
      <PasswordAuthLock
        isUnlocked={isUnlocked}
        onUnlockSuccess={handleUnlockSuccess}
        storedPasscode={storedPasscode}
        onUpdatePasscode={handleUpdatePasscode}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      
      {/* Top Shopify Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProductsCount={printQueue.length}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenShopifyConnectModal={() => setIsShopifyModalOpen(true)}
        onLockApp={handleLockApp}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Info */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-black tracking-tight">
                {activeTab === 'product'
                  ? 'Retail Product Packaging & Barcode Label Designer'
                  : activeTab === 'shelf'
                  ? 'Retail Store Shelf Talkers & Channel Strip Designer'
                  : 'Shopify Inventory & Catalog Manager'}
              </h1>
            </div>
            <p className="text-xs text-slate-300">
              Create high-resolution retail packaging labels & shelf tags with custom store logos, vector barcodes, and multi-format sheet printing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShopifyModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0"
            >
              <Globe className="w-4 h-4" />
              Connect Live Shopify Store
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
            >
              <Printer className="w-4 h-4" />
              View Queue ({printQueue.length} items)
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'product' && (
          <ProductLabelStudio
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            customLogo={customLogo}
            setCustomLogo={setCustomLogo}
            selectedPresetId={selectedPresetId}
            setSelectedPresetId={setSelectedPresetId}
            onAddToPrintQueue={handleAddToPrintQueue}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'shelf' && (
          <ShelfLabelStudio
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            customLogo={customLogo}
            selectedPresetId={selectedPresetId}
            onAddToPrintQueue={handleAddToPrintQueue}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogManager
            products={products}
            setProducts={setProducts}
            onBatchAddToQueue={handleBatchAddToQueue}
            onSelectProductForEdit={handleSelectProductForEdit}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Shopify Store Connect Modal */}
      <ShopifyConnectModal
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        onImportProducts={handleImportShopifyProducts}
        onShowToast={showToast}
      />

      {/* Print Preview & Layout Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        printQueue={printQueue}
        onClearQueue={() => setPrintQueue([])}
        onRemoveItemFromQueue={handleRemoveItemFromQueue}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <span>Shopify Barcode & Retail Packaging Label Generator App • Powered by Vector SVG Barcode Engine</span>
        <button
          onClick={handleLockApp}
          className="text-slate-400 hover:text-slate-700 underline font-medium ml-2"
        >
          Lock App
        </button>
      </footer>

    </div>
  );
}
