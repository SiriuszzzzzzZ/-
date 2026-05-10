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
