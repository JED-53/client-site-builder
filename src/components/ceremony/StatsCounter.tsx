import { motion } from 'framer-motion';
import { useParrainageStore } from '@/store/useParrainageStore';
import { Promotion } from '@/types/student';

export const StatsCounter = () => {
  const { students, pairings } = useParrainageStore();
  
  const promotions: Promotion[] = ['B1', 'B2', 'B3', 'M1', 'M2'];
  
  const filleulsRestants = students.filter(
    (s) => s.status === 'disponible' && ['B1', 'B2', 'B3', 'M1'].includes(s.promotion)
  ).length;

  const countByPromotion = (promo: Promotion) => {
    const total = students.filter((s) => s.promotion === promo).length;
    const paired = students.filter(
      (s) => s.promotion === promo && s.status !== 'disponible'
    ).length;
    return { total, paired };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="card-gradient border border-border rounded-2xl p-6 backdrop-blur-lg">
        <div className="flex flex-col items-center gap-6">
          {/* Main counter */}
          <div className="text-center border-b border-border pb-4 w-full">
            <div className="text-4xl font-bold font-display text-gradient">
              {pairings.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Paires créées</div>
          </div>
          
          <div className="text-center border-b border-border pb-4 w-full">
            <div className="text-4xl font-bold font-display text-accent">
              {filleulsRestants}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Filleuls restants</div>
          </div>
          
          {/* Promotion breakdown */}
          <div className="flex flex-col gap-3 w-full">
            {promotions.map((promo) => {
              const { total, paired } = countByPromotion(promo);
              if (total === 0) return null;
              
              return (
                <div key={promo} className="text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {paired}/{total}
                  </div>
                  <div className="text-xs text-muted-foreground">{promo}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
