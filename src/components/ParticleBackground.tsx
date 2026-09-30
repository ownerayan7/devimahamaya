import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  reducedMotion?: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      // Only re-size canvas if width changes or height changes significantly (to prevent mobile URL bar toggle flicker)
      if (Math.abs(window.innerWidth - width) > 10 || Math.abs(window.innerHeight - height) > 90) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 16000), 60);
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaChange: number;
      type: 'flower' | 'gold_ball';
      rotation: number;
      vRot: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const isFlower = i % 3 === 0; // 33% Shiuli flowers, 66% golden balls
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isFlower ? Math.random() * 3.5 + 3.5 : Math.random() * 4 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.15, // Floating gently upwards
        alpha: Math.random() * 0.6 + 0.25,
        alphaChange: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        type: isFlower ? 'flower' : 'gold_ball',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha += p.alphaChange;

        if (p.alpha <= 0.15 || p.alpha >= 0.85) {
          p.alphaChange = -p.alphaChange;
        }

        if (p.y < -25) {
          p.y = height + 25;
          p.x = Math.random() * width;
        }
        if (p.x < -25) p.x = width + 25;
        if (p.x > width + 25) p.x = -25;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const currentAlpha = Math.max(0.1, Math.min(0.9, p.alpha));

        if (p.type === 'flower') {
          // Draw high-fidelity Shiuli / Kash Phool Flower (White Petals + Orange Center)
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 4;

          // Draw 8 white petals symmetrically
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.95})`;
          for (let j = 0; j < 8; j++) {
            ctx.save();
            ctx.rotate((j * Math.PI) / 4);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 1.3, p.size * 0.55, p.size * 1.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Draw the iconic bright orange-red center circle of Shiuli
          ctx.fillStyle = `rgba(234, 88, 12, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw Glowing Golden Dust Ball with a beautiful radial gradient glow
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          ctx.shadowBlur = 8;

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.8);
          grad.addColorStop(0, `rgba(255, 254, 240, ${currentAlpha})`);    // white gold core
          grad.addColorStop(0.3, `rgba(251, 191, 36, ${currentAlpha * 0.8})`); // amber bright gold
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');                    // soft fade out

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-65"
      aria-hidden="true"
    />
  );
};
