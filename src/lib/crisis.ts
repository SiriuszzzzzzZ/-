const CRISIS_KEYWORDS = [
  "不想活", "想死", "自伤", "自杀", "结束生命",
  "活不下去了", "没有意义", "想结束", "伤害自己",
  "不想存在", "消失算了", "去死",
];

const EMOTION_KEYWORDS = [
  "想哭", "崩溃", "好焦虑", "好累", "扛不住",
  "撑不下去", "好难", "受不了", "好孤独", "没人懂",
  "好难过", "好压抑", "快疯了", "好无助", "好绝望",
];

export function detectCrisis(text: string): "crisis" | "emotion" | null {
  const lower = text.toLowerCase();
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) return "crisis";
  if (EMOTION_KEYWORDS.some((kw) => lower.includes(kw))) return "emotion";
  return null;
}

export function classifyHelpType(text: string): "SKILL" | "EMOTION" {
  return detectCrisis(text) ? "EMOTION" : "SKILL";
}
