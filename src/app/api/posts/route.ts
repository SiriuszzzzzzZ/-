import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, content, parentId, type, image } = await req.json();
  if (!classId || (!content?.trim() && !image)) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const post = await db.post.create({
    data: {
      userId: session.user.id,
      classId,
      type: type || "HELP_SKILL",
      content: content || "",
      image: image || null,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ success: true, post });
}
