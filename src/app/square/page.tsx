import { Card } from "@/components/ui/Card";

const TAGS = ["考研心情", "第一次", "低谷", "温暖瞬间", "成长记录"];

export default async function SquarePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <h1 className="font-semibold text-gray-800">年级广场</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          人生流动 · 你不是唯一一个这样的人
        </p>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-500"
            >
              #{tag}
            </button>
          ))}
        </div>

        <Card className="text-center py-8">
          <p className="text-sm text-gray-400">广场内容将在这里展现</p>
          <p className="text-xs text-gray-300 mt-1">当辅导员推送话题到广场后</p>
        </Card>
      </main>
    </div>
  );
}
