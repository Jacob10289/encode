# 📦 Code Snippets - AES256GCM Encryption Tool

Tài liệu này chứa tất cả các đoạn code chính của dự án, được tổ chức theo từng file để dễ dàng copy và sử dụng.

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/
│   ├── Header.tsx
│   ├── FileUpload.tsx
│   ├── EncryptSection.tsx
│   ├── DecryptSection.tsx
│   ├── TokenDisplay.tsx
│   ├── AboutSection.tsx
│   └── Footer.tsx
├── hooks/
│   └── useTranslation.ts
├── utils/
│   └── crypto.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## 🪝 1. useTranslation Hook

**File:** `src/hooks/useTranslation.ts`

Hook tùy chỉnh để quản lý đa ngôn ngữ mà không cần thư viện bên ngoài.

```typescript
import { useState, useCallback } from 'react';

// Vietnamese translations (default)
const translations: Record<string, Record<string, string>> = {
  vi: {
    'app.title': 'Công Cụ Mã Hóa AES256GCM',
    'app.subtitle': 'Bảo vệ dữ liệu của bạn với mã hóa cấp quân sự',
    'app.description': 'Mã hóa và giải mã file an toàn với thuật toán AES-256-GCM',
    'nav.encrypt': 'Mã Hóa',
    'nav.decrypt': 'Giải Mã',
    'nav.about': 'Giới Thiệu',
    'encrypt.title': 'Mã Hóa File',
    'encrypt.subtitle': 'Tải lên file để mã hóa bảo mật',
    'encrypt.dropzone.title': 'Kéo thả file vào đây',
    'encrypt.dropzone.or': 'hoặc',
    'encrypt.dropzone.browse': 'Chọn file từ máy tính',
    'encrypt.dropzone.maxSize': 'Kích thước tối đa: 100MB',
    'encrypt.password.label': 'Mật khẩu mã hóa',
    'encrypt.password.placeholder': 'Nhập mật khẩu mạnh...',
    'encrypt.password.hint': 'Sử dụng mật khẩu ít nhất 12 ký tự với chữ hoa, chữ thường, số và ký tự đặc biệt',
    'encrypt.confirmPassword.label': 'Xác nhận mật khẩu',
    'encrypt.confirmPassword.placeholder': 'Nhập lại mật khẩu...',
    'encrypt.button': 'Mã Hóa File',
    'encrypt.processing': 'Đang mã hóa...',
    'encrypt.success': 'Mã hóa thành công!',
    'encrypt.error': 'Mã hóa thất bại',
    'decrypt.title': 'Giải Mã File',
    'decrypt.subtitle': 'Nhập token và mật khẩu để giải mã',
    'decrypt.token.label': 'Token mã hóa',
    'decrypt.token.placeholder': 'Dán token mã hóa vào đây...',
    'decrypt.password.label': 'Mật khẩu',
    'decrypt.password.placeholder': 'Nhập mật khẩu mã hóa...',
    'decrypt.button': 'Giải Mã',
    'decrypt.processing': 'Đang giải mã...',
    'decrypt.success': 'Giải mã thành công!',
    'decrypt.error': 'Giải mã thất bại - Kiểm tra token và mật khẩu',
    'result.title': 'Kết Quả Mã Hóa',
    'result.token': 'Token Bảo Mật',
    'result.filename': 'Tên file',
    'result.size': 'Kích thước',
    'result.copy': 'Sao chép',
    'result.download': 'Tải xuống',
    'result.copied': 'Đã sao chép!',
    'result.warning': 'Lưu ý: Token này chỉ hiển thị một lần. Hãy sao chép và lưu trữ an toàn!',
    'language.title': 'Ngôn ngữ',
    'language.vi': 'Tiếng Việt',
    'language.en': 'English',
    'language.zh': '中文',
    'language.ja': '日本語',
    'language.ko': '한국어',
    'footer.copyright': 'Bảo lưu mọi quyền.',
    'footer.tagline': 'Bảo mật dữ liệu là ưu tiên hàng đầu',
    'footer.security': 'Mã hóa AES-256-GCM',
    'footer.privacy': 'Dữ liệu được xử lý cục bộ',
    'footer.terms': 'Điều khoản sử dụng',
    'footer.contact': 'Liên hệ',
    'errors.fileTooLarge': 'File quá lớn. Kích thước tối đa là 100MB.',
    'errors.passwordMismatch': 'Mật khẩu không khớp',
    'errors.passwordTooShort': 'Mật khẩu phải có ít nhất 8 ký tự',
    'errors.invalidToken': 'Token không hợp lệ',
    'errors.missingFields': 'Vui lòng điền đầy đủ thông tin',
    'errors.decryptionFailed': 'Giải mã thất bại. Kiểm tra lại mật khẩu.',
    'errors.noFile': 'Vui lòng chọn file để mã hóa',
    'about.title': 'Giới Thiệu',
    'about.description': 'Công cụ mã hóa AES256GCM cung cấp giải pháp bảo mật dữ liệu đơn giản và hiệu quả. Tất cả dữ liệu được xử lý cục bộ trong trình duyệt, đảm bảo quyền riêng tư tuyệt đối.',
    'about.features.title': 'Tính Năng',
    'about.features.item1': 'Mã hóa AES-256-GCM cấp quân sự',
    'about.features.item2': 'Xử lý dữ liệu cục bộ - không gửi lên server',
    'about.features.item3': 'Hỗ trợ nhiều định dạng file',
    'about.features.item4': 'Giao diện thân thiện, dễ sử dụng',
    'about.features.item5': 'Đa ngôn ngữ',
    'about.howItWorks.title': 'Cách Hoạt Động',
    'about.howItWorks.step1': 'Chọn file cần mã hóa',
    'about.howItWorks.step2': 'Nhập mật khẩu mạnh',
    'about.howItWorks.step3': 'Nhận token bảo mật',
    'about.howItWorks.step4': 'Sử dụng token và mật khẩu để giải mã',
  },
  // ... (en, zh, ja, ko translations)
};

export function useTranslation() {
  const [language, setLanguage] = useState('vi');

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] || translations['vi'][key] || key;
    },
    [language]
  );

  const i18n = {
    language,
    changeLanguage: (lng: string) => {
      setLanguage(lng);
      localStorage.setItem('app-language', lng);
    },
  };

  return { t, i18n };
}
```

---

## 🔐 2. Crypto Utils

**File:** `src/utils/crypto.ts`

Chứa logic mã hóa/giải mã AES-256-GCM sử dụng Web Crypto API. Hỗ trợ cả mã hóa file và văn bản.

```typescript
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

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 128;
const ITERATIONS = 100000;

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

export async function encryptFile(
  file: File,
  password: string
): Promise<EncryptionResult> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);
    const fileData = await file.arrayBuffer();

    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv, tagLength: TAG_LENGTH },
      key,
      fileData
    );

    const encryptedBytes = new Uint8Array(encryptedData);
    const ciphertext = encryptedBytes.slice(0, -TAG_LENGTH / 8);
    const tag = encryptedBytes.slice(-TAG_LENGTH / 8);

    const encryptedResult: EncryptedData = {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      tag: arrayBufferToBase64(tag),
      filename: file.name,
      mimeType: file.type,
    };

    const token = btoa(JSON.stringify(encryptedResult));

    return { token, filename: file.name, size: file.size };
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

export async function decryptData(
  token: string,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  try {
    const encryptedData: EncryptedData = JSON.parse(atob(token));
    
    const salt = base64ToArrayBuffer(encryptedData.salt);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const tag = base64ToArrayBuffer(encryptedData.tag);

    const key = await deriveKey(password, new Uint8Array(salt));

    const encryptedBytes = new Uint8Array(ciphertext.byteLength + tag.byteLength);
    encryptedBytes.set(new Uint8Array(ciphertext), 0);
    encryptedBytes.set(new Uint8Array(tag), ciphertext.byteLength);

    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: new Uint8Array(iv), tagLength: TAG_LENGTH },
      key,
      encryptedBytes
    );

    const blob = new Blob([decryptedData], { 
      type: encryptedData.mimeType || 'application/octet-stream' 
    });

    return { blob, filename: encryptedData.filename || 'decrypted_file' };
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, strength: 'weak', message: 'Password must be at least 8 characters' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const score = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;

  if (password.length >= 12 && score >= 3) {
    return { valid: true, strength: 'strong', message: 'Strong password' };
  } else if (password.length >= 8 && score >= 2) {
    return { valid: true, strength: 'medium', message: 'Medium strength password' };
  } else {
    return { valid: true, strength: 'weak', message: 'Weak password' };
  }
}
```

---

## 🎨 3. CSS Styles

**File:** `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 6%;
    --foreground: 0 0% 98%;
    --card: 222 47% 8%;
    --card-foreground: 0 0% 98%;
    --primary: 250 95% 76%;
    --primary-foreground: 0 0% 100%;
    --secondary: 222 47% 15%;
    --secondary-foreground: 0 0% 98%;
    --muted: 222 30% 15%;
    --muted-foreground: 220 10% 60%;
    --accent: 280 95% 76%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 222 30% 20%;
    --input: 222 30% 20%;
    --ring: 250 95% 76%;
    --radius: 0.75rem;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-card-strong {
    @apply bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #667eea 0%, #f093fb 50%, #4facfe 100%);
  }

  .btn-gradient {
    @apply relative overflow-hidden text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  .btn-gradient-cyan {
    @apply relative overflow-hidden text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }

  .btn-gradient-cyan:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 172, 254, 0.6);
  }

  .input-glow {
    @apply bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 transition-all duration-300;
  }

  .input-glow:focus {
    @apply outline-none border-purple-400/50;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }

  .text-area-glow {
    @apply bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 transition-all duration-300 resize-none;
  }

  .text-area-glow:focus {
    @apply outline-none border-purple-400/50;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }

  .orb {
    @apply absolute rounded-full blur-3xl opacity-30;
    animation: float 6s ease-in-out infinite;
  }

  .drop-zone {
    @apply border-2 border-dashed border-white/20 rounded-2xl transition-all duration-300;
  }

  .drop-zone.drag-over {
    @apply border-purple-400/50 bg-purple-400/10;
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.2);
  }

  .token-display {
    @apply font-mono text-sm break-all;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border: 1px solid rgba(102, 126, 234, 0.3);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}
```

---

## 📄 Các File Component

Các file component đầy đủ đã được copy vào thư mục `src/components/`:

- `Header.tsx` - Thanh điều hướng với chọn ngôn ngữ
- `FileUpload.tsx` - Tải file với kéo thả
- `EncryptSection.tsx` - Form mã hóa với 2 chế độ: File và Văn bản
- `DecryptSection.tsx` - Form giải mã
- `TokenDisplay.tsx` - Hiển thị kết quả mã hóa
- `AboutSection.tsx` - Thông tin giới thiệu
- `Footer.tsx` - Chân trang

---

## 🚀 Cách Upload Lên GitHub

### Bước 1: Tạo Repository Mới

1. Vào GitHub → Click "New Repository"
2. Đặt tên: `aes256gcm-encryption-tool`
3. Chọn "Public" hoặc "Private"
4. Click "Create repository"

### Bước 2: Upload Files

**Cách 1: Upload trực tiếp**
1. Click "uploading an existing file"
2. Kéo thả tất cả file trong thư mục `github-upload/`
3. Commit changes

**Cách 2: Sử dụng Git**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/aes256gcm-encryption-tool.git
cd aes256gcm-encryption-tool

# Copy tất cả file từ github-upload/
cp -r /path/to/github-upload/* .

# Commit và push
git add .
git commit -m "Initial commit: AES256GCM Encryption Tool"
git push origin main
```

### Bước 3: Deploy với GitHub Pages (Tùy chọn)

1. Vào Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / root
4. Save

---

## 📞 Liên Hệ

**PHAMDUONG**
- Email: contact@phamduong.com

© 2024 PHAMDUONG. All rights reserved.
