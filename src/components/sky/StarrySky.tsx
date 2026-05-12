"use client";
import { useRef, useEffect } from "react";

interface Star {
  x: number; y: number; r: number;
  baseAlpha: number; speed: number; phase: number;
  state: "dim" | "lit" | "pulse" | "red" | "lighting" | "dimming";
  targetAlpha: number;
  transitionStart: number;
}

const STAR_COUNT = 65;
const MOOD_COLORS: Record<string, { r1: number; g1: number; b1: number; r2: number; g2: number; b2: number }> = {
  STORMY:  { r1:45, g1:40, b1:64, r2:74, g2:63, b2:80 },
  RAINY:   { r1:42, g1:53, b1:80, r2:74, g2:85, b2:104 },
  GROWING: { r1:30, g1:58, b1:74, r2:42, g2:90, b2:80 },
  SUNNY:   { r1:26, g1:48, b1:80, r2:58, g2:80, b2:112 },
};
const DEFAULT_COLORS = { r1:28, g1:40, b1:64, r2:58, g2:64, b2:88 };
const MOOD_STAR_COUNT: Record<string, number> = {
  GROWING: 35, SUNNY: 25, RAINY: 12, STORMY: 5,
};

export function StarrySky({ mood, isCounselor, emotionHelpCount }: { mood: string | null; isCounselor?: boolean; emotionHelpCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const skyColorRef = useRef({ ...DEFAULT_COLORS });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(), y: Math.random() * 0.7 + 0.05,
        r: Math.random() * 2 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.2,
        speed: Math.random() * 0.018 + 0.004,
        phase: Math.random() * Math.PI * 2,
        state: "dim", targetAlpha: 0, transitionStart: 0,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    if (!mood) return;
    const stars = starsRef.current;
    const count = MOOD_STAR_COUNT[mood] || 25;
    const indices = stars.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const now = performance.now();
    stars.forEach((s, i) => {
      s.transitionStart = now + i * 40;
      if (i < count) { s.state = "lighting"; s.targetAlpha = 0.7 + Math.random() * 0.3; }
      else { s.state = "dimming"; s.targetAlpha = 0.12 + Math.random() * 0.15; }
    });

    // 辅导员视角：将部分 dim 星标记为红色（情绪求助信号）
    if (isCounselor && emotionHelpCount && emotionHelpCount > 0) {
      const redCount = Math.min(emotionHelpCount, 5);
      const dimStars = stars.filter((s) => s.state === "dimming");
      for (let i = 0; i < Math.min(redCount, dimStars.length); i++) {
        dimStars[i].state = "red";
        dimStars[i].targetAlpha = 0.55 + Math.random() * 0.25;
      }
    }
  }, [mood, isCounselor, emotionHelpCount]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const canvas = el;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(t: number) {
      const stars = starsRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const target = mood ? MOOD_COLORS[mood] : null;
      const sc = skyColorRef.current;
      const ease = 0.03;
      if (target) {
        sc.r1 += (target.r1 - sc.r1) * ease; sc.g1 += (target.g1 - sc.g1) * ease; sc.b1 += (target.b1 - sc.b1) * ease;
        sc.r2 += (target.r2 - sc.r2) * ease; sc.g2 += (target.g2 - sc.g2) * ease; sc.b2 += (target.b2 - sc.b2) * ease;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgb(${Math.round(sc.r1)},${Math.round(sc.g1)},${Math.round(sc.b1)})`);
      grad.addColorStop(0.65, `rgb(${Math.round(sc.r2)},${Math.round(sc.g2)},${Math.round(sc.b2)})`);
      grad.addColorStop(1, "#FFFBF5");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const x = s.x * w; const y = s.y * h;
        if (s.state === "lighting" || s.state === "dimming") {
          const elapsed = t - s.transitionStart;
          if (elapsed > 0) {
            const progress = Math.min(1, elapsed / 600);
            const eased = 1 - Math.pow(1 - progress, 3);
            s.baseAlpha += (s.targetAlpha - s.baseAlpha) * eased * 0.3;
            if (Math.abs(s.baseAlpha - s.targetAlpha) < 0.008) {
              s.baseAlpha = s.targetAlpha;
              s.state = s.state === "lighting" ? "lit" : "dim";
            }
          }
        }
        let alpha = s.baseAlpha;
        if (s.state === "lit" || s.state === "dim") alpha += Math.sin(t * s.speed + s.phase) * 0.12;
        if (s.state === "pulse") alpha += Math.sin(t * 0.008 + s.phase) * 0.25;
        alpha = Math.max(0.03, Math.min(1, alpha));

        if (s.state === "red") {
          ctx.fillStyle = `rgba(255,92,74,${alpha})`;
          ctx.shadowColor = `rgba(255,92,74,${alpha * 0.5})`; ctx.shadowBlur = 5;
        } else if (s.state === "pulse") {
          ctx.fillStyle = `rgba(255,240,200,${alpha})`;
          ctx.shadowColor = `rgba(255,210,140,${alpha * 0.7})`; ctx.shadowBlur = 8;
        } else if (s.state === "lit" || s.state === "lighting") {
          ctx.fillStyle = `rgba(255,235,200,${alpha})`;
          ctx.shadowColor = `rgba(255,215,160,${alpha * 0.35})`; ctx.shadowBlur = 2.5;
        } else {
          ctx.fillStyle = `rgba(190,205,225,${alpha})`;
          ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        }
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [mood]);

  return <canvas ref={canvasRef} className="sky-canvas" />;
}
