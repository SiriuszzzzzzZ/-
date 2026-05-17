import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { toUserId, content } = await req.json();
  if (!toUserId || !content?.trim()) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  if (toUserId === session.user.id) return NextResponse.json({ error: "不能给自己发" }, { status: 400 });
  if (content.length > 100) return NextResponse.json({ error: "最多100字" }, { status: 400 });

  const whisper = await db.whisper.create({
    data: { fromUserId: session.user.id, toUserId, content },
  });

  return NextResponse.json({ success: true, whisper });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const direction = req.nextUrl.searchParams.get("dir") || "received";
  const where = direction === "sent"
    ? { fromUserId: session.user.id }
    : { toUserId: session.user.id };

  const whispers = await db.whisper.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Get user names
  const userIds = Array.from(new Set(whispers.flatMap(w => [w.fromUserId, w.toUserId])));
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, avatar: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  return NextResponse.json({
    whispers: whispers.map(w => ({
      ...w,
      fromUser: userMap.get(w.fromUserId),
      toUser: userMap.get(w.toUserId),
    })),
  });
}
