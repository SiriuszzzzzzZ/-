import Link from "next/link";
import { TopicCard } from "@/components/post/TopicCard";
import { ShareQuick } from "@/components/help/ShareQuick";
import { GoodDeedForm } from "@/components/help/GoodDeedForm";
import { TopicPublisher } from "@/components/counselor/TopicPublisher";

interface Post {
  id: string; type: string; content: string | null; createdAt: Date; anonymous?: boolean;
  user: { id: string; name: string; avatar: string | null };
  _count?: { replies: number };
}

interface Topic {
  id: string; title: string; tags: string; content: string | null; isNotice: boolean; isMicroAction: boolean;
}

export function CounselorClassView({
  classId, currentUserId, todayMoodCount, particles, sharePosts, topics, helpPosts, goodDeeds,
  dominantMood, rainyWarning,
}: {
  classId: string; currentUserId: string;
  todayMoodCount: number; dominantMood: string | null; rainyWarning: boolean;
  particles: Post[]; sharePosts: Post[]; topics: Topic[]; helpPosts: Post[]; goodDeeds: Post[];
}) {
  return (
    <>
      {/* 班级脉搏 — 聚合摘要 */}
      <section className="bg-white/40 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-warm-500 font-medium">💛 班级脉搏</span>
          <span className="text-[10px] text-warm-300">学生们在这里自由相处</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="text-xl font-bold text-warm-700">{todayMoodCount}</p><p className="text-[10px] text-warm-400">今日打卡</p></div>
          <div><p className="text-xl font-bold text-warm-700">{particles.length}</p><p className="text-[10px] text-warm-400">状态粒子</p></div>
          <div><p className="text-xl font-bold text-warm-700">{sharePosts.length}</p><p className="text-[10px] text-warm-400">日常分享</p></div>
        </div>
        {dominantMood && <p className="text-xs text-warm-400 text-center mt-3">今日班级基调：{dominantMood}</p>}
        {rainyWarning && <p className="text-xs text-peach-500 bg-peach-50 rounded-full px-3 py-1 text-center mt-2">🌧 连续阴雨预警</p>}
        <p className="text-[10px] text-warm-300 text-center mt-3">学生的自由空间 · 数据匿名聚合展示</p>
      </section>

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
                  {p.user.id === currentUserId && <span className="text-[9px] text-coral-400 bg-coral-50 px-1.5 py-0.5 rounded-full">辅导员</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 召唤区 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-coral-500 font-medium">📬 召唤区</span>
          <span className="text-[10px] text-warm-300">需要你关注的内容</span>
        </div>
        <div className="space-y-3">
          {helpPosts.filter(p => p.type === "HELP_EMOTION").length > 0 ? (
            helpPosts.filter(p => p.type === "HELP_EMOTION").map((p) => (
              <Link key={p.id} href={`/class/${classId}/post/${p.id}`} className="block">
                <div className="bg-coral-50 rounded-2xl border border-coral-100 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">🫂</span><span className="text-[10px] text-coral-400">情绪求助</span>
                    <span className="text-[10px] text-warm-300 ml-auto">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p className="text-sm text-warm-700">{p.content}</p>
                </div>
              </Link>
            ))
          ) : <p className="text-xs text-warm-300 text-center py-4 bg-white/30 rounded-2xl">没有需要关注的求助</p>}
          {helpPosts.filter(p => p.type === "HELP_SKILL").length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-warm-300 mb-2">技能互助 ({helpPosts.filter(p => p.type === "HELP_SKILL").length} 条)</p>
              {helpPosts.filter(p => p.type === "HELP_SKILL").map((p) => (
                <Link key={p.id} href={`/class/${classId}/post/${p.id}`} className="block mb-1.5">
                  <div className="bg-white/50 rounded-xl px-3 py-2 border border-warm-100">
                    <p className="text-sm text-warm-600">{p.content}</p><span className="text-[10px] text-warm-400">{p._count?.replies || 0} 回应</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 话题 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">话题</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <TopicPublisher classId={classId} />
        {topics.length > 0 && (
          <div className="space-y-2 mt-3">
            {topics.map((t) => <TopicCard key={t.id} topic={t} classId={classId} isCounselor />)}
          </div>
        )}
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
