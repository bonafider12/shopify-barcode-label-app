// Utility to interact with Shopify Admin API & Storefront API via Serverless Proxy or Direct

export async function fetchShopifyProducts(storeDomain, accessToken) {
  let cleanDomain = storeDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

  // Diagnostic check for token prefix
  if (accessToken.startsWith('shpss_')) {
    throw new Error(
      'Notice: "shpss_..." is a Partner Client Secret (used for app installs). Please use your Admin API Token ("shpat_...") or Storefront Access Token ("shpka_...").'
    );
  }

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
    console.warn('Proxy endpoint unavailable, trying direct fetch...', e);
  }

  // Direct fetch fallback if local dev
  if (!data) {
    const isStorefront = accessToken.startsWith('shpka_');
    const endpoint = isStorefront
      ? `https://${cleanDomain}/api/2024-07/graphql.json`
      : `https://${cleanDomain}/admin/api/2024-07/graphql.json`;

    const headers = isStorefront
      ? {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken
        }
      : {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        };

    const query = `
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
        headers,
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Shopify API error HTTP ${response.status}`);
      }
      data = await response.json();
    } catch (err) {
      throw new Error(
        'Browser CORS blocked direct fetch to myshopify.com. Deploy to Vercel (where our /api/shopify proxy runs) or use the Shopify CSV Import tab!'
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
      const priceVal = typeof variant.price === 'object' ? variant.price?.amount : variant.price;
      const compareVal = typeof variant.compareAtPrice === 'object' ? variant.compareAtPrice?.amount : variant.compareAtPrice;

      const numPrice = parseFloat(priceVal) || 0;
      const numCompare = compareVal ? parseFloat(compareVal) : null;

      formattedProducts.push({
        id: variant.id,
        title: prod.title,
        variant: variant.title !== 'Default Title' ? variant.title : 'Standard',
        sku: variant.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: variant.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        barcodeType: 'CODE128',
        price: numPrice,
        compareAtPrice: numCompare,
        unitPrice: `$${numPrice} / ea`,
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
