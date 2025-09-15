// backend/utils/encryption.js
const crypto = require('crypto');

function encryptMessage(message, keyBase64) {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(message, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptMessage(encryptedBase64, keyBase64) {
  const data = Buffer.from(encryptedBase64, 'base64');
  const key = Buffer.from(keyBase64, 'base64');

  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = decipher.update(encrypted, null, 'utf8') + decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encryptMessage,
  decryptMessage,
};
