"use client";
import Link from "next/link";
import { TopicCard } from "@/components/post/TopicCard";
import { ShareQuick } from "@/components/help/ShareQuick";
import { GoodDeedForm } from "@/components/help/GoodDeedForm";
import { GoodDeedItem } from "@/components/help/GoodDeedItem";
import { TopicPublisher } from "@/components/counselor/TopicPublisher";
import { TreeholeResponder } from "@/components/counselor/TreeholeResponder";
import { MarkSeen } from "@/components/counselor/MarkSeen";
import { LightUpButton } from "@/components/help/LightUpButton";
import { useState } from "react";

interface Post {
  id: string; type: string; content: string | null; createdAt: Date; anonymous?: boolean;
  user: { id: string; name: string; avatar: string | null };
  _count?: { replies: number };
}

interface Topic {
  id: string; title: string; tags: string; content: string | null; isNotice: boolean; isMicroAction: boolean;
}

function ReplyToShare({ postId, classId }: { postId: string; classId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, content: text, type: "SHARE", parentId: postId }),
    });
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setText(""); }, 2000);
  }

  if (sent) return <p className="text-[10px] text-mint-500 mt-1">已回复 ✓</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="text-[10px] text-coral-400 hover:text-coral-600 mt-1">回复</button>;

  return (
    <div className="flex gap-2 mt-1.5">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="一句话回应..."
        className="flex-1 text-xs rounded-xl border border-warm-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-coral-300" />
      <button onClick={submit} className="text-[10px] px-2 py-1 rounded-lg bg-coral-400 text-white">发送</button>
    </div>
  );
}

function StudentSignals({ classId }: { classId: string }) {
  return (
    <section className="bg-white/40 rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-coral-500 font-medium">📊 学生信号分析</span>
        <span className="text-[10px] text-warm-300">基于最近7天数据</span>
      </div>
      <div className="space-y-2">
        <Link href={`/dashboard/class/${classId}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
          <span className="text-lg">📈</span>
          <div className="flex-1">
            <p className="text-sm text-warm-700">情绪趋势图</p>
            <p className="text-[10px] text-warm-400">查看班级7天情绪变化</p>
          </div>
          <span className="text-xs text-warm-300">→</span>
        </Link>
        <Link href={`/dashboard/signals?classId=${classId}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
          <span className="text-lg">🔍</span>
          <div className="flex-1">
            <p className="text-sm text-warm-700">需关注学生</p>
            <p className="text-[10px] text-warm-400">连续阴雨 / 长期未活跃</p>
          </div>
          <span className="text-xs text-warm-300">→</span>
        </Link>
        <Link href={`/dashboard/class/${classId}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
          <span className="text-lg">☁️</span>
          <div className="flex-1">
            <p className="text-sm text-warm-700">树洞词云</p>
            <p className="text-[10px] text-warm-400">匿名话题汇总分析</p>
          </div>
          <span className="text-xs text-warm-300">→</span>
        </Link>
      </div>
    </section>
  );
}

export function CounselorClassView({
  classId, currentUserId, todayMoodCount, particles, sharePosts, topics, helpPosts, goodDeeds,
  dominantMood, rainyWarning, topicInteractionCounts, microActionCounts,
}: {
  classId: string; currentUserId: string;
  todayMoodCount: number; dominantMood: string | null; rainyWarning: boolean;
  particles: Post[]; sharePosts: Post[]; topics: Topic[]; helpPosts: Post[]; goodDeeds: Post[];
  topicInteractionCounts: Map<string, number>;
  microActionCounts: Map<string, number>;
}) {
  const totalInteractions = Array.from(topicInteractionCounts.values()).reduce((a, b) => a + b, 0);
  const emotionHelpCount = helpPosts.filter(p => p.type === "HELP_EMOTION").length;
  const skillHelpCount = helpPosts.filter(p => p.type === "HELP_SKILL").length;

  return (
    <>
      <MarkSeen classId={classId} />

      {/* 专业数据分析区 */}
      <StudentSignals classId={classId} />

      {/* 班级脉搏 — 聚合摘要 */}
      <section className="bg-white/40 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-warm-500 font-medium">💛 班级脉搏</span>
          <span className="text-[10px] text-warm-300">今日快照</span>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div><p className="text-xl font-bold text-mint-500">{todayMoodCount}</p><p className="text-[10px] text-warm-400">今日打卡</p></div>
          <div><p className="text-xl font-bold text-warm-700">{sharePosts.length + particles.length}</p><p className="text-[10px] text-warm-400">动态</p></div>
          <div><p className="text-xl font-bold text-coral-500">{emotionHelpCount + skillHelpCount}</p><p className="text-[10px] text-warm-400">求助</p></div>
          <div><p className="text-xl font-bold text-mint-600">{totalInteractions}</p><p className="text-[10px] text-warm-400">话题互动</p></div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          {dominantMood && <span className="text-xs text-warm-400">基调：{dominantMood}</span>}
          {rainyWarning && <span className="text-xs text-peach-600 bg-peach-50 px-2 py-0.5 rounded-full">连续阴雨，建议留意</span>}
        </div>
      </section>

      {/* 召唤区 — 最高优先级置顶 */}
      {emotionHelpCount > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-peach-600 font-medium">召唤区</span>
            <span className="text-[10px] text-warm-300">优先关注</span>
          </div>
          <div className="space-y-2">
            {helpPosts.filter(p => p.type === "HELP_EMOTION").map((p) => (
              <Link key={p.id} href={`/class/${classId}/post/${p.id}`} className="block">
                <div className="bg-peach-50 rounded-2xl border border-peach-100 px-4 py-3 hover:shadow-soft transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs" aria-hidden="true">🫂</span><span className="text-xs text-peach-600">情绪求助 · 待查看</span>
                    <span className="text-[10px] text-warm-300 ml-auto">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p className="text-sm text-warm-700">{p.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 技能互助 */}
      {skillHelpCount > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-warm-300 uppercase tracking-widest">技能互助</span>
            <div className="h-px flex-1 bg-warm-200/50" />
            <span className="text-[10px] text-warm-300">{skillHelpCount} 条</span>
          </div>
          <div className="space-y-1.5">
            {helpPosts.filter(p => p.type === "HELP_SKILL").map((p) => (
              <Link key={p.id} href={`/class/${classId}/post/${p.id}`} className="block">
                <div className="bg-white/50 rounded-xl px-3 py-2 border border-warm-100 hover:bg-white/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-warm-600">{p.content}</p>
                    <span className="text-[10px] text-warm-400 ml-2">{p._count?.replies || 0} 回应 →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 话题 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">话题</span>
          <div className="h-px flex-1 bg-warm-200/50" />
          <span className="text-[10px] text-warm-300">{totalInteractions > 0 ? `${totalInteractions} 次互动` : ""}</span>
        </div>
        <TopicPublisher classId={classId} />
        {topics.length > 0 && (
          <div className="space-y-2 mt-3">
            {topics.map((t) => <TopicCard key={t.id} topic={t} classId={classId} isCounselor interactionCount={topicInteractionCounts.get(t.id) ?? 0} microCount={microActionCounts.get(t.id)} />)}
          </div>
        )}
      </section>

      {/* 日常 — 辅导员可评论 */}
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
                  <Link href={`/class/${classId}/student/${p.user.id}`} className="text-[10px] text-coral-400 hover:text-coral-600 transition-colors">{p.user.name}</Link>
                  <span className="text-[10px] text-warm-300">{new Date(p.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {p.user.id === currentUserId && <span className="text-[9px] text-coral-400 bg-coral-50 px-1.5 py-0.5 rounded-full">我</span>}
                  <ReplyToShare postId={p.id} classId={classId} />
                  {p.user.id !== currentUserId && <LightUpButton toUserId={p.user.id} toUserName={p.user.name} />}
                  {(p._count?.replies ?? 0) > 0 && <span className="text-[10px] text-warm-300 ml-auto">{p._count?.replies} 回复</span>}
                </div>
              </div>
            ))}
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
            {goodDeeds.map((gd) => (
              <GoodDeedItem key={gd.id} deed={gd} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>

      {/* 树洞回应 */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-warm-300 uppercase tracking-widest">树洞回应</span>
          <div className="h-px flex-1 bg-warm-200/50" />
        </div>
        <TreeholeResponder classId={classId} />
      </section>
    </>
  );
}
