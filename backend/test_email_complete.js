#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('🚀 Starting backend server...\n');

const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'pipe'
});

serverProcess.stdout.on('data', (data) => {
  console.log('[SERVER]', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error('[SERVER-ERROR]', data.toString().trim());
});

// Wait for server to start
setTimeout(() => {
  console.log('\n📧 Testing forgot password endpoint...\n');
  
  const data = JSON.stringify({ email: 'admin@telecom.com' });
  
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
    res.on('data', (chunk) => response += chunk);
    res.on('end', () => {
      console.log('\n📨 Response:', response);
      console.log('\n✅ Test completed!');
      console.log('📋 Check the server logs above to see if email was sent.');
      console.log('📧 If successful, the email should arrive in the inbox of: admin@telecom.com');
      console.log('\n⚠️  IMPORTANT: For SendGrid to actually deliver:');
      console.log('   1. You must verify a sender email in your SendGrid account');
      console.log('   2. Update EMAIL_FROM in .env with the verified email');
      console.log('   3. Without this, SendGrid will reject the email\n');
      
      serverProcess.kill();
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running (check server logs above)');
    console.log('2. No firewall blocking port 5000');
    serverProcess.kill();
    process.exit(1);
  });

  req.write(data);
  req.end();
}, 5000);

// Handle server exit
serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error('\n❌ Server exited with code', code);
  }
  process.exit(code);
});
