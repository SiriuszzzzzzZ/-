import { db } from "./db";

export async function checkSyncTrigger(userId: string, classId: string): Promise<string | null> {
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
  const recentOwnMoods = await db.moodEntry.findMany({
    where: { userId, classId, date: { gte: fourDaysAgo } },
    orderBy: { date: "desc" }, take: 3,
  });
  if (recentOwnMoods.length < 3) return null;

  const sameMood = recentOwnMoods.every((m) => m.mood === recentOwnMoods[0].mood);
  if (!sameMood) return null;

  const syncUsers = await db.moodEntry.findMany({
    where: {
      classId,
      userId: { not: userId },
      mood: recentOwnMoods[0].mood,
      date: { gte: fourDaysAgo },
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 3,
  });

  return syncUsers.length > 0 ? syncUsers[0].userId : null;
}

export async function getGrowthTrajectory(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const [moodCount, postCount, growthReceived] = await Promise.all([
    db.moodEntry.count({ where: { userId, date: { gte: thirtyDaysAgo } } }),
    db.post.count({ where: { userId, createdAt: { gte: thirtyDaysAgo } } }),
    db.growthMoment.count({ where: { toUserId: userId, createdAt: { gte: thirtyDaysAgo } } }),
  ]);
  const activeDays = await db.moodEntry.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    select: { date: true },
    distinct: ["date"],
  });
  return { total: moodCount + postCount + growthReceived, activeDays: activeDays.length, growthReceived };
}
