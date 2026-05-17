import { db } from "@/lib/db";
import Link from "next/link";
import { TopicDiscuss } from "./TopicDiscuss";

export default async function TopicDetailPage({
  params,
}: {
  params: { classId: string; topicId: string };
}) {
  const topic = await db.topic.findUnique({ where: { id: params.topicId } });

  if (!topic) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-warm-400">话题不存在</p>
        <Link href={`/class/${params.classId}`} className="text-xs text-coral-400 mt-2 inline-block">← 返回班级</Link>
      </div>
    );
  }

  const tagList = topic.tags ? topic.tags.split(",").filter(Boolean) : [];
  const topicExt = topic as { isNotice?: boolean; image?: string | null };
  const isNotice = topicExt.isNotice;
  const topicImage = topicExt.image;

  const discussions = await db.post.findMany({
    where: { classId: params.classId, type: "TOPIC_POST", topicId: params.topicId },
    select: {
      id: true, content: true, createdAt: true,
      user: { select: { name: true } },
      image: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const initialDiscussions = discussions.map((d) => ({
    id: d.id,
    content: d.content || "",
    createdAt: d.createdAt,
    user: { name: d.user.name },
    image: d.image,
  }));

  return (
    <div className="space-y-4 animate-float-up">
      <Link href={`/class/${params.classId}`} className="inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600">
        ← 返回班级
      </Link>

      <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isNotice && <span className="text-xs bg-peach-100 text-peach-600 px-2 py-0.5 rounded-full font-medium">📢 公告</span>}
          {topic.isMicroAction && <span className="text-xs bg-mint-100 text-mint-600 px-2 py-0.5 rounded-full font-medium">🏃 微行动</span>}
          {!isNotice && !topic.isMicroAction && <span className="text-xs bg-coral-50 text-coral-400 px-2 py-0.5 rounded-full">💬 话题</span>}
          {tagList.map((t: string) => (
            <span key={t} className="text-xs text-warm-400">#{t.trim()}</span>
          ))}
          <span className="text-xs text-warm-300 ml-auto">
            {new Date(topic.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-warm-800">{topic.title}</h2>
        {topic.content && <p className="text-sm text-warm-600 leading-relaxed">{topic.content}</p>}
        {topicImage && (
          <img src={topicImage} alt="" className="w-full rounded-2xl object-cover max-h-80" />
        )}
      </div>

      {/* 讨论区 */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-warm-400">
          {discussions.length > 0 ? `${discussions.length} 人参与讨论` : "还没有人参与，来做第一个吧"}
        </p>
        <TopicDiscuss
          classId={params.classId}
          topicId={params.topicId}
          initialDiscussions={initialDiscussions}
        />
      </div>
    </div>
  );
}
