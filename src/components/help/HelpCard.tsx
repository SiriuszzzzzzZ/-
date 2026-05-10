import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

interface HelpPost {
  id: string;
  content: string | null;
  anonymous: boolean;
  createdAt: string | Date;
  user: { id: string; name: string; avatar: string | null };
  _count?: { replies: number };
}

export function HelpCard({ post }: { post: HelpPost }) {
  return (
    <Card padding="sm" className="space-y-2">
      <div className="flex items-center gap-2">
        {post.anonymous ? (
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">?</div>
        ) : (
          <Avatar src={post.user.avatar} name={post.user.name} size="sm" />
        )}
        <span className="text-xs text-gray-400">{post.anonymous ? "匿名" : post.user.name}</span>
        <span className="text-xs text-gray-300">{new Date(post.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <p className="text-sm text-gray-700">{post.content}</p>
      {(post._count?.replies ?? 0) > 0 && (
        <p className="text-xs text-indigo-500">{post._count?.replies} 条回应</p>
      )}
    </Card>
  );
}
