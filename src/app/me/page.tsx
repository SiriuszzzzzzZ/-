import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGrowthTrajectory } from "@/lib/growth";
import { computeSignals } from "@/lib/signals";
import { getUserBadges } from "@/lib/badges";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationList } from "@/components/ui";
import { BadgeDisplay } from "@/components/ui/BadgeDisplay";
import Link from "next/link";
import { LowPresenceToggle } from "./LowPresenceToggle";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { TopicListItem } from "@/components/post/TopicListItem";
import { MoodInsight } from "@/components/me/MoodInsight";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  const isCounselor = user.role === "COUNSELOR";
  const trajectory = await getGrowthTrajectory(user.id);
  const badges = await getUserBadges(user.id);

  // 通知 + 痕迹
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [newGrowth, repliedToMe, myShares, myParticles] = await Promise.all([
    db.growthMoment.count({ where: { toUserId: user.id, createdAt: { gte: weekAgo } } }),
    // 所有我的帖子收到了谁的回复
    db.post.findMany({
      where: { userId: user.id, parentId: null },
      select: { id: true, classId: true, content: true, type: true },
    }).then(async (myPosts) => {
      if (myPosts.length === 0) return [];
      const replies = await db.post.findMany({
        where: { parentId: { in: myPosts.map(p => p.id) }, userId: { not: user.id }, createdAt: { gte: weekAgo } },
        select: { parentId: true, userId: true, user: { select: { name: true } } },
        distinct: ["parentId", "userId"],
      });
      return replies.map(r => {
        const parent = myPosts.find(p => p.id === r.parentId);
        return { postId: parent!.id, classId: parent!.classId, content: parent!.content, replyerName: r.user.name };
      });
    }),
    db.post.findMany({ where: { userId: user.id, type: "SHARE", parentId: null }, orderBy: { createdAt: "desc" }, take: 5, select: { content: true, createdAt: true } }),
    db.post.findMany({ where: { userId: user.id, type: "STATE_PARTICLE" }, orderBy: { createdAt: "desc" }, take: 5, select: { content: true, createdAt: true } }),
  ]);

  const totalNotifications = newGrowth + repliedToMe.length;

  return (
    <div className="min-h-screen bg-cream">
      <header className="relative overflow-hidden bg-gradient-to-b from-[#1C2840] via-[#2A3850] to-cream px-5 pt-8 pb-8">
        <div className="relative z-10 flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div>
            <h2 className="font-semibold text-white text-lg">{user.name}</h2>
            <p className="text-xs text-white/50">
              {isCounselor ? "辅导员" : "学生"}{user.signature ? ` · ${user.signature}` : ""}
            </p>
          </div>
          <Link href="/me/settings" className="ml-auto text-white/50 hover:text-white/80 transition-colors text-lg" aria-label="设置">⚙</Link>
        </div>
      </header>

      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 -mt-2 pb-8 space-y-5">
        {/* 通知摘要 */}
        {totalNotifications > 0 && (
          <NotificationList notifications={[
            ...(newGrowth > 0 ? [{ type: "growth" as const, count: newGrowth }] : []),
            ...repliedToMe.map((rp) => ({ type: "reply" as const, postId: rp.postId, classId: rp.classId, content: `${rp.replyerName} 回复了你` })),
          ]} />
        )}

        {isCounselor ? <CounselorWorkbench counselorId={user.id} /> : <StudentSpace user={user} trajectory={trajectory} myShares={myShares} myParticles={myParticles} badges={badges} />}

        <div className="pt-2">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}

// ═══════ 辅导员工作台 ═══════
async function CounselorWorkbench({ counselorId }: { counselorId: string; badges?: { type: string; level: number; progress: number }[] }) {
  const classes = await db.class.findMany({
    where: { counselorId },
    include: { _count: { select: { students: true } } },
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const classSnapshots = await Promise.all(classes.map(async (cls) => {
    const todayMood = await db.moodEntry.count({ where: { classId: cls.id, date: { gte: today } } });
    const todayHelp = await db.post.count({ where: { classId: cls.id, type: "HELP_EMOTION", createdAt: { gte: today } } });
    const signals = await computeSignals(cls.id);
    return { ...cls, todayMood, todayHelp, signalCount: signals.length };
  }));

  const totalStudents = classSnapshots.reduce((s, c) => s + c._count.students, 0);
  const totalMoods = classSnapshots.reduce((s, c) => s + c.todayMood, 0);
  const totalHelp = classSnapshots.reduce((s, c) => s + c.todayHelp, 0);
  const totalSignals = classSnapshots.reduce((s, c) => s + c.signalCount, 0);

  const topics = await db.topic.findMany({
    where: { createdBy: counselorId },
    orderBy: { createdAt: "desc" }, take: 5,
    select: { id: true, title: true, classId: true, isNotice: true, isMicroAction: true, createdAt: true },
  });

  return (
    <>
      {/* 三色块数据 — 不是四宫格 */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard" className="bg-gradient-to-b from-mint-50 to-mint-100/50 rounded-2xl p-4 text-center hover:shadow-soft transition-shadow">
          <p className="text-2xl font-bold text-mint-500">{totalMoods}</p>
          <p className="text-[10px] text-mint-400 mt-0.5">已打卡</p>
        </Link>
        <Link href="/dashboard/signals" className="bg-gradient-to-b from-coral-50 to-coral-100/50 rounded-2xl p-4 text-center hover:shadow-soft transition-shadow">
          <p className={`text-2xl font-bold ${totalHelp > 0 ? "text-coral-500" : "text-warm-400"}`}>{totalHelp}</p>
          <p className="text-[10px] text-coral-400 mt-0.5">情绪求助</p>
        </Link>
        <Link href="/dashboard/signals" className="bg-gradient-to-b from-peach-50 to-peach-100/50 rounded-2xl p-4 text-center hover:shadow-soft transition-shadow">
          <p className={`text-2xl font-bold ${totalSignals > 0 ? "text-peach-500" : "text-warm-400"}`}>{totalSignals}</p>
          <p className="text-[10px] text-peach-400 mt-0.5">需关注</p>
        </Link>
      </div>

      {/* 学生总数 */}
      <p className="text-center text-xs text-warm-300">共 {totalStudents} 名学生 · {classes.length} 个班级</p>

      {/* 管理班级 — 每条可点击 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">管理班级</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        {classes.map((cls) => (
          <Link key={cls.id} href={`/class/${cls.id}`} className="flex items-center justify-between py-2.5 px-4 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
            <span className="text-sm text-warm-600">{cls.name}</span>
            <span className="text-xs text-warm-400">{cls._count.students} 人 →</span>
          </Link>
        ))}
      </div>

      {/* 我发布的话题 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">我发布的话题</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        {topics.length === 0 ? (
          <p className="text-xs text-warm-400 py-3 px-4">还没有发布过话题</p>
        ) : (
          topics.map((t) => <TopicListItem key={t.id} topic={t} />)
        )}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="bg-white/50 rounded-2xl p-3 text-center hover:shadow-soft transition-all">
          <p className="text-lg">📋</p>
          <p className="text-xs text-warm-500 mt-1">仪表盘</p>
        </Link>
        <Link href="/dashboard/signals" className="bg-white/50 rounded-2xl p-3 text-center hover:shadow-soft transition-all">
          <p className="text-lg">🔍</p>
          <p className="text-xs text-warm-500 mt-1">学生信号</p>
        </Link>
      </div>
    </>
  );
}

// ═══════ 学生空间 ═══════
async function StudentSpace({ user, trajectory, myShares, myParticles, badges }: {
  user: { classId: string | null; lowPresenceMode: boolean };
  trajectory: { growthReceived: number };
  myShares: { content: string | null; createdAt: Date }[];
  myParticles: { content: string | null; createdAt: Date }[];
  badges: { type: string; level: number; progress: number }[];
}) {
  const hasTraces = myShares.length > 0 || myParticles.length > 0;

  return (
    <>
      {/* 徽章展示 */}
      <div className="bg-white/50 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-warm-400">我的徽章</p>
        <BadgeDisplay badges={badges} />
      </div>

      <MoodInsight />

      {/* 成长记录 */}
      <Link href="/me/growth" className="block">
        <div className="bg-gradient-to-r from-[#1A3050] via-[#2A4050] to-[#1E3A4A] rounded-3xl p-6 text-center hover:shadow-soft-lg transition-all duration-300 hover:scale-[1.01]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint-400/20 mb-3">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-white font-medium">我的星光收集</p>
          <p className="text-white/60 text-sm mt-1">
            已收集 <span className="text-mint-300 font-semibold">{trajectory.growthReceived}</span> 颗星光
          </p>
        </div>
      </Link>

      {/* 周报入口 */}
      <Link href="/me/report" className="block">
        <div className="bg-gradient-to-r from-mint-50 to-peach-50 rounded-2xl p-4 text-center hover:shadow-soft transition-all">
          <span className="text-lg">📊</span>
          <p className="text-sm font-medium text-warm-600 mt-1">本周成长周报</p>
          <p className="text-[10px] text-warm-400">你的情绪足迹和互动记录</p>
        </div>
      </Link>

      {/* 我的痕迹 */}
      {hasTraces && (
        <div className="bg-white/50 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-warm-400">我留下的痕迹</p>
          {myShares.slice(0, 3).map((s, i) => (
            <div key={i} className="text-sm text-warm-600 flex items-center gap-2">
              <span>💬</span>
              <span className="flex-1 truncate">{s.content}</span>
              <span className="text-[10px] text-warm-300">{new Date(s.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          ))}
          {myParticles.slice(0, 3).map((p, i) => (
            <div key={`pt-${i}`} className="text-sm text-warm-500 flex items-center gap-2">
              <span>👣</span>
              <span className="flex-1 truncate">{p.content}</span>
              <span className="text-[10px] text-warm-300">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          ))}
        </div>
      )}

      <LowPresenceToggle current={user.lowPresenceMode} />

      {user.classId && (
        <Link href={`/class/${user.classId}`} className="block">
          <div className="bg-white/50 rounded-2xl py-3 text-center hover:shadow-soft transition-all">
            <span className="text-sm text-coral-400">← 返回班级</span>
          </div>
        </Link>
      )}
    </>
  );
}
