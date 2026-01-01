import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParrainageStore } from '@/store/useParrainageStore';
import { Promotion, getGodparentPromotion } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

interface ManualPairingDialogProps {
  onPairingCreated?: () => void;
}

export const ManualPairingDialog = ({ onPairingCreated }: ManualPairingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFilleul, setSelectedFilleul] = useState<string>('');
  const [selectedParrain, setSelectedParrain] = useState<string>('');
  const { students, createManualPairing, getCompatibleParrains } = useParrainageStore();
  const { toast } = useToast();

  // Filleuls disponibles (B1, B2, B3, M1 sans parrain)
  const availableFilleuls = useMemo(() => {
    return students.filter(
      (s) => !s.hasParrain && ['B1', 'B2', 'B3', 'M1'].includes(s.promotion)
    );
  }, [students]);

  // Parrains compatibles basés sur le filleul sélectionné
  const compatibleParrains = useMemo(() => {
    if (!selectedFilleul) return [];
    const filleul = students.find((s) => s.id === selectedFilleul);
    if (!filleul) return [];
    return getCompatibleParrains(filleul.promotion);
  }, [selectedFilleul, students, getCompatibleParrains]);

  const handleCreatePairing = () => {
    if (!selectedFilleul || !selectedParrain) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un filleul et un parrain.",
        variant: "destructive",
      });
      return;
    }

    const pairing = createManualPairing(selectedParrain, selectedFilleul);
    
    if (pairing) {
      toast({
        title: "Paire créée",
        description: `${pairing.filleul.prenom} est maintenant filleul(e) de ${pairing.parrain.prenom}`,
      });
      setSelectedFilleul('');
      setSelectedParrain('');
      setOpen(false);
      onPairingCreated?.();
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de créer cette paire.",
        variant: "destructive",
      });
    }
  };

  const getPromotionLabel = (promotion: Promotion) => {
    const parrainPromo = getGodparentPromotion(promotion);
    return parrainPromo ? `${promotion} → Parrain ${parrainPromo}` : promotion;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Paire manuelle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Créer une paire manuellement
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Sélection du filleul */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Filleul(e)
            </label>
            <Select
              value={selectedFilleul}
              onValueChange={(value) => {
                setSelectedFilleul(value);
                setSelectedParrain(''); // Reset parrain when filleul changes
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un filleul" />
              </SelectTrigger>
              <SelectContent>
                {availableFilleuls.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun filleul disponible
                  </SelectItem>
                ) : (
                  availableFilleuls.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.prenom} {student.nom} ({student.promotion})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection du parrain */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Parrain/Marraine
            </label>
            <Select
              value={selectedParrain}
              onValueChange={setSelectedParrain}
              disabled={!selectedFilleul}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedFilleul ? "Sélectionner un parrain" : "Sélectionnez d'abord un filleul"} />
              </SelectTrigger>
              <SelectContent>
                {compatibleParrains.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun parrain compatible
                  </SelectItem>
                ) : (
                  compatibleParrains.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.prenom} {student.nom} ({student.promotion})
                      {student.filleulsCount ? ` - ${student.filleulsCount} filleul(s)` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedFilleul && (
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const filleul = students.find((s) => s.id === selectedFilleul);
                  if (!filleul) return '';
                  const parrainPromo = getGodparentPromotion(filleul.promotion);
                  return parrainPromo 
                    ? `Les parrains doivent être en ${parrainPromo}`
                    : 'Aucun parrain possible pour cette promotion';
                })()}
              </p>
            )}
          </div>

          {/* Bouton de création */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ceremony"
              className="w-full"
              onClick={handleCreatePairing}
              disabled={!selectedFilleul || !selectedParrain}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Créer la paire
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
