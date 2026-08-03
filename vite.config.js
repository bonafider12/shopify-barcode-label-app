import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Vite plugin implementing official Shopify OAuth Client Credentials Token Exchange
// https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets
function shopifyDevApiProxy() {
  return {
    name: 'shopify-dev-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/shopify', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { storeDomain, accessToken, clientId, clientSecret } = JSON.parse(body || '{}');
            const targetDomain = storeDomain || 'midwestturftech.myshopify.com';
            let cleanDomain = targetDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
            if (!cleanDomain.includes('.myshopify.com')) {
              cleanDomain = `${cleanDomain}.myshopify.com`;
            }

            const effectiveSecret = clientSecret || accessToken || '';
            const effectiveClientId = clientId || '';

            let finalAccessToken = effectiveSecret;

            // Execute Official Shopify OAuth Client Credentials Token Exchange
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
                } else {
                  const errText = await tokenRes.text();
                  console.warn('Local OAuth Exchange Notice HTTP', tokenRes.status, errText);
                }
              } catch (oauthErr) {
                console.warn('OAuth Exchange exception:', oauthErr);
              }
            }

            const isStorefront = finalAccessToken.startsWith('shpka_');
            const endpoint = isStorefront
              ? `https://${cleanDomain}/api/2024-07/graphql.json`
              : `https://${cleanDomain}/admin/api/2024-07/graphql.json`;

            const headers = { 'Content-Type': 'application/json' };
            if (isStorefront) {
              headers['X-Shopify-Storefront-Access-Token'] = finalAccessToken;
            } else {
              headers['X-Shopify-Access-Token'] = finalAccessToken;
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

            const shopifyRes = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({ query })
            });

            const data = await shopifyRes.json();

            res.setHeader('Content-Type', 'application/json');
            if (!shopifyRes.ok) {
              res.statusCode = shopifyRes.status;
              res.end(
                JSON.stringify({
                  error: `Shopify returned HTTP ${shopifyRes.status}: ${JSON.stringify(data)}`
                })
              );
              return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch (err) {
            console.error('Local Vite Proxy Error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Internal proxy error' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), shopifyDevApiProxy()],
  server: {
    port: 3000,
    open: false
  }
});
