/**
 * AES-256-GCM Encryption/Decryption Utility
 * Format: [salt(16)][iv(12)][filenameLen(1)][mimeLen(1)][filename][mime][ciphertext][tag(16)]
 */

export interface EncryptedFileData {
  salt: string;
  iv: string;
  tag: string;
  filename: string;
  mimeType: string;
}

export interface EncryptedTextData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  isText: boolean;
}

export interface EncryptionResult {
  token: string;
  filename: string;
  size: number;
}

export interface TextEncryptionResult {
  token: string;
  textLength: number;
}

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 128;
const ITERATIONS = 100000;
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer: Uint8Array): string {
  const alphabet = BASE58_ALPHABET;
  const base = BigInt(alphabet.length);
  
  let num = BigInt(0);
  for (let i = 0; i < buffer.length; i++) {
    num = num * BigInt(256) + BigInt(buffer[i]);
  }
  
  let result = '';
  if (num === BigInt(0)) return alphabet[0];
  
  while (num > BigInt(0)) {
    result = alphabet[Number(num % base)] + result;
    num = num / base;
  }
  
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result = alphabet[0] + result;
  }
  
  return result;
}

function base58Decode(str: string): Uint8Array {
  const alphabet = BASE58_ALPHABET;
  const base = BigInt(alphabet.length);
  
  let num = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    const index = alphabet.indexOf(str[i]);
    if (index === -1) throw new Error('Invalid Base58 character');
    num = num * base + BigInt(index);
  }
  
  const bytes: number[] = [];
  while (num > BigInt(0)) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }
  
  for (let i = 0; i < str.length && str[i] === alphabet[0]; i++) {
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Sửa lỗi type: salt phải là ArrayBuffer, không phải Uint8Array
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}


/**
 * Mã hóa FILE → .enc
 * Format: [salt(16)][iv(12)][filenameLen(1)][mimeLen(1)][filename][mime][ciphertext][tag(16)]
 */
export async function encryptFileToBlob(
  file: File,
  password: string
): Promise<{ blob: Blob; token: string; filename: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const fileData = await file.arrayBuffer();

  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    fileData
  );

  const encryptedBytes = new Uint8Array(encryptedData);
  const ciphertext = encryptedBytes.slice(0, -16); // Cắt 16 bytes cuối (tag)
  const tag = encryptedBytes.slice(-16);           // 16 bytes tag

  const filenameBytes = new TextEncoder().encode(file.name);
  const mimeBytes = new TextEncoder().encode(file.type || 'application/octet-stream');
  
  if (filenameBytes.length > 255 || mimeBytes.length > 255) {
    throw new Error('Filename or MIME type too long');
  }

  // Header: salt(16) + iv(12) + filenameLen(1) + mimeLen(1) + filename + mime
  const headerLen = 16 + 12 + 1 + 1 + filenameBytes.length + mimeBytes.length;
  const header = new Uint8Array(headerLen);
  let offset = 0;

  header.set(salt, offset); offset += 16;
  header.set(iv, offset); offset += 12;
  header.set([filenameBytes.length], offset); offset += 1;
  header.set([mimeBytes.length], offset); offset += 1;
  header.set(filenameBytes, offset); offset += filenameBytes.length;
  header.set(mimeBytes, offset);

  // Gộp: header + ciphertext + tag (tag ở cuối!)
  const finalData = new Uint8Array(headerLen + ciphertext.length + tag.length);
  finalData.set(header, 0);
  finalData.set(ciphertext, headerLen);
  finalData.set(tag, headerLen + ciphertext.length);

  // Token ngắn để verify (chỉ chứa metadata, không chứa dữ liệu mã hóa)
  const metadata = { f: file.name.substring(0, 15), z: file.size };
  const token = base58Encode(new TextEncoder().encode(JSON.stringify(metadata)));

  return {
    blob: new Blob([finalData], { type: 'application/encrypted' }),
    token,
    filename: file.name + '.enc'
  };
}

/**
 * Giải mã từ file .enc
 */
export async function decryptFileFromBlob(
  blob: Blob,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  const data = new Uint8Array(await blob.arrayBuffer());
  
  // Đọc header
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const filenameLen = data[28];
  const mimeLen = data[29];
  const headerEnd = 30 + filenameLen + mimeLen;
  
  const filenameBytes = data.slice(30, 30 + filenameLen);
  const mimeBytes = data.slice(30 + filenameLen, headerEnd);
  
  // Ciphertext: từ sau header đến trước 16 bytes cuối (tag)
  const ciphertext = data.slice(headerEnd, -16);
  const tag = data.slice(-16); // 16 bytes cuối là tag
  
  const filename = new TextDecoder().decode(filenameBytes) || 'decrypted_file';
  const mimeType = new TextDecoder().decode(mimeBytes) || 'application/octet-stream';

  const key = await deriveKey(password, salt);

  // Ghép ciphertext + tag để giải mã
  const encryptedBytes = new Uint8Array(ciphertext.length + tag.length);
  encryptedBytes.set(ciphertext, 0);
  encryptedBytes.set(tag, ciphertext.length);

  const decryptedData = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encryptedBytes
  );

  return {
    blob: new Blob([decryptedData], { type: mimeType }),
    filename: filename.replace(/\.enc$/, '')
  };
}

/**
 * Mã hóa TEXT → Token Base58
 */
export async function encryptText(
  text: string,
  password: string
): Promise<TextEncryptionResult> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const textData = new TextEncoder().encode(text);

  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    textData
  );

  const encryptedBytes = new Uint8Array(encryptedData);
  const ciphertext = encryptedBytes.slice(0, -16);
  const tag = encryptedBytes.slice(-16);

  const combined = new Uint8Array(16 + 12 + ciphertext.length + 16);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(ciphertext, 28);
  combined.set(tag, 28 + ciphertext.length);

  const token = base58Encode(combined);

  return { token, textLength: text.length };
}

/**
 * Giải mã TEXT từ token
 */
export async function decryptText(token: string, password: string): Promise<string> {
  const data = base58Decode(token);
  if (data.length < 44) throw new Error('Invalid token');

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const tag = data.slice(-16);
  const ciphertext = data.slice(28, -16);

  const key = await deriveKey(password, salt);

  const encryptedBytes = new Uint8Array(ciphertext.length + tag.length);
  encryptedBytes.set(ciphertext, 0);
  encryptedBytes.set(tag, ciphertext.length);

  const decryptedData = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encryptedBytes
  );

  return new TextDecoder().decode(decryptedData);
}

export function isValidTextToken(token: string): boolean {
  return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(token);
}

export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  messageKey: string;
} {
  if (password.length < 8) {
    return { valid: false, strength: 'weak', messageKey: 'errors.passwordTooShort' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSpec = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const score = [hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;

  if (password.length >= 12 && score >= 3) {
    return { valid: true, strength: 'strong', messageKey: 'password.strength.strong' };
  } else if (score >= 2) {
    return { valid: true, strength: 'medium', messageKey: 'password.strength.medium' };
  } else {
    return { valid: true, strength: 'weak', messageKey: 'password.strength.weak' };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Legacy exports
export async function encryptFile(file: File, password: string): Promise<EncryptionResult> {
  const result = await encryptFileToBlob(file, password);
  return { token: result.token, filename: result.filename, size: file.size };
}

export async function decryptData(
  _token: string,
  _password: string
): Promise<{ blob: Blob; filename: string }> {
  throw new Error('Legacy decryptData removed. Use decryptFileFromBlob or decryptText.');
}

export function isTextToken(token: string): boolean {
  return isValidTextToken(token);
}

export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let pass = '';
  for (let i = 0; i < length; i++) pass += charset[array[i] % charset.length];
  return pass;
}
