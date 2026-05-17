import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFBF5",
        // coral = 行动/温暖/主要按钮/情绪求助
        coral: {
          50: "#FFF5F5",
          100: "#FFE8E5",
          200: "#FFCEC7",
          300: "#FFA99E",
          400: "#FF7A6B",
          500: "#FF5C4A",
          600: "#E84A3A",
        },
        // mint = 成长/治愈/正面状态/好意
        mint: {
          50: "#F2FDF9",
          100: "#DFF8EF",
          200: "#B5F0DB",
          300: "#7DE4C2",
          400: "#4ECDC4",
          500: "#35B5A8",
        },
        // peach = 需要关注/提醒/警示（不用红色表示负面）
        peach: {
          50: "#FFF9F2",
          100: "#FFEFDE",
          200: "#FFE0BA",
          300: "#FFCB8A",
          400: "#FFB355",
          500: "#F59E2E",
        },
        // warm = 中性信息/结构元素/文本
        warm: {
          50: "#FDFBF7",
          100: "#F7F1E8",
          200: "#EDE0CE",
          300: "#BAA58A",
          400: "#A08B70",
          500: "#8C7B6E",
          600: "#6B5D52",
          700: "#4A3F38",
          800: "#2D2520",
          900: "#1A1512",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        // 分层阴影体系（中性色，不再只有 coral 阴影）
        soft: "0 2px 16px rgba(26, 21, 18, 0.06)",
        "soft-lg": "0 8px 32px rgba(26, 21, 18, 0.10)",
        glow: "0 0 20px rgba(78, 205, 196, 0.2)",
        "glow-coral": "0 0 16px rgba(255, 92, 74, 0.25)",
      },
      animation: {
        // 入场动画
        "float-up": "floatUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-spring": "popSpring 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        // 氛围动画
        "star-glow": "starGlow 2s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        // 粒子动画
        "particle-float": "particleFloat 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both",
        "particle-fade": "particleFade 0.5s cubic-bezier(0.55, 0, 1, 0.45) forwards",
        // 微交互
        "ripple-out": "rippleOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "confetti-drop": "confettiDrop 1.5s cubic-bezier(0.55, 0, 1, 0.45) forwards",
        // 保留必要的简单动画
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        popSpring: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "60%": { opacity: "1", transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        starGlow: {
          "0%, 100%": { filter: "drop-shadow(0 0 0px transparent)", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 8px rgba(255,179,85,0.6))", transform: "scale(1.15)" },
        },
        particleFloat: {
          "0%": { opacity: "0", transform: "translateY(8px) translateX(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0) translateX(0)" },
        },
        particleFade: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "70%": { opacity: "0.5", transform: "scale(0.97)" },
          "100%": { opacity: "0", transform: "scale(0.9)" },
        },
        rippleOut: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        confettiDrop: {
          "0%": { opacity: "1", transform: "translateY(-40px) rotate(0deg)" },
          "100%": { opacity: "0", transform: "translateY(60px) rotate(180deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
