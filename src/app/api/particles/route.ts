import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";
import { PARTICLE_OPTIONS } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { classId, particleType } = await req.json();
  if (!classId || !particleType) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const option = PARTICLE_OPTIONS.find((o) => o.id === particleType);
  if (!option) return NextResponse.json({ error: "无效状态" }, { status: 400 });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.post.create({
    data: {
      userId: session.user.id,
      classId,
      type: "STATE_PARTICLE",
      content: option.label,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "缺少classId" }, { status: 400 });

  try { await requireClassAccess(session.user.id, classId); }
  catch { return NextResponse.json({ error: "无权访问该班级" }, { status: 403 }); }

  const now = new Date();
  const particles = await db.post.findMany({
    where: { classId, type: "STATE_PARTICLE", expiresAt: { gt: now } },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ particles });
}
