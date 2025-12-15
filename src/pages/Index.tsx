import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { CeremonyScreen } from '@/components/ceremony/CeremonyScreen';
import keyceLogo from '@/assets/keyce-logo.png';

type View = 'landing' | 'admin' | 'ceremony';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('landing');

  if (currentView === 'ceremony') {
    return <CeremonyScreen onExit={() => setCurrentView('admin')} />;
  }

  if (currentView === 'admin') {
    return <AdminPanel onStartCeremony={() => setCurrentView('ceremony')} />;
  }

  return (
    <div className="min-h-screen ceremony-bg overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 particle-bg" />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-32 h-32 mx-auto mb-6"
          >
            <img src={keyceLogo} alt="Keyce Informatique & I.A." className="w-full h-full object-contain drop-shadow-lg" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold font-display mb-4"
          >
            <span className="text-gradient">Parrainage</span>
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-display text-foreground/80 mb-4"
          >
            Keyce Informatique
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground max-w-md mx-auto"
          >
            Application de gestion automatisée du parrainage entre les promotions
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl w-full"
        >
          {[
            { icon: '📚', title: 'Import CSV', desc: 'Importez facilement vos listes d\'étudiants' },
            { icon: '🎲', title: 'Tirage automatique', desc: 'Attribution équilibrée selon les règles' },
            { icon: '✨', title: 'Animations', desc: 'Révélations spectaculaires pour la cérémonie' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="card-gradient border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            variant="ceremony"
            size="xl"
            onClick={() => setCurrentView('admin')}
            className="group"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Commencer
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Pairing rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Règles de parrainage</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { from: 'B2', to: 'B1' },
              { from: 'B3', to: 'B2' },
              { from: 'M1', to: 'B3' },
              { from: 'M2', to: 'M1' },
            ].map((rule, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border"
              >
                <span className="text-primary font-medium">{rule.from}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-accent font-medium">{rule.to}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
