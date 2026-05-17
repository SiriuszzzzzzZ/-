import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function WeeklyReportPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);

  const [weekMoods, monthMoods, growthReceived, growthGiven, helpReplies, myPosts, whispers] = await Promise.all([
    db.moodEntry.findMany({ where: { userId, date: { gte: weekStart } }, orderBy: { date: "desc" } }),
    db.moodEntry.count({ where: { userId, date: { gte: monthStart } } }),
    db.growthMoment.count({ where: { toUserId: userId, createdAt: { gte: weekStart } } }),
    db.growthMoment.count({ where: { fromUserId: userId, createdAt: { gte: weekStart } } }),
    db.post.count({ where: { userId, parentId: { not: null }, type: { in: ["HELP_SKILL", "HELP_EMOTION"] }, createdAt: { gte: weekStart } } }),
    db.post.count({ where: { userId, parentId: null, createdAt: { gte: weekStart } } }),
    db.whisper.count({ where: { toUserId: userId, createdAt: { gte: weekStart } } }),
  ]);

  const weekMoodCounts: Record<string, number> = {};
  for (const m of weekMoods) weekMoodCounts[m.mood] = (weekMoodCounts[m.mood] || 0) + 1;
  const moodCN: Record<string, string> = { SUNNY: "☀️ 晴朗", GROWING: "🌱 生长", RAINY: "🌧 阴雨", STORMY: "🌪 风暴" };

  const streakCheck = weekMoods;
  let streak = 0;
  if (streakCheck.length > 0) {
    streak = 1;
    for (let i = 1; i < streakCheck.length; i++) {
      const diff = new Date(streakCheck[i - 1].date).getTime() - new Date(streakCheck[i].date).getTime();
      if (Math.round(diff / 86400000) === 1) streak++;
      else break;
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <Link href="/me" className="text-warm-400 hover:text-warm-600 text-sm">← 返回</Link>
        <h1 className="font-semibold text-warm-800 text-lg">本周成长周报</h1>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 space-y-5 pb-10">
        {/* 总览卡片 */}
        <div className="bg-gradient-to-br from-[#1C2840] via-[#2A3E58] to-[#3A5070] rounded-3xl p-6 text-white space-y-4">
          <div className="text-center">
            <span className="text-3xl">🌟</span>
            <p className="text-white/80 text-sm mt-2">这一周</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-mint-300">{growthReceived}</p>
              <p className="text-[10px] text-white/50">被点亮</p>
            </div>
            <div>
              <p className="text-xl font-bold text-coral-300">{helpReplies}</p>
              <p className="text-[10px] text-white/50">帮助人</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-300">{streak}</p>
              <p className="text-[10px] text-white/50">天打卡</p>
            </div>
          </div>
        </div>

        {/* 情绪分布 */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
          <p className="text-sm font-medium text-warm-700">本周情绪记录</p>
          {Object.keys(weekMoodCounts).length > 0 ? (
            <div className="space-y-1.5">
              {Object.entries(weekMoodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                <div key={mood} className="flex items-center gap-2">
                  <span className="text-xs w-20 text-warm-500">{moodCN[mood] || mood}</span>
                  <div className="flex-1 h-4 rounded-full bg-warm-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-mint-300 to-mint-400" style={{ width: `${(count / weekMoods.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-warm-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400">本周还没有打卡，从今天开始也不晚</p>
          )}
        </div>

        {/* 互动统计 */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
          <p className="text-sm font-medium text-warm-700">互动足迹</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-warm-50 rounded-xl p-3 text-center">
              <p className="text-lg">{myPosts}</p>
              <p className="text-[10px] text-warm-400">发出了声音</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3 text-center">
              <p className="text-lg">{growthGiven}</p>
              <p className="text-[10px] text-warm-400">点亮了别人</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3 text-center">
              <p className="text-lg">{whispers}</p>
              <p className="text-[10px] text-warm-400">收到悄悄话</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3 text-center">
              <p className="text-lg">{monthMoods}</p>
              <p className="text-[10px] text-warm-400">本月打卡</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-warm-300">
          不被评价，只被看见
        </p>
      </main>
    </div>
  );
}
