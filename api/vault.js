// Vercel Serverless Backend Proxy for Cloud Workspace Vault
// Eliminates browser CORS preflight restrictions and ensures robust 1-Click Multi-Computer Sync

const CLOUD_API_BASE = 'https://extendsclass.com/api/json-storage/bin';

export default async function handler(req, res) {
  // Set CORS headers so it also functions seamlessly across staging or localhost origins
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, vaultId, payload } = req.body || {};

  try {
    if (action === 'save') {
      const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);

      if (vaultId && vaultId.trim() !== '') {
        // Update existing cloud storage bin
        const cleanId = vaultId.trim();
        const response = await fetch(`${CLOUD_API_BASE}/${cleanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: stringified
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to update Vault ${cleanId} (HTTP ${response.status}: ${errText})`);
        }
        return res.status(200).json({ success: true, id: cleanId, isNew: false });
      } else {
        // Create brand new cloud storage bin
        const response = await fetch(CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: stringified
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Cloud database rejected save request (HTTP ${response.status}: ${errText})`);
        }

        const resData = await response.json();
        if (!resData.id) {
          throw new Error('Cloud storage server did not return a valid Vault ID.');
        }

        return res.status(200).json({ success: true, id: resData.id, isNew: true });
      }
    } else if (action === 'load') {
      if (!vaultId || vaultId.trim() === '') {
        return res.status(400).json({ error: 'Missing Cloud Vault ID' });
      }
      const cleanId = vaultId.trim();
      const response = await fetch(`${CLOUD_API_BASE}/${cleanId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: `Cloud Vault ID "${cleanId}" was not found.` });
        }
        throw new Error(`Could not reach Cloud Vault server (HTTP ${response.status})`);
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ error: 'Invalid operation action specified.' });
    }
  } catch (err) {
    console.error('Vercel Cloud Vault Backend Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Backend Error communicating with Cloud Vault database' });
  }
}
