import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const MILESTONES = [1, 5, 10, 20, 30, 50];

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  const moments = await db.growthMoment.findMany({
    where: { toUserId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = moments.length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const thisWeekCount = moments.filter((m) => new Date(m.createdAt) >= thisWeekStart).length;

  // Group by week (Monday-based)
  const weekGroups: { label: string; items: typeof moments }[] = [];
  let currentWeek = "";
  for (const m of moments) {
    const d = new Date(m.createdAt);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const weekKey = `${monday.getMonth() + 1}/${monday.getDate()}`;
    if (weekKey !== currentWeek) {
      currentWeek = weekKey;
      weekGroups.push({ label: `${weekKey} 周`, items: [m] });
    } else {
      weekGroups[weekGroups.length - 1].items.push(m);
    }
  }

  const nextMilestone = MILESTONES.find((m) => m > total);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3">
        <h1 className="font-semibold text-warm-800 text-lg">我的星光收集</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* 收集总览 */}
        <div className="bg-white/60 rounded-3xl p-6 shadow-soft text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mint-50">
            <span className="text-4xl animate-fade-in">✨</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-warm-800">
              {total} <span className="text-base font-normal text-warm-400">颗星光</span>
            </p>
            <p className="text-xs text-warm-400 mt-1">
              本周收获了 {thisWeekCount} 次点亮
            </p>
          </div>

          {/* 30天节奏迷你柱状图 */}
          {weekGroups.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] text-warm-300 mb-2">最近几周的节奏</p>
              <div className="flex items-end justify-center gap-2 h-16">
                {weekGroups.slice(0, 5).reverse().map((g) => {
                  const maxCount = Math.max(...weekGroups.map(w => w.items.length), 1);
                  const height = Math.max(4, (g.items.length / maxCount) * 56);
                  return (
                    <div key={g.label} className="flex flex-col items-center gap-1">
                      <div
                        className="w-6 rounded-t-md bg-gradient-to-t from-mint-300 to-mint-400 transition-all"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[9px] text-warm-300">{g.label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-warm-300 mt-2">有高峰有低谷，不被评价</p>
            </div>
          )}

          {/* 进度条到下一个里程碑 */}
          {nextMilestone && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 justify-center">
                <div className="flex-1 max-w-40 h-1.5 rounded-full bg-warm-100 overflow-hidden">
                  <div
                    className="h-full bg-mint-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((total / nextMilestone) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-warm-300">{total}/{nextMilestone}</span>
              </div>
              <p className="text-[10px] text-warm-300">
                距离下一个里程碑还差 {nextMilestone - total} 次
              </p>
            </div>
          )}
        </div>

        {/* 星光列表 */}
        {moments.length === 0 ? (
          <div className="bg-white/60 rounded-3xl p-8 shadow-soft text-center space-y-3">
            <p className="text-4xl">🫙</p>
            <p className="text-sm text-warm-500">罐子还是空的</p>
            <p className="text-xs text-warm-400">当有人在班级里注意到你的闪光点</p>
            <p className="text-xs text-warm-300">星光就会落进这里</p>
          </div>
        ) : (
          <div className="space-y-5">
            {weekGroups.map((group, gi) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-medium text-warm-300 tracking-wide">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-warm-200/30" />
                  <span className="text-[10px] text-warm-300">{group.items.length} 颗</span>
                </div>
                <div className="space-y-2">
                  {group.items.map((m, i) => {
                    const globalIndex = moments.indexOf(m);
                    const isMilestone = MILESTONES.includes(globalIndex + 1);
                    return (
                      <div
                        key={m.id}
                        className="bg-white/60 rounded-2xl p-4 shadow-soft animate-float-up relative overflow-hidden"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        {isMilestone && (
                          <div className="absolute -top-1 right-3 bg-mint-100 text-mint-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            第 {globalIndex + 1} 颗
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {isMilestone ? "🌟" : "✨"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-warm-700 leading-relaxed">{m.reason}</p>
                            <p className="text-[10px] text-warm-300 mt-1.5">
                              {new Date(m.createdAt).toLocaleDateString("zh-CN", {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        {total > 0 && total < 10 && (
          <p className="text-center text-[11px] text-warm-300 px-4">
            每一点微光都值得被看见。继续在班级里发光，星光会越来越多
          </p>
        )}
      </main>
    </div>
  );
}
