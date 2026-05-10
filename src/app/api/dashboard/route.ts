import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClassMoodTrend } from "@/lib/mood";
import { computeSignals } from "@/lib/signals";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.user.role !== "COUNSELOR") {
    return NextResponse.json({ error: "仅辅导员可访问" }, { status: 403 });
  }

  const classes = await db.class.findMany({
    where: { counselorId: session.user.id },
    include: { _count: { select: { students: true } } },
  });

  const classData = await Promise.all(
    classes.map(async (cls) => {
      const trend = await getClassMoodTrend(cls.id, 7);
      const signals = await computeSignals(cls.id);
      const emotionHelpCount = await db.post.count({
        where: {
          classId: cls.id,
          type: "HELP_EMOTION",
          createdAt: { gte: new Date(Date.now() - 86400000) },
        },
      });
      return {
        id: cls.id,
        name: cls.name,
        studentCount: cls._count.students,
        trend,
        signals,
        emotionHelpCount,
      };
    })
  );

  const allSignals = classData.flatMap((c) =>
    c.signals.map((s) => ({ ...s, className: c.name }))
  );

  return NextResponse.json({ classes: classData, allSignals });
}
