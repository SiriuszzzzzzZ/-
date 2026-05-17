"use client";
import { useState } from "react";

const MOODS = [
  { id: "SUNNY", emoji: "🌤", label: "还行" },
  { id: "GROWING", emoji: "🌱", label: "状态不错" },
  { id: "RAINY", emoji: "🌧", label: "有点累" },
  { id: "STORMY", emoji: "🌪", label: "快炸了" },
];

interface Props {
  classId: string;
  currentMood?: string | null;
  onSelected?: (mood: string) => void;
}

export function MoodPicker({ classId, currentMood, onSelected }: Props) {
  const [selected, setSelected] = useState<string | null>(currentMood || null);
  const [clicked, setClicked] = useState<string | null>(null);
  const [syncUser, setSyncUser] = useState<{ userId: string; userName: string } | null>(null);

  async function handlePick(moodId: string) {
    if (selected || clicked) return;
    setClicked(moodId);
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, mood: moodId }),
    });
    const data = await res.json();
    if (data.sync) setSyncUser(data.sync);
    setTimeout(() => {
      setSelected(moodId);
      setClicked(null);
      onSelected?.(moodId);
    }, 550);
  }

  if (selected) {
    const mood = MOODS.find((m) => m.id === selected);
    return (
      <div className="absolute bottom-4 inset-x-0 px-6 z-10 text-center">
        <div className="inline-block animate-pop-spring">
          <p className="text-4xl mb-1">{mood?.emoji}</p>
          <p className="text-sm font-medium text-white/85">{mood?.label}</p>
          <p className="text-[11px] text-white/50 mt-1">已为今天点亮天空</p>
        </div>
        {syncUser && (
          <div className="mt-3 mx-auto max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 animate-float-up">
            <p className="text-sm text-white/90">
              {syncUser.userName} 最近也选了相同的情绪
            </p>
            <p className="text-xs text-white/60 mt-1">你们同频了，要给对方点亮一个瞬间吗？</p>
            <button
              onClick={async () => {
                await fetch("/api/growth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ toUserId: syncUser.userId, reason: "最近我们同频了" }),
                });
                setSyncUser(null);
              }}
              className="mt-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
            >
              ✨ 点亮
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 inset-x-0 px-5 z-10">
      <p className="text-center text-sm text-white/65 mb-2.5 tracking-wider">
        今天先点亮一个心情
      </p>
      <div className="flex gap-2 justify-center">
        {MOODS.map((m, i) => {
          const isClicked = clicked === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handlePick(m.id)}
              disabled={!!clicked}
              aria-label={`选择今天的心情：${m.label}`}
              className={`flex-1 max-w-[84px] min-h-20 flex flex-col items-center gap-1 py-3 px-1.5 rounded-[22px]
                border border-white/25 backdrop-blur-[6px] text-white cursor-pointer
                transition-all duration-200
                ${isClicked
                  ? "bg-white/20 scale-[0.92] animate-pop-spring"
                  : "bg-white/8 hover:bg-white/16 hover:-translate-y-[3px] hover:scale-[1.04]"
                }
                ${clicked && !isClicked ? "opacity-40" : "opacity-100"}
                animate-float-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[26px] transition-transform duration-250">
                {m.emoji}
              </span>
              <span className="text-xs opacity-85">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
