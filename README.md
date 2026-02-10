# 🔐 AES256GCM Encryption Tool

Một công cụ mã hóa/giải mã file chuyên nghiệp sử dụng thuật toán AES-256-GCM cấp quân sự. Dữ liệu được xử lý hoàn toàn cục bộ trong trình duyệt, đảm bảo quyền riêng tư tuyệt đối.

## 🌟 Tính Năng

- **🔒 Mã hóa AES-256-GCM** - Thuật toán mã hóa cấp quân sự
- **💻 Xử lý cục bộ** - Dữ liệu không bao giờ rồi khỏi trình duyệt
- **🌍 Đa ngôn ngữ** - Hỗ trợ 5 ngôn ngữ (Việt, Anh, Trung, Nhật, Hàn)
- **📁 Mã hóa File** - Hỗ trợ mọi loại file (tối đa 100MB)
- **📝 Mã hóa Văn bản** - Nhập trực tiếp nội dung văn bản để mã hóa
- **🎨 Giao diện đẹp** - Thiết kế gradient hiện đại với hiệu ứng ánh sáng
- **⚡ Dễ sử dụng** - Kéo thả file, giao diện trực quan

## 🚀 Demo

Truy cập: [https://gpse2s4guz7es.ok.kimi.link](https://gpse2s4guz7es.ok.kimi.link)

## 📋 Cách Sử Dụng

### Mã Hóa File

1. Chọn tab "Mã Hóa" → "Mã hóa File"
2. Kéo thả file vào vùng chỉ định hoặc click để chọn file
3. Nhập mật khẩu mạnh (ít nhất 8 ký tự)
4. Xác nhận mật khẩu
5. Click "Mã Hóa File"
6. Sao chép và lưu trữ token an toàn

### Mã Hóa Văn Bản

1. Chọn tab "Mã Hóa" → "Mã hóa Văn bản"
2. Nhập nội dung văn bản cần mã hóa
3. Nhập mật khẩu mạnh (ít nhất 8 ký tự)
4. Xác nhận mật khẩu
5. Click "Mã Hóa Văn Bản"
6. Sao chép và lưu trữ token an toàn

### Giải Mã

1. Chọn tab "Giải Mã"
2. Dán token mã hóa vào ô nhập
3. Nhập mật khẩu đã dùng để mã hóa
4. Click "Giải Mã"
5. Nếu là file: Tải file đã giải mã về máy
6. Nếu là văn bản: Sao chép nội dung đã giải mã

## 🛠️ Cài Đặt và Chạy Local

### Yêu Cầu

- Node.js 18+
- npm hoặc yarn

### Các Bước

```bash
# Clone repository
git clone <repository-url>
cd aes256gcm-encryption-tool

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## 📁 Cấu Trúc Dự Án

```
aes256gcm-encryption-tool/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── FileUpload.tsx   # File upload with drag-drop
│   │   ├── TokenDisplay.tsx # Display encryption results
│   │   ├── EncryptSection.tsx
│   │   ├── DecryptSection.tsx
│   │   ├── AboutSection.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useTranslation.ts # Multi-language support hook
│   ├── utils/
│   │   └── crypto.ts        # AES-256-GCM encryption logic
│   ├── App.tsx              # Main application
│   ├── App.css              # Application styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Công Nghệ Sử Dụng

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Web Crypto API** - Native browser encryption
- **Lucide React** - Icons

## 🔐 Bảo Mật

- Sử dụng **AES-256-GCM** - Thuật toán mã hóa đối xứng cấp quân sự
- **PBKDF2** với 100,000 iterations để dẫn xuất khóa từ mật khẩu
- **IV ngẫu nhiên** cho mỗi lần mã hóa
- **Salt ngẫu nhiên** chống lại tấn công rainbow table
- **Xác thực dữ liệu** với GCM authentication tag

## 🌐 Ngôn Ngữ Hỗ Trợ

| Ngôn Ngữ | Mã |
|----------|-----|
| Tiếng Việt | vi |
| English | en |
| 中文 | zh |
| 日本語 | ja |
| 한국어 | ko |

## 📝 License

© 2024 PHAMDUONG. All rights reserved.

## 👤 Tác Giả

**PHAMDUONG**

- Email: contact@phamduong.com

---

## Code Snippets

Dưới đây là các đoạn code chính của dự án:

### 1. useTranslation Hook (`src/hooks/useTranslation.ts`)

Hook tùy chỉnh để quản lý đa ngôn ngữ mà không cần thư viện bên ngoài.

### 2. Crypto Utils (`src/utils/crypto.ts`)

Chứa logic mã hóa/giải mã AES-256-GCM sử dụng Web Crypto API.

### 3. Components

Các component React cho giao diện ngườ dùng:
- `Header.tsx` - Thanh điều hướng với chọn ngôn ngữ
- `FileUpload.tsx` - Tải file với kéo thả
- `EncryptSection.tsx` - Form mã hóa
- `DecryptSection.tsx` - Form giải mã
- `TokenDisplay.tsx` - Hiển thị kết quả mã hóa
- `AboutSection.tsx` - Thông tin giới thiệu
- `Footer.tsx` - Chân trang

### 4. Styles (`src/index.css`)

CSS tùy chỉnh với:
- Glassmorphism effects
- Gradient animations
- Custom scrollbar
- Responsive design
