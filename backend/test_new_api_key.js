const http = require('http');

console.log('='.repeat(60));
console.log('📧 TESTING PASSWORD RESET EMAIL WITH NEW API KEY');
console.log('='.repeat(60));
console.log('\n📤 Sending request to backend...\n');

const email = 'ghaithbejaoui00@gmail.com';
const data = JSON.stringify({ email });

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
  let response = '';
  res.on('data', chunk => response += chunk);
  res.on('end', () => {
    console.log('📨 HTTP Status:', res.statusCode);
    console.log('📨 Response:', response);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ REQUEST COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📋 WHAT TO CHECK:');
    console.log('\n1️⃣  BACKEND TERMINAL OUTPUT:');
    console.log('   Look for one of these messages:');
    console.log('   ✅ "✅ Email sent successfully!" → EMAIL DELIVERED');
    console.log('   ❌ "❌ Failed to send email" → ERROR (see details above)');
    console.log('\n2️⃣  YOUR GMAIL INBOX:');
    console.log('   📧 Check: ' + email);
    console.log('   • Inbox');
    console.log('   • Spam/Junk folder');
    console.log('   • Promotions tab');
    console.log('\n⏱️  Delivery usually takes 5-30 seconds.');
    console.log('\n🔧 IF EMAIL NOT RECEIVED:');
    console.log('   - Check backend terminal for error messages');
    console.log('   - Verify sender email is verified in SendGrid');
    console.log('   - Try waiting 2-3 minutes (SendGrid can be slow)');
    console.log('   - Check SendGrid dashboard → Activity → see if email was sent\n');
  });
});

req.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  console.log('\n⚠️  Make sure backend is running on port 5000');
});

req.write(data);
req.end();
