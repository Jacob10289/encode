/**
 * AES-256-GCM Encryption/Decryption Utility
 * Uses Web Crypto API for secure client-side encryption
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  filename: string;
  mimeType: string;
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

export interface TextEncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  isText: boolean;
}

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 128;
const ITERATIONS = 100000;

/**
 * Derive a key from password using PBKDF2
 */
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

  // Convert Uint8Array to ArrayBuffer for salt
  const saltBuffer = new Uint8Array(salt).buffer;

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a file using AES-256-GCM
 */
export async function encryptFile(
  file: File,
  password: string
): Promise<EncryptionResult> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Read file as array buffer
    const fileData = await file.arrayBuffer();

    // Encrypt the file data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      fileData
    );

    // Split ciphertext and authentication tag
    const encryptedBytes = new Uint8Array(encryptedData);
    const ciphertext = encryptedBytes.slice(0, -TAG_LENGTH / 8);
    const tag = encryptedBytes.slice(-TAG_LENGTH / 8);

    // Create encrypted data object
    const encryptedResult: EncryptedData = {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      tag: arrayBufferToBase64(tag),
      filename: file.name,
      mimeType: file.type,
    };

    // Create token from encrypted data
    const token = btoa(JSON.stringify(encryptedResult));

    return {
      token,
      filename: file.name,
      size: file.size,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptData(
  token: string,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  try {
    // Parse token
    let encryptedData: EncryptedData;
    try {
      encryptedData = JSON.parse(atob(token));
    } catch {
      throw new Error('Invalid token format');
    }

    // Validate required fields
    if (!encryptedData.ciphertext || !encryptedData.iv || !encryptedData.salt || !encryptedData.tag) {
      throw new Error('Invalid token data');
    }

    // Decode base64 values
    const salt = base64ToArrayBuffer(encryptedData.salt);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const tag = base64ToArrayBuffer(encryptedData.tag);

    // Derive key from password
    const key = await deriveKey(password, new Uint8Array(salt));

    // Combine ciphertext and tag for decryption
    const encryptedBytes = new Uint8Array(ciphertext.byteLength + tag.byteLength);
    encryptedBytes.set(new Uint8Array(ciphertext), 0);
    encryptedBytes.set(new Uint8Array(tag), ciphertext.byteLength);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: new Uint8Array(iv),
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedBytes
    );

    // Create blob from decrypted data
    const blob = new Blob([decryptedData], { type: encryptedData.mimeType || 'application/octet-stream' });

    return {
      blob,
      filename: encryptedData.filename || 'decrypted_file',
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed - Invalid password or corrupted data');
  }
}

/**
 * Encrypt text using AES-256-GCM
 */
export async function encryptText(
  text: string,
  password: string
): Promise<TextEncryptionResult> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Encode text to array buffer
    const encoder = new TextEncoder();
    const textData = encoder.encode(text);

    // Encrypt the text data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      textData
    );

    // Split ciphertext and authentication tag
    const encryptedBytes = new Uint8Array(encryptedData);
    const ciphertext = encryptedBytes.slice(0, -TAG_LENGTH / 8);
    const tag = encryptedBytes.slice(-TAG_LENGTH / 8);

    // Create encrypted data object
    const encryptedResult: TextEncryptedData = {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      tag: arrayBufferToBase64(tag),
      isText: true,
    };

    // Create token from encrypted data
    const token = btoa(JSON.stringify(encryptedResult));

    return {
      token,
      textLength: text.length,
    };
  } catch (error) {
    console.error('Text encryption error:', error);
    throw new Error('Text encryption failed');
  }
}

/**
 * Decrypt text using AES-256-GCM
 */
export async function decryptText(
  token: string,
  password: string
): Promise<string> {
  try {
    // Parse token
    let encryptedData: TextEncryptedData;
    try {
      encryptedData = JSON.parse(atob(token));
    } catch {
      throw new Error('Invalid token format');
    }

    // Validate required fields
    if (!encryptedData.ciphertext || !encryptedData.iv || !encryptedData.salt || !encryptedData.tag) {
      throw new Error('Invalid token data');
    }

    // Decode base64 values
    const salt = base64ToArrayBuffer(encryptedData.salt);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const tag = base64ToArrayBuffer(encryptedData.tag);

    // Derive key from password
    const key = await deriveKey(password, new Uint8Array(salt));

    // Combine ciphertext and tag for decryption
    const encryptedBytes = new Uint8Array(ciphertext.byteLength + tag.byteLength);
    encryptedBytes.set(new Uint8Array(ciphertext), 0);
    encryptedBytes.set(new Uint8Array(tag), ciphertext.byteLength);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: new Uint8Array(iv),
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedBytes
    );

    // Decode array buffer to text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Text decryption error:', error);
    throw new Error('Text decryption failed - Invalid password or corrupted data');
  }
}

/**
 * Check if a token is for text encryption
 */
export function isTextToken(token: string): boolean {
  try {
    const data = JSON.parse(atob(token));
    return data.isText === true;
  } catch {
    return false;
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      strength: 'weak',
      message: 'Password must be at least 8 characters',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;

  if (password.length >= 12 && score >= 3) {
    return {
      valid: true,
      strength: 'strong',
      message: 'Strong password',
    };
  } else if (password.length >= 8 && score >= 2) {
    return {
      valid: true,
      strength: 'medium',
      message: 'Medium strength password',
    };
  } else {
    return {
      valid: true,
      strength: 'weak',
      message: 'Weak password - consider using more character types',
    };
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}
