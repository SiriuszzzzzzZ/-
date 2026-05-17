import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";
import { classifyHelpType, detectCrisis } from "@/lib/crisis";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, content, treehole, anonymous, image } = await req.json();
  if (!classId || !content?.trim()) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  // 危机检测 — 树洞和普通求助都检测
  const crisis = detectCrisis(content);

  // 树洞模式：跳过情绪分类，默认匿名
  if (treehole) {
    const post = await db.post.create({
      data: { userId: session.user.id, classId, type: "HELP_EMOTION", content, image: image || null, treehole: true, anonymous: true },
    });
    return NextResponse.json({
      success: true, postId: post.id, type: "TREEHOLE", message: "已丢进树洞",
      crisis: crisis === "crisis" ? true : undefined,
    });
  }

  const helpType = classifyHelpType(content);

  const post = await db.post.create({
    data: {
      userId: session.user.id,
      classId,
      type: helpType === "SKILL" ? "HELP_SKILL" : "HELP_EMOTION",
      content,
      image: image || null,
      anonymous: anonymous === true || helpType === "EMOTION",
    },
  });

  return NextResponse.json({
    success: true,
    postId: post.id,
    type: helpType,
    message: helpType === "EMOTION"
      ? "已发出。辅导员会在今天内看到。"
      : "已发出，等待同学回应。",
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "缺少classId" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const isCounselor = session.user.role === "COUNSELOR";
  const where = {
    classId,
    type: isCounselor
      ? { in: ["HELP_SKILL", "HELP_EMOTION"] }
      : "HELP_SKILL",
  };

  const posts = await db.post.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ posts });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { postId, action } = await req.json();
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  if (action === "withdraw") {
    await db.post.delete({ where: { id: postId } });
    return NextResponse.json({ success: true, message: "已收回" });
  }
  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
