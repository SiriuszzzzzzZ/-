import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Confetti } from "@/components/me/Confetti";

const MILESTONES = [1, 5, 10, 20, 30, 50, 100];
const CELEBRATION_MILESTONES = [50, 100];
const GROWTH_STAGES = [
  { min: 0, icon: "🌱", label: "种子", color: "from-warm-200 to-warm-300" },
  { min: 1, icon: "🌿", label: "发芽", color: "from-mint-200 to-mint-400" },
  { min: 5, icon: "🪴", label: "幼苗", color: "from-mint-300 to-mint-500" },
  { min: 10, icon: "🌳", label: "小树", color: "from-mint-400 to-mint-600" },
  { min: 20, icon: "🌸", label: "开花", color: "from-coral-300 to-peach-400" },
  { min: 30, icon: "🌺", label: "盛放", color: "from-coral-400 to-peach-500" },
  { min: 50, icon: "🌟", label: "星光花园", color: "from-amber-300 to-coral-400" },
];

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  const moments = await db.growthMoment.findMany({
    where: { toUserId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = moments.length;
  const stage = [...GROWTH_STAGES].reverse().find(s => total >= s.min) || GROWTH_STAGES[0];
  const nextStage = GROWTH_STAGES.find(s => s.min > total);

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const thisWeekCount = moments.filter((m) => new Date(m.createdAt) >= thisWeekStart).length;

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
  const progressPercent = nextMilestone
    ? Math.min((total / nextMilestone) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-cream">
      <Confetti active={CELEBRATION_MILESTONES.includes(total)} />
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <Link href="/me" className="text-warm-400 hover:text-warm-600 text-sm">← 返回</Link>
        <h1 className="font-semibold text-warm-800 text-lg">我的星光收集</h1>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 space-y-6 pb-10">
        {/* 星光怎么来 */}
        <div className="bg-white/40 rounded-2xl p-4 space-y-2">
          <p className="text-xs text-warm-500 font-medium">星光怎么来？</p>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-white/50 rounded-xl p-2.5 space-y-1">
              <span className="text-lg">⭐</span>
              <p className="text-warm-600">被同学点亮</p>
              <p className="text-warm-300">你的发言被看见</p>
            </div>
            <div className="bg-white/50 rounded-xl p-2.5 space-y-1">
              <span className="text-lg">🤝</span>
              <p className="text-warm-600">帮助同学</p>
              <p className="text-warm-300">回复求助帖</p>
            </div>
            <div className="bg-white/50 rounded-xl p-2.5 space-y-1">
              <span className="text-lg">🔥</span>
              <p className="text-warm-600">坚持打卡</p>
              <p className="text-warm-300">3/7/14/30天</p>
            </div>
          </div>
        </div>

        {/* 养成主视觉 */}
        <div className="bg-white/60 rounded-3xl p-6 shadow-soft text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b ${stage.color} animate-pop-spring`}>
            <span className="text-5xl">{stage.icon}</span>
          </div>
          <div>
            <p className="text-sm text-warm-500 font-medium">{stage.label}阶段</p>
            <p className="text-3xl font-bold text-warm-800 mt-1">
              {total} <span className="text-base font-normal text-warm-400">颗星光</span>
            </p>
            <p className="text-xs text-warm-400 mt-1">本周 +{thisWeekCount}</p>
          </div>

          {/* 升级进度条 */}
          {nextStage && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xl">{stage.icon}</span>
                <div className="flex-1 max-w-44 h-2 rounded-full bg-warm-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-700`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xl">{nextStage.icon}</span>
              </div>
              <p className="text-[10px] text-warm-300">
                还需要 {nextStage.min - total} 颗星光升级到「{nextStage.label}」
              </p>
            </div>
          )}

          {/* 已满级 */}
          {!nextStage && (
            <p className="text-sm text-mint-500">🎉 你已到达星光花园，不可思议的旅程</p>
          )}

          {/* 迷你柱状图 */}
          {weekGroups.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] text-warm-300 mb-2">最近几周的节奏</p>
              <div className="flex items-end justify-center gap-2 h-16">
                {weekGroups.slice(0, 5).reverse().map((g) => {
                  const maxCount = Math.max(...weekGroups.map(w => w.items.length), 1);
                  const height = Math.max(4, (g.items.length / maxCount) * 56);
                  return (
                    <div key={g.label} className="flex flex-col items-center gap-1">
                      <div className="w-6 rounded-t-md bg-gradient-to-t from-mint-300 to-mint-400" style={{ height: `${height}px` }} />
                      <span className="text-[9px] text-warm-300">{g.label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 星光列表 */}
        {moments.length === 0 ? (
          <div className="bg-white/60 rounded-3xl p-8 shadow-soft text-center space-y-3">
            <p className="text-5xl">{stage.icon}</p>
            <p className="text-sm text-warm-500">罐子还是空的</p>
            <p className="text-xs text-warm-400">当有人在班级里注意到你的闪光点</p>
            <p className="text-xs text-warm-300">星光就会落进这里，种子会慢慢长大</p>
          </div>
        ) : (
          <div className="space-y-5">
            {weekGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-medium text-warm-300 tracking-wide">{group.label}</span>
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
                            第 {globalIndex + 1} 颗里程碑
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
                                month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
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

        {total > 0 && total < 10 && (
          <p className="text-center text-[11px] text-warm-300 px-4">
            每一点微光都值得被看见。继续在班级里发光，{stage.icon} 会慢慢长大
          </p>
        )}
      </main>
    </div>
  );
}
