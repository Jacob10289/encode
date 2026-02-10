import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Unlock, Eye, EyeOff, Key, Loader2, FileDown, Check, Copy } from 'lucide-react';
import { decryptData, decryptText, isTextToken } from '../utils/crypto';

export default function DecryptSection() {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<{ blob: Blob; filename: string } | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [textCopied, setTextCopied] = useState(false);

  const handleDecrypt = async () => {
    if (!token.trim() || !password) {
      setError(t('errors.missingFields'));
      return;
    }

    setError(null);
    setIsDecrypting(true);
    setSuccess(false);
    setDecryptedFile(null);
    setDecryptedText(null);

    try {
      // Check if token is for text or file
      const isText = isTextToken(token.trim());
      
      if (isText) {
        const result = await decryptText(token.trim(), password);
        setDecryptedText(result);
      } else {
        const result = await decryptData(token.trim(), password);
        setDecryptedFile(result);
      }
      setSuccess(true);
    } catch (err) {
      setError(t('errors.decryptionFailed'));
      console.error('Decryption error:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedFile) return;

    const url = URL.createObjectURL(decryptedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    if (!decryptedText) return;
    try {
      await navigator.clipboard.writeText(decryptedText);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = () => {
    setToken('');
    setPassword('');
    setError(null);
    setSuccess(false);
    setDecryptedFile(null);
    setDecryptedText(null);
    setTextCopied(false);
  };

  const isText = decryptedText !== null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4 shadow-glow-cyan">
          <Unlock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {isText ? t('textdecrypt.title') : t('decrypt.title')}
        </h2>
        <p className="text-white/60">
          {isText ? t('textdecrypt.subtitle') : t('decrypt.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Token Input */}
        <div className="glass-card p-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            {t('decrypt.token.label')}
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('decrypt.token.placeholder')}
            className="text-area-glow w-full h-32 font-mono text-sm"
          />
        </div>

        {/* Password Input */}
        <div className="glass-card p-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            {t('decrypt.password.label')}
          </label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('decrypt.password.placeholder')}
              className="input-glow w-full pl-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
            {error}
          </div>
        )}

        {/* Success - Text Decryption */}
        {success && decryptedText !== null && (
          <div className="glass-card-strong p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{t('decrypt.success')}</h3>
                <p className="text-white/60 text-sm">{t('textdecrypt.result.label')}</p>
              </div>
            </div>
            
            {/* Decrypted Text Display */}
            <div className="mb-4">
              <div className="relative">
                <textarea
                  value={decryptedText}
                  readOnly
                  className="text-area-glow w-full h-40 bg-white/5"
                  placeholder={t('textdecrypt.result.placeholder')}
                />
                <button
                  onClick={handleCopyText}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                >
                  {textCopied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
              {textCopied && (
                <p className="mt-2 text-green-400 text-sm animate-fade-in">{t('result.copied')}</p>
              )}
            </div>
            
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium transition-all duration-300"
            >
              Giải mã nội dung khác
            </button>
          </div>
        )}

        {/* Success - File Decryption */}
        {success && decryptedFile !== null && (
          <div className="glass-card-strong p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{t('decrypt.success')}</h3>
                <p className="text-white/60 text-sm">{decryptedFile.filename}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="btn-gradient-cyan flex items-center justify-center gap-2 flex-1"
              >
                <FileDown className="w-5 h-5" />
                {t('result.download')}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium transition-all duration-300"
              >
                Giải mã file khác
              </button>
            </div>
          </div>
        )}

        {/* Decrypt Button */}
        {!success && (
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting || !token.trim() || !password}
            className="btn-gradient-cyan w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isDecrypting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('decrypt.processing')}
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                {t('decrypt.button')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
