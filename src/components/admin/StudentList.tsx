import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParrainageStore } from '@/store/useParrainageStore';
import { Promotion } from '@/types/student';

export const StudentList = () => {
  const { students, removeStudent } = useParrainageStore();
  const [search, setSearch] = useState('');
  const [filterPromotion, setFilterPromotion] = useState<Promotion | 'all'>('all');

  const promotions: (Promotion | 'all')[] = ['all', 'B1', 'B2', 'B3', 'M1', 'M2'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.nom.toLowerCase().includes(search.toLowerCase()) ||
      student.prenom.toLowerCase().includes(search.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(search.toLowerCase());
    
    const matchesPromotion = filterPromotion === 'all' || student.promotion === filterPromotion;

    return matchesSearch && matchesPromotion;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'parrain': return 'bg-primary/20 text-primary border-primary/30';
      case 'filleul': return 'bg-accent/20 text-accent border-accent/30';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        
        <div className="flex gap-2">
          {promotions.map((promo) => (
            <Button
              key={promo}
              variant={filterPromotion === promo ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPromotion(promo)}
            >
              {promo === 'all' ? 'Tous' : promo}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card-gradient border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_100px_80px_80px_60px] gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
          <div>Nom</div>
          <div>Prénom</div>
          <div>Matricule</div>
          <div>Promo</div>
          <div>Statut</div>
          <div></div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[1fr_1fr_100px_80px_80px_60px] gap-4 p-4 border-b border-border/50 items-center hover:bg-secondary/30 transition-colors"
              >
                <div className="font-medium">{student.nom}</div>
                <div>{student.prenom}</div>
                <div className="text-muted-foreground text-sm">
                  {student.matricule || '-'}
                </div>
                <div>
                  <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                    {student.promotion}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStudent(student.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {students.length === 0 
                ? "Aucun étudiant. Importez un fichier CSV pour commencer."
                : "Aucun résultat pour cette recherche."
              }
            </div>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="text-sm text-muted-foreground">
        Affichage de {filteredStudents.length} sur {students.length} étudiants
      </div>
    </div>
  );
};
