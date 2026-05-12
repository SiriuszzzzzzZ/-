"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmPanel } from "@/components/ui";

interface TopicItem {
  id: string;
  title: string;
  classId: string;
  isNotice: boolean;
  isMicroAction: boolean;
  createdAt: Date;
}

export function TopicListItem({ topic }: { topic: TopicItem }) {
  const router = useRouter();
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  if (deleted) return null;

  return (
    <div
      onClick={() => router.push(`/class/${topic.classId}/topic/${topic.id}`)}
      className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer relative group"
    >
      <span className="text-xs">{topic.isNotice ? "📢" : topic.isMicroAction ? "🏃" : "💬"}</span>
      <span className="text-sm text-warm-600 truncate flex-1">{topic.title}</span>
      <span className="text-[10px] text-warm-300">{new Date(topic.createdAt).toLocaleDateString("zh-CN")}</span>
      <button
        onClick={handleDelete}
        className="w-5 h-5 rounded-full bg-white/80 text-warm-400 hover:text-coral-500 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-[10px] flex-shrink-0"
      >
        ×
      </button>

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
