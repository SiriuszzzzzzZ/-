import { db } from "./db";
import { StudentSignal } from "@/types";

export async function computeSignals(classId: string): Promise<StudentSignal[]> {
  const signals: StudentSignal[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000);

  const students = await db.user.findMany({
    where: { classId, role: "STUDENT", lowPresenceMode: false },
  });

  for (const student of students) {
    if (student.lastActiveAt < sevenDaysAgo) {
      signals.push({ userId: student.id, userName: student.name, signalType: "long_silence", detail: "7 天未登录" });
    }

    const recentMoods = await db.moodEntry.findMany({
      where: { userId: student.id, date: { gte: fiveDaysAgo } },
      orderBy: { date: "desc" },
    });
    if (recentMoods.length >= 5 && recentMoods.slice(0, 5).every((m) => m.mood === "RAINY" || m.mood === "STORMY")) {
      signals.push({ userId: student.id, userName: student.name, signalType: "pressure_rising", detail: "连续 5 天情绪低落" });
    }

    const recentPosts = await db.post.count({ where: { userId: student.id, createdAt: { gte: threeDaysAgo } } });
    const olderPosts = await db.post.count({
      where: { userId: student.id, createdAt: { gte: sevenDaysAgo, lt: threeDaysAgo } },
    });
    if (olderPosts > 3 && recentPosts === 0) {
      signals.push({ userId: student.id, userName: student.name, signalType: "social_disconnect", detail: "之前活跃，近 3 天无互动" });
    }
  }

  return signals;
}
