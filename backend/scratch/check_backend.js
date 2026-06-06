const http = require('https');

function check() {
  console.log('Sending request to Render backend...');
  http.get('https://shopease-backend-v51k.onrender.com/', (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response:', data);
    });
  }).on('error', (err) => {
    console.error('Error connecting to Render backend:', err.message);
  });
}

check();
