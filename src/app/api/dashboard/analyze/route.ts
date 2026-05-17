import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeClassMood } from "@/lib/mood-analysis";
import { getCounselorPrediction } from "@/lib/ai";
import { getClassMoodTrend } from "@/lib/mood";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "COUNSELOR") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "缺少classId" }, { status: 400 });

  // 当前分析
  const analysis = await analyzeClassMood(classId);

  // 保存到数据库
  await db.moodAnalysis.create({
    data: {
      classId,
      summary: analysis.summary,
      trend: analysis.trend,
      risk: analysis.risk,
      dominantMood: analysis.dominantMood,
      changeRate: analysis.changeRate,
      suggestions: JSON.stringify(analysis.suggestions),
    },
  });

  // 取上一次分析做对比
  const previous = await db.moodAnalysis.findFirst({
    where: { classId },
    orderBy: { createdAt: "desc" },
    skip: 1,
  });

  let comparison: string | null = null;
  if (previous) {
    const prevSuggestions = JSON.parse(previous.suggestions || "[]") as string[];
    const parts: string[] = [];
    if (previous.trend !== analysis.trend) {
      parts.push(`情绪趋势从上一次的「${previous.trend}」变为「${analysis.trend}」`);
    }
    if (previous.dominantMood !== analysis.dominantMood) {
      parts.push(`主导情绪从「${previous.dominantMood}」变为「${analysis.dominantMood}」`);
    }
    if (previous.risk !== analysis.risk) {
      parts.push(`风险从「${previous.risk}」变为「${analysis.risk}」`);
    }
    if (parts.length > 0) {
      comparison = parts.join("；") + "。";
    } else {
      comparison = "与上次分析相比，班级状态保持稳定。";
    }
  } else {
    comparison = "这是首次分析，暂无历史对比数据。";
  }

  // 取最近7次分析做趋势图
  const history = await db.moodAnalysis.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    take: 7,
    select: { changeRate: true, dominantMood: true, createdAt: true },
  });

  // AI 预测
  const trendData = await getClassMoodTrend(classId, 7);
  const prediction = await getCounselorPrediction(trendData);

  return NextResponse.json({ ...analysis, comparison, prediction, history: history.reverse() });
}
