const http = require('http');

const data = JSON.stringify({ email: 'admin@telecom.com' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing forgot password endpoint...');
console.log('Sending request to:', options.hostname + ':' + options.port + options.path);
console.log('Email: admin@telecom.com\n');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let response = '';
  res.on('data', (chunk) => {
    response += chunk;
  });
  res.on('end', () => {
    console.log('Response:', response);
    console.log('\n--- NEXT STEPS ---');
    console.log('1. Check the terminal where the backend server is running');
    console.log('2. Look for email sending logs (✅ or ❌)');
    console.log('3. If successful, check your email inbox');
    console.log('4. If error, follow the troubleshooting instructions shown in the server console');
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  console.log('\nMake sure the backend server is running (node server.js in backend folder)');
  process.exit(1);
});

req.write(data);
req.end();
