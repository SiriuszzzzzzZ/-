"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SquareTopicForm } from "@/components/counselor/SquareTopicForm";
import { ConfirmPanel } from "@/components/ui";

const TAGS = ["考研心情", "第一次", "低谷", "温暖瞬间", "成长记录"];

const CLASS_COLORS = [
  "bg-coral-400", "bg-mint-400", "bg-peach-400",
  "bg-coral-300", "bg-mint-500", "bg-peach-300",
];

interface SquareTopic {
  id: string; title: string; tags: string; classId: string;
  isNotice: boolean; isMicroAction: boolean; createdAt: string;
  class: { name: string };
}
interface GoodDeed {
  id: string; content: string | null; createdAt: string;
  user: { name: string };
}

export default function SquarePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<SquareTopic[]>([]);
  const [goodDeeds, setGoodDeeds] = useState<GoodDeed[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isCounselor = session?.user?.role === "COUNSELOR";

  async function fetchData() {
    const res = await fetch("/api/square");
    const data = await res.json();
    setTopics(data.topics || []);
    setGoodDeeds(data.recentGoodDeeds || []);
    setLoading(false);
  }
  useEffect(() => { fetchData(); }, []);

  async function openForm() {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setClasses((data.classes || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    setShowForm(true);
  }

  function classColor(classId: string) {
    let hash = 0;
    for (let i = 0; i < classId.length; i++) hash = ((hash << 5) - hash) + classId.charCodeAt(i);
    return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
  }

  function uniqueClasses() {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    for (const t of topics) {
      if (!seen.has(t.classId)) { seen.add(t.classId); result.push({ id: t.classId, name: t.class.name }); }
    }
    return result;
  }

  const filteredTopics = activeTag
    ? topics.filter((t) => t.tags?.includes(activeTag))
    : topics;
  const visibleTopics = filteredTopics.filter((t) => !deletedIds.has(t.id));
  const classCount = uniqueClasses().length;

  return (
    <div className="min-h-screen bg-cream">
      {/* 跨班星光墙 header */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#1C2840] via-[#2D3550] to-cream px-5 pt-8 pb-10">
        <div className="relative z-10">
          <button onClick={() => router.back()} className="text-white/50 hover:text-white/80 text-sm mb-2 transition-colors">← 返回</button>
          <h1 className="text-xl font-semibold text-white">年级广场</h1>
          <p className="text-sm text-white/60 mt-1">
            {classCount > 0
              ? `来自 ${classCount} 个班级的声音`
              : "人生流动 · 你不是唯一一个这样的人"}
          </p>
          {/* 班级色点指示器 */}
          {classCount > 0 && (
            <div className="flex gap-1.5 mt-3">
              {uniqueClasses().map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 text-[10px] text-white/70">
                  <span className={`w-2 h-2 rounded-full ${classColor(c.id)}`} />
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-4 pb-24 space-y-5">
        {/* 标签筛选 — 暖色 pill */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 ${
              activeTag === null
                ? "bg-coral-400 text-white shadow-lg shadow-coral-400/20"
                : "bg-white/70 text-warm-500 hover:bg-white hover:text-coral-400 border border-warm-100"
            }`}
          >
            全部
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 ${
                activeTag === tag
                  ? "bg-coral-400 text-white shadow-lg shadow-coral-400/20"
                  : "bg-white/70 text-warm-500 hover:bg-white hover:text-coral-400 border border-warm-100"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-sm text-warm-300 animate-pulse">正在收集星光...</p>
          </div>
        ) : (
          <>
            {/* 话题 — 每条带班级色点 */}
            {visibleTopics.length > 0 ? (
              <div className="space-y-3">
                {visibleTopics.map((t, i) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/class/${t.classId}/topic/${t.id}`)}
                    className="bg-white/70 rounded-2xl pl-4 pr-5 py-4 hover:shadow-soft-lg transition-all duration-300 cursor-pointer relative group animate-float-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* 左侧班级色点 + 竖线 */}
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ backgroundColor: classColor(t.classId).includes("coral") ? "#FF7A6B" : classColor(t.classId).includes("mint") ? "#4ECDC4" : classColor(t.classId).includes("peach") ? "#FFB355" : "#B8A58A" }} />

                    <div className="flex items-center gap-2 mb-1.5 pl-1">
                      <span className="text-xs">
                        {t.isNotice ? "📢" : t.isMicroAction ? "🏃" : "💬"}
                      </span>
                      <span className="text-[10px] text-warm-400">
                        {t.isNotice ? "公告" : t.isMicroAction ? "微行动" : "话题"}
                      </span>
                      <span className="text-[10px] text-warm-300 ml-auto">来自 {t.class.name}</span>
                    </div>
                    <h3 className="text-sm font-medium text-warm-800 mb-1 pl-1">{t.title}</h3>
                    {t.tags && (
                      <div className="flex gap-1 flex-wrap pl-1">
                        {t.tags.split(",").filter(Boolean).map((tag) => (
                          <span key={tag} className="text-[10px] text-coral-400 bg-coral-50 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* 辅导员删除 */}
                    {isCounselor && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 text-warm-400 hover:text-coral-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* 空状态 — 发光的圆，不是卡片 */
              <div className="flex flex-col items-center py-16 space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-coral-100 to-mint-50 flex items-center justify-center shadow-glow animate-pulse">
                  <span className="text-3xl">🌌</span>
                </div>
                <p className="text-sm text-warm-500">
                  {activeTag ? `还没有 #${activeTag} 相关的话题` : "广场还空着"}
                </p>
                <p className="text-xs text-warm-400">
                  {isCounselor ? "点击右下角的 + 推送第一个话题" : "辅导员正在准备中..."}
                </p>
              </div>
            )}

            {/* 好意展板 — 横向滚动 */}
            {goodDeeds.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] text-warm-300 uppercase tracking-widest">多余的好意</span>
                  <div className="h-px flex-1 bg-warm-200/50" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {goodDeeds.map((gd) => (
                    <div
                      key={gd.id}
                      className="flex-shrink-0 w-44 bg-mint-50 rounded-2xl px-4 py-3 animate-float-up"
                    >
                      <span className="text-lg">🎁</span>
                      <p className="text-sm text-warm-600 mt-1">{gd.content}</p>
                      <p className="text-xs text-warm-400 mt-1.5">{gd.user.name} · {new Date(gd.createdAt).toLocaleDateString("zh-CN")}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 辅导员发布 + 按钮 */}
        {isCounselor && !showForm && (
          <button
            onClick={openForm}
            className="fixed bottom-20 right-5 w-12 h-12 rounded-full bg-coral-400 text-white text-2xl shadow-lg hover:bg-coral-500 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-30 flex items-center justify-center"
          >+</button>
        )}
        {showForm && (
          <SquareTopicForm
            classes={classes}
            onClose={() => setShowForm(false)}
            onSent={() => { setShowForm(false); fetchData(); }}
          />
        )}

        {/* 删除确认 */}
        {confirmDeleteId && (
          <ConfirmPanel
            message="确定删除这个话题吗？"
            onConfirm={async () => {
              const id = confirmDeleteId;
              setConfirmDeleteId(null);
              await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
              setDeletedIds((prev) => new Set(prev).add(id));
            }}
            onCancel={() => setConfirmDeleteId(null)}
          />
        )}
      </main>
    </div>
  );
}
