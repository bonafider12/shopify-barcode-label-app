// Vercel Serverless API Proxy for Shopify
// Supports Client ID & Client Secret (shpss_...), Admin Access Tokens (shpat_...), and Storefront Tokens (shpka_...)

export default async function handler(req, res) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Shopify-Access-Token, X-Shopify-Domain'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { storeDomain, accessToken, clientId, clientSecret } = req.body || {};

  const targetDomain = storeDomain || process.env.SHOPIFY_STORE_DOMAIN || 'midwestturftech.myshopify.com';
  let cleanDomain = targetDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

  const effectiveToken = accessToken || clientSecret || process.env.SHOPIFY_CLIENT_SECRET || '';
  const effectiveClientId = clientId || process.env.SHOPIFY_CLIENT_ID || '';

  if (!effectiveToken) {
    return res.status(400).json({ error: 'Missing API Token or Client Secret' });
  }

  const isStorefront = effectiveToken.startsWith('shpka_');
  const isAppSecret = effectiveToken.startsWith('shpss_');

  const endpoint = isStorefront
    ? `https://${cleanDomain}/api/2024-07/graphql.json`
    : `https://${cleanDomain}/admin/api/2024-07/graphql.json`;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (isStorefront) {
    headers['X-Shopify-Storefront-Access-Token'] = effectiveToken;
  } else if (isAppSecret) {
    headers['X-Shopify-Access-Token'] = effectiveToken;
    if (effectiveClientId) {
      headers['X-Shopify-Client-Id'] = effectiveClientId;
    }
  } else {
    headers['X-Shopify-Access-Token'] = effectiveToken;
  }

  const query = isStorefront
    ? `
      query getProducts {
        products(first: 50) {
          nodes {
            id
            title
            vendor
            productType
            featuredImage { url }
            variants(first: 10) {
              nodes {
                id
                title
                price { amount }
                compareAtPrice { amount }
                sku
                barcode
              }
            }
          }
        }
      }
    `
    : `
      query getProducts {
        products(first: 50) {
          nodes {
            id
            title
            vendor
            productType
            featuredImage { url }
            variants(first: 10) {
              nodes {
                id
                title
                price
                compareAtPrice
                sku
                barcode
              }
            }
          }
        }
      }
    `;

  try {
    const shopifyRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!shopifyRes.ok) {
      const errorText = await shopifyRes.text();
      return res.status(shopifyRes.status).json({
        error: `Shopify responded with HTTP ${shopifyRes.status}: ${errorText}`
      });
    }

    const data = await shopifyRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Serverless Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error querying Shopify' });
  }
}
