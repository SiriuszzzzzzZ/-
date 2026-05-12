import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.user.role !== "COUNSELOR") return NextResponse.json({ error: "仅辅导员可发布话题" }, { status: 403 });

  const { classId, title, content, tags, isMicroAction, isNotice, image, syncedToSquare } = await req.json();
  if (!classId || !title?.trim()) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const topic = await db.topic.create({
    data: {
      classId,
      title: title.trim(),
      content: content || null,
      tags: tags || "",
      isMicroAction: isMicroAction || false,
      isNotice: isNotice || false,
      image: image || null,
      syncedToSquare: syncedToSquare || false,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json({ success: true, topic });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.user.role !== "COUNSELOR") return NextResponse.json({ error: "仅辅导员可删除话题" }, { status: 403 });

  const topicId = req.nextUrl.searchParams.get("id");
  if (!topicId) return NextResponse.json({ error: "缺少话题ID" }, { status: 400 });

  const topic = await db.topic.findUnique({ where: { id: topicId } });
  if (!topic) return NextResponse.json({ error: "话题不存在" }, { status: 404 });
  if (topic.createdBy !== session.user.id) return NextResponse.json({ error: "只能删除自己发布的话题" }, { status: 403 });

  await db.topic.delete({ where: { id: topicId } });
  return NextResponse.json({ success: true, message: "已删除" });
}
