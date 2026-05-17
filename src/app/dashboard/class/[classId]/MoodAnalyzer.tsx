"use client";
import { useState } from "react";

interface AnalysisResult {
  summary: string;
  trend: string;
  risk: string;
  suggestions: string[];
  dominantMood: string;
  changeRate: number;
  comparison: string | null;
  prediction: string | null;
  history: { changeRate: number; dominantMood: string; createdAt: string }[];
}

export function MoodAnalyzer({ classId }: { classId: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/analyze?classId=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        setError("分析失败，请稍后重试");
      }
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  }

  const trendEmoji = (t: string) => t === "上升" ? "📈" : t === "下降" ? "📉" : "➡️";
  const changeColor = analysis && analysis.changeRate >= 0 ? "text-mint-500" : "text-coral-500";

  return (
    <div className="bg-white/60 rounded-3xl p-5 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-warm-700">🤖 AI 情绪分析</h3>
        {(!analysis || analysis) && (
          <button
            onClick={analyze}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-coral-400 to-peach-400 text-white text-xs font-medium hover:from-coral-500 hover:to-peach-500 disabled:opacity-40 transition-all active:scale-[0.97]"
          >
            {loading ? "分析中..." : analysis ? "重新分析" : "一键分析"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-coral-500">{error}</p>}

      {analysis && (
        <div className="space-y-4 animate-float-up">
          {/* 摘要 */}
          <p className="text-sm text-warm-700 leading-relaxed">{analysis.summary}</p>

          {/* 对比上一次 */}
          {analysis.comparison && (
            <div className="bg-warm-50 rounded-xl p-3">
              <p className="text-[10px] text-warm-400 mb-1">与上次对比</p>
              <p className="text-xs text-warm-600">{analysis.comparison}</p>
            </div>
          )}

          {/* 四格指标 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-warm-50 rounded-xl p-2 text-center">
              <p className="text-[10px] text-warm-400">趋势</p>
              <p className="text-base">{trendEmoji(analysis.trend)}</p>
              <p className="text-[11px] font-medium text-warm-700">{analysis.trend}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-2 text-center">
              <p className="text-[10px] text-warm-400">风险</p>
              <p className="text-sm font-medium text-warm-700 mt-1">{analysis.risk}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-2 text-center">
              <p className="text-[10px] text-warm-400">主导</p>
              <p className="text-sm font-medium text-warm-700 mt-1">{analysis.dominantMood}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-2 text-center">
              <p className="text-[10px] text-warm-400">变化</p>
              <p className={`text-sm font-medium mt-1 ${changeColor}`}>
                {analysis.changeRate >= 0 ? "+" : ""}{analysis.changeRate}%
              </p>
            </div>
          </div>

          {/* 历史趋势迷你图 */}
          {analysis.history.length > 1 && (
            <div className="space-y-1">
              <p className="text-[10px] text-warm-400">近期变化率趋势</p>
              <div className="flex items-end gap-1 h-12">
                {analysis.history.map((h, i) => {
                  const maxVal = Math.max(...analysis.history.map(x => Math.abs(x.changeRate)), 1);
                  const hPct = Math.abs(h.changeRate) / maxVal * 40;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-t-sm ${h.changeRate >= 0 ? "bg-mint-400" : "bg-coral-400"}`}
                        style={{ height: `${Math.max(2, hPct)}px` }}
                      />
                      <span className="text-[8px] text-warm-300">{h.dominantMood[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI 预测 */}
          {analysis.prediction && (
            <div className="bg-gradient-to-r from-coral-50 to-peach-50 rounded-xl p-3">
              <p className="text-[10px] text-coral-400 mb-1">🤖 AI 下周预测</p>
              <p className="text-xs text-warm-600 leading-relaxed">{analysis.prediction}</p>
            </div>
          )}

          {/* 建议 */}
          <div className="space-y-1.5">
            <p className="text-xs text-warm-500 font-medium">建议行动</p>
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-coral-400 text-xs mt-0.5 shrink-0">•</span>
                <p className="text-xs text-warm-600">{s}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setAnalysis(null)} className="text-[10px] text-warm-400 hover:text-warm-600">
            收起
          </button>
        </div>
      )}
    </div>
  );
}
