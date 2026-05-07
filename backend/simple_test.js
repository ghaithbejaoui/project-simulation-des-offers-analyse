#!/usr/bin/env node
/**
 * Simple direct test - no server management
 * Just test if the API works and show server logs separately
 */

const http = require('http');

console.log('='.repeat(60));
console.log('📧 PASSWORD RESET EMAIL TEST');
console.log('='.repeat(60));
console.log('\nThis script tests the forgot-password endpoint.');
console.log('Make sure your backend server is running in another terminal:\n');
console.log('   cd backend && node server.js\n');
console.log('Then press Enter to continue...\n');

// Simple read stdin to wait
process.stdin.once('data', () => {
  const email = 'ghaithbejaoui00@gmail.com';
  const data = JSON.stringify({ email });
  
  console.log('📤 Sending request to: POST http://localhost:5000/api/auth/forgot-password');
  console.log('📧 Email:', email);
  console.log('');
  
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
      console.log('📨 HTTP', res.statusCode);
      console.log('📨 Response:', response);
      console.log('\n✅ Request completed!');
      console.log('\n🔍 NEXT STEP: Check your backend server terminal');
      console.log('   Look for these messages:');
      console.log('   - "📧 Attempting to send password reset email..."');
      console.log('   - "✅ Email sent successfully!" → SUCCESS');
      console.log('   - "❌ Failed to send email" → ERROR (see details)');
      console.log('\n📧 Then check your Gmail inbox for the reset email');
      console.log('   (May take 5-30 seconds, check Spam folder)\n');
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
    console.log('\n⚠️  Is your backend server running?');
    console.log('   Open a new terminal and run:');
    console.log('   cd backend && node server.js\n');
    process.exit(1);
  });

  req.write(data);
  req.end();
});
