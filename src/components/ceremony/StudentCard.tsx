import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student | null;
  type: 'parrain' | 'filleul';
  isRevealing?: boolean;
}

export const StudentCard = ({ student, type, isRevealing }: StudentCardProps) => {
  const isParrain = type === 'parrain';
  
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className={`text-sm font-medium uppercase tracking-widest mb-4 ${
          isParrain ? 'text-primary' : 'text-accent'
        }`}
      >
        {isParrain ? 'Parrain' : 'Filleul'}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {student ? (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { 
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: isParrain ? 0.3 : 0
              }
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`
              relative w-72 h-96 rounded-2xl overflow-hidden
              card-gradient border border-border
              ${isRevealing ? 'animate-pulse-glow' : ''}
            `}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              isParrain 
                ? 'from-primary/20 via-transparent to-transparent' 
                : 'from-accent/20 via-transparent to-transparent'
            }`} />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              {/* Avatar placeholder */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: isParrain ? 0.5 : 0.2, type: "spring" }}
                className={`
                  w-24 h-24 rounded-full mb-6
                  flex items-center justify-center text-3xl font-bold
                  ${isParrain 
                    ? 'bg-primary/20 text-primary border-2 border-primary/50' 
                    : 'bg-accent/20 text-accent border-2 border-accent/50'
                  }
                `}
              >
                {student.prenom[0]}{student.nom[0]}
              </motion.div>
              
              {/* Name */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isParrain ? 0.6 : 0.3 }}
                className="text-2xl font-bold font-display text-foreground mb-2"
              >
                {student.prenom}
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isParrain ? 0.7 : 0.4 }}
                className="text-xl text-muted-foreground font-medium mb-4"
              >
                {student.nom}
              </motion.h3>
              
              {/* Promotion badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: isParrain ? 0.8 : 0.5 }}
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold
                  ${isParrain 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-accent/20 text-accent border border-accent/30'
                  }
                `}
              >
                {student.promotion}
              </motion.div>

              {/* Matricule */}
              {student.matricule && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isParrain ? 0.9 : 0.6 }}
                  className="mt-4 text-xs text-muted-foreground"
                >
                  #{student.matricule}
                </motion.div>
              )}
            </div>
            
            {/* Shine effect */}
            {isRevealing && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`
              w-72 h-96 rounded-2xl
              border-2 border-dashed border-border
              flex items-center justify-center
              bg-secondary/20
            `}
          >
            <span className="text-muted-foreground text-lg">
              En attente...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
