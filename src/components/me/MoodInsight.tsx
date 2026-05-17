"use client";
import { useEffect, useState } from "react";

interface InsightData {
  insight: string;
  detail: { total: number; streak: number; moodDistribution: Record<string, string> } | null;
  poweredByAi?: boolean;
}

export function MoodInsight() {
  const [data, setData] = useState<InsightData | null>(null);

  useEffect(() => {
    fetch("/api/me/insight").then(r => r.json()).then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="bg-gradient-to-r from-[#1A3050] via-[#2A4058] to-[#1E3A4A] rounded-2xl p-4 space-y-2 text-white/90">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">🤖 个人情绪洞察</p>
        {data.poweredByAi && <span className="text-[9px] text-mint-300 bg-mint-400/10 px-1.5 py-0.5 rounded-full">AI</span>}
      </div>
      <p className="text-sm leading-relaxed">{data.insight}</p>
      {data.detail && (
        <div className="flex gap-2 text-[10px] text-white/40 pt-1">
          <span>{data.detail.total} 次打卡</span>
          <span>·</span>
          <span>连续 {data.detail.streak} 天</span>
          <span>·</span>
          <span>{Object.entries(data.detail.moodDistribution).map(([k, v]) => `${k}${v}`).join(" ")}</span>
        </div>
      )}
    </div>
  );
}
