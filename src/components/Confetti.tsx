import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export const Confetti = () => {
  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 4 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm bg-primary"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
            opacity: piece.opacity,
          }}
          initial={{ y: -20, rotate: 0 }}
          animate={{
            y: ['0vh', '100vh'],
            rotate: [0, 360, 720],
            x: [0, Math.random() > 0.5 ? 30 : -30, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};
