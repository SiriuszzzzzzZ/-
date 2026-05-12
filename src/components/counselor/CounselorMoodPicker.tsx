"use client";
import { useState } from "react";
import { MoodType, MOOD_LABELS, MOOD_EMOJI } from "@/types";

export function CounselorMoodPicker() {
  const [selected, setSelected] = useState<MoodType | null>(null);
  const moods: MoodType[] = ["SUNNY", "RAINY", "STORMY", "GROWING"];

  async function submit(mood: MoodType) {
    setSelected(mood);
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: "", mood }),
    });
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
      {moods.map((m, i) => (
        <button
          key={m}
          onClick={() => submit(m)}
          className={`group flex flex-col items-center gap-2 p-3 rounded-3xl transition-all duration-200 hover:-translate-y-1 active:scale-95 animate-float-up ${
            selected === m
              ? "bg-coral-50 shadow-soft"
              : "bg-white/60 shadow-soft hover:shadow-soft-lg"
          }`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
            {MOOD_EMOJI[m]}
          </span>
          <span className="text-xs text-warm-400 font-medium">
            {MOOD_LABELS[m].replace(/^[^\s]+\s/, "")}
          </span>
        </button>
      ))}
    </div>
  );
}
