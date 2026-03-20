/**
 * AES-256-GCM Encryption/Decryption Utility
 * Cải thiện: Base58 encoding + Obfuscation + File Blob thay vì token dài
 */

export interface EncryptedFileData {
  salt: string;
  iv: string;
  tag: string;
  filename: string;
  mimeType: string;
  // ciphertext sẽ được lưu riêng trong file .enc, không nhét vào token
}

export interface EncryptedTextData {
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

// Base58 Alphabet (Bitcoin) - không chứa 0, O, I, l, +, /, =
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Base58 Encode (thay thế Base64 - khó nhận dạng hơn)
 */
function base58Encode(buffer: Uint8Array): string {
  const alphabet = BASE58_ALPHABET;
  const base = BigInt(alphabet.length);
  
  // Chuyển Uint8Array thành BigInt
  let num = BigInt(0);
  for (let i = 0; i < buffer.length; i++) {
    num = num * BigInt(256) + BigInt(buffer[i]);
  }
  
  // Encode sang Base58
  let result = '';
  if (num === BigInt(0)) return alphabet[0];
  
  while (num > BigInt(0)) {
    result = alphabet[Number(num % base)] + result;
    num = num / base;
  }
  
  // Xử lý leading zero bytes
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result = alphabet[0] + result;
  }
  
  return result;
}

/**
 * Base58 Decode
 */
function base58Decode(str: string): Uint8Array {
  const alphabet = BASE58_ALPHABET;
  const base = BigInt(alphabet.length);
  
  let num = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = alphabet.indexOf(char);
    if (index === -1) throw new Error('Invalid Base58 character');
    num = num * base + BigInt(index);
  }
  
  // Chuyển BigInt về Uint8Array
  const bytes: number[] = [];
  while (num > BigInt(0)) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }
  
  // Xử lý leading zeros
  for (let i = 0; i < str.length && str[i] === alphabet[0]; i++) {
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
}

/**
 * Obfuscation đơn giản (XOR) để che giấu cấu trúc JSON
 * Làm cho output không giống Base58 thuần túy
 */
function obfuscate(data: string, key: string = 'AES256GCM'): string {
  const result: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(String.fromCharCode(charCode));
  }
  // Chuyển sang Base58 sau khi XOR để không còn nhìn ra pattern
  const bytes = new TextEncoder().encode(result.join(''));
  return base58Encode(bytes);
}

/**
 * Derive key từ password dùng PBKDF2
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
 * Mã hóa FILE - Trả về Blob để download thay vì token dài
 * Output: File .enc chứa toàn bộ dữ liệu đã mã hóa
 */
export async function encryptFileToBlob(
  file: File,
  password: string
): Promise<{ blob: Blob; token: string; filename: string }> {
  try {
    // Generate salt và IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key
    const key = await deriveKey(password, salt);

    // Đọc file
    const fileData = await file.arrayBuffer();

    // Mã hóa
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      fileData
    );

    // Tách ciphertext và tag
    const encryptedBytes = new Uint8Array(encryptedData);
    const ciphertext = encryptedBytes.slice(0, -TAG_LENGTH / 8);
    const tag = encryptedBytes.slice(-TAG_LENGTH / 8);

    // Tạo header chứa metadata (44 bytes đầu tiên)
    // Format: [salt(16)][iv(12)][tag(16)][filenameLength(2)][mimeTypeLength(2)]
    const filenameBytes = new TextEncoder().encode(file.name);
    const mimeBytes = new TextEncoder().encode(file.type || 'application/octet-stream');
    
    if (filenameBytes.length > 255) throw new Error('Filename too long');
    
    const header = new Uint8Array(16 + 12 + 16 + 2 + 2 + filenameBytes.length + mimeBytes.length);
    let offset = 0;
    
    header.set(salt, offset); offset += 16;
    header.set(iv, offset); offset += 12;
    header.set(tag, offset); offset += 16;
    header.set([filenameBytes.length], offset); offset += 1;
    header.set([mimeBytes.length], offset); offset += 1;
    header.set(filenameBytes, offset); offset += filenameBytes.length;
    header.set(mimeBytes, offset);

    // Gộp header + ciphertext
    const finalData = new Uint8Array(header.length + ciphertext.length);
    finalData.set(header, 0);
    finalData.set(ciphertext, header.length);

    // Tạo token ngắn (chỉ chứa salt + filename hash để verify)
    const metadata = {
      s: arrayBufferToBase64URL(salt), // salt rút gọn
      f: file.name.substring(0, 20),   // tên file (max 20 chars)
      z: file.size                     // kích thước gốc
    };
    
    // Obfuscate token để không nhìn ra là Base64
    const token = obfuscate(JSON.stringify(metadata));

    return {
      blob: new Blob([finalData], { type: 'application/encrypted' }),
      token,
      filename: file.name + '.enc'
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Giải mã từ Blob file .enc
 */
export async function decryptFileFromBlob(
  blob: Blob,
  password: string,
  originalFilename?: string
): Promise<{ blob: Blob; filename: string }> {
  try {
    const data = new Uint8Array(await blob.arrayBuffer());
    
    // Parse header
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const tag = data.slice(28, 44);
    const filenameLen = data[44];
    const mimeLen = data[45];
    
    const filenameBytes = data.slice(46, 46 + filenameLen);
    const mimeBytes = data.slice(46 + filenameLen, 46 + filenameLen + mimeLen);
    const ciphertext = data.slice(46 + filenameLen + mimeLen);
    
    const filename = originalFilename || new TextDecoder().decode(filenameBytes) || 'decrypted_file';
    const mimeType = new TextDecoder().decode(mimeBytes) || 'application/octet-stream';

    // Derive key
    const key = await deriveKey(password, salt);

    // Ghép ciphertext + tag để giải mã
    const encryptedBytes = new Uint8Array(ciphertext.length + tag.length);
    encryptedBytes.set(ciphertext, 0);
    encryptedBytes.set(tag, ciphertext.length);

    // Giải mã
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedBytes
    );

    return {
      blob: new Blob([decryptedData], { type: mimeType }),
      filename: filename.replace(/\.enc$/, '') // Bỏ đuôi .enc
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed - Invalid password or corrupted file');
  }
}

/**
 * Mã hóa TEXT - Token ngắn gọn dùng Base58 + Obfuscation
 */
export async function encryptText(
  text: string,
  password: string
): Promise<{ token: string; textLength: number }> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const textData = encoder.encode(text);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      textData
    );

    const encryptedBytes = new Uint8Array(encryptedData);
    const ciphertext = encryptedBytes.slice(0, -TAG_LENGTH / 8);
    const tag = encryptedBytes.slice(-TAG_LENGTH / 8);

    // Gộp tất cả thành một buffer
    const combined = new Uint8Array(16 + 12 + ciphertext.length + 16);
    combined.set(salt, 0);
    combined.set(iv, 16);
    combined.set(ciphertext, 28);
    combined.set(tag, 28 + ciphertext.length);

    // Encode Base58 thay vì Base64 - khó nhận dạng hơn
    const token = base58Encode(combined);

    return {
      token,
      textLength: text.length
    };
  } catch (error) {
    console.error('Text encryption error:', error);
    throw new Error('Text encryption failed');
  }
}

/**
 * Giải mã TEXT từ token Base58
 */
export async function decryptText(
  token: string,
  password: string
): Promise<string> {
  try {
    // Decode Base58
    const data = base58Decode(token);
    
    if (data.length < 44) throw new Error('Invalid token');

    // Tách các phần
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const tag = data.slice(-16);
    const ciphertext = data.slice(28, -16);

    const key = await deriveKey(password, salt);

    // Ghép lại để giải mã
    const encryptedBytes = new Uint8Array(ciphertext.length + tag.length);
    encryptedBytes.set(ciphertext, 0);
    encryptedBytes.set(tag, ciphertext.length);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedBytes
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Text decryption error:', error);
    throw new Error('Text decryption failed - Invalid password or corrupted data');
  }
}

/**
 * Helper: ArrayBuffer to Base64URL (rút gọn hơn Base64 thường)
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Kiểm tra token có phải dạng text (Base58) hay không
 */
export function isValidTextToken(token: string): boolean {
  // Base58 chỉ chứa các ký tự trong alphabet
  return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(token);
}

/**
 * Validate password (giữ nguyên)
 */
export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  messageKey: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      strength: 'weak',
      messageKey: 'errors.passwordTooShort',
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
      messageKey: 'password.strength.strong',
    };
  } else if (password.length >= 8 && score >= 2) {
    return {
      valid: true,
      strength: 'medium',
      messageKey: 'password.strength.medium',
    };
  } else {
    return {
      valid: true,
      strength: 'weak',
      messageKey: 'password.strength.weak',
    };
  }
}
/**
 * Format file size for display (Giữ lại để FileUpload.tsx sử dụng)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Legacy interface để tương thích với TokenDisplay.tsx cũ
 * Nếu không dùng TokenDisplay nữa thì có thể xóa
 */
export interface EncryptionResult {
  token: string;
  filename: string;
  size: number;
}

/**
 * Legacy export để tương thích với code cũ
 */
export async function encryptFile(
  file: File,
  password: string
): Promise<EncryptionResult> {
  const result = await encryptFileToBlob(file, password);
  return {
    token: result.token,
    filename: result.filename,
    size: file.size
  };
}

/**
 * Legacy decrypt để tương thích
 */
export async function decryptData(
  token: string,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  // Nếu là token text (Base58) thì decrypt text rồi convert sang blob
  if (isValidTextToken(token)) {
    const text = await decryptText(token, password);
    const blob = new Blob([text], { type: 'text/plain' });
    return { blob, filename: 'decrypted_text.txt' };
  }
  throw new Error('Use decryptFileFromBlob for file decryption');
}

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
