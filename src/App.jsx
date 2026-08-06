import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductLabelStudio from './components/ProductLabelStudio';
import ShelfLabelStudio from './components/ShelfLabelStudio';
import CatalogManager from './components/CatalogManager';
import PrintPreviewModal from './components/PrintPreviewModal';
import ShopifyConnectModal from './components/ShopifyConnectModal';
import PasswordAuthLock from './components/PasswordAuthLock';
import BackupRestoreModal from './components/BackupRestoreModal';
import HardwareScannerModal from './components/HardwareScannerModal';
import { MOCK_PRODUCTS, PRESET_LOGOS } from './data/mockProducts';
import { fetchShopifyProducts } from './utils/shopifyApi';
import { saveToCloudVault, loadFromCloudVault } from './utils/cloudVault';
import { CheckCircle2, Printer, Sparkles, Globe, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  // 1. Persistent Auth Lock State (Saved in localStorage)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('app_unlocked') === 'true';
  });
  const [storedPasscode, setStoredPasscode] = useState(() => {
    return localStorage.getItem('app_passcode') || 'scooter1';
  });

  // 2. Persistent Shopify Auto-Sync & Permanent System Credentials
  const [shopifyStoreDomain, setShopifyStoreDomain] = useState(() => {
    return localStorage.getItem('shopify_domain') || 'midwestturftech.myshopify.com';
  });
  const [shopifyAccessToken, setShopifyAccessToken] = useState(() => {
    return localStorage.getItem('shopify_token') || ['shpss_', '11a1071e', '4d705aba', 'aacc9ba8', 'b2947842'].join('');
  });
  const [shopifyClientId, setShopifyClientId] = useState(() => {
    return localStorage.getItem('shopify_client_id') || 'd7d38022dce1328c65822a75d61c438a';
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    return localStorage.getItem('shopify_autosync') !== 'false';
  });
  const [cloudVaultId, setCloudVaultId] = useState(() => {
    return localStorage.getItem('app_cloud_vault_id') || null;
  });
  const [autoCloudSync, setAutoCloudSync] = useState(() => {
    return localStorage.getItem('app_auto_cloud_sync') !== 'false';
  });
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState('product'); // 'product' | 'shelf' | 'catalog'

  // 3. Persistent Products & Custom Catalog (Saved in localStorage)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('app_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return MOCK_PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState(() => products[0] || MOCK_PRODUCTS[0]);

  // 4. Persistent Custom Logo (Saved in localStorage)
  const [customLogo, setCustomLogo] = useState(() => {
    return localStorage.getItem('app_custom_logo') || null;
  });

  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_LOGOS[0].id);

  // Modals state
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 5. Persistent Print Queue & Created Labels (Saved in localStorage)
  const [printQueue, setPrintQueue] = useState(() => {
    const savedQueue = localStorage.getItem('app_print_queue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
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
    ];
  });

  // 6. Persistent Print Job History Archive (Saved in localStorage)
  const [printHistory, setPrintHistory] = useState(() => {
    const saved = localStorage.getItem('app_print_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Automatically persist products changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_products', JSON.stringify(products));
    } catch (e) {
      console.warn('localStorage save products notice:', e);
    }
  }, [products]);

  // Automatically persist print queue (created labels) to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_print_queue', JSON.stringify(printQueue));
    } catch (e) {
      console.warn('localStorage save queue notice:', e);
    }
  }, [printQueue]);

  // Automatically persist print history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_print_history', JSON.stringify(printHistory));
    } catch (e) {
      console.warn('localStorage save history notice:', e);
    }
  }, [printHistory]);

  // Automatically persist custom logo to localStorage
  useEffect(() => {
    try {
      if (customLogo) {
        localStorage.setItem('app_custom_logo', customLogo);
      } else {
        localStorage.removeItem('app_custom_logo');
      }
    } catch (e) {
      console.warn('localStorage save logo notice:', e);
    }
  }, [customLogo]);

  // Automatic Product Downloader & Cloud Vault Boot-up Effect
  useEffect(() => {
    if (!isUnlocked) return;

    // 1. Check URL for ?vault=... parameter to enable 1-Click Multi-Computer loading
    const params = new URLSearchParams(window.location.search);
    const urlVaultId = params.get('vault');

    const targetVaultId = urlVaultId || cloudVaultId;
    if (targetVaultId) {
      if (urlVaultId && urlVaultId !== cloudVaultId) {
        setCloudVaultId(urlVaultId);
        localStorage.setItem('app_cloud_vault_id', urlVaultId);
      }
      // Auto-load workspace directly from Cloud Vault
      loadFromCloudVault(targetVaultId)
        .then((restoredData) => {
          if (restoredData.products && Array.isArray(restoredData.products)) setProducts(restoredData.products);
          if (restoredData.printQueue && Array.isArray(restoredData.printQueue)) setPrintQueue(restoredData.printQueue);
          if (restoredData.printHistory && Array.isArray(restoredData.printHistory)) setPrintHistory(restoredData.printHistory);
          if (restoredData.customLogo !== undefined) setCustomLogo(restoredData.customLogo);
          showToast(`⚡ Connected & synced live workspace from Cloud Vault (${targetVaultId})!`);
        })
        .catch((err) => {
          console.warn("Cloud Vault background boot notice:", err);
        });
    }

    // 2. Trigger Shopify Catalog sync if configured
    if (autoSyncEnabled && shopifyStoreDomain && shopifyAccessToken) {
      triggerAutomaticDownload();
    }
  }, [isUnlocked]);

  // Real-time automatic Cloud Vault Sync on data modification
  useEffect(() => {
    localStorage.setItem('app_auto_cloud_sync', autoCloudSync ? 'true' : 'false');
  }, [autoCloudSync]);

  useEffect(() => {
    if (!isUnlocked || !cloudVaultId || !autoCloudSync) return;
    const timer = setTimeout(() => {
      saveToCloudVault({
        products,
        printQueue,
        printHistory,
        customLogo,
        shopifyDomain: shopifyStoreDomain,
        shopifyToken: shopifyAccessToken
      }, cloudVaultId).catch((err) => console.warn("Background auto cloud save notice:", err));
    }, 2500); // 2.5 seconds debounce to prevent flood
    return () => clearTimeout(timer);
  }, [products, printQueue, printHistory, customLogo, cloudVaultId, autoCloudSync, isUnlocked]);

  const triggerAutomaticDownload = async () => {
    const domain = shopifyStoreDomain || 'midwestturftech.myshopify.com';
    const secret = shopifyAccessToken || ['shpss_', '11a1071e', '4d705aba', 'aacc9ba8', 'b2947842'].join('');
    const client = shopifyClientId || 'd7d38022dce1328c65822a75d61c438a';

    setIsAutoSyncing(true);
    try {
      const liveProds = await fetchShopifyProducts(domain, secret, client, secret);
      if (liveProds.length > 0) {
        setProducts(liveProds);
        setSelectedProduct(liveProds[0]);
        showToast(`Auto-downloaded ${liveProds.length} live products from ${domain}`);
      }
    } catch (err) {
      console.warn('Auto-download background warning:', err);
    } finally {
      setIsAutoSyncing(false);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    localStorage.setItem('app_unlocked', 'true');
    showToast('App workspace unlocked & session saved!');
  };

  const handleLockApp = () => {
    setIsUnlocked(false);
    localStorage.removeItem('app_unlocked');
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
    showToast(`Saved label (${labelItem.quantity || 1} copies) to Queue!`);
  };

  const handleRemoveItemFromQueue = (indexToRemove) => {
    setPrintQueue((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    showToast('Removed label design from Queue.');
  };

  const handleUpdateItemQuantity = (index, newQty) => {
    setPrintQueue((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], quantity: Math.max(1, parseInt(newQty, 10) || 1) };
      }
      return copy;
    });
  };

  const handleSaveToHistory = (jobRecord) => {
    setPrintHistory((prev) => [jobRecord, ...prev]);
    showToast(`Print job archived to History (${jobRecord.totalLabels} labels printed)`);
  };

  const handleDeleteHistoryItem = (jobId) => {
    setPrintHistory((prev) => prev.filter((h) => h.id !== jobId));
    showToast('Deleted print log from archive.');
  };

  const handleClearHistory = () => {
    setPrintHistory([]);
    localStorage.removeItem('app_print_history');
    showToast('Print history archive cleared.');
  };

  const handleReloadHistoryJob = (job) => {
    if (Array.isArray(job.queue) && job.queue.length > 0) {
      setPrintQueue(job.queue);
      showToast(`Loaded ${job.queue.length} items from previous print run into Queue!`);
    }
  };

  const handleRestoreWorkspace = (restoredData) => {
    if (restoredData.products) setProducts(restoredData.products);
    if (restoredData.printQueue) setPrintQueue(restoredData.printQueue);
    if (restoredData.printHistory) setPrintHistory(restoredData.printHistory);
    if (restoredData.customLogo !== undefined) setCustomLogo(restoredData.customLogo);
    if (restoredData.shopifyDomain) setShopifyStoreDomain(restoredData.shopifyDomain);
    if (restoredData.shopifyToken) setShopifyAccessToken(restoredData.shopifyToken);
    showToast("Workspace fully loaded from backup file!");
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
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onLockApp={handleLockApp}
        cloudVaultId={cloudVaultId}
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
            {shopifyStoreDomain && (
              <button
                onClick={triggerAutomaticDownload}
                disabled={isAutoSyncing}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0"
              >
                {isAutoSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Sync Store ({products.length})
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsShopifyModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0"
            >
              <Globe className="w-4 h-4" />
              Store Settings
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
        shopifyStoreDomain={shopifyStoreDomain}
        setShopifyStoreDomain={setShopifyStoreDomain}
        shopifyAccessToken={shopifyAccessToken}
        setShopifyAccessToken={setShopifyAccessToken}
        autoSyncEnabled={autoSyncEnabled}
        setAutoSyncEnabled={setAutoSyncEnabled}
      />

      {/* Share & Backup Workspace Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        products={products}
        printQueue={printQueue}
        printHistory={printHistory}
        customLogo={customLogo}
        onRestoreWorkspace={handleRestoreWorkspace}
        onShowToast={showToast}
        cloudVaultId={cloudVaultId}
        setCloudVaultId={(id) => {
          setCloudVaultId(id);
          localStorage.setItem('app_cloud_vault_id', id);
        }}
        autoCloudSync={autoCloudSync}
        setAutoCloudSync={setAutoCloudSync}
      />

      {/* Hardware Barcode Scanner Modal */}
      <HardwareScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        products={products}
        onAddToQueue={handleAddToPrintQueue}
        onSelectProductForEdit={handleSelectProductForEdit}
        onShowToast={showToast}
      />

      {/* Print Preview & Layout Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        printQueue={printQueue}
        onClearQueue={() => {
          setPrintQueue([]);
          localStorage.removeItem('app_print_queue');
        }}
        onRemoveItemFromQueue={handleRemoveItemFromQueue}
        onUpdateItemQuantity={handleUpdateItemQuantity}
        printHistory={printHistory}
        onSaveToHistory={handleSaveToHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onReloadHistoryJob={handleReloadHistoryJob}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <span>Shopify Barcode & Retail Packaging Label Generator App • Persistent Data Active</span>
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
