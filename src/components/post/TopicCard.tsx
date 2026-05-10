import { Card } from "@/components/ui/Card";

interface TopicCardData {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  isMicroAction: boolean;
}

export function TopicCard({ topic }: { topic: TopicCardData }) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 mb-1">
        {topic.isMicroAction && (
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">微行动</span>
        )}
        {topic.tags?.map((t: string) => (
          <span key={t} className="text-xs text-indigo-400">#{t}</span>
        ))}
      </div>
      <h4 className="text-sm font-medium text-gray-800">{topic.title}</h4>
      {topic.content && <p className="text-xs text-gray-500 mt-1">{topic.content.slice(0, 100)}</p>}
    </Card>
  );
}
