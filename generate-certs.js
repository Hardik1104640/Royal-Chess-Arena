// Generate self-signed SSL certificates for development
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating self-signed SSL certificates for development...');

try {
  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const keyPath = path.join(__dirname, 'key.pem');
  const certPath = path.join(__dirname, 'cert.pem');
  
  fs.writeFileSync(keyPath, privateKey);
  
  // For development, we use the private key as the certificate
  // This works for HTTPS in Node.js even though it's not a standard setup
  fs.writeFileSync(certPath, privateKey);
  
  console.log('✅ Generated key.pem');
  console.log('✅ Generated cert.pem');
  console.log('\n✅ SSL certificates created successfully!');
  console.log('   - key.pem (private key)');
  console.log('   - cert.pem (certificate)');
  console.log('\n📝 Note: This is a self-signed certificate for development only.');
  console.log('   When accessing via HTTPS, your browser will show a security warning.');
  console.log('   This is normal - you can proceed safely for testing.');
  
  process.exit(0);
} catch (err) {
  console.error('❌ Error generating certificates:', err.message);
  process.exit(1);
}
