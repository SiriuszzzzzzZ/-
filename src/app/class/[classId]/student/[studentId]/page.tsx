import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeSignals } from "@/lib/signals";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

const MOOD_CN: Record<string, string> = { SUNNY: "☀️", GROWING: "🌱", RAINY: "🌧", STORMY: "🌪" };

export default async function StudentProfilePage({
  params,
}: {
  params: { classId: string; studentId: string };
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "COUNSELOR") return <p className="p-8 text-center text-sm text-warm-400">无权访问</p>;

  const student = await db.user.findUnique({ where: { id: params.studentId } });
  if (!student) return <p className="p-8 text-center text-sm text-warm-400">学生不存在</p>;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

  const [moods, posts, starsReceived, starsGiven, signals] = await Promise.all([
    db.moodEntry.findMany({ where: { userId: student.id, date: { gte: fourteenDaysAgo } }, orderBy: { date: "desc" }, select: { mood: true, date: true } }),
    db.post.findMany({ where: { userId: student.id, parentId: null, createdAt: { gte: fourteenDaysAgo } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, content: true, type: true, createdAt: true, anonymous: true } }),
    db.growthMoment.count({ where: { toUserId: student.id } }),
    db.growthMoment.count({ where: { fromUserId: student.id } }),
    computeSignals(params.classId).then(s => s.filter(x => x.userId === student.id)),
  ]);

  const moodCounts: Record<string, number> = {};
  for (const m of moods) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  const totalMoods = moods.length;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <Link href={`/class/${params.classId}`} className="text-warm-400 hover:text-warm-600 text-sm">← 返回</Link>
        <h1 className="font-semibold text-warm-800 text-lg">学生档案</h1>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 space-y-5 pb-10">
        {/* 基本信息 */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <Avatar src={student.avatar} name={student.name} size="lg" />
          <div className="flex-1">
            <h2 className="font-semibold text-warm-800">{student.name}</h2>
            <p className="text-xs text-warm-400">{student.signature || "暂无签名"}</p>
            <div className="flex gap-3 mt-2">
              <span className="text-[10px] text-mint-500">⭐ {starsReceived} 颗星光</span>
              <span className="text-[10px] text-coral-400">🤝 点亮 {starsGiven} 人</span>
              {student.lowPresenceMode && <span className="text-[10px] text-warm-400">🔇 低存在模式</span>}
            </div>
          </div>
        </div>

        {/* 信号标签 */}
        {signals.length > 0 && (
          <div className="bg-peach-50 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-medium text-peach-600">⚠️ 需关注信号</p>
            {signals.map((s, i) => (
              <p key={i} className="text-xs text-peach-500">{(s as { detail?: string }).detail || s.signalType}</p>
            ))}
          </div>
        )}

        {/* 14天情绪曲线 */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
          <p className="text-sm font-medium text-warm-700">近两周情绪</p>
          {moods.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end gap-1 h-16">
                {[...moods].reverse().map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-xs">{MOOD_CN[m.mood]}</span>
                    <div className={`w-full rounded-t-sm h-8 ${
                      m.mood === "SUNNY" ? "bg-amber-200" : m.mood === "GROWING" ? "bg-mint-300" : m.mood === "RAINY" ? "bg-blue-200" : "bg-coral-400"
                    }`} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 text-[10px] text-warm-400 justify-center">
                {totalMoods > 0 && Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([m, c]) => (
                  <span key={m}>{MOOD_CN[m]} {Math.round(c / totalMoods * 100)}%</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-warm-400">暂无打卡数据</p>
          )}
        </div>

        {/* 最近发言 */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
          <p className="text-sm font-medium text-warm-700">最近发言 ({posts.length})</p>
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="flex items-start gap-2 bg-warm-50 rounded-xl px-3 py-2">
                  <span className="text-xs mt-0.5">{p.anonymous ? "🎭" : "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-warm-600 truncate">{p.content || "(无内容)"}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[9px] text-warm-300">{p.type}</span>
                      <span className="text-[9px] text-warm-300">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400">暂无公开发言</p>
          )}
        </div>
      </main>
    </div>
  );
}
