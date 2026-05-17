import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";
import { checkAndAwardBadge } from "@/lib/badges";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, content, parentId, topicId, type, treehole, image } = await req.json();
  if (!classId || (!content?.trim() && !image)) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const postType = type || "HELP_SKILL";

  const post = await db.post.create({
    data: {
      userId: session.user.id,
      classId,
      type: postType,
      content: content || "",
      image: image || null,
      parentId: parentId || null,
      topicId: topicId || null,
      treehole: treehole || false,
    },
  });

  // 徽章 + 星光检查（异步不阻塞）
  if ((postType === "HELP_SKILL" || postType === "HELP_EMOTION") && parentId) {
    checkAndAwardBadge(session.user.id, "HELPER").catch(() => {});
    db.growthMoment.create({
      data: { fromUserId: session.user.id, toUserId: session.user.id, reason: "[系统] 帮助了同学" },
    }).catch(() => {});
    checkAndAwardBadge(session.user.id, "GROWTH_COLLECTOR").catch(() => {});
  }
  if (postType === "TOPIC_POST") {
    checkAndAwardBadge(session.user.id, "TOPIC_STAR").catch(() => {});
  }
  if (treehole) {
    checkAndAwardBadge(session.user.id, "TREEHOLE_FRIEND").catch(() => {});
  }

  return NextResponse.json({ success: true, post });
}
