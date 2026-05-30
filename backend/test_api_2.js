const http = require('http');

http.get('http://localhost:5000/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      const withVariants = products.filter(p => p.variants && p.variants.length > 0);
      const withoutVariants = products.filter(p => !p.variants || p.variants.length === 0);
      console.log('Total Products:', products.length);
      console.log('With variants:', withVariants.length);
      console.log('Without variants:', withoutVariants.length);
      if (withoutVariants.length > 0) {
        console.log('Without variants sample names:', withoutVariants.slice(0, 10).map(p => p.name));
        console.log('First product without variants ID:', withoutVariants[0].id);
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}).on('error', (err) => {
  console.error('API request error:', err.message);
});
