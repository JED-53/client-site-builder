import { motion } from 'framer-motion';
import { Download, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParrainageStore } from '@/store/useParrainageStore';

export const PairingHistory = () => {
  const { pairings } = useParrainageStore();

  const exportToCSV = () => {
    const headers = ['Filleul Nom', 'Filleul Prénom', 'Filleul Promotion', 'Parrain Nom', 'Parrain Prénom', 'Parrain Promotion', 'Date'];
    
    const rows = pairings.map((p) => [
      p.filleul.nom,
      p.filleul.prenom,
      p.filleul.promotion,
      p.parrain.nom,
      p.parrain.prenom,
      p.parrain.promotion,
      new Date(p.timestamp).toLocaleString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `parrainage_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Historique des attributions</h3>
          <p className="text-sm text-muted-foreground">{pairings.length} paire(s) créée(s)</p>
        </div>
        {pairings.length > 0 && (
          <Button variant="glow" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {pairings.length === 0 ? (
          <div className="card-gradient border border-border rounded-xl p-8 text-center text-muted-foreground">
            Aucune attribution pour le moment. Lancez la cérémonie pour commencer !
          </div>
        ) : (
          pairings.map((pairing, index) => (
            <motion.div
              key={pairing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-gradient border border-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Number */}
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Filleul */}
                  <div className="text-center">
                    <div className="text-xs text-accent uppercase tracking-wider mb-1">Filleul</div>
                    <div className="font-medium">{pairing.filleul.prenom} {pairing.filleul.nom}</div>
                    <div className="text-xs text-muted-foreground">{pairing.filleul.promotion}</div>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  
                  {/* Parrain */}
                  <div className="text-center">
                    <div className="text-xs text-primary uppercase tracking-wider mb-1">Parrain</div>
                    <div className="font-medium">{pairing.parrain.prenom} {pairing.parrain.nom}</div>
                    <div className="text-xs text-muted-foreground">{pairing.parrain.promotion}</div>
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(pairing.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
