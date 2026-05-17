import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGrowthTrajectory } from "@/lib/growth";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.lowPresenceMode !== undefined) data.lowPresenceMode = body.lowPresenceMode;
  if (body.themeColor) data.themeColor = body.themeColor;
  if (body.signature !== undefined) data.signature = body.signature;
  if (body.avatar) data.avatar = body.avatar;
  if (body.name) data.name = body.name;

  // 修改密码
  if (body.newPassword) {
    const bcrypt = await import("bcryptjs");
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) return NextResponse.json({ error: "无法修改密码" }, { status: 400 });
    const valid = await bcrypt.compare(body.currentPassword || "", user.password);
    if (!valid) return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
    data.password = await bcrypt.hash(body.newPassword, 10);
  }

  await db.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const trajectory = await getGrowthTrajectory(session.user.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user || {};

  return NextResponse.json({ user: safeUser, trajectory });
}
