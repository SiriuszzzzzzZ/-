import { db } from "@/lib/db";
import { PostReplyForm } from "./PostReplyForm";
import Link from "next/link";

export default async function PostDetailPage({
  params,
}: {
  params: { classId: string; postId: string };
}) {
  const post = await db.post.findUnique({
    where: { id: params.postId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-warm-400">帖子不存在</p>
        <Link href={`/class/${params.classId}`} className="text-xs text-coral-400 mt-2 inline-block">
          ← 返回班级
        </Link>
      </div>
    );
  }

  const typeLabel =
    post.type === "HELP_SKILL" ? "技能求助" :
    post.type === "HELP_EMOTION" ? "情绪求助" :
    post.type === "GOOD_DEED" ? "多余的好意" : "帖子";

  return (
    <div className="space-y-4 animate-float-up">
      {/* 返回 */}
      <Link
        href={`/class/${params.classId}`}
        className="inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600 transition-colors"
      >
        ← 返回班级
      </Link>

      {/* 主帖 */}
      <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-300 bg-warm-50 px-2 py-0.5 rounded-full">
            {typeLabel}
          </span>
          <span className="text-xs text-warm-300">
            {post.anonymous ? "匿名" : post.user.name}
          </span>
          <span className="text-xs text-warm-300">
            {new Date(post.createdAt).toLocaleString("zh-CN")}
          </span>
        </div>
        <p className="text-sm text-warm-700 leading-relaxed">{post.content}</p>
      </div>

      {/* 回复列表 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-warm-400">
          {post.replies.length > 0 ? `${post.replies.length} 条回应` : "还没有回应"}
        </p>
        {post.replies.map((r) => (
          <div key={r.id} className="bg-white/40 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-warm-600">{r.user.name}</span>
              <span className="text-xs text-warm-300">
                {new Date(r.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <p className="text-sm text-warm-600">{r.content}</p>
          </div>
        ))}
      </div>

      {/* 回复表单 — 所有人都可以回复 */}
      <PostReplyForm classId={params.classId} postId={post.id} parentType={post.type} />
    </div>
  );
}
