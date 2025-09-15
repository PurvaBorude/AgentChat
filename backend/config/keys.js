// backend/config/keys.js
const crypto = require('crypto');

// Generate server's ECDH key pair once on server start
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

function getPublicKey() {
  return ecdh.getPublicKey('base64', 'uncompressed');
}

// Derive shared secret using client public key (base64)
function deriveSharedSecret(clientPublicKeyBase64) {
  const clientPubKeyBuffer = Buffer.from(clientPublicKeyBase64, 'base64');
  const secret = ecdh.computeSecret(clientPubKeyBuffer);
  return secret.toString('base64');
}

module.exports = {
  getPublicKey,
  deriveSharedSecret,
};
