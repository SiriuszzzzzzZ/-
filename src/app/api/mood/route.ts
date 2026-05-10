import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";
import { shouldShowMoodChart, getClassMoodTrend, checkConsecutiveRainy } from "@/lib/mood";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, mood } = await req.json();
  if (!classId || !mood) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

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

  return NextResponse.json({ success: true, mood: entry.mood });
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
