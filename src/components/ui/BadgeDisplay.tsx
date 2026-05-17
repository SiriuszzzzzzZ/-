"use client";
import { useState } from "react";
import { BADGE_DEFS, getBadgeLevel, type BadgeType } from "@/lib/badges";

interface BadgeData {
  type: string;
  level: number;
  progress: number;
}

export function BadgeDisplay({ badges }: { badges: BadgeData[] }) {
  const [expanded, setExpanded] = useState(false);

  if (badges.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-warm-400">还没有获得徽章</p>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-coral-400 mt-1 hover:underline">
          {expanded ? "收起" : "怎么获得？"}
        </button>
        {expanded && (
          <div className="mt-2 space-y-1 text-left">
            {Object.entries(BADGE_DEFS).map(([key, def]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-warm-500">
                <span>{def.icon}</span>
                <span className="font-medium">{def.name}</span>
                <span className="text-warm-300">{def.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => {
          const type = b.type as BadgeType;
          const def = BADGE_DEFS[type];
          if (!def) return null;
          const { label, nextAt } = getBadgeLevel(type, b.progress);
          const levelColors = ["bg-warm-100 text-warm-500", "bg-amber-100 text-amber-600", "bg-mint-100 text-mint-600", "bg-coral-100 text-coral-500"];
          const colorClass = levelColors[Math.min(b.level, 4) - 1] || levelColors[0];

          return (
            <div key={b.type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colorClass} text-xs`}>
              <span>{def.icon}</span>
              <span className="font-medium">{def.name}</span>
              <span className="opacity-70">{label}</span>
              {nextAt > 0 && b.progress > 0 && (
                <span className="text-[9px] opacity-50">{b.progress}/{nextAt}</span>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-warm-400 hover:text-coral-400">
        {expanded ? "收起说明" : "徽章怎么获得？"}
      </button>
      {expanded && (
        <div className="space-y-1.5 bg-white/40 rounded-xl p-3">
          {Object.entries(BADGE_DEFS).map(([key, def]) => {
            const levels = def.levels.map((l, i) => `${["初级","中级","高级","星辰"][i]} ≥${l}次`).join(" → ");
            return (
              <div key={key} className="flex items-start gap-2">
                <span className="text-sm mt-0.5">{def.icon}</span>
                <div>
                  <p className="text-xs font-medium text-warm-600">{def.name}</p>
                  <p className="text-[10px] text-warm-400">{def.desc}</p>
                  <p className="text-[9px] text-warm-300">{levels}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
