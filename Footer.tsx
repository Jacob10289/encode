import { useTranslation } from '../hooks/useTranslation';
import { Shield, Lock, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">AES256GCM</h3>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {t('app.subtitle')}
            </p>
          </div>

          {/* Security Info */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              {t('footer.security')}
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {t('footer.privacy')}
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                AES-256-GCM Encryption
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                PBKDF2 Key Derivation
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              {t('footer.contact')}
            </h4>
            <a
              href="mailto:contact@phamduong.com"
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
            >
              contact@phamduong.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            © {currentYear} PHAMDUONG. {t('footer.copyright')}
          </p>
          <p className="text-white/30 text-xs">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
