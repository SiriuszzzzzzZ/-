"use client";
import { PARTICLE_OPTIONS } from "@/types";

export function ParticlePicker({ classId }: { classId: string }) {
  async function pick(id: string) {
    await fetch("/api/particles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, particleType: id }),
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {PARTICLE_OPTIONS.map((p) => (
        <button
          key={p.id}
          onClick={() => pick(p.id)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-500 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
