// Utility to interact with Shopify using Client Credentials (Client ID & Secret) or Tokens

export async function fetchShopifyProducts(storeDomain, accessToken, clientId, clientSecret) {
  let cleanDomain = (storeDomain || 'midwestturftech.myshopify.com')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

  const effectiveSecret = clientSecret || accessToken || '';
  const effectiveClientId = clientId || '';

  let response;
  let data;

  try {
    response = await fetch('/api/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        storeDomain: cleanDomain,
        accessToken: effectiveSecret,
        clientId: effectiveClientId,
        clientSecret: effectiveSecret
      })
    });

    if (response.ok) {
      data = await response.json();
    } else {
      const errRes = await response.json();
      throw new Error(errRes.error || `HTTP ${response.status}`);
    }
  } catch (e) {
    console.warn('Proxy endpoint error, trying direct fetch fallback...', e);
  }

  // Direct fetch fallback if local dev
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
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': effectiveSecret,
          'X-Shopify-Client-Id': effectiveClientId
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Shopify API error HTTP ${response.status}`);
      }
      data = await response.json();
    } catch (err) {
      throw new Error(
        'Browser CORS blocked direct request. Deploy to Vercel (where our /api/shopify serverless proxy handles it automatically) or use the Shopify CSV Import tab!'
      );
    }
  }

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'Shopify query error');
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
        vendor: prod.vendor || 'Midwest Turf Tech',
        category: prod.productType || 'Turf Equipment',
        origin: 'Made in USA',
        location: 'Aisle 1 • Shelf A',
        image: image
      });
    });
  });

  return formattedProducts;
}
