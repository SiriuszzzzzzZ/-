import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { ParticlePicker } from "@/components/particle/ParticlePicker";
import { ParticleBubble } from "@/components/particle/ParticleBubble";
import { HelpForm } from "@/components/help/HelpForm";
import { HelpCard } from "@/components/help/HelpCard";
import { TopicCard } from "@/components/post/TopicCard";
import { CounselorMoodBanner } from "@/components/counselor/CounselorMoodBanner";

export default async function ClassPage({ params }: { params: { classId: string } }) {
  const session = await getServerSession(authOptions);
  const isCounselor = session?.user?.role === "COUNSELOR";

  const now = new Date();
  const [particles, helpPosts, topics] = await Promise.all([
    db.post.findMany({
      where: { classId: params.classId, type: "STATE_PARTICLE", expiresAt: { gt: now } },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.post.findMany({
      where: { classId: params.classId, type: "HELP_SKILL" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.topic.findMany({
      where: { classId: params.classId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-4">
      <CounselorMoodBanner classId={params.classId} />

      {!isCounselor && <MoodPicker classId={params.classId} />}

      <div>
        <ParticlePicker classId={params.classId} />
        {particles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {particles.map((p) => (
              <ParticleBubble key={p.id} particle={p} />
            ))}
          </div>
        )}
      </div>

      {topics.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">今日话题</h3>
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">一分钟求助</h3>
        {!isCounselor && <HelpForm classId={params.classId} onSent={() => {}} />}
        {helpPosts.map((p) => (
          <HelpCard key={p.id} post={p} />
        ))}
        {helpPosts.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">还没有求助，来做第一个吧</p>
        )}
      </div>
    </div>
  );
}
