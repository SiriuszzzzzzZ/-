import { db } from "./db";
import { getClassMoodTrend } from "./mood";

interface AnalysisResult {
  summary: string;
  trend: string;
  risk: string;
  suggestions: string[];
  dominantMood: string;
  changeRate: number;
}

export async function analyzeClassMood(classId: string): Promise<AnalysisResult> {
  const trend = await getClassMoodTrend(classId, 7);

  if (trend.length < 3) {
    return {
      summary: "数据不足，需要至少3天的打卡数据才能进行分析。",
      trend: "暂无趋势",
      risk: "数据不足",
      suggestions: ["鼓励学生每天打卡", "在班级中发起话题吸引参与"],
      dominantMood: "未知",
      changeRate: 0,
    };
  }

  const latest = trend[trend.length - 1];
  const previous = trend[trend.length - 2];

  const totalLatest = latest.SUNNY + latest.RAINY + latest.STORMY + latest.GROWING;
  const totalPrev = previous.SUNNY + previous.RAINY + previous.STORMY + previous.GROWING;

  // 主导情绪
  const moodScores: [string, number][] = [
    ["晴朗", latest.SUNNY / Math.max(totalLatest, 1)],
    ["阴雨", latest.RAINY / Math.max(totalLatest, 1)],
    ["风暴", latest.STORMY / Math.max(totalLatest, 1)],
    ["生长", latest.GROWING / Math.max(totalLatest, 1)],
  ];
  moodScores.sort((a, b) => b[1] - a[1]);
  const dominantMood = moodScores[0][0];

  // 变化率
  const prevScore = (previous.SUNNY + previous.GROWING) / Math.max(totalPrev, 1);
  const latestScore = (latest.SUNNY + latest.GROWING) / Math.max(totalLatest, 1);
  const changeRate = Math.round((latestScore - prevScore) * 100);

  // 趋势判断
  const recentPositive = trend.slice(-3).map(t =>
    (t.SUNNY + t.GROWING) / Math.max(t.total, 1)
  );
  let trendDirection = "稳定";
  if (recentPositive.length >= 2) {
    const delta = recentPositive[recentPositive.length - 1] - recentPositive[0];
    if (delta > 0.1) trendDirection = "上升";
    else if (delta < -0.1) trendDirection = "下降";
  }

  // 风险识别
  const riskRatio = (latest.RAINY + latest.STORMY) / Math.max(totalLatest, 1);
  let risk = "低风险";
  if (riskRatio > 0.5) risk = "⚠️ 需要关注";
  else if (riskRatio > 0.3) risk = "轻微波动";
  else risk = "整体良好";

  // 生成建议
  const suggestions: string[] = [];

  if (trendDirection === "下降") {
    suggestions.push("班级积极情绪有所下滑，建议发起轻松话题或微行动来提振气氛");
  }
  if (riskRatio > 0.4) {
    suggestions.push("有" + Math.round(riskRatio * 100) + "%的学生情绪低落，建议关注连续阴雨的学生");
  }
  if (latest.STORMY > 0) {
    suggestions.push("存在" + latest.STORMY + "个风暴情绪，建议尽快逐一关注");
  }
  if (trendDirection === "上升") {
    suggestions.push("班级情绪在向好发展，可以趁势发起更多互动话题");
  }
  if (suggestions.length === 0) {
    suggestions.push("班级状态稳定，保持现有节奏即可");
    suggestions.push("可以发起一些有趣的话题来增加班级凝聚力");
  }

  // 缺席检测
  const classStudents = await db.user.count({ where: { classId, role: "STUDENT" } });
  const participationRate = Math.round((totalLatest / Math.max(classStudents, 1)) * 100);
  if (participationRate < 50) {
    suggestions.push("今日打卡率仅" + participationRate + "%，建议提醒未打卡的学生");
  }

  const summary = `今日班级主导情绪为「${dominantMood}」，整体趋势${trendDirection}，${risk}。参与率${participationRate}%。`;

  return { summary, trend: trendDirection, risk, suggestions, dominantMood, changeRate };
}
