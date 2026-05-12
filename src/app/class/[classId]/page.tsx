import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClassMoodTrend, checkConsecutiveRainy } from "@/lib/mood";
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

  const [particles, helpPosts, sharePosts, topics, goodDeeds, moodTrend, todayMoodCount, rainyWarning, todayEmotionHelp] =
    await Promise.all([
      db.post.findMany({ where: { classId: params.classId, type: "STATE_PARTICLE", expiresAt: { gt: now } }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.post.findMany({ where: { classId: params.classId, type: { in: ["HELP_SKILL", "HELP_EMOTION"] }, treehole: false }, include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { replies: true } } }, orderBy: { createdAt: "desc" }, take: 15 }),
      db.post.findMany({ where: { classId: params.classId, type: "SHARE" }, include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { replies: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
      db.topic.findMany({ where: { classId: params.classId }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.post.findMany({ where: { classId: params.classId, type: "GOOD_DEED" }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
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

  return (
    <div className="space-y-5">
      {/* 星空区 */}
      <section className="relative overflow-hidden" style={{ height: "35vh" }}>
        <StarrySky mood={todayMoodEntry?.mood || null} isCounselor={isCounselor} emotionHelpCount={todayEmotionHelp} />
        <CounselorMoodBanner classId={params.classId} />
        {!isCounselor && <MoodPicker classId={params.classId} currentMood={todayMoodEntry?.mood || null} />}
      </section>

      <ClassPulse todayMoodCount={todayMoodCount} rainyWarning={rainyWarning} dominantMood={dominantMood} />

      <main className="px-4 pb-6 space-y-6">
        {isCounselor ? (
          <CounselorClassView
            classId={params.classId} currentUserId={currentUserId}
            todayMoodCount={todayMoodCount} dominantMood={dominantMood} rainyWarning={rainyWarning}
            particles={particles} sharePosts={sharePosts} topics={topics} helpPosts={helpPosts} goodDeeds={goodDeeds}
          />
        ) : (
          <StudentClassView
            classId={params.classId} currentUserId={currentUserId}
            particles={particles} sharePosts={sharePosts} topics={topics} helpPosts={helpPosts} goodDeeds={goodDeeds}
          />
        )}
      </main>
    </div>
  );
}
