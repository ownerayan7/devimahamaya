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

    const particleCount = Math.min(Math.floor((width * height) / 16000), 65);
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaChange: number;
      color: string;
      shape: 'circle' | 'square' | 'diamond';
      rotation: number;
      vRot: number;
    }> = [];

    const colors = [
      'rgba(245, 158, 11, ', // Amber gold
      'rgba(251, 191, 36, ', // Bright gold
      'rgba(239, 68, 68, ',  // Festive red
      'rgba(255, 215, 0, ',  // Golden yellow
    ];

    for (let i = 0; i < particleCount; i++) {
      const isSquare = i % 3 === 0;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSquare ? Math.random() * 8 + 3 : Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.1, // Floating gently upwards
        alpha: Math.random() * 0.7 + 0.2,
        alphaChange: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: isSquare ? (i % 6 === 0 ? 'diamond' : 'square') : 'circle',
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

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
          p.alphaChange = -p.alphaChange;
        }

        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const currentAlpha = Math.max(0.05, Math.min(0.85, p.alpha));
        ctx.fillStyle = `${p.color}${currentAlpha})`;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.strokeStyle = `${p.color}${currentAlpha * 0.8})`;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          // Diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
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
