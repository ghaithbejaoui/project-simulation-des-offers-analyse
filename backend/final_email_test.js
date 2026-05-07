const http = require('http');

console.log('📧 Testing Forgot Password with SendGrid...\n');

const email = 'ghaithbejaoui00@gmail.com';
const data = JSON.stringify({ email });

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

const req = http.request(options, (res) => {
  console.log('📨 HTTP Status:', res.statusCode);
  let response = '';
  res.on('data', chunk => response += chunk);
  res.on('end', () => {
    console.log('📨 Response:', response);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📋 WHAT TO DO NOW:');
    console.log('1. Look at the terminal/console where your backend server is running');
    console.log('2. You should see one of these messages:');
    console.log('   ✅ "Email sent successfully!" → SUCCESS!');
    console.log('   ❌ "Failed to send email" → Check error details');
    console.log('\n📧 Check your email: ' + email);
    console.log('   - Inbox');
    console.log('   - Spam/Junk folder');
    console.log('   - Promotions tab (if Gmail)');
    console.log('\n⏱️  Email delivery usually takes 5-30 seconds.');
    console.log('\n🔧 If email NOT received, check backend console for:');
    console.log('   - Authentication errors');
    console.log('   - Sender verification errors');
    console.log('   - API key permissions\n');
  });
});

req.on('error', (err) => {
  console.error('❌ Connection Error:', err.message);
  console.log('\nMake sure backend is running at http://localhost:5000');
});

req.write(data);
req.end();
