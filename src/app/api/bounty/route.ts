import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireClassAccess } from "@/lib/rls";

const BOUNTY_TEMPLATES = [
  {
    type: "remind_survey",
    title: "提醒同学填写问卷",
    description: "在班级群里提醒大家填写本周问卷",
  },
  {
    type: "count_activity",
    title: "统计活动参与人数",
    description: "统计报名参加XX活动的人数",
  },
  {
    type: "collect_feedback",
    title: "收集课堂反馈",
    description: "收集团队对XX课程的反馈意见",
  },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "未登录" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId")!;
  try {
    await requireClassAccess(session.user.id, classId);
  } catch {
    return NextResponse.json({ error: "无权访问该班级" }, { status: 403 });
  }

  const tasks = await db.bountyTask.findMany({
    where: { classId },
    include: { claimedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks, templates: BOUNTY_TEMPLATES });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "未登录" }, { status: 401 });

  const isCounselor = session.user.role === "COUNSELOR";
  const { classId, templateType, action, taskId } = await req.json();

  try {
    await requireClassAccess(session.user.id, classId);
  } catch {
    return NextResponse.json({ error: "无权访问该班级" }, { status: 403 });
  }

  if (isCounselor) {
    const template = BOUNTY_TEMPLATES.find((t) => t.type === templateType);
    if (!template)
      return NextResponse.json({ error: "无效模板" }, { status: 400 });
    const task = await db.bountyTask.create({
      data: {
        classId,
        templateType,
        title: template.title,
        description: template.description,
      },
    });
    return NextResponse.json({ success: true, task });
  }

  if (action === "claim" && taskId) {
    const task = await db.bountyTask.update({
      where: { id: taskId },
      data: { status: "CLAIMED", claimedById: session.user.id },
    });
    return NextResponse.json({ success: true, task });
  }

  if (action === "complete" && taskId) {
    await db.bountyTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED" },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}
