import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 7 * 86400000);

  const [newGrowth, newReplies, syncTarget] = await Promise.all([
    db.growthMoment.count({ where: { toUserId: userId, createdAt: { gte: sinceDate } } }),
    db.post.count({
      where: {
        parent: { userId, type: { in: ["HELP_SKILL", "HELP_EMOTION"] } },
        userId: { not: userId },
        createdAt: { gte: sinceDate },
      },
    }),
    db.user.findUnique({ where: { id: userId }, select: { classId: true } }).then(async (u) => {
      if (!u?.classId) return null;
      const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
      if (sinceDate > fourDaysAgo) return null; // already seen
      const recentMoods = await db.moodEntry.findMany({
        where: { userId, classId: u.classId, date: { gte: fourDaysAgo } },
        orderBy: { date: "desc" }, take: 3,
      });
      if (recentMoods.length < 3) return null;
      if (!recentMoods.every((m) => m.mood === recentMoods[0].mood)) return null;
      const syncUser = await db.moodEntry.findFirst({
        where: { classId: u.classId, userId: { not: userId }, mood: recentMoods[0].mood, date: { gte: fourDaysAgo } },
        select: { user: { select: { name: true } } },
      });
      return syncUser?.user.name || null;
    }),
  ]);

  const total = newGrowth + newReplies + (syncTarget ? 1 : 0);
  return NextResponse.json({ total, newGrowth, newReplies, syncTarget });
}
