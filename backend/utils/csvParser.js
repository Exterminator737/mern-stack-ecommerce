const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const products = [];
  
  // Skip header line
  let i = 1;
  let currentLine = '';
  let inQuotes = false;
  let rowCount = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Track quote state
    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      inQuotes = !inQuotes;
    }
    
    // Accumulate lines until we have a complete row
    if (currentLine) {
      currentLine += '\n' + line;
    } else {
      currentLine = line;
    }
    
    // If we're not in quotes and line ends or we have a complete row
    if (!inQuotes && (i === lines.length - 1 || (lines[i + 1] && lines[i + 1].trim().startsWith('https://')))) {
      // Process the complete row
      const product = parseRow(currentLine.trim());
      if (product && product.url) {
        products.push(processProduct(product));
        rowCount++;
      }
      currentLine = '';
    }
    
    i++;
  }
  
  console.log(`Processed ${products.length} products from CSV`);
  return products;
}

function parseRow(line) {
  if (!line || !line.trim() || !line.startsWith('https://')) {
    return null;
  }
  
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (inQuotes && nextChar === ',') {
        // End of quoted field
        inQuotes = false;
      } else {
        // Start or end quote
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last part
  if (current || parts.length < 5) {
    parts.push(current.trim());
  }
  
  // Ensure we have at least 5 parts (url, name, price, description, images)
  while (parts.length < 5) {
    parts.push('');
  }
  
  return {
    url: parts[0] || '',
    name: parts[1] || '',
    price: parts[2] || '',
    description: parts.slice(3, -1).join(' ').replace(/^"|"$/g, '').trim() || parts[3] || '',
    images: parts[parts.length - 1] || ''
  };
}

function processProduct(rawProduct) {
  // Extract price (remove "R " prefix and parse number)
  let priceStr = rawProduct.price || '0';
  priceStr = priceStr.replace(/^R\s*/i, '').replace(/,/g, '').trim();
  const price = parseFloat(priceStr) || 0;
  
  // Extract first image URL and replace {width} placeholder
  let images = [];
  if (rawProduct.images) {
    images = rawProduct.images.split(',').map(img => img.trim().replace(/^"|"$/g, '')).filter(img => img);
  }
  const mainImage = images[0] ? images[0].replace('{width}', '500').replace(/_{width}/g, '_500') : 'https://via.placeholder.com/500';
  
  // Clean description - remove extra quotes and clean up
  let description = rawProduct.description || '';
  description = description.replace(/^"|"$/g, '').replace(/\n+/g, ' ').trim();
  
  if (!description || description.length < 10) {
    description = `${rawProduct.name || 'Quality product'} from Wholesale ZA.`;
  }
  
  // Limit description length
  if (description.length > 500) {
    description = description.substring(0, 497) + '...';
  }
  
  // Determine category based on product name
  const name = (rawProduct.name || '').toLowerCase();
  let category = 'Other';
  
  if (name.includes('frame') || name.includes('photo')) {
    category = 'Home';
  } else if (name.includes('board') || name.includes('sheet') || name.includes('notebook') || 
             name.includes('exercise') || name.includes('file') || name.includes('display')) {
    category = 'Books';
  } else if (name.includes('laminator') || name.includes('office')) {
    category = 'Electronics';
  } else if (name.includes('bag') || name.includes('adaptive')) {
    category = 'Other';
  } else {
    category = 'Other';
  }
  
  return {
    name: rawProduct.name.trim() || 'Product',
    description: description,
    price: price,
    category: category,
    image: mainImage,
    stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Random rating between 3.5-5.0
    numReviews: Math.floor(Math.random() * 200) + 10
  };
}

module.exports = { parseCSV };
