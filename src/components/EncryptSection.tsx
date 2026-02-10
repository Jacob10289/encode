import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Lock, Eye, EyeOff, Key, Loader2, FileText, Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import TokenDisplay from './TokenDisplay';
import { encryptFile, encryptText, validatePassword } from '../utils/crypto';
import type { EncryptionResult } from '../utils/crypto';

type EncryptMode = 'file' | 'text';

interface TextEncryptionResultDisplay {
  token: string;
  filename: string;
  size: number;
  isText: true;
}

export default function EncryptSection() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EncryptMode>('file');

  // File encryption state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Text encryption state
  const [plaintext, setPlaintext] = useState('');

  // Common state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EncryptionResult | TextEncryptionResultDisplay | null>(null);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleEncrypt = async () => {
    if (!password) {
      setError(t('errors.missingFields'));
      return;
    }

    // Keep this check explicit (fast UX) even though validatePassword also checks length
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
        const encryptionResult = await encryptFile(selectedFile, password);
        setResult(encryptionResult);
      } else {
        const textResult = await encryptText(plaintext, password);
        setResult({
          token: textResult.token,
          filename: 'encrypted_text.txt',
          size: textResult.textLength,
          isText: true,
        });
      }
    } catch (err) {
      setError(mode === 'file' ? t('encrypt.error') : t('textencrypt.error'));
      console.error('Encryption error:', err);
    } finally {
      setIsEncrypting(false);
    }
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
  };

  if (result) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <TokenDisplay result={result} onReset={handleReset} isText={mode === 'text'} />
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
        {/* File Upload or Text Input */}
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
              className="text-area-glow w-full h-40"
            />
            <p className="mt-2 text-white/40 text-xs text-right">
              {plaintext.length} {t('textencrypt.characters')}
            </p>
          </div>
        )}

        {/* Password Input */}
        <div className="glass-card p-6">
          <div className="space-y-4">
            {/* Password */}
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

              {password && (
                <p
                  className={`mt-2 text-sm ${
                    passwordValidation.strength === 'strong'
                      ? 'text-green-400'
                      : passwordValidation.strength === 'medium'
                      ? 'text-yellow-400'
                      : 'text-orange-400'
                  }`}
                >
                  {/* IMPORTANT: validatePassword now returns messageKey */}
                  {t(passwordValidation.messageKey)}
                </p>
              )}

              <p className="mt-2 text-white/40 text-xs">{t('encrypt.password.hint')}</p>
            </div>

            {/* Confirm Password */}
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
                  className="input-glow w-full pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
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

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
            {error}
          </div>
        )}

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          disabled={
            isEncrypting ||
            !passwordsMatch ||
            (mode === 'file' ? !selectedFile : !plaintext.trim())
          }
          className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
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
