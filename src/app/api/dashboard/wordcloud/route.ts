import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const STOP_WORDS = new Set([
  "的", "了", "是", "我", "不", "在", "有", "和", "就", "都",
  "也", "一", "个", "上", "下", "来", "去", "这", "那", "会",
  "要", "能", "可以", "没有", "什么", "怎么", "为什么", "因为",
  "所以", "但是", "还是", "只是", "吧", "吗", "呢", "啊", "哦",
  "嗯", "觉得", "知道", "想", "说", "看", "让", "被", "把",
]);

function tokenize(text: string): string[] {
  const cleaned = text.replace(/[^一-龥]/g, "");
  const words: string[] = [];
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= cleaned.length - len; i++) {
      const w = cleaned.slice(i, i + len);
      if (!STOP_WORDS.has(w)) words.push(w);
    }
  }
  return words;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "COUNSELOR") {
    return NextResponse.json({ error: "仅辅导员可访问" }, { status: 403 });
  }

  const classes = await db.class.findMany({
    where: { counselorId: session.user.id },
    select: { id: true },
  });
  const classIds = classes.map((c) => c.id);

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const treeholePosts = await db.post.findMany({
    where: {
      classId: { in: classIds },
      treehole: true,
      createdAt: { gte: weekAgo },
    },
    select: { content: true },
  });

  const freq: Record<string, number> = {};
  for (const post of treeholePosts) {
    if (!post.content) continue;
    for (const word of tokenize(post.content)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  const words = Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([text, count]) => ({ text, count }));

  return NextResponse.json({ words, total: treeholePosts.length });
}
