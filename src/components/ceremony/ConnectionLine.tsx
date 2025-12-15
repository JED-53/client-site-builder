import { motion } from 'framer-motion';

interface ConnectionLineProps {
  isVisible: boolean;
}

export const ConnectionLine = ({ isVisible }: ConnectionLineProps) => {
  return (
    <div className="relative w-32 h-4 flex items-center justify-center mx-8">
      {isVisible && (
        <>
          {/* Glow effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-accent/0 blur-xl"
          />
          
          {/* Main line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute h-1 w-full bg-gradient-to-r from-primary via-primary to-accent rounded-full origin-left"
          />
          
          {/* Particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                x: 128,
              }}
              transition={{
                duration: 1.5,
                delay: 0.3 + i * 0.2,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
              className="absolute w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
              style={{ left: 0 }}
            />
          ))}
          
          {/* Center glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute w-4 h-4 rounded-full bg-white/50 blur-sm"
          />
        </>
      )}
    </div>
  );
};
