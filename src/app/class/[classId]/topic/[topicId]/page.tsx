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

  // 获取参与讨论的帖子
  const discussions = await db.post.findMany({
    where: { classId: params.classId, type: "TOPIC_POST", parentId: params.topicId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4 animate-float-up">
      <Link href={`/class/${params.classId}`} className="inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600">
        ← 返回班级
      </Link>

      <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
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
        {discussions.map((d) => (
          <div key={d.id} className="bg-white/40 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-warm-600">{d.user.name}</span>
              <span className="text-xs text-warm-300">{new Date(d.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <p className="text-sm text-warm-600">{d.content}</p>
            {(d as { image?: string | null }).image && <img src={(d as { image?: string | null }).image!} alt="" className="w-24 h-24 rounded-xl object-cover mt-2" />}
          </div>
        ))}
      </div>

      {/* 参与表单 */}
      <TopicDiscuss classId={params.classId} topicId={params.topicId} />
    </div>
  );
}
