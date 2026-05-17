import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { classId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "COUNSELOR") {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await db.post.updateMany({
    where: {
      classId: params.classId,
      type: { in: ["HELP_EMOTION", "HELP_SKILL"] },
      counselorSeenAt: null,
    },
    data: { counselorSeenAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
