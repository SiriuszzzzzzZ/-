import { db } from "@/lib/db";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

const MOOD_CN: Record<string, string> = { SUNNY: "🌤 还行", GROWING: "🌱 状态不错", RAINY: "🌧 有点累", STORMY: "🌪 快炸了" };

interface ActivityItem {
  type: "mood" | "post" | "growth" | "topic";
  time: Date;
  user: { id: string; name: string; avatar: string | null };
  detail: string;
  link?: string;
}

export default async function ActivityPage({ params }: { params: { classId: string } }) {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

  const [moods, posts, growths, topics] = await Promise.all([
    db.moodEntry.findMany({ where: { classId: params.classId, date: { gte: threeDaysAgo } }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { date: "desc" }, take: 30 }),
    db.post.findMany({ where: { classId: params.classId, parentId: null, treehole: false, createdAt: { gte: threeDaysAgo } }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.growthMoment.findMany({ where: { fromUserId: { not: "system" }, createdAt: { gte: threeDaysAgo } }, include: { fromUser: { select: { id: true, name: true, avatar: true } }, toUser: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.topic.findMany({ where: { classId: params.classId, createdAt: { gte: threeDaysAgo } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const activities: ActivityItem[] = [
    ...moods.map(m => ({ type: "mood" as const, time: new Date(m.date), user: m.user, detail: MOOD_CN[m.mood] || m.mood })),
    ...posts.map(p => ({ type: "post" as const, time: p.createdAt, user: p.user, detail: p.content?.slice(0, 50) || "", link: `/class/${params.classId}/post/${p.id}` })),
    ...growths.filter(g => g.fromUser && g.toUser).map(g => ({
      type: "growth" as const, time: g.createdAt, user: g.fromUser!,
      detail: `点亮了 ${g.toUser!.name}`,
      link: `/class/${params.classId}/student/${g.toUser!.id}`,
    })),
    ...topics.map(t => ({
      type: "topic" as const, time: t.createdAt,
      user: { id: "", name: "辅导员", avatar: null },
      detail: t.title,
      link: `/class/${params.classId}/topic/${t.id}`,
    })),
  ];

  activities.sort((a, b) => b.time.getTime() - a.time.getTime());
  const recent = activities.slice(0, 40);

  const typeIcon = (type: string) => type === "mood" ? "💛" : type === "growth" ? "⭐" : type === "topic" ? "📋" : "💬";

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <Link href={`/class/${params.classId}`} className="text-warm-400 hover:text-warm-600 text-sm">← 返回</Link>
        <h1 className="font-semibold text-warm-800 text-lg">班级动态</h1>
        <span className="text-[10px] text-warm-300 ml-auto">近 3 天</span>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 pb-10">
        {recent.length === 0 ? (
          <p className="text-sm text-warm-400 text-center py-16">这三天很安静，班级像在呼吸</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-warm-100 ml-3 space-y-0">
            {recent.map((a, i) => (
              <div key={i} className="relative pb-5 last:pb-0 animate-float-up" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-white border-2 border-warm-200 flex items-center justify-center text-[8px]">
                  {typeIcon(a.type)}
                </span>
                <div className="ml-2">
                  <div className="flex items-center gap-2">
                    {a.user.avatar || a.user.name ? (
                      <Avatar src={a.user.avatar} name={a.user.name} size="sm" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-coral-100 flex items-center justify-center text-[10px]">📋</span>
                    )}
                    <span className="text-xs font-medium text-warm-600">{a.user.name || "系统"}</span>
                    <span className="text-[10px] text-warm-300">{new Date(a.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {a.link ? (
                    <Link href={a.link} className="ml-7 text-xs text-warm-500 hover:text-coral-500 transition-colors">
                      {a.detail}
                    </Link>
                  ) : (
                    <p className="ml-7 text-xs text-warm-500">{a.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
