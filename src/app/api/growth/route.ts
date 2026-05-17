import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkSyncTrigger } from "@/lib/growth";
import { checkAndAwardBadge } from "@/lib/badges";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { toUserId, reason } = await req.json();
  if (!toUserId || !reason?.trim()) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  if (toUserId === session.user.id) return NextResponse.json({ error: "不能点亮自己" }, { status: 400 });

  // 每人每天最多点亮同一个人 1 次
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await db.growthMoment.findFirst({
    where: { fromUserId: session.user.id, toUserId, createdAt: { gte: today } },
  });
  if (existing) {
    return NextResponse.json({ error: "今天已经给TA点亮过了" }, { status: 400 });
  }

  const moment = await db.growthMoment.create({
    data: { fromUserId: session.user.id, toUserId, reason },
  });

  checkAndAwardBadge(toUserId, "GROWTH_COLLECTOR").catch(() => {});

  return NextResponse.json({ success: true, moment });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const targetUserId = req.nextUrl.searchParams.get("userId") || session.user.id;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.classId) return NextResponse.json({ neglected: [], myGrowth: [], syncTarget: null });

  const neglected = await db.user.findMany({
    where: {
      classId: user.classId,
      id: { not: session.user.id },
      lowPresenceMode: false,
    },
    include: { growthReceived: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { growthReceived: { _count: "asc" } },
    take: 5,
  });

  const myGrowth = await db.growthMoment.findMany({
    where: { toUserId: targetUserId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const syncTarget = await checkSyncTrigger(session.user.id, user.classId);

  return NextResponse.json({ neglected, myGrowth, syncTarget });
}
