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
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-gray-500 text-center mb-3">今天你的状态？学生可以看到</p>
      <div className="grid grid-cols-4 gap-2">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => submit(m)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              selected === m ? "bg-indigo-50" : "hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl mb-1">{MOOD_EMOJI[m]}</span>
            <span className="text-xs text-gray-600">{MOOD_LABELS[m].slice(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
