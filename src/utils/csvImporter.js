// Utility for parsing Shopify Products Export CSV files

export function parseShopifyCSV(csvText) {
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const handleIdx = headers.findIndex(h => /handle/i.test(h));
  const titleIdx = headers.findIndex(h => /title/i.test(h));
  const vendorIdx = headers.findIndex(h => /vendor/i.test(h));
  const typeIdx = headers.findIndex(h => /type/i.test(h));
  const variantNameIdx = headers.findIndex(h => /option1 value|variant value/i.test(h));
  const priceIdx = headers.findIndex(h => /variant price|price/i.test(h));
  const comparePriceIdx = headers.findIndex(h => /variant compare at price|compare at price/i.test(h));
  const skuIdx = headers.findIndex(h => /variant sku|sku/i.test(h));
  const barcodeIdx = headers.findIndex(h => /variant barcode|barcode/i.test(h));
  const imageIdx = headers.findIndex(h => /image src|image/i.test(h));

  const products = [];
  let currentTitle = '';
  let currentVendor = 'My Store';
  let currentCategory = 'General';

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = parseCSVLine(lines[i]);
    
    if (row[titleIdx]) currentTitle = row[titleIdx];
    if (row[vendorIdx]) currentVendor = row[vendorIdx];
    if (row[typeIdx]) currentCategory = row[typeIdx];

    const price = parseFloat(row[priceIdx]) || 0;
    const sku = row[skuIdx] || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcode = row[barcodeIdx] || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const variant = row[variantNameIdx] || 'Standard';

    if (currentTitle) {
      products.push({
        id: `csv_prod_${i}`,
        title: currentTitle,
        variant: variant,
        sku: sku,
        barcode: barcode,
        barcodeType: 'CODE128',
        price: price,
        compareAtPrice: row[comparePriceIdx] ? parseFloat(row[comparePriceIdx]) : null,
        unitPrice: `$${price} / ea`,
        vendor: currentVendor,
        category: currentCategory,
        origin: 'Imported CSV',
        location: 'Aisle 1',
        image: row[imageIdx] || null
      });
    }
  }

  return products;
}

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}
