import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTreeholeFeedback } from "@/lib/treehole-feedback";
import { matchTreeholePosts } from "@/lib/ai";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, content } = await req.json();
  if (!classId || !content) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  const feedback = await getTreeholeFeedback(session.user.id, classId, content);

  // AI 智能匹配
  let aiMatch: string | null = null;
  if (content) {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const allTreeholes = await db.post.findMany({
      where: { classId, treehole: true, userId: { not: session.user.id }, createdAt: { gte: weekAgo } },
      select: { content: true },
      take: 20,
    });
    const others = allTreeholes.filter(p => p.content && p.content !== content).map(p => p.content!);
    aiMatch = await matchTreeholePosts(content, others);
  }

  return NextResponse.json({ feedback, aiMatch });
}
