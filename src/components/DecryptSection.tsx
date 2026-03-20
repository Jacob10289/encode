import { useState, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Unlock, Eye, EyeOff, Loader2, FileText, Upload, Download } from 'lucide-react';
import { decryptFileFromBlob, decryptText, isValidTextToken } from '../utils/crypto';

type DecryptMode = 'file' | 'text';

export default function DecryptSection() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<DecryptMode>('text');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{text?: string; blob?: Blob; filename?: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDecrypt = async () => {
    if (!password) {
      setError(t('errors.missingFields'));
      return;
    }

    if (mode === 'text' && !token) {
      setError(t('errors.missingFields'));
      return;
    }

    if (mode === 'file' && !selectedFile) {
      setError('Vui lòng chọn file .enc để giải mã');
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      if (mode === 'text') {
        const text = await decryptText(token.trim(), password);
        setResult({ text });
      } else {
        const { blob, filename } = await decryptFileFromBlob(selectedFile!, password);
        setResult({ blob, filename });
      }
    } catch (err) {
      setError(t('errors.decryptionFailed'));
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!result?.blob) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename || 'decrypted_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setToken('');
    setPassword('');
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (result) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-up">
        <div className="glass-card p-6 md:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6">
            <Unlock className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">{t('decrypt.success')}</h3>

          {result.text ? (
            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/10 text-left">
              <label className="block text-white/60 text-sm mb-2">Nội dung:</label>
              <textarea
                readOnly
                value={result.text}
                className="w-full bg-transparent text-white font-mono text-sm resize-none focus:outline-none h-40"
              />
            </div>
          ) : (
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/10">
              <p className="text-white mb-2">File: {result.filename}</p>
              <button
                onClick={handleDownload}
                className="btn-gradient flex items-center justify-center gap-2 mx-auto"
              >
                <Download className="w-5 h-5" />
                Tải xuống file
              </button>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Giải mã khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-glow">
          <Unlock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('decrypt.title')}</h2>
        <p className="text-white/60">{t('decrypt.subtitle')}</p>
      </div>

      <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            mode === 'text' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          Token Text
        </button>
        <button
          onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            mode === 'file' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-4 h-4" />
          File .enc
        </button>
      </div>

      <div className="space-y-6">
        {mode === 'text' ? (
          <div className="glass-card p-6">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Token (Base58)
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dán token vào đây..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 font-mono text-sm"
            />
            <p className="mt-2 text-white/40 text-xs">
              Token đã được mã hóa bằng Base58 - không còn dạng Base64 thông thường
            </p>
          </div>
        ) : (
          <div className="glass-card p-6">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Chọn file .enc
            </label>
            <input
              type="file"
              accept=".enc"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="w-full text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
            />
            {selectedFile && (
              <p className="mt-2 text-green-400 text-sm">
                Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        <div className="glass-card p-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            {t('decrypt.password.label')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('decrypt.password.placeholder')}
              className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleDecrypt}
          disabled={isDecrypting}
          className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {isDecrypting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('decrypt.processing')}</>
          ) : (
            <><Unlock className="w-5 h-5" /> {t('decrypt.button')}</>
          )}
        </button>
      </div>
    </div>
  );
}
