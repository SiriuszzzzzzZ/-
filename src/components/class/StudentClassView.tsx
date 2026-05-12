import { ParticlePicker } from "@/components/particle/ParticlePicker";
import { ParticleBubble } from "@/components/particle/ParticleBubble";
import { HelpForm } from "@/components/help/HelpForm";
import { HelpCard } from "@/components/help/HelpCard";
import { TopicCard } from "@/components/post/TopicCard";
import { ShareQuick } from "@/components/help/ShareQuick";
import { TreeholeQuick } from "@/components/help/TreeholeQuick";
import { GoodDeedForm } from "@/components/help/GoodDeedForm";
import { DeletePostButton } from "@/components/help/OwnPostActions";

interface Post {
  id: string; type: string; content: string | null; createdAt: Date; anonymous: boolean;
  user: { id: string; name: string; avatar: string | null };
  _count?: { replies: number };
}

interface Topic {
  id: string; title: string; tags: string; content: string | null; isNotice: boolean; isMicroAction: boolean;
}

export function StudentClassView({
  classId, currentUserId, particles, sharePosts, topics, helpPosts, goodDeeds,
}: {
  classId: string; currentUserId: string;
  particles: Post[]; sharePosts: Post[]; topics: Topic[]; helpPosts: Post[]; goodDeeds: Post[];
}) {
  return (
    <>
      {/* 粒子 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">此刻</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <div className="flex flex-wrap gap-2">
          {particles.map((p) => <ParticleBubble key={p.id} particle={p} />)}
        </div>
        <div className="mt-2"><ParticlePicker classId={classId} /></div>
        {particles.length === 0 && <p className="text-xs text-warm-300 text-center py-3">还没有人留下足迹</p>}
      </section>

      <TreeholeQuick classId={classId} />

      {/* 日常 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">日常</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <ShareQuick classId={classId} />
        {sharePosts.length > 0 && (
          <div className="mt-3 space-y-2">
            {sharePosts.map((p, i) => (
              <div key={p.id} className="bg-white/50 rounded-2xl border border-warm-100 px-4 py-3 animate-float-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-sm text-warm-700">{p.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-warm-400">{p.user.name}</span>
                  <span className="text-[10px] text-warm-300">{new Date(p.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {p.user.id === currentUserId && <DeletePostButton postId={p.id} classId={classId} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 话题 */}
      {topics.length > 0 ? (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-warm-300 uppercase tracking-widest">话题</span>
            <div className="h-px flex-1 bg-warm-200/50" />
          </div>
          <div className="space-y-2">
            {topics.map((t) => <TopicCard key={t.id} topic={t} classId={classId} isCounselor={false} />)}
          </div>
        </section>
      ) : (
        <section>
          <div className="bg-mint-50/50 rounded-2xl border border-dashed border-mint-200 px-4 py-4 text-center">
            <p className="text-sm text-mint-600">✨ 今天的话题由你来开启</p>
            <p className="text-xs text-warm-400 mt-1">辅导员正在准备第一个话题，你也可以先分享日常</p>
          </div>
        </section>
      )}

      {/* 互助 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">互助</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <div className="space-y-3">
          <HelpForm classId={classId} />
          {helpPosts.map((p) => <HelpCard key={p.id} post={p} classId={classId} currentUserId={currentUserId} />)}
          {helpPosts.length === 0 && <p className="text-xs text-warm-300 text-center py-4">这里很安静，也是一种好</p>}
        </div>
      </section>

      {/* 好意 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">多余的好意</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <GoodDeedForm classId={classId} />
        {goodDeeds.length > 0 && (
          <div className="space-y-2 mt-3">
            {goodDeeds.map((gd, i) => (
              <div key={gd.id} className="bg-mint-50 rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                <span className="text-lg">🎁</span>
                <div className="flex-1"><p className="text-sm text-warm-600">{gd.content}</p><p className="text-xs text-warm-400 mt-0.5">{gd.user.name} · 先到先得</p></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
