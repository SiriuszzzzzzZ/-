import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeSignals } from "@/lib/signals";
import { getClassMoodTrend, checkConsecutiveRainy } from "@/lib/mood";
import { CounselorMoodPicker } from "@/components/counselor/CounselorMoodPicker";
import Link from "next/link";

const STOP_WORDS = new Set([
  "的","了","是","我","不","在","有","和","就","都","也","一","个","上","下","来","去","这","那","会",
  "要","能","可以","没有","什么","怎么","为什么","因为","所以","但是","还是","只是",
  "吧","吗","呢","啊","哦","嗯","觉得","知道","想","说","看","让","被","把",
]);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const classes = await db.class.findMany({
    where: { counselorId: session?.user.id },
    include: { _count: { select: { students: true } } },
  });

  const classSnapshots = await Promise.all(
    classes.map(async (cls) => {
      const trend = await getClassMoodTrend(cls.id, 7);
      const signals = await computeSignals(cls.id);
      const rainy = await checkConsecutiveRainy(cls.id);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayCount = await db.moodEntry.count({ where: { classId: cls.id, date: { gte: today } } });
      const todayEmotionHelp = await db.post.count({ where: { classId: cls.id, type: "HELP_EMOTION", createdAt: { gte: today } } });

      const lastDay = trend[trend.length - 1];
      let moodLabel = "暂无数据";
      let moodTone: "warm" | "cool" | "neutral" = "neutral";
      if (lastDay && lastDay.total > 0) {
        const sunnyPct = Math.round((lastDay.SUNNY / lastDay.total) * 100);
        const rainyPct = Math.round(((lastDay.RAINY + lastDay.STORMY) / lastDay.total) * 100);
        if (sunnyPct >= 50) { moodLabel = "晴朗"; moodTone = "warm"; }
        else if (rainyPct >= 30) { moodLabel = "阴雨"; moodTone = "cool"; }
        else { moodLabel = "混合"; moodTone = "neutral"; }
      }

      return {
        id: cls.id, name: cls.name,
        studentCount: cls._count.students,
        todayCount, todayEmotionHelp,
        moodLabel, moodTone,
        signalCount: signals.length,
        signals,
        rainy,
      };
    })
  );

  const totalSignals = classSnapshots.reduce((s, c) => s + c.signalCount, 0);
  const totalEmotionHelp = classSnapshots.reduce((s, c) => s + c.todayEmotionHelp, 0);

  // 树洞词云
  const treeholePosts = await db.post.findMany({
    where: { classId: { in: classes.map((c) => c.id) }, treehole: true, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    select: { content: true },
    take: 100,
  });
  const wordFreq: Record<string, number> = {};
  for (const p of treeholePosts) {
    if (!p.content) continue;
    const cleaned = p.content.replace(/[^一-龥]/g, "");
    for (let len = 2; len <= 3; len++) {
      for (let i = 0; i <= cleaned.length - len; i++) {
        const w = cleaned.slice(i, i + len);
        if (!STOP_WORDS.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
  }
  const cloudWords = Object.entries(wordFreq).filter(([, c]) => c >= 2).sort(([, a], [, b]) => b - a).slice(0, 12);

  // 信号学生汇总
  const allSignals = classSnapshots.flatMap((c) =>
    c.signals.map((s) => ({ ...s, className: c.name, classId: c.id }))
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* 瞭望台 header */}
      <header className="bg-gradient-to-b from-[#1C2840] to-[#2D3550] px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs tracking-wide">今天</p>
            <h1 className="text-xl font-semibold text-white mt-0.5">
              {session?.user?.name || "老师"}，这是你的班级
            </h1>
          </div>
          {totalSignals > 0 && (
            <Link href="/dashboard/signals" className="flex-shrink-0 px-3 py-1.5 rounded-full bg-peach-400/20 text-peach-300 text-xs hover:bg-peach-400/30 transition-colors">
              {totalSignals} 人需关注 →
            </Link>
          )}
        </div>

        {/* 信号速览横滚条 */}
        {allSignals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mt-4 pb-1 -mx-1 px-1">
            {allSignals.slice(0, 8).map((s, i) => (
              <Link
                key={i}
                href={`/dashboard/class/${s.classId}`}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[11px] hover:bg-white/20 transition-colors animate-float-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {s.userName.split("(")[0]} · {s.signalType === "long_silence" ? "久未出现" : s.signalType === "pressure_rising" ? "压力上升" : "社交断联"}
              </Link>
            ))}
            {allSignals.length > 8 && (
              <Link href="/dashboard/signals" className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 text-white/40 text-[11px] hover:bg-white/10 transition-colors">
                +{allSignals.length - 8} 更多
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-2 pb-8 space-y-6">
        {/* 辅导员自己的情绪 */}
        <section className="text-center py-3">
          <CounselorMoodPicker />
        </section>

        {/* 班级星空缩略图 — 不是卡片，是色块 */}
        <section className="space-y-4">
          {classSnapshots.map((cls, i) => (
            <Link
              key={cls.id}
              href={`/class/${cls.id}`}
              className="block animate-float-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* 微型星空色块 */}
              <div
                className={`relative rounded-3xl overflow-hidden h-28 ${
                  cls.rainy
                    ? "bg-gradient-to-br from-[#2D2840] via-[#4A3F50] to-[#3D3550]"
                    : cls.moodTone === "warm"
                      ? "bg-gradient-to-br from-[#2A3050] via-[#3A5070] to-[#5A6040]"
                      : "bg-gradient-to-br from-[#1E3040] via-[#2D4058] to-[#3A4550]"
                }`}
              >
                {/* 随机光点模拟星星（仅在有打卡数据时显示） */}
                {cls.todayCount > 0 && (
                  <div className="absolute inset-0 opacity-40">
                    {Array.from({ length: 20 }).map((_, j) => (
                      <span
                        key={j}
                        className="absolute rounded-full bg-white"
                        style={{
                          width: `${Math.random() * 3 + 1}px`,
                          height: `${Math.random() * 3 + 1}px`,
                          left: `${Math.random() * 90 + 5}%`,
                          top: `${Math.random() * 80 + 5}%`,
                          opacity: Math.random() * 0.7 + 0.2,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 情绪求助暗红点（仅本班） */}
                {cls.todayEmotionHelp > 0 && (
                  <div className="absolute inset-0 opacity-50">
                    {Array.from({ length: cls.todayEmotionHelp }).map((_, j) => (
                      <span
                        key={`red-${j}`}
                        className="absolute rounded-full bg-coral-400 shadow-glow-coral"
                        style={{
                          width: `${Math.random() * 3 + 2}px`,
                          height: `${Math.random() * 3 + 2}px`,
                          left: `${Math.random() * 70 + 15}%`,
                          top: `${Math.random() * 60 + 20}%`,
                          opacity: Math.random() * 0.5 + 0.3,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 叠加信息层 */}
                <div className="absolute inset-0 flex items-center justify-between px-5">
                  <div>
                    <h2 className="text-white font-semibold text-lg drop-shadow-sm">{cls.name}</h2>
                    <p className="text-white/60 text-xs mt-0.5">
                      {cls.todayCount}/{cls.studentCount} 人已打卡
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 text-sm font-medium">{cls.moodLabel}</p>
                    {cls.signalCount > 0 ? (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-peach-400/30 text-peach-200 text-[10px]">
                        {cls.signalCount} 需关注
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-white/30 text-[10px]">一切安稳</span>
                    )}
                    {cls.todayEmotionHelp > 0 && (
                      <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded-full bg-coral-400/30 text-coral-200 text-[10px]">
                        🆘 {cls.todayEmotionHelp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {classSnapshots.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">🔭</p>
              <p className="text-sm text-warm-500">还没有管理的班级</p>
            </div>
          )}
        </section>

        {/* 树洞词云 */}
        {cloudWords.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-warm-300 uppercase tracking-widest">本周树洞词云</span>
              <div className="h-px flex-1 bg-warm-200/50" />
            </div>
            <p className="text-[10px] text-warm-300 mb-3">来自 {treeholePosts.length} 条匿名树洞 · 仅展示高频词</p>
            <div className="flex flex-wrap gap-2">
              {cloudWords.map(([word, count]) => (
                <span
                  key={word}
                  className="inline-block px-3 py-1.5 rounded-full bg-white/60 border border-warm-100 text-warm-600 hover:bg-white hover:border-warm-200 transition-colors"
                  style={{ fontSize: `${Math.min(11 + count * 1.5, 18)}px`, opacity: 0.5 + (count / cloudWords[0][1]) * 0.5 }}
                >
                  #{word}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
