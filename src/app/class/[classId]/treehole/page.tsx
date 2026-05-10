import { Card } from "@/components/ui/Card";

export default function TreeholePage() {
  return (
    <div className="space-y-4">
      <Card className="text-center py-8">
        <p className="text-3xl mb-2">🌲</p>
        <p className="text-sm text-gray-600">树洞模式</p>
        <p className="text-xs text-gray-400 mt-1">这里的内容只有词云会被辅导员看到</p>
        <p className="text-xs text-gray-300">不用担心具体的表达被识别</p>
      </Card>
    </div>
  );
}
