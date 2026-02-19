'use client';

import { useEffect, useRef, useCallback } from 'react';

interface InteractiveGridProps {
  className?: string;
}

export function InteractiveGrid({ className = '' }: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  const GRID_SIZE = 40;
  const DOT_RADIUS = 1;
  const HOVER_RADIUS = 150;
  const MAX_DOT_SCALE = 3;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { x: mx, y: my } = mouseRef.current;

    ctx.clearRect(0, 0, width, height);

    // Draw grid lines (very subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw dots at intersections
    for (let x = 0; x <= width; x += GRID_SIZE) {
      for (let y = 0; y <= height; y += GRID_SIZE) {
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let scale = 1;
        let opacity = 0.15;

        if (dist < HOVER_RADIUS) {
          const factor = 1 - dist / HOVER_RADIUS;
          scale = 1 + (MAX_DOT_SCALE - 1) * factor;
          opacity = 0.15 + 0.65 * factor;
        }

        const radius = DOT_RADIUS * scale;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Draw connecting lines to nearby dots when hovered
        if (dist < HOVER_RADIUS * 0.8) {
          const factor = 1 - dist / (HOVER_RADIUS * 0.8);
          const lineOpacity = 0.08 * factor;

          // Connect to right neighbor
          if (x + GRID_SIZE <= width) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + GRID_SIZE, y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5 + factor;
            ctx.stroke();
          }
          // Connect to bottom neighbor
          if (y + GRID_SIZE <= height) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + GRID_SIZE);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5 + factor;
            ctx.stroke();
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    // Listen on window so events are captured even when canvas is behind content
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
