import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
    });
  } catch (err) {
    // Graceful fallback
  }
}

export function fireGrandCelebration() {
  try {
    const end = Date.now() + 1000;
    const colors = ['#6366f1', '#10b981', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (err) {
    // Graceful fallback
  }
}
