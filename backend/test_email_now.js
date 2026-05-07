const http = require('http');

console.log('📧 Testing Forgot Password Email...\n');
console.log('Sending request to backend...\n');

const data = JSON.stringify({ email: 'ghaithbejaoui00@gmail.com' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log('📨 HTTP Status:', res.statusCode);
  let response = '';
  res.on('data', chunk => response += chunk);
  res.on('end', () => {
    console.log('📨 Response Body:', response);
    console.log('\n✅ Request completed successfully!');
    console.log('\n📋 WHAT TO CHECK:');
    console.log('1️⃣  Look at the backend terminal - you should see:');
    console.log('   "✅ Email sent successfully!" or error details');
    console.log('2️⃣  Check your Gmail inbox for: ghaithbejaoui00@gmail.com');
    console.log('3️⃣  Also check Spam folder');
    console.log('\n⚠️  If email NOT sent, the backend will show:');
    console.log('   "❌ Failed to send email: ..." with error details');
    console.log('\n⏳ Please wait 5-10 seconds for email to arrive...');
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Connection Error:', err.message);
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('1. Make sure backend server is running (node server.js)');
  console.log('2. Check if port 5000 is not blocked by firewall');
  console.log('3. Verify server started without errors');
  process.exit(1);
});

req.write(data);
req.end();
