import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClassMoodTrend, checkConsecutiveRainy, shouldShowMoodChart } from "@/lib/mood";
import { computeSignals } from "@/lib/signals";
import { SignalList } from "@/components/dashboard/SignalList";

export default async function ClassDetailPage({ params }: { params: { classId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "COUNSELOR") return null;

  const classData = await db.class.findUnique({
    where: { id: params.classId },
    include: { _count: { select: { students: true } } },
  });
  if (!classData) return <div>班级不存在</div>;

  const trend = await getClassMoodTrend(params.classId, 7);
  const signals = await computeSignals(params.classId);
  const showChart = shouldShowMoodChart(
    trend.length > 0 ? trend[trend.length - 1]?.total ?? 0 : 0
  );
  const rainyWarning = await checkConsecutiveRainy(params.classId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emotionHelpCount = await db.post.count({
    where: { classId: params.classId, type: "HELP_EMOTION", createdAt: { gte: today } },
  });

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3">
        <h1 className="font-semibold text-warm-800 text-lg">{classData.name}</h1>
        <p className="text-xs text-warm-400 mt-0.5">{classData._count.students} 名学生</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/60 rounded-2xl p-3.5 text-center shadow-soft">
            <p className="text-2xl font-bold text-warm-700">{classData._count.students}</p>
            <p className="text-xs text-warm-400 mt-0.5">学生总数</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-3.5 text-center shadow-soft">
            <p className="text-2xl font-bold text-peach-500">{signals.length}</p>
            <p className="text-xs text-warm-400 mt-0.5">需关注</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-3.5 text-center shadow-soft">
            <p className="text-2xl font-bold text-mint-500">{emotionHelpCount}</p>
            <p className="text-xs text-warm-400 mt-0.5">今日求助</p>
          </div>
        </div>

        {/* Emotion trend */}
        <div className="bg-white/60 rounded-3xl p-5 shadow-soft">
          <h3 className="text-sm font-medium text-warm-700 mb-3">本周情绪趋势</h3>
          {showChart && trend.length > 0 ? (
            <div className="flex items-end gap-1 h-20">
              {trend.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full rounded-sm overflow-hidden" style={{ height: "64px", position: "relative", background: "#f5f0eb" }}>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        height: `${d.total > 0 ? ((d.RAINY + d.STORMY) / d.total) * 64 : 0}px`,
                        background: "linear-gradient(to top, #FF7A6B, #FFA99E)",
                        borderRadius: "4px 4px 0 0",
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-warm-400 mt-1">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 text-center py-4">数据不足，暂不展示</p>
          )}
        </div>

        {/* Alerts */}
        {emotionHelpCount > 0 && (
          <div className="bg-peach-50 border border-peach-200 rounded-3xl px-5 py-3">
            <p className="text-sm text-peach-600 font-medium">
              今日有 {emotionHelpCount} 名学生表达了情绪困扰
            </p>
          </div>
        )}

        {rainyWarning && (
          <div className="bg-mint-50 border border-mint-200 rounded-3xl px-5 py-3">
            <p className="text-sm text-mint-600 font-medium">
              连续阴雨预警：班级情绪持续低落，建议主动关注
            </p>
          </div>
        )}

        {/* Signals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-warm-400">需要关注的人</span>
            <div className="h-px flex-1 bg-warm-200" />
          </div>
          <SignalList signals={signals} />
        </div>
      </main>
    </div>
  );
}
