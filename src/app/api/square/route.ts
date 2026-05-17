import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "未登录" }, { status: 401 });

  const topics = await db.topic.findMany({
    where: { syncedToSquare: true },
    include: { class: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const recentGoodDeeds = await db.post.findMany({
    where: { type: "GOOD_DEED", treehole: false },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ topics, recentGoodDeeds });
}
