// Utility to interact with Shopify API with 250 limit & fallback SKU/barcode handling

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
  const formattedProducts = [];

  let autoSkuCounter = 1001;

  rawProducts.forEach((prod) => {
    const image = prod.featuredImage?.url || null;
    const variants = prod.variants?.nodes || [];

    if (variants.length === 0) {
      // If product has no explicit variants object, create standard product entry
      formattedProducts.push({
        id: prod.id || `prod_${autoSkuCounter}`,
        title: prod.title || 'Untitled Product',
        variant: 'Standard',
        sku: `SKU-MWT-${autoSkuCounter}`,
        barcode: `${Math.floor(100000000000 + autoSkuCounter * 987654)}`,
        barcodeType: 'CODE128',
        price: 0,
        compareAtPrice: null,
        unitPrice: `$0.00 / ea`,
        vendor: prod.vendor || 'Midwest Turf Tech',
        category: prod.productType || 'Turf Equipment',
        origin: 'Made in USA',
        location: 'Aisle 1 • Shelf A',
        image: image
      });
      autoSkuCounter++;
    } else {
      variants.forEach((variant) => {
        const priceVal = typeof variant.price === 'object' ? variant.price?.amount : variant.price;
        const compareVal = typeof variant.compareAtPrice === 'object' ? variant.compareAtPrice?.amount : variant.compareAtPrice;

        const numPrice = parseFloat(priceVal) || 0;
        const numCompare = compareVal ? parseFloat(compareVal) : null;

        // Auto-assign SKU if missing or empty string
        const finalSku = variant.sku && variant.sku.trim() !== ''
          ? variant.sku.trim()
          : `SKU-MWT-${autoSkuCounter++}`;

        // Auto-assign Barcode if missing or empty string
        const finalBarcode = variant.barcode && variant.barcode.trim() !== ''
          ? variant.barcode.trim()
          : `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

        formattedProducts.push({
          id: variant.id || `var_${autoSkuCounter}`,
          title: prod.title || 'Untitled Product',
          variant: variant.title !== 'Default Title' ? variant.title : 'Standard',
          sku: finalSku,
          barcode: finalBarcode,
          barcodeType: 'CODE128',
          price: numPrice,
          compareAtPrice: numCompare,
          unitPrice: `$${numPrice.toFixed(2)} / ea`,
          vendor: prod.vendor || 'Midwest Turf Tech',
          category: prod.productType || 'Turf Equipment',
          origin: 'Made in USA',
          location: 'Aisle 1 • Shelf A',
          image: image
        });
      });
    }
  });

  return formattedProducts;
}
