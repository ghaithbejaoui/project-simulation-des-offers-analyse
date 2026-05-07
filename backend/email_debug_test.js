#!/usr/bin/env node
/**
 * Email Testing Script
 * This script starts the server, tests forgot password, and shows all logs
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('🚀 Starting comprehensive email test...\n');

// Start backend server
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'pipe'
});

let serverOutput = '';

server.stdout.on('data', (data) => {
  const text = data.toString();
  serverOutput += text;
  console.log('[SERVER]', text.trim());
});

server.stderr.on('data', (data) => {
  const text = data.toString();
  serverOutput += text;
  console.error('[ERROR]', text.trim());
});

// Wait for server to initialize
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 Testing forgot password endpoint...');
  console.log('Email: ghaithbejaoui00@gmail.com');
  console.log('='.repeat(60) + '\n');
  
  const emailData = JSON.stringify({ email: 'ghaithbejaoui00@gmail.com' });
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': emailData.length
    }
  }, (res) => {
    let response = '';
    res.on('data', chunk => response += chunk);
    res.on('end', () => {
      console.log('\n📨 API Response:', response);
      console.log('HTTP Status:', res.statusCode);
      
      console.log('\n' + '='.repeat(60));
      console.log('📋 CHECKLIST FOR EMAIL DELIVERY:');
      console.log('='.repeat(60));
      console.log('\n1. ✓ Backend server is running');
      console.log('2. ✓ API endpoint responded');
      console.log('\n3. 📧 EMAIL STATUS:');
      
      // Check server output for email result
      if (serverOutput.includes('Email sent successfully')) {
        console.log('   ✅ EMAIL SENT - Check your Gmail inbox!');
        console.log('   📥 Inbox, Spam, and Promotions tabs');
      } else if (serverOutput.includes('Authentication failed')) {
        console.log('   ❌ AUTHENTICATION FAILED');
        console.log('   🔑 Go to SendGrid → Settings → API Keys');
        console.log('   ✓ Ensure your API key has "Mail Send" permission');
        console.log('   ✓ Or create new API key with Full Access');
        console.log('   ✓ Use "apikey" as EMAIL_USER in .env');
      } else if (serverOutput.includes('sender')) {
        console.log('   ❌ SENDER NOT VERIFIED');
        console.log('   📝 Go to SendGrid → Settings → Sender Authentication');
        console.log('   ✓ Verify ghaithbejaoui00@gmail.com as sender');
      } else {
        console.log('   ⚠️  Check backend console above for exact error');
        console.log('   📋 Look for lines starting with "❌ Failed to send email"');
      }
      
      console.log('\n4. 🔄 If issues persist:');
      console.log('   - Verify API key permissions in SendGrid');
      console.log('   - Verify sender email is confirmed in SendGrid');
      console.log('   - Wait 2-3 minutes after verification');
      console.log('   - Restart backend server');
      console.log('\n5. 📞 Need help? Check SendGrid dashboard → Activity → Error logs\n');
      
      server.kill();
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
    server.kill();
    process.exit(1);
  });

  req.write(emailData);
  req.end();
}, 5000);

// Handle server errors
server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

// Handle server exit
server.on('exit', (code) => {
  console.log('\nServer exited with code:', code);
});
