interface ClassPulseProps {
  todayMoodCount: number;
  rainyWarning: boolean;
  dominantMood: string | null;
}

export function ClassPulse({ todayMoodCount, rainyWarning, dominantMood }: ClassPulseProps) {
  if (todayMoodCount === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 text-xs text-warm-400 py-2 animate-float-up">
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-fade-in" />
        今天 {todayMoodCount} 人已打卡
      </span>
      {rainyWarning && (
        <span className="text-peach-500">· 班级情绪有点低落</span>
      )}
      {dominantMood && !rainyWarning && (
        <span className="text-warm-400">· 今天偏{dominantMood}</span>
      )}
    </div>
  );
}
