import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { getClassMoodTrend, checkConsecutiveRainy } from "@/lib/mood";
import { getMonthlySyncPeers } from "@/lib/sync";
import { StarrySky } from "@/components/sky";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { ClassPulse } from "@/components/mood/ClassPulse";
import { CounselorMoodBanner } from "@/components/counselor/CounselorMoodBanner";
import { StudentClassView } from "@/components/class/StudentClassView";
import { CounselorClassView } from "@/components/class/CounselorClassView";

export default async function ClassPage({ params }: { params: { classId: string } }) {
  const session = await getServerSession(authOptions);
  const isCounselor = session?.user?.role === "COUNSELOR";
  const currentUserId = session!.user.id;

  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const todayMoodEntry = isCounselor ? null : await db.moodEntry.findFirst({
    where: { userId: currentUserId, date: { gte: today } },
    select: { mood: true },
  });

  const totalMoodEntries = isCounselor ? 1 : await db.moodEntry.count({ where: { userId: currentUserId } });
  const isFirstTime = !isCounselor && totalMoodEntries === 0;

  const syncPeers = isCounselor ? [] : await getMonthlySyncPeers(currentUserId, params.classId);

  const [particles, helpPosts, sharePosts, topicCounts, topics, goodDeeds, microActionCounts, moodTrend, todayMoodCount, rainyWarning, todayEmotionHelp] =
    await Promise.all([
      db.post.findMany({ where: { classId: params.classId, type: "STATE_PARTICLE", expiresAt: { gt: now } }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.post.findMany({ where: { classId: params.classId, type: { in: ["HELP_SKILL", "HELP_EMOTION"] }, treehole: false, parentId: null }, select: { id: true, type: true, content: true, anonymous: true, createdAt: true, counselorSeenAt: true, user: { select: { id: true, name: true, avatar: true } }, _count: { select: { replies: true } } }, orderBy: { createdAt: "desc" }, take: 15 }),
      db.post.findMany({ where: { classId: params.classId, type: "SHARE", parentId: null }, include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { replies: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
      // 话题互动统计
      db.post.groupBy({ by: ["topicId"], where: { classId: params.classId, type: "TOPIC_POST", topicId: { not: null } }, _count: { id: true } }),
      db.topic.findMany({ where: { classId: params.classId }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.post.findMany({ where: { classId: params.classId, type: "GOOD_DEED" }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
      // 微行动参与人数
      db.topic.findMany({ where: { classId: params.classId, isMicroAction: true }, select: { id: true } }).then(async (micros) => {
        if (micros.length === 0) return new Map<string, number>();
        const counts = await db.post.groupBy({ by: ["topicId", "userId"], where: { topicId: { in: micros.map(m => m.id) }, type: "TOPIC_POST" }, _count: { userId: true } });
        const map = new Map<string, number>();
        for (const c of counts) {
          if (c.topicId) map.set(c.topicId, (map.get(c.topicId) || 0) + 1);
        }
        return map;
      }),
      getClassMoodTrend(params.classId, 7),
      db.moodEntry.count({ where: { classId: params.classId, date: { gte: today } } }),
      checkConsecutiveRainy(params.classId),
      db.post.count({ where: { classId: params.classId, type: "HELP_EMOTION", createdAt: { gte: today } } }),
    ]);

  const lastTrend = moodTrend[moodTrend.length - 1];
  let dominantMood: string | null = null;
  if (lastTrend && lastTrend.total > 0) {
    const moods = [{ key: "SUNNY", label: "晴朗" }, { key: "GROWING", label: "生长" }, { key: "RAINY", label: "阴雨" }, { key: "STORMY", label: "风暴" }];
    const top = moods.sort((a, b) => (lastTrend[b.key as keyof typeof lastTrend] as number) - (lastTrend[a.key as keyof typeof lastTrend] as number))[0];
    dominantMood = top.label;
  }

  const topicInteractionCounts = new Map<string, number>();
  for (const tc of topicCounts) { if (tc.topicId) topicInteractionCounts.set(tc.topicId, tc._count.id); }

  return (
    <div className="space-y-5">
      {/* 星空区 */}
      <section className="relative overflow-hidden" style={{ height: "35vh" }}>
        <StarrySky mood={todayMoodEntry?.mood || null} isCounselor={isCounselor} emotionHelpCount={todayEmotionHelp} />
        <CounselorMoodBanner classId={params.classId} />
        {!isCounselor && <MoodPicker classId={params.classId} currentMood={todayMoodEntry?.mood || null} />}
      </section>

      <ClassPulse todayMoodCount={todayMoodCount} rainyWarning={rainyWarning} dominantMood={dominantMood} />
      <div className="text-center">
        <Link href={`/class/${params.classId}/activity`} className="text-[10px] text-warm-300 hover:text-coral-400 transition-colors">
          📜 班级动态 →
        </Link>
      </div>

      <main className="px-4 pb-6 space-y-6">
        {isCounselor ? (
          <CounselorClassView
            classId={params.classId} currentUserId={currentUserId}
            todayMoodCount={todayMoodCount} dominantMood={dominantMood} rainyWarning={rainyWarning}
            particles={particles} sharePosts={sharePosts} topics={topics} helpPosts={helpPosts} goodDeeds={goodDeeds}
            topicInteractionCounts={topicInteractionCounts} microActionCounts={microActionCounts}
          />
        ) : (
          <StudentClassView
            classId={params.classId} currentUserId={currentUserId}
            particles={particles} sharePosts={sharePosts} topics={topics} helpPosts={helpPosts} goodDeeds={goodDeeds}
            syncPeers={syncPeers} topicInteractionCounts={topicInteractionCounts} isFirstTime={isFirstTime} hasMood={!!todayMoodEntry} microActionCounts={microActionCounts}
          />
        )}
      </main>
    </div>
  );
}
