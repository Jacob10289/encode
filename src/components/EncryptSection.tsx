import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Lock, Eye, EyeOff, Key, Loader2, FileText, Upload, Download } from 'lucide-react';
import FileUpload from './FileUpload';
import TokenDisplay from './TokenDisplay';
import { encryptFileToBlob, encryptText, validatePassword } from '../utils/crypto';

type EncryptMode = 'file' | 'text';

interface TextEncryptionResult {
  token: string;
  textLength: number;
  isText: true;
}

interface FileEncryptionResult {
  token: string;
  filename: string;
  blob: Blob;
  isText: false;
}

export default function EncryptSection() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EncryptMode>('file');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextEncryptionResult | FileEncryptionResult | null>(null);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleEncrypt = async () => {
    if (!password) {
      setError(t('errors.missingFields'));
      return;
    }

    if (password.length < 8) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (mode === 'file') {
      if (!selectedFile) {
        setError(t('errors.noFile'));
        return;
      }
    } else {
      if (!plaintext.trim()) {
        setError(t('errors.missingFields'));
        return;
      }
    }

    setError(null);
    setIsEncrypting(true);

    try {
      if (mode === 'file' && selectedFile) {
        // Mã hóa file → Tải xuống file .enc + token ngắn
        const { blob, token, filename } = await encryptFileToBlob(selectedFile, password);
        setResult({
          token,
          filename,
          blob,
          isText: false
        });
      } else {
        // Mã hóa text → Token Base58 ngắn gọn
        const { token, textLength } = await encryptText(plaintext, password);
        setResult({
          token,
          textLength,
          isText: true
        });
      }
    } catch (err) {
      setError(mode === 'file' ? t('encrypt.error') : t('textencrypt.error'));
      console.error('Encryption error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownloadEnc = () => {
    if (!result || result.isText) return;
    
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPlaintext('');
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setError(null);
  };

  const handleModeChange = (newMode: EncryptMode) => {
    setMode(newMode);
    setError(null);
    setSelectedFile(null);
    setPlaintext('');
    setResult(null);
  };

  // HIỂN THỊ KẾT QUẢ
  if (result) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-up">
        <div className="glass-card p-6 md:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            {mode === 'file' ? t('encrypt.success') : t('textencrypt.success')}
          </h3>

          {result.isText ? (
            // Hiển thị token cho text (ngắn gọn, dễ copy)
            <>
              <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/10">
                <label className="block text-white/60 text-sm mb-2">Token (Base58)</label>
                <textarea
                  readOnly
                  value={result.token}
                  className="w-full bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
                  rows={3}
                />
                <p className="text-white/40 text-xs mt-2">
                  Độ dài: {result.token.length} ký tự • {result.textLength} ký tự gốc
                </p>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Token đã được mã hóa bằng Base58 - khó nhận dạng hơn Base64 thông thường.
              </p>
            </>
          ) : (
            // Hiển thị download cho file
            <>
              <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/10">
                <p className="text-white/80 mb-2">File đã mã hóa: <span className="text-white font-medium">{result.filename}</span></p>
                <p className="text-white/60 text-sm mb-4">
                  File được mã hóa dạng binary (.enc) - Không thể đọc trực tiếp
                </p>
                <button
                  onClick={handleDownloadEnc}
                  className="btn-gradient flex items-center justify-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Tải xuống file .enc
                </button>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  <strong>Verification Token:</strong> {result.token.substring(0, 20)}...
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Dùng token này để xác minh file khi giải mã (không bắt buộc)
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Mã hóa khác
            </button>
            {result.isText && (
              <button
                onClick={() => navigator.clipboard.writeText(result.token)}
                className="px-6 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                Copy Token
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-glow">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {mode === 'file' ? t('encrypt.title') : t('textencrypt.title')}
        </h2>
        <p className="text-white/60">
          {mode === 'file' ? t('encrypt.subtitle') : t('textencrypt.subtitle')}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
        <button
          onClick={() => handleModeChange('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === 'file'
              ? 'text-white bg-white/10'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-4 h-4" />
          {t('encrypt.tab.file')}
        </button>
        <button
          onClick={() => handleModeChange('text')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === 'text'
              ? 'text-white bg-white/10'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t('encrypt.tab.text')}
        </button>
      </div>

      <div className="space-y-6">
        {mode === 'file' ? (
          <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
        ) : (
          <div className="glass-card p-6">
            <label className="block text-white/80 text-sm font-medium mb-2">
              {t('textencrypt.label')}
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder={t('textencrypt.placeholder')}
              className="text-area-glow w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />
            <p className="mt-2 text-white/40 text-xs text-right">
              {plaintext.length} {t('textencrypt.characters')}
            </p>
          </div>
        )}

        {/* Password Input */}
        <div className="glass-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('encrypt.password.label')}
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('encrypt.password.placeholder')}
                  className="input-glow w-full pl-12 pr-12 bg-white/5 border border-white/10 rounded-lg py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {password && (
                <p className={`mt-2 text-sm ${
                  passwordValidation.strength === 'strong' ? 'text-green-400' : 
                  passwordValidation.strength === 'medium' ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {t(passwordValidation.messageKey)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('encrypt.confirmPassword.label')}
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('encrypt.confirmPassword.placeholder')}
                  className="input-glow w-full pl-12 pr-12 bg-white/5 border border-white/10 rounded-lg py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-red-400 text-sm">{t('errors.passwordMismatch')}</p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="mt-2 text-green-400 text-sm">{t('password.match')}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
            {error}
          </div>
        )}

        <button
          onClick={handleEncrypt}
          disabled={isEncrypting || !passwordsMatch || (mode === 'file' ? !selectedFile : !plaintext.trim())}
          className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-medium"
        >
          {isEncrypting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'file' ? t('encrypt.processing') : t('textencrypt.processing')}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {mode === 'file' ? t('encrypt.button') : t('textencrypt.button')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
