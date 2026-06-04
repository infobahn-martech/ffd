import CryptoJS from 'crypto-js';
import { notify } from '../../components/Toaster';

export function encryptAccessToken(accessToken, secretKey) {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify({ accessToken }),
      secretKey,
    );
    return encrypted.toString();
  } catch (e) {
    notify('Invalid token', 'error', 'TOP_RIGHT');
  }
}

export function decryptAccessToken(encryptedAccessToken, secretKey) {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedAccessToken,
      secretKey,
    ).toString(CryptoJS.enc.Utf8);
    const parsedData = JSON.parse(decrypted);
    return parsedData?.accessToken ?? '';
  } catch (e) {
    notify('Invalid token', 'error', 'TOP_RIGHT');
  }
}
