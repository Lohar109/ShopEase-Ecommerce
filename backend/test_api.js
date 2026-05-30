const http = require('http');

http.get('http://localhost:5000/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('Total Products returned by API:', products.length);
      console.log('Sample Product from API:', JSON.stringify(products[0], null, 2));
      const withVariants = products.filter(p => p.variants && p.variants.length > 0);
      console.log('Products with non-empty variants:', withVariants.length);
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}).on('error', (err) => {
  console.error('API request error:', err.message);
});
