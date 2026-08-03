// Utility to interact with Shopify Admin GraphQL API

export async function fetchShopifyProducts(storeDomain, accessToken) {
  let cleanDomain = storeDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

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
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Shopify API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL Query error');
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
  } catch (err) {
    console.error('Shopify API Sync Error:', err);
    throw err;
  }
}
