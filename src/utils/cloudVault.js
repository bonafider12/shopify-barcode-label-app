// Zero-config persistent Cloud Workspace Vault using free CORS JSON Storage API
// Allows real-time multi-computer sync without manual file uploads/downloads

const CLOUD_API_BASE = 'https://extendsclass.com/api/json-storage/bin';

/**
 * Saves the entire app workspace to the live cloud database.
 * If existingVaultId is provided, updates existing vault; otherwise creates a brand new vault.
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
      const response = await fetch(CLOUD_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });
      if (!response.ok) {
        throw new Error(`Cloud storage API rejected request (HTTP ${response.status})`);
      }
      const resData = await response.json();
      if (!resData.id) {
        throw new Error("Cloud database did not return a valid Vault ID.");
      }
      return { id: resData.id, isNew: true, success: true };
    }
  } catch (err) {
    console.error("Cloud Vault Save Error:", err);
    throw err;
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
  const response = await fetch(`${CLOUD_API_BASE}/${cleanId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
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
