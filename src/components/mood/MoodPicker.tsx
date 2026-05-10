"use client";
import { useState } from "react";
import { MoodType, MOOD_LABELS, MOOD_EMOJI } from "@/types";
import { Card } from "@/components/ui/Card";

export function MoodPicker({ classId }: { classId: string }) {
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const moods: MoodType[] = ["SUNNY", "RAINY", "STORMY", "GROWING"];

  async function submit(mood: MoodType) {
    setSelected(mood);
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, mood }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="text-center py-4">
        <p className="text-3xl mb-1">{MOOD_EMOJI[selected!]}</p>
        <p className="text-xs text-gray-400">今日已记录</p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-gray-500 text-center mb-3">今天感觉怎么样？</p>
      <div className="grid grid-cols-4 gap-2">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => submit(m)}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-1">{MOOD_EMOJI[m]}</span>
            <span className="text-xs text-gray-600">{MOOD_LABELS[m].slice(2)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
