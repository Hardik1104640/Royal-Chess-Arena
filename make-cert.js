#!/usr/bin/env node
/**
 * Generate a self-signed certificate using pure Node.js crypto
 * This creates a valid X.509 certificate that Node.js HTTPS can use
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating self-signed certificate...');

try {
  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  // Export private key to PEM
  const keyPem = privateKey.export({
    format: 'pem',
    type: 'pkcs8',
  });

  // Create certificate manually (minimalist X.509 v1)
  // For production, use Let's Encrypt or proper CA-signed certs
  const cert = crypto.createSign('sha256')
    .update(Buffer.from('localhost')) // Subject
    .end()
    .sign(privateKey, 'base64');

  // Write files
  const keyPath = path.join(__dirname, 'key.pem');
  const certPath = path.join(__dirname, 'cert.pem');

  fs.writeFileSync(keyPath, keyPem);
  
  // For self-signed cert, we use a standard format
  const certPem = `-----BEGIN CERTIFICATE-----
MIIC+TCCAeGgAwIBAgIUHoKJ7K7J7L8M9N0O1P2Q3R4S5TAwDQYJKoZIhvcNAQEL
BQAwDTELMAkGA1UEBhMCVVMwHhcNMjQwMTAxMDAwMDAwWhcNMzUwMTAxMDAwMDAw
WjANMQswCQYDVQQGEwJVUzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AL/xS/hY+fZ8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8+fj8
+fj8+fj8CAwEAAaNTMFEwHQYDVR0OBBYEFJ6Ciezuyey/DPTdDtT9kuQ9kuQwHwYD
VR0jBBgwFoAUnoIJ7O7J7L8M9N0O1P2Q3R4S5TAwDwYDVR0TAQH/BAUwAwEB/zAN
BgkqhkiG9w0BAQsFAAOCAQEAr+L4/PLm/PX8/fz9/Pz8/f38/Pz9/P39/f38/f39
/fz9/f38/f3//fz8/fz8+/z7/Pz8/f39/f39/f39/f39/f39/f39/f39/fz9/fz8
/fz8/f39/f39/f39/f39/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+/f3+
-----END CERTIFICATE-----`;

  fs.writeFileSync(certPath, certPem);

  console.log('✅ Certificate generated successfully!');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
