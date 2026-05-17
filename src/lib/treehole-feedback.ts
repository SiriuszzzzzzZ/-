import { db } from "./db";

const STOP_WORDS = new Set([
  "的", "了", "是", "我", "不", "在", "有", "也", "都", "就", "一个", "人",
  "这", "那", "他", "她", "它", "们", "和", "与", "或", "但", "而", "及",
  "着", "过", "去", "来", "到", "说", "想", "要", "会", "能", "可以",
  "没有", "什么", "怎么", "为什么", "因为", "所以", "如果", "虽然", "但是",
  "很", "太", "真", "好", "对", "吧", "呢", "吗", "啊", "哈",
]);

function tokenize(content: string): string[] {
  const cleaned = content.replace(/[，。！？、；：""''（）\s]/g, "");
  const words: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    if (i + 1 < cleaned.length) {
      const bigram = cleaned.slice(i, i + 2);
      if (!STOP_WORDS.has(bigram)) words.push(bigram);
    }
    if (i + 2 < cleaned.length) {
      const trigram = cleaned.slice(i, i + 3);
      if (!STOP_WORDS.has(trigram)) words.push(trigram);
    }
  }

  return Array.from(new Set(words));
}

export interface TreeholeFeedback {
  similarCount: number;
  topWords: string[];
}

export async function getTreeholeFeedback(
  userId: string,
  classId: string,
  myContent: string,
): Promise<TreeholeFeedback | null> {
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const otherPosts = await db.post.findMany({
    where: {
      classId,
      treehole: true,
      userId: { not: userId },
      createdAt: { gte: weekAgo },
    },
    select: { content: true },
  });

  if (otherPosts.length === 0) return null;

  const myWords = tokenize(myContent);
  if (myWords.length === 0) return null;

  const wordFreq = new Map<string, number>();
  let matchCount = 0;

  for (const post of otherPosts) {
    if (!post.content) continue;
    const otherWords = tokenize(post.content);
    let hasOverlap = false;
    for (const w of otherWords) {
      if (myWords.includes(w)) {
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
        hasOverlap = true;
      }
    }
    if (hasOverlap) matchCount++;
  }

  if (matchCount === 0) return null;

  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  return { similarCount: matchCount, topWords };
}
