import type { PostWithUser } from "@/types";
import { Avatar } from "@/components/ui";

export function ParticleBubble({ particle }: { particle: PostWithUser }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-500">
      <Avatar src={particle.user?.avatar} name={particle.user?.name || "?"} size="sm" />
      <span>{particle.content}</span>
    </div>
  );
}
