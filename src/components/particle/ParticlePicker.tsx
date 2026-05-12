"use client";
import { useState } from "react";
import { PARTICLE_OPTIONS } from "@/types";

export function ParticlePicker({ classId }: { classId: string }) {
  const [picked, setPicked] = useState<string | null>(null);

  async function pick(id: string) {
    setPicked(id);
    await fetch("/api/particles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, particleType: id }),
    });
    setTimeout(() => setPicked(null), 1800);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {PARTICLE_OPTIONS.map((p) => {
        const isPicked = picked === p.id;
        return (
          <button
            key={p.id}
            onClick={() => pick(p.id)}
            disabled={isPicked}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full border text-xs transition-all duration-300 ${
              isPicked
                ? "bg-coral-100 border-coral-300 text-coral-500 scale-105"
                : "bg-white/60 border-warm-200/50 text-warm-500 hover:bg-coral-50 hover:text-coral-500 hover:border-coral-200"
            } disabled:cursor-default active:scale-95`}
          >
            {isPicked ? `${p.emoji} 已留下痕迹` : `${p.emoji} ${p.label}`}
          </button>
        );
      })}
    </div>
  );
}
