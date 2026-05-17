import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeSignals } from "@/lib/signals";
import { getClassMoodTrend, checkConsecutiveRainy, detectCrisis, detectStormCrisisStudent, getWeekComparison } from "@/lib/mood";
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

      const weekComp = await getWeekComparison(cls.id);

      return {
        id: cls.id, name: cls.name,
        studentCount: cls._count.students,
        todayCount, todayEmotionHelp,
        moodLabel, moodTone,
        signalCount: signals.length,
        signals,
        rainy,
        weekChange: weekComp.change,
      };
    })
  );

  const totalSignals = classSnapshots.reduce((s, c) => s + c.signalCount, 0);

  // 危机检测
  const allCrisisResults = await Promise.all(classes.map(async (c) => {
    const [keywordCrisis, stormCrisis] = await Promise.all([detectCrisis(c.id), detectStormCrisisStudent(c.id)]);
    return { classId: c.id, className: c.name, keywordCrisis, stormCrisis };
  }));
  const totalCrisis = allCrisisResults.reduce((s, r) => s + r.keywordCrisis.length + r.stormCrisis.length, 0);
  const crisisCards = allCrisisResults.flatMap((r) => [
    ...r.stormCrisis.map((s) => ({
      id: `storm-${s.userId}`,
      href: `/class/${r.classId}/student/${s.userId}`,
      title: s.userName,
      className: r.className,
      reason: `连续 ${s.stormCount} 天风暴`,
      status: s.stormCount >= 3 ? "建议跟进" : "待查看",
      tone: "peach" as const,
    })),
    ...r.keywordCrisis.map((k) => ({
      id: `keyword-${k.postId}`,
      href: `/class/${k.classId}/post/${k.postId}`,
      title: "匿名内容触发关键词",
      className: r.className,
      reason: "近 3 天出现需要留意的表达",
      status: "待查看",
      tone: "amber" as const,
    })),
  ]);

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

        {/* 重点关注卡片 */}
        {totalCrisis > 0 && (
          <section className="mt-3 rounded-3xl border border-peach-300/40 bg-peach-400/15 px-4 py-3 animate-float-up" aria-label="近 3 天重点关注">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-peach-100 font-medium">近 3 天重点关注</p>
                <p className="text-[11px] text-white/55 mt-0.5">先看原因，再决定是否跟进</p>
              </div>
              <Link href="/dashboard/signals" className="min-h-11 inline-flex items-center rounded-full bg-white/10 px-3 text-xs text-peach-100 hover:bg-white/20 transition-colors">
                全部信号 →
              </Link>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {crisisCards.slice(0, 4).map((card) => (
                <Link key={card.id} href={card.href} className="block rounded-2xl bg-white/10 px-3 py-3 text-white/90 hover:bg-white/15 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{card.title}</p>
                      <p className="text-xs text-white/55 mt-0.5">{card.className} · {card.reason}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-peach-300/20 px-2 py-1 text-xs text-peach-100">{card.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-peach-100">查看详情 →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

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

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 -mt-2 pb-8 space-y-6">
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
                {/* 确定性光点（种子=classId+j，避Math.random水合不一致） */}
                {cls.todayCount > 0 && (
                  <div className="absolute inset-0 opacity-40">
                    {Array.from({ length: 20 }).map((_, j) => (
                      <StarDot key={j} seed={`${cls.id}-${j}`} color="white" sizeRange={[1, 3]} leftRange={[5, 90]} topRange={[5, 80]} />
                    ))}
                  </div>
                )}
                {cls.todayEmotionHelp > 0 && (
                  <div className="absolute inset-0 opacity-50">
                    {Array.from({ length: cls.todayEmotionHelp }).map((_, j) => (
                      <StarDot key={`red-${j}`} seed={`${cls.id}-red-${j}`} color="coral" sizeRange={[2, 4]} leftRange={[15, 70]} topRange={[20, 60]} />
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
                    <p className="text-white/90 text-sm font-medium inline-flex items-center gap-1">
                      {cls.moodLabel}
                      {cls.weekChange !== 0 && (
                        <span className={`text-[10px] ${cls.weekChange! > 0 ? "text-mint-300" : "text-coral-300"}`}>
                          本周{cls.weekChange! > 0 ? "上升" : "下降"} {Math.abs(cls.weekChange!)}%
                        </span>
                      )}
                    </p>
                    {cls.signalCount > 0 ? (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-peach-400/30 text-peach-200 text-[10px]">
                        {cls.signalCount} 个学生信号
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-white/30 text-[10px]">一切安稳</span>
                    )}
                    {cls.todayEmotionHelp > 0 && (
                      <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded-full bg-coral-400/30 text-coral-200 text-[10px]">
                        情绪求助 {cls.todayEmotionHelp}
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

// 确定性伪随机 — 避免 Math.random() 导致服务端/客户端水合不一致
function seedRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 4294967296;
}

function StarDot({ seed, color, sizeRange, leftRange, topRange }: {
  seed: string; color: string; sizeRange: [number, number]; leftRange: [number, number]; topRange: [number, number];
}) {
  const r = (n: number) => seedRandom(seed + String(n));
  const size = r(0) * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
  const left = r(1) * (leftRange[1] - leftRange[0]) + leftRange[0];
  const top = r(2) * (topRange[1] - topRange[0]) + topRange[0];
  const opacity = r(3) * 0.5 + 0.3;
  const colorClass = color === "coral" ? "bg-coral-400 shadow-glow-coral" : "bg-white";
  return (
    <span
      className={`absolute rounded-full ${colorClass}`}
      style={{ width: `${size}px`, height: `${size}px`, left: `${left}%`, top: `${top}%`, opacity }}
    />
  );
}
