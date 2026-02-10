import { useTranslation } from '../hooks/useTranslation';
import { Shield, Lock, Server, FileCheck, Globe, ChevronRight } from 'lucide-react';

export default function AboutSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, text: t('about.features.item1') },
    { icon: Server, text: t('about.features.item2') },
    { icon: FileCheck, text: t('about.features.item3') },
    { icon: Lock, text: t('about.features.item4') },
    { icon: Globe, text: t('about.features.item5') },
  ];

  const steps = [
    t('about.howItWorks.step1'),
    t('about.howItWorks.step2'),
    t('about.howItWorks.step3'),
    t('about.howItWorks.step4'),
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('about.title')}
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('about.description')}
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          {t('about.features.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-5 hover:bg-white/10 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card-strong p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6 text-cyan-400" />
          {t('about.howItWorks.title')}
        </h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-white/80">{step}</p>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-white/30 ml-auto hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
