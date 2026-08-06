// Zero-config persistent Cloud Workspace Vault using Vercel Backend & JSON Storage API
// Ensures real-time multi-computer sync without manual file uploads/downloads or CORS errors

const CLOUD_API_BASE = 'https://extendsclass.com/api/json-storage/bin';

/**
 * Saves the entire app workspace to the live cloud database.
 * Routes via same-origin Vercel proxy (/api/vault) first to avoid CORS browser preflight issues.
 */
export async function saveToCloudVault(workspaceData, existingVaultId = null) {
  const payload = JSON.stringify({
    version: "2.0.0",
    updatedAt: new Date().toISOString(),
    products: workspaceData.products || [],
    printQueue: workspaceData.printQueue || [],
    printHistory: workspaceData.printHistory || [],
    customLogo: workspaceData.customLogo || null,
    shopifyDomain: workspaceData.shopifyDomain || null,
    shopifyToken: workspaceData.shopifyToken || null,
    shopifyClientId: workspaceData.shopifyClientId || null
  });

  // 1. Attempt upload through Vercel serverless proxy (/api/vault)
  try {
    const proxyRes = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        vaultId: existingVaultId,
        payload: JSON.parse(payload)
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
    }
  } catch (proxyError) {
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
      // Could mean API route doesn't exist locally OR Vault ID wasn't found
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
