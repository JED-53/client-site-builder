import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Undo2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentCard } from './StudentCard';
import { ConnectionLine } from './ConnectionLine';
import { StatsCounter } from './StatsCounter';
import { useParrainageStore } from '@/store/useParrainageStore';
import { Pairing } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

interface CeremonyScreenProps {
  onExit: () => void;
}

export const CeremonyScreen = ({ onExit }: CeremonyScreenProps) => {
  const { generatePairing, undoLastPairing, resetAllPairings, students, pairings } = useParrainageStore();
  const [currentPairing, setCurrentPairing] = useState<Pairing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const { toast } = useToast();

  const handleGeneratePairing = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setShowConnection(false);
    setCurrentPairing(null);

    // Petit délai pour l'effet dramatique
    await new Promise((r) => setTimeout(r, 500));

    const pairing = generatePairing();
    
    if (!pairing) {
      toast({
        title: "Tirage terminé",
        description: "Tous les étudiants ont été attribués !",
        variant: "default",
      });
      setIsGenerating(false);
      return;
    }

    setCurrentPairing(pairing);
    
    // Afficher la connexion après un délai
    setTimeout(() => {
      setShowConnection(true);
    }, 800);

    setIsGenerating(false);
  }, [generatePairing, isGenerating, toast]);

  const handleUndo = () => {
    undoLastPairing();
    setCurrentPairing(null);
    setShowConnection(false);
    toast({
      title: "Annulé",
      description: "La dernière attribution a été annulée.",
    });
  };

  const handleReset = () => {
    resetAllPairings();
    setCurrentPairing(null);
    setShowConnection(false);
    toast({
      title: "Réinitialisé",
      description: "Toutes les attributions ont été effacées.",
      variant: "destructive",
    });
  };

  const filleulsRestants = students.filter(
    (s) => s.status === 'disponible' && ['B1', 'B2', 'B3', 'M1'].includes(s.promotion)
  ).length;

  return (
    <div className="fixed inset-0 ceremony-bg overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 particle-bg opacity-50" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8 right-8 flex justify-between items-center z-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-gradient">
              Cérémonie de Parrainage
            </h1>
            <p className="text-sm text-muted-foreground">Keyce Informatique</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="glow"
            size="sm"
            onClick={handleUndo}
            disabled={pairings.length === 0}
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            disabled={pairings.length === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" size="sm" onClick={onExit}>
            Quitter
          </Button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="h-full flex flex-col items-center justify-center">
        {/* Cards section */}
        <div className="flex items-center justify-center mb-12">
          <StudentCard
            student={currentPairing?.filleul || null}
            type="filleul"
            isRevealing={!!currentPairing}
          />
          
          <ConnectionLine isVisible={showConnection} />
          
          <StudentCard
            student={currentPairing?.parrain || null}
            type="parrain"
            isRevealing={!!currentPairing}
          />
        </div>

        {/* Reveal text */}
        <AnimatePresence>
          {currentPairing && showConnection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-8"
            >
              <p className="text-2xl font-display">
                <span className="text-accent">{currentPairing.filleul.prenom}</span>
                {' '}devient filleul(e) de{' '}
                <span className="text-primary">{currentPairing.parrain.prenom}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ceremony"
            size="xl"
            onClick={handleGeneratePairing}
            disabled={isGenerating || filleulsRestants === 0}
            className="relative overflow-hidden"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                </motion.div>
                Tirage en cours...
              </>
            ) : filleulsRestants === 0 ? (
              'Tous les étudiants sont attribués !'
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer une paire
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Stats counter */}
      <StatsCounter />
    </div>
  );
};
