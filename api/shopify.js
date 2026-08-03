// Vercel Serverless API Proxy for Shopify Admin & Storefront GraphQL API
// Increased limit to 250 products per page and comprehensive variant mapping

export default async function handler(req, res) {
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

  const effectiveSecret = clientSecret || accessToken || process.env.SHOPIFY_CLIENT_SECRET || '';
  const effectiveClientId = clientId || process.env.SHOPIFY_CLIENT_ID || '';

  if (!effectiveSecret) {
    return res.status(400).json({ error: 'Missing API Token or Client Secret' });
  }

  let finalAccessToken = effectiveSecret;

  // Execute Official Shopify OAuth Token Exchange if Client Secret shpss_ is provided
  if (effectiveSecret.startsWith('shpss_') || (effectiveClientId && !effectiveSecret.startsWith('shpat_'))) {
    try {
      const oauthUrl = `https://${cleanDomain}/admin/oauth/access_token`;
      const tokenRes = await fetch(oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: effectiveClientId,
          client_secret: effectiveSecret
        }).toString()
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          finalAccessToken = tokenData.access_token;
        }
      }
    } catch (e) {
      console.warn('OAuth Token exchange warning:', e);
    }
  }

  const isStorefront = finalAccessToken.startsWith('shpka_');
  const endpoint = isStorefront
    ? `https://${cleanDomain}/api/2024-07/graphql.json`
    : `https://${cleanDomain}/admin/api/2024-07/graphql.json`;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (isStorefront) {
    headers['X-Shopify-Storefront-Access-Token'] = finalAccessToken;
  } else {
    headers['X-Shopify-Access-Token'] = finalAccessToken;
  }

  // Increased fetch limit to 250 products & up to 25 variants per product
  const query = isStorefront
    ? `
      query getProducts {
        products(first: 250) {
          nodes {
            id
            title
            vendor
            productType
            featuredImage { url }
            variants(first: 25) {
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
        products(first: 250) {
          nodes {
            id
            title
            vendor
            productType
            featuredImage { url }
            variants(first: 25) {
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
        error: `Shopify API returned HTTP ${shopifyRes.status}: ${errorText}`
      });
    }

    const data = await shopifyRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Serverless Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error querying Shopify' });
  }
}
