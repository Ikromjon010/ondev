import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Star, Flame, Trophy } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  points: number;
  streak: number;
  badges: { name: string; icon: string; description: string }[];
  onClose: () => void;
}

const CelebrationOverlay = ({ show, points, streak, badges, onClose }: CelebrationProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!show) {
      setStep(0);
      return;
    }

    // Fire confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#6366f1", "#ec4899"],
    });

    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => {
      if (badges.length > 0) setStep(2);
    }, 2000);
    const t3 = setTimeout(onClose, badges.length > 0 ? 4500 : 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [show, badges.length, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="glass-card p-8 text-center max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Points display */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-warning" />
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-3xl font-bold text-primary"
              >
                +{points} ball
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">Ajoyib natija! 🎉</p>
            </motion.div>

            {/* Streak */}
            {step >= 1 && streak > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-4 py-2 px-4 bg-destructive/10 rounded-lg"
              >
                <Flame className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-foreground">{streak} kunlik streak!</span>
              </motion.div>
            )}

            {/* New badges */}
            {step >= 2 && badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span>Yangi yutuq!</span>
                </div>
                {badges.map((badge, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
