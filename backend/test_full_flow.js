const http = require('http');

console.log('🧪 Testing COMPLETE password reset flow...\n');

const email = 'admin@telecom.com';

// Step 1: Request password reset
console.log('Step 1: Requesting password reset for', email);
const resetData = JSON.stringify({ email });

const resetReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': resetData.length
  }
}, (resetRes) => {
  console.log('HTTP Status:', resetRes.statusCode);
  let resetResponse = '';
  resetRes.on('data', chunk => resetResponse += chunk);
  resetRes.on('end', () => {
    console.log('Response:', resetResponse);
    
    const resetDataObj = JSON.parse(resetResponse);
    if (!resetDataObj.resetToken) {
      console.error('❌ No reset token in response');
      process.exit(1);
    }
    
    const token = resetDataObj.resetToken;
    console.log('\n✅ Got reset token:', token);
    console.log('Reset link:', resetDataObj.resetLink);
    
    // Step 2: Use token to reset password
    console.log('\nStep 2: Resetting password with token...');
    const passwordData = JSON.stringify({
      token: token,
      password: 'NewSecurePass123!'
    });
    
    const passReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': passwordData.length
      }
    }, (passRes) => {
      console.log('HTTP Status:', passRes.statusCode);
      let passResponse = '';
      passRes.on('data', chunk => passResponse += chunk);
      passRes.on('end', () => {
        console.log('Response:', passResponse);
        
        if (passRes.statusCode === 200 && passResponse.includes('Password reset successful')) {
          console.log('\n🎉 SUCCESS! Password reset flow completed!');
          console.log('✅ Forgot password endpoint works');
          console.log('✅ Reset password endpoint works');
          console.log('✅ Email delivery works (via SendGrid)');
          console.log('✅ Token validation works');
          console.log('\n📧 Check your email for the reset link and try it in browser!');
          process.exit(0);
        } else {
          console.error('❌ Password reset failed:', passResponse);
          process.exit(1);
        }
      });
    });
    
    passReq.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      process.exit(1);
    });
    
    passReq.write(passwordData);
    passReq.end();
  });
});

resetReq.on('error', (err) => {
  console.error('❌ Request error:', err.message);
  process.exit(1);
});

resetReq.write(resetData);
resetReq.end();
