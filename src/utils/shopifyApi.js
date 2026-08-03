// Utility to interact with Shopify Admin GraphQL API via Serverless Proxy or Direct

export async function fetchShopifyProducts(storeDomain, accessToken) {
  let cleanDomain = storeDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

  // Diagnostic check for token prefix
  if (accessToken.startsWith('shpss_')) {
    throw new Error(
      'Notice: "shpss_..." is a Partner Client Secret (used for app installs). For Admin API product queries, Shopify requires an Admin API Access Token starting with "shpat_..." (from Store Admin > Settings > Apps > Develop Apps > Install App).'
    );
  }

  // Try Vercel Serverless Proxy first to bypass browser CORS
  let response;
  let data;

  try {
    response = await fetch('/api/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ storeDomain: cleanDomain, accessToken })
    });

    if (response.ok) {
      data = await response.json();
    }
  } catch (e) {
    // If running locally without Vercel serverless functions, fallback to direct fetch
    console.warn('Proxy endpoint unavailable, trying direct fetch...', e);
  }

  // Direct fetch fallback
  if (!data) {
    const endpoint = `https://${cleanDomain}/admin/api/2024-07/graphql.json`;
    const query = `
      query getProducts {
        products(first: 50) {
          nodes {
            id
            title
            vendor
            productType
            featuredImage {
              url
            }
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
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Shopify API error HTTP ${response.status}. Ensure token has read_products scope.`);
      }
      data = await response.json();
    } catch (err) {
      throw new Error(
        'Browser CORS blocked direct fetch to myshopify.com. Deploy to Vercel (where our /api/shopify serverless proxy handles it automatically) or use the Shopify CSV Import tab!'
      );
    }
  }

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'Shopify GraphQL query error');
  }

  const rawProducts = data.data?.products?.nodes || [];
  const formattedProducts = [];

  rawProducts.forEach((prod) => {
    const image = prod.featuredImage?.url || null;
    prod.variants.nodes.forEach((variant) => {
      formattedProducts.push({
        id: variant.id,
        title: prod.title,
        variant: variant.title !== 'Default Title' ? variant.title : 'Standard',
        sku: variant.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: variant.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        barcodeType: 'CODE128',
        price: parseFloat(variant.price) || 0,
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
        unitPrice: `$${variant.price} / ea`,
        vendor: prod.vendor || 'Shopify Store',
        category: prod.productType || 'Store Inventory',
        origin: 'Shopify Store Item',
        location: 'Aisle 1 • Shelf A',
        image: image
      });
    });
  });

  return formattedProducts;
}
