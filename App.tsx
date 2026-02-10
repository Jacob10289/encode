import { useState, useEffect } from 'react';
import { useTranslation } from './hooks/useTranslation';
import Header from './components/Header';
import EncryptSection from './components/EncryptSection';
import DecryptSection from './components/DecryptSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'about'>('encrypt');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'encrypt':
        return <EncryptSection />;
      case 'decrypt':
        return <DecryptSection />;
      case 'about':
        return <AboutSection />;
      default:
        return <EncryptSection />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1 w-96 h-96 -top-48 -left-48" />
        <div className="orb orb-2 w-80 h-80 top-1/3 -right-40" />
        <div className="orb orb-3 w-72 h-72 bottom-20 left-1/4" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Hero Section */}
        <section className="pt-32 md:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-sm">{t('footer.security')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slide-up">
              <span className="gradient-text">{t('app.title')}</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto animate-slide-up animation-delay-100">
              {t('app.description')}
            </p>
          </div>
        </section>

        {/* Main Section */}
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
