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

const CRISIS_KEYWORDS = ["不想活了", "自杀", "自残", "想死", "活不下去", "没有意义", "结束一切", "离开这个世界"];

export async function detectCrisis(classId: string): Promise<{ postId: string; classId: string; content: string; type: string; createdAt: Date }[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
  const posts = await db.post.findMany({
    where: { classId, createdAt: { gte: threeDaysAgo }, content: { not: null } },
    select: { id: true, classId: true, content: true, type: true, createdAt: true },
  });
  return posts.filter(p => p.content && CRISIS_KEYWORDS.some(kw => p.content!.includes(kw)))
    .map(p => ({ postId: p.id, classId: p.classId, content: p.content || "", type: p.type, createdAt: p.createdAt }));
}

const STORM_CRISIS_THRESHOLD = 3;

export async function detectStormCrisisStudent(classId: string): Promise<{ userId: string; userName: string; stormCount: number }[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
  const stormEntries = await db.moodEntry.groupBy({
    by: ["userId"],
    where: { classId, mood: "STORMY", date: { gte: threeDaysAgo } },
    _count: { mood: true },
  });
  const crisis = stormEntries.filter(e => e._count.mood >= STORM_CRISIS_THRESHOLD);
  if (crisis.length === 0) return [];
  const userIds = crisis.map(c => c.userId);
  const users = await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
  const userMap = new Map(users.map(u => [u.id, u.name]));
  return crisis.map(c => ({ userId: c.userId, userName: userMap.get(c.userId) || "未知", stormCount: c._count.mood }));
}

export async function getWeekComparison(classId: string): Promise<{ thisWeekPositive: number; lastWeekPositive: number; change: number }> {
  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);

  const [thisWeek, lastWeek] = await Promise.all([
    db.moodEntry.findMany({ where: { classId, date: { gte: thisWeekStart } } }),
    db.moodEntry.findMany({ where: { classId, date: { gte: lastWeekStart, lt: thisWeekStart } } }),
  ]);

  const positivity = (entries: { mood: string }[]) => {
    if (entries.length === 0) return 0;
    const positive = entries.filter(e => e.mood === "SUNNY" || e.mood === "GROWING").length;
    return Math.round((positive / entries.length) * 100);
  };

  const thisWeekPositive = positivity(thisWeek);
  const lastWeekPositive = positivity(lastWeek);
  const change = lastWeekPositive > 0 ? thisWeekPositive - lastWeekPositive : 0;

  return { thisWeekPositive, lastWeekPositive, change };
}
