import { useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Upload, File, X, Check } from 'lucide-react';
import { formatFileSize } from '../utils/crypto';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errors.fileTooLarge'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, t]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, t]);

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
    setError(null);
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="glass-card p-6 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <File className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{selectedFile.name}</p>
            <p className="text-white/50 text-sm">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 transition-all duration-300 group"
          >
            <X className="w-5 h-5 text-white/60 group-hover:text-red-400" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
          <Check className="w-4 h-4" />
          <span>File đã sẵn sàng để mã hóa</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone p-8 md:p-12 text-center transition-all duration-300 ${
          isDragOver ? 'drag-over' : 'hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer block"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-white font-medium text-lg mb-2">
            {t('encrypt.dropzone.title')}
          </p>
          <p className="text-white/50 mb-4">{t('encrypt.dropzone.or')}</p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 text-white font-medium">
            <File className="w-4 h-4" />
            {t('encrypt.dropzone.browse')}
          </span>
          <p className="text-white/40 text-sm mt-4">
            {t('encrypt.dropzone.maxSize')}
          </p>
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
          {error}
        </div>
      )}
    </div>
  );
}
