"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmPanel } from "@/components/ui";

interface TopicCardData {
  id: string;
  title: string;
  content: string | null;
  tags: string;
  isMicroAction: boolean;
  isNotice?: boolean;
  image?: string | null;
}

export function TopicCard({ topic, classId, isCounselor }: { topic: TopicCardData; classId: string; isCounselor?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  if (deleted) return null;

  const tagList = topic.tags ? topic.tags.split(",").filter(Boolean) : [];
  const isNotice = topic.isNotice;

  return (
    <div
      onClick={() => router.push(`/class/${classId}/topic/${topic.id}`)}
      className="bg-white/60 rounded-2xl p-3.5 shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative group"
    >
      <div className="flex items-center gap-2 mb-1.5 pr-6">
        {isNotice && (
          <span className="text-xs bg-peach-100 text-peach-600 px-2 py-0.5 rounded-full font-medium">📢 公告</span>
        )}
        {topic.isMicroAction && (
          <span className="text-xs bg-mint-100 text-mint-600 px-2 py-0.5 rounded-full font-medium">🏃 微行动</span>
        )}
        {!isNotice && !topic.isMicroAction && (
          <span className="text-xs bg-coral-50 text-coral-400 px-2 py-0.5 rounded-full font-medium">💬 话题</span>
        )}
        {tagList.map((t: string) => (
          <span key={t} className="text-xs text-warm-400">#{t.trim()}</span>
        ))}
      </div>
      <h4 className="text-sm font-medium text-warm-800">{topic.title}</h4>
      {topic.content && (
        <p className="text-xs text-warm-400 mt-1 line-clamp-2">{topic.content.slice(0, 100)}</p>
      )}
      {topic.image && (
        <img src={topic.image} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />
      )}

      {/* 辅导员删除按钮 */}
      {isCounselor && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 text-warm-400 hover:text-coral-500 hover:bg-coral-50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs"
          title="删除话题"
        >
          {deleting ? "..." : "×"}
        </button>
      )}

      {confirmDelete && (
        <ConfirmPanel
          message="确定删除这个话题吗？"
          onConfirm={async () => {
            setConfirmDelete(false);
            setDeleted(true);
            await fetch(`/api/topics?id=${topic.id}`, { method: "DELETE" });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
