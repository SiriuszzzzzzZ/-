# 同窗小栈

一个会呼吸的校园角落——低压力关系基础设施。

大学生和辅导员之间不需要另一个管理平台。「同窗小栈」用班级星空、匿名树洞、星光收集和 AI 情绪洞察，让**被看见、被理解、被连接、被允许缓慢成长**成为日常。

## 快速开始

```bash
npm install
cp .env.example .env        # 编辑 .env 填入 DeepSeek API Key（可选）
npx prisma db push          # 创建 SQLite 数据库
npx tsx prisma/seed.ts      # 填充示例数据（50学生+1辅导员+7天数据）
npm run dev                 # http://localhost:3000
```

**测试账号**：
- 辅导员：`counselor@university.edu.cn` / `123456`
- 学生：`student1@university.edu.cn` ~ `student50@university.edu.cn` / `123456`

## 核心功能

| 模块 | 说明 |
|------|------|
| **班级星空** | Canvas 动画星空 + 每日心情打卡 + 辅导员/学生双视角 |
| **年级广场** | 跨班级话题墙 + 标签筛选 + 多余好意展板 |
| **树洞** | 匿名倾诉 + AI 智能匹配相似经历 + 辅导员匿名回应 |
| **星光系统** | 被点亮/帮助别人/坚持打卡 → 7 阶段养成（🌱→🌟）+ 里程碑撒花 |
| **同频人** | 本月心情相似的同学 + 送花 + 虚拟咖啡限时对话 |
| **徽章** | 5 种徽章 × 4 级（助人为乐/话题之星/星光收集者/树洞之友/坚持打卡） |
| **AI 洞察** | DeepSeek 驱动：个人情绪分析 + 树洞匹配 + 辅导员预测 |
| **辅导员面板** | 情绪趋势 + 危机预警 + 学生信号 + 学生档案 + AI 一键分析 |

## 技术栈

Next.js 14 (App Router) · TypeScript · TailwindCSS · Prisma · SQLite · NextAuth · DeepSeek AI

## 许可

MIT
