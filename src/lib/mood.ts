import { db } from "./db";

export function shouldShowMoodChart(count: number): boolean {
  return count >= 5;
}

type MoodTrend = {
  date: string;
  SUNNY: number;
  RAINY: number;
  STORMY: number;
  GROWING: number;
  total: number;
};

export async function getClassMoodTrend(classId: string, days: number = 7): Promise<MoodTrend[]> {
  const entries = await db.moodEntry.findMany({
    where: {
      classId,
      date: { gte: new Date(Date.now() - days * 86400000) },
    },
  });

  const grouped: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    const d = e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10);
    if (!grouped[d]) grouped[d] = { SUNNY: 0, RAINY: 0, STORMY: 0, GROWING: 0, total: 0 };
    grouped[d][e.mood]++;
    grouped[d].total++;
  }

  return Object.entries(grouped).map(([date, counts]) => ({
    date,
    SUNNY: counts.SUNNY || 0,
    RAINY: counts.RAINY || 0,
    STORMY: counts.STORMY || 0,
    GROWING: counts.GROWING || 0,
    total: counts.total,
  }));
}

export async function checkConsecutiveRainy(classId: string, threshold: number = 3): Promise<boolean> {
  const trend = await getClassMoodTrend(classId, threshold);
  if (trend.length < threshold) return false;
  return trend.slice(-threshold).every((d) => {
    if (d.total === 0) return false;
    const rainyRatio = (d.RAINY + d.STORMY) / d.total;
    return rainyRatio > 0.3;
  });
}
