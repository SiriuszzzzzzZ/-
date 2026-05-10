"use client";
import { Card } from "@/components/ui/Card";
import { MoodTrend, MOOD_EMOJI } from "@/types";

const moodColors: Record<string, string> = {
  SUNNY: "bg-amber-300",
  RAINY: "bg-blue-400",
  STORMY: "bg-gray-500",
  GROWING: "bg-green-400",
};

export function MoodChart({ trend, showChart }: { trend: MoodTrend[]; showChart: boolean }) {
  if (!showChart || trend.length === 0) {
    return (
      <Card className="text-center py-4">
        <p className="text-sm text-gray-400">今日数据不足，暂不展示趋势</p>
        <p className="text-xs text-gray-300 mt-1">至少需要 5 人参与</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-700 mb-3">本周情绪趋势</h3>
      <div className="flex items-end gap-1 h-20">
        {trend.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col-reverse rounded-sm overflow-hidden" style={{ height: "64px" }}>
              {(["STORMY", "RAINY", "GROWING", "SUNNY"] as const).map((mood) => {
                const h = d.total > 0 ? ((d[mood] as number) / d.total) * 64 : 0;
                return h > 0 ? <div key={mood} style={{ height: `${h}px` }} className={`w-full ${moodColors[mood]}`} title={`${MOOD_EMOJI[mood]}: ${d[mood]}`} /> : null;
              })}
            </div>
            <span className="text-[10px] text-gray-400 mt-1">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
