// Utility to interact with Shopify API via Serverless/Vite Proxy

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

  const response = await fetch('/api/shopify', {
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

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error || `Shopify Proxy Error (HTTP ${response.status})`);
  }

  if (resData.errors) {
    const errText = Array.isArray(resData.errors)
      ? resData.errors.map((e) => e.message || e).join(', ')
      : typeof resData.errors === 'string'
      ? resData.errors
      : 'Shopify GraphQL query error';
    throw new Error(`Shopify API Error: ${errText}`);
  }

  const rawProducts = resData.data?.products?.nodes || [];
  if (rawProducts.length === 0 && resData.data) {
    console.log('Shopify returned empty products list:', resData);
  }

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
