import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_E2EE_SECRET || 'fallback_secret';

export const encryptMessage = (message) => {
  if (!message) return '';
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

export const decryptMessage = (encryptedMessage) => {
  if (!encryptedMessage) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '[Unable to decrypt]';
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Encrypted Message]';
  }
};
