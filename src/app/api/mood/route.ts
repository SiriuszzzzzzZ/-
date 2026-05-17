import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";
import { shouldShowMoodChart, getClassMoodTrend, checkConsecutiveRainy } from "@/lib/mood";
import { checkSyncTrigger } from "@/lib/growth";
import { checkAndAwardBadge } from "@/lib/badges";

const STREAK_MILESTONES = [3, 7, 14, 30];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId: rawClassId, mood } = await req.json();
  if (!mood) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  let classId = rawClassId;
  if (!classId || classId === "counselor-self") {
    const firstClass = await db.class.findFirst({ where: { counselorId: session.user.id } });
    if (!firstClass) return NextResponse.json({ error: "未找到班级" }, { status: 400 });
    classId = firstClass.id;
  }

  try {
    await requireClassAccess(session.user.id, classId);
  } catch {
    return NextResponse.json({ error: "无权访问该班级" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entry = await db.moodEntry.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    update: { mood },
    create: { userId: session.user.id, classId, mood, date: today },
  });

  // 同频检查
  const syncUserId = await checkSyncTrigger(session.user.id, classId);
  let syncUserName: string | null = null;
  if (syncUserId) {
    const syncUser = await db.user.findUnique({ where: { id: syncUserId }, select: { name: true } });
    syncUserName = syncUser?.name || null;
  }

  // 徽章 + 打卡星光检查
  checkAndAwardBadge(session.user.id, "STREAK_KEEPER").catch(() => {});
  checkStreakStar(session.user.id).catch(() => {});

  return NextResponse.json({
    success: true, mood: entry.mood,
    sync: syncUserName ? { userId: syncUserId, userName: syncUserName } : null,
  });
}

async function checkStreakStar(userId: string) {
  const entries = await db.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
    take: 31,
  });
  if (entries.length < 2) return;
  let streak = 1;
  for (let i = 1; i < entries.length; i++) {
    const diffMs = new Date(entries[i - 1].date).getTime() - new Date(entries[i].date).getTime();
    if (Math.round(diffMs / 86400000) === 1) streak++;
    else break;
  }
  if (STREAK_MILESTONES.includes(streak)) {
    // 检查今天是否已经给过这个里程碑的星光
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const reason = `连续打卡 ${streak} 天`;
    const existing = await db.growthMoment.findFirst({
      where: { toUserId: userId, fromUserId: userId, reason, createdAt: { gte: today } },
    });
    if (!existing) {
      await db.growthMoment.create({
        data: { fromUserId: userId, toUserId: userId, reason },
      });
      checkAndAwardBadge(userId, "GROWTH_COLLECTOR").catch(() => {});
    }
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "缺少classId" }, { status: 400 });

  try {
    await requireClassAccess(session.user.id, classId);
  } catch {
    return NextResponse.json({ error: "无权访问该班级" }, { status: 403 });
  }

  const trend = await getClassMoodTrend(classId, 7);
  const todayTotal = trend.length > 0 ? trend[trend.length - 1]?.total ?? 0 : 0;
  const showChart = shouldShowMoodChart(todayTotal);
  const rainyWarning = await checkConsecutiveRainy(classId);

  return NextResponse.json({ trend, todayTotal, showChart, rainyWarning });
}
