"use client";
import { useEffect, useState } from "react";

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = ["#FF7A6B", "#4ECDC4", "#FFB355", "#FFE66D", "#B8A58A", "#A8D8EA", "#FF9A9E"];
    const items = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      size: Math.random() * 8 + 4,
    }));
    setParticles(items);
    const timer = setTimeout(() => setParticles([]), 5000);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            background: p.color,
            borderRadius: p.size > 6 ? "2px" : "50%",
            animationDelay: `${p.delay}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
