const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 600;
const TEMPERATURE = 0.7;

let apiKey: string | null = null;

function getKey(): string {
  if (apiKey) return apiKey;
  apiKey = process.env.DEEPSEEK_API_KEY || "";
  return apiKey;
}

export function isAiConfigured(): boolean {
  return getKey().length > 10 && !getKey().includes("你的DeepSeek");
}

async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  const key = getKey();
  if (!isAiConfigured()) return "";

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// ═══════ 个人情绪洞察 ═══════

export async function getPersonalInsight(moodHistory: { mood: string; date: string }[]): Promise<string> {
  if (!isAiConfigured() || moodHistory.length < 5) return "";

  const moodCN: Record<string, string> = { SUNNY: "晴朗", GROWING: "生长", RAINY: "阴雨", STORMY: "风暴" };
  const history = moodHistory.map(m => `${m.date}: ${moodCN[m.mood] || m.mood}`).join("\n");

  const system = `你是「同窗小栈」的AI助手，一个温暖、不做评判的校园陪伴者。
你的用户是大学生。基于用户的情绪打卡历史，给出一句个性化洞察。
规则：
- 不超过50字
- 不评判、不标签化
- 像朋友一样温和
- 注意情绪的起伏和变化
- 如果情绪在变好，肯定这个方向
- 如果有低谷，不带压力地表示陪伴`;

  try {
    return await chat(system, `以下是用户近期的情绪打卡记录：\n${history}\n\n请基于以上记录给出一句温暖的情绪洞察。`);
  } catch {
    return "";
  }
}

// ═══════ 树洞智能匹配 ═══════

export async function matchTreeholePosts(myContent: string, others: string[]): Promise<string> {
  if (!isAiConfigured() || others.length === 0) return "";

  const system = `你是一个树洞匹配助手。用户刚刚在树洞写了一段话，你需要从历史树洞中找到最相似的一条，并生成一句温暖的反馈。
规则：
- 找出与用户表达最相似的那条历史树洞
- 生成一句不超过40字的反馈，让用户感到"不是一个人"
- 不要直接引用原文，保护隐私
- 温暖但不煽情`;

  const othersList = others.map((c, i) => `${i + 1}. ${c}`).join("\n");

  try {
    return await chat(system, `用户刚写的树洞：${myContent}\n\n历史树洞内容：\n${othersList}\n\n请找出最相似的一条，并给用户一句温暖的反馈。`);
  } catch {
    return "";
  }
}

// ═══════ 辅导员预测 ═══════

export async function getCounselorPrediction(trend: { date: string; SUNNY: number; RAINY: number; STORMY: number; GROWING: number }[]): Promise<string> {
  if (!isAiConfigured() || trend.length < 5) return "";

  const system = `你是「同窗小栈」的辅导员AI助手。基于班级7天情绪趋势数据，给出下周预测和行动建议。
格式：一段话，不超过80字
- 先判断趋势（上升/下降/稳定）
- 给出1条具体的行动建议
- 语气专业但不冰冷`;

  const stats = trend.map(d => `${d.date}: 晴朗${d.SUNNY} 生长${d.GROWING} 阴雨${d.RAINY} 风暴${d.STORMY}`).join("\n");

  try {
    return await chat(system, `班级近7天情绪趋势：\n${stats}\n\n请给出下周预测和1条行动建议。`);
  } catch {
    return "";
  }
}
