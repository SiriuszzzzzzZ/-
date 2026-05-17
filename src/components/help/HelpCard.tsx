import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { DeletePostButton } from "@/components/help/OwnPostActions";

interface HelpPost {
  id: string;
  content: string | null;
  anonymous: boolean;
  createdAt: string | Date;
  user: { id: string; name: string; avatar: string | null };
  _count?: { replies: number };
  counselorSeenAt?: string | Date | null;
}

export function HelpCard({ post, classId, currentUserId }: { post: HelpPost; classId: string; currentUserId?: string }) {
  const isOwn = currentUserId && post.user.id === currentUserId;

  return (
    <div className="relative group">
      <Link href={`/class/${classId}/post/${post.id}`} className="block focus-visible:ring-2 focus-visible:ring-coral-300 focus-visible:ring-offset-2 rounded-2xl" aria-label={`帖子：${(post.content || "").slice(0, 30)}`}>
        <div className="bg-white/60 rounded-2xl p-3.5 space-y-2 shadow-soft hover:shadow-soft-lg transition-all duration-200 active:scale-[0.99]">
          <div className="flex items-center gap-2">
            {post.anonymous ? (
              <div className="w-7 h-7 rounded-full bg-mint-100 flex items-center justify-center text-xs text-mint-500">?</div>
            ) : (
              <Avatar src={post.user.avatar} name={post.user.name} size="sm" />
            )}
            <span className="text-xs text-warm-400">{post.anonymous ? "匿名" : post.user.name}</span>
            <span className="text-xs text-warm-300">
              {new Date(post.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
            {isOwn && post.counselorSeenAt && (
              <span className="text-[10px] text-mint-500 bg-mint-50 px-1.5 py-0.5 rounded-full ml-auto">辅导员已看到</span>
            )}
          </div>
          <p className="text-sm text-warm-700">{post.content}</p>
          {(post._count?.replies ?? 0) > 0 && (
            <p className="text-xs text-mint-500 font-medium">{post._count?.replies} 条回应 →</p>
          )}
        </div>
      </Link>
      {isOwn && (
        <div className="absolute bottom-2 right-3">
          <DeletePostButton postId={post.id} classId={classId} />
        </div>
      )}
    </div>
  );
}
