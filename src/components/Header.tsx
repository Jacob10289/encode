import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Globe, Menu, X, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'encrypt' | 'decrypt' | 'about';
  onTabChange: (tab: 'encrypt' | 'decrypt' | 'about') => void;
}

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-b border-white/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-glow">
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold gradient-text">
                AES256GCM
              </h1>
              <p className="text-xs text-white/50">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: 'encrypt', label: t('nav.encrypt') },
              { key: 'decrypt', label: t('nav.decrypt') },
              { key: 'about', label: t('nav.about') },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key as 'encrypt' | 'decrypt' | 'about')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === item.key
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Language Selector & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
              >
                <Globe className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/80 hidden sm:inline">{currentLang.flag}</span>
                <span className="text-sm text-white/80">{currentLang.code.toUpperCase()}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 py-2 min-w-[160px] glass-card-strong animate-scale-in">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                        i18n.language === lang.code
                          ? 'text-white bg-white/10'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10 animate-slide-up">
            <div className="flex flex-col gap-2">
              {[
                { key: 'encrypt', label: t('nav.encrypt') },
                { key: 'decrypt', label: t('nav.decrypt') },
                { key: 'about', label: t('nav.about') },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onTabChange(item.key as 'encrypt' | 'decrypt' | 'about');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-left ${
                    activeTab === item.key
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
