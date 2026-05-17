import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPersonalInsight, isAiConfigured } from "@/lib/ai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const moods = await db.moodEntry.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "desc" },
    select: { mood: true, date: true },
  });

  if (moods.length < 5) {
    return NextResponse.json({ insight: "打卡数据还不够，先记录 5 天心情吧 🌱", detail: null, poweredByAi: false });
  }

  const moodCount: Record<string, number> = {};
  for (const m of moods) moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
  const total = moods.length;
  const streak = getStreak(moods);

  // 尝试 AI 洞察
  const moodHistory = moods.map(m => ({ mood: m.mood, date: new Date(m.date).toISOString().slice(0, 10) }));
  const aiInsight = await getPersonalInsight(moodHistory);

  // Fallback 规则引擎
  let insight = aiInsight;
  const moodsCN: Record<string, string> = { SUNNY: "晴朗", GROWING: "生长", RAINY: "阴雨", STORMY: "风暴" };

  if (!insight) {
    const recentTwoWeeks = moods.filter(m => new Date(m.date) >= new Date(Date.now() - 14 * 86400000));
    const recentRainy = recentTwoWeeks.filter(m => m.mood === "RAINY" || m.mood === "STORMY").length;
    const prevTwoWeeks = moods.filter(m => {
      const d = new Date(m.date);
      return d >= new Date(Date.now() - 30 * 86400000) && d < new Date(Date.now() - 14 * 86400000);
    });
    const prevRainy = prevTwoWeeks.filter(m => m.mood === "RAINY" || m.mood === "STORMY").length;

    if (streak >= 7) {
      insight = `你已连续打卡 ${streak} 天，这种持续本身就是一种力量`;
    } else {
      insight = `你的情绪像四季，有晴有雨。总共有 ${total} 次记录`;
    }
  }

  return NextResponse.json({
    insight,
    detail: {
      total,
      streak,
      moodDistribution: Object.fromEntries(Object.entries(moodCount).map(([k, v]) => [moodsCN[k] || k, Math.round(v / total * 100) + "%"])),
    },
    poweredByAi: isAiConfigured() && !!aiInsight,
  });
}

function getStreak(moods: { date: Date }[]): number {
  if (moods.length < 2) return moods.length;
  let streak = 1;
  for (let i = 1; i < moods.length; i++) {
    const diff = new Date(moods[i - 1].date).getTime() - new Date(moods[i].date).getTime();
    if (Math.round(diff / 86400000) === 1) streak++;
    else break;
  }
  return streak;
}
