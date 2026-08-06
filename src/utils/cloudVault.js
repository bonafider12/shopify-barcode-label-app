// Zero-config persistent Cloud Workspace Vault using Vercel Backend & JSON Storage API
// Ensures real-time multi-computer sync without manual file uploads/downloads or CORS/size errors

const CLOUD_API_BASE = 'https://extendsclass.com/api/json-storage/bin';

/**
 * Optimizes logo size using client-side canvas downscaling if base64 exceeds 25KB.
 * Ensures thermal printing logos remain crisp without exceeding cloud storage size ceilings.
 */
async function optimizeLogoForCloud(logoDataUrl) {
  if (!logoDataUrl || typeof logoDataUrl !== 'string') return logoDataUrl;
  if (logoDataUrl.length < 25000) return logoDataUrl; // Already lightweight (< 25KB)

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 280; // Crisp label print resolution
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/png');
        resolve(compressed.length < logoDataUrl.length ? compressed : logoDataUrl);
      };
      img.onerror = () => resolve(logoDataUrl);
      img.src = logoDataUrl;
    } catch (e) {
      resolve(logoDataUrl);
    }
  });
}

/**
 * Saves the entire app workspace to the live cloud database.
 * Automatically compresses logos and excludes redundant Shopify catalogs to prevent HTTP 413 Payload Too Large.
 * Routes via same-origin Vercel proxy (/api/vault) first to avoid CORS browser preflight issues.
 */
export async function saveToCloudVault(workspaceData, existingVaultId = null) {
  const optimizedLogo = await optimizeLogoForCloud(workspaceData.customLogo);

  // To prevent HTTP 413 (Payload Too Large) on cloud storage bins (which cap around 50KB),
  // we filter out massive raw Shopify product inventories that already auto-download from Shopify on every device anyway!
  const customLocalProducts = (workspaceData.products || [])
    .filter(p => !p.id || (!String(p.id).includes('shopify') && !String(p.id).includes('gid://')))
    .slice(0, 50);

  // Cap print queue & print history to prevent historical logs from bloating the cloud storage
  const cleanPrintQueue = (workspaceData.printQueue || []).slice(0, 30);
  const cleanPrintHistory = (workspaceData.printHistory || []).slice(0, 20);

  const payloadObj = {
    version: "2.1.0",
    updatedAt: new Date().toISOString(),
    products: customLocalProducts,
    printQueue: cleanPrintQueue,
    printHistory: cleanPrintHistory,
    customLogo: optimizedLogo || null,
    shopifyDomain: workspaceData.shopifyDomain || null,
    shopifyToken: workspaceData.shopifyToken || null,
    shopifyClientId: workspaceData.shopifyClientId || null
  };

  const payload = JSON.stringify(payloadObj);

  // 1. Attempt upload through Vercel serverless proxy (/api/vault)
  try {
    const proxyRes = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        vaultId: existingVaultId,
        payload: payloadObj
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.id) {
        return { id: data.id, isNew: data.isNew, success: true };
      }
    }
    if (proxyRes.status !== 404 && !proxyRes.ok) {
      const errorText = await proxyRes.text();
      console.warn('Proxy responded with error, trying fallback:', errorText);
      if (proxyRes.status === 413 || errorText.includes('413')) {
        throw new Error("Payload size exceeded cloud storage limit even after compression. Try clearing old print history or using a smaller logo.");
      }
    }
  } catch (proxyError) {
    if (proxyError.message && proxyError.message.includes('Payload size exceeded')) {
      throw proxyError;
    }
    console.warn('Vercel proxy unreachable (likely running in local mode), falling back to client-side storage:', proxyError.message);
  }

  // 2. Direct client-side fallback (using text/plain on POST to bypass browser OPTIONS preflight restrictions)
  try {
    if (existingVaultId && existingVaultId.trim() !== '') {
      const cleanId = existingVaultId.trim();
      const response = await fetch(`${CLOUD_API_BASE}/${cleanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Payload size (HTTP 413) exceeded cloud storage limit. Your brand presets and logo have been compressed—please try saving again!");
        }
        throw new Error(`Failed to update Vault ${cleanId} (HTTP ${response.status})`);
      }
      return { id: cleanId, isNew: false, success: true };
    } else {
      // Using text/plain is a W3C simple CORS header, preventing browser preflight block
      const response = await fetch(CLOUD_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: payload
      });
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Payload size (HTTP 413) exceeded cloud storage limit. Your brand presets and logo have been compressed—please try saving again!");
        }
        throw new Error(`Cloud storage rejected request (HTTP ${response.status})`);
      }
      const resData = await response.json();
      if (!resData.id) {
        throw new Error("Cloud database did not return a valid Vault ID.");
      }
      return { id: resData.id, isNew: true, success: true };
    }
  } catch (err) {
    console.error("Cloud Vault Save Error:", err);
    const friendlyMsg = err.message === 'Load failed' || err.message === 'Failed to fetch'
      ? "Network connection blocked by browser security. Please make sure you are accessing via your Vercel URL so the backend proxy can handle the transfer."
      : err.message;
    throw new Error(friendlyMsg);
  }
}

/**
 * Retrieves saved workspace data from the Cloud Vault using Vault ID.
 */
export async function loadFromCloudVault(vaultId) {
  if (!vaultId || vaultId.trim() === '') {
    throw new Error("Missing Cloud Vault ID");
  }
  const cleanId = vaultId.trim();

  // 1. Attempt read through Vercel serverless proxy (/api/vault)
  try {
    const proxyRes = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'load',
        vaultId: cleanId
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.data) {
        return data.data;
      }
    }
    if (proxyRes.status === 404) {
      const data = await proxyRes.json().catch(() => ({}));
      if (data.error && data.error.includes('not found')) {
        throw new Error(`Cloud Vault ID "${cleanId}" was not found. Check the ID and try again.`);
      }
    }
  } catch (proxyError) {
    if (proxyError.message.includes('not found')) throw proxyError;
    console.warn('Vercel proxy unreachable for loading, using client fallback:', proxyError.message);
  }

  // 2. Direct client-side fallback (GET requests do not require preflight in standard CORS)
  const response = await fetch(`${CLOUD_API_BASE}/${cleanId}`, {
    method: 'GET'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Cloud Vault ID "${cleanId}" was not found. Check the ID and try again.`);
    }
    throw new Error(`Could not reach Cloud Vault server (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!data || typeof data !== 'object') {
    throw new Error("Cloud Vault contained invalid workspace data.");
  }
  return data;
}
