import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Vite plugin to handle /api/shopify serverless proxy during local npm run dev
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

            const effectiveToken = accessToken || clientSecret || '';
            const effectiveClientId = clientId || '';

            const isStorefront = effectiveToken.startsWith('shpka_');
            const isAppSecret = effectiveToken.startsWith('shpss_');

            const endpoint = isStorefront
              ? `https://${cleanDomain}/api/2024-07/graphql.json`
              : `https://${cleanDomain}/admin/api/2024-07/graphql.json`;

            const headers = { 'Content-Type': 'application/json' };
            if (isStorefront) {
              headers['X-Shopify-Storefront-Access-Token'] = effectiveToken;
            } else {
              headers['X-Shopify-Access-Token'] = effectiveToken;
              if (effectiveClientId) {
                headers['X-Shopify-Client-Id'] = effectiveClientId;
              }
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
              if (shopifyRes.status === 401 && isAppSecret) {
                res.statusCode = 401;
                res.end(
                  JSON.stringify({
                    error:
                      'Shopify HTTP 401 Unauthorized: "shpss_..." is your Partner Client Secret. Shopify requires an Admin API Access Token starting with "shpat_..." (from Dev Dashboard > Install App) or a Storefront Access Token ("shpka_...").'
                  })
                );
                return;
              }
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
