import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Copy, Check, Download, AlertTriangle, File, FileText } from 'lucide-react';
import type { EncryptionResult } from '../utils/crypto';
import { formatFileSize } from '../utils/crypto';

interface TokenDisplayProps {
  result: EncryptionResult | { token: string; filename: string; size: number; isText?: boolean };
  onReset: () => void;
  isText?: boolean;
}

export default function TokenDisplay({ result, onReset, isText = false }: TokenDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `AES256GCM Encryption Token\n`,
        `========================\n\n`,
        `${isText ? 'Type: Text\n' : 'Filename: ' + result.filename + '\n'}`,
        `${isText ? 'Characters: ' + result.size + '\n' : 'Size: ' + formatFileSize(result.size) + '\n'}`,
        `Created: ${new Date().toLocaleString()}\n\n`,
        `TOKEN (keep this secure):\n`,
        `${result.token}\n`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isText ? 'encrypted_text.token.txt' : `${result.filename}.token.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card-strong p-6 md:p-8 animate-scale-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glow">
          <Check className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{isText ? t('textencrypt.success') : t('encrypt.success')}</h3>
          <p className="text-white/60 text-sm">{t('result.title')}</p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-200/80 text-sm">{t('result.warning')}</p>
      </div>

      {/* Info */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          {isText ? (
            <FileText className="w-5 h-5 text-cyan-400" />
          ) : (
            <File className="w-5 h-5 text-purple-400" />
          )}
          <span className="text-white/60 text-sm">
            {isText ? t('textencrypt.label') : t('result.filename')}
          </span>
        </div>
        <p className="text-white font-medium truncate pl-8">
          {isText ? `${result.size} characters` : result.filename}
        </p>
        {!isText && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
            <span className="text-white/60 text-sm">{t('result.size')}</span>
            <span className="text-white font-medium">{formatFileSize(result.size)}</span>
          </div>
        )}
      </div>

      {/* Token Display */}
      <div className="mb-6">
        <label className="block text-white/60 text-sm mb-2">{t('result.token')}</label>
        <div className="relative">
          <div className="token-display p-4 rounded-xl max-h-40 overflow-y-auto text-xs md:text-sm text-white/80">
            {result.token}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-white/70" />
            )}
          </button>
        </div>
        {copied && (
          <p className="mt-2 text-green-400 text-sm animate-fade-in">{t('result.copied')}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          className="btn-gradient-cyan flex items-center justify-center gap-2 flex-1"
        >
          <Download className="w-4 h-4" />
          {t('result.download')}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium transition-all duration-300"
        >
          {isText ? 'Mã hóa văn bản khác' : 'Mã hóa file khác'}
        </button>
      </div>
    </div>
  );
}
