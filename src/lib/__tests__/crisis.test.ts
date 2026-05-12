import { describe, it, expect } from "vitest";
import { detectCrisis, classifyHelpType } from "../crisis";

describe("detectCrisis", () => {
  it("detects suicide keywords as crisis", () => {
    expect(detectCrisis("我不想活了")).toBe("crisis");
    expect(detectCrisis("好想死")).toBe("crisis");
    expect(detectCrisis("想结束生命")).toBe("crisis");
    expect(detectCrisis("活不下去了")).toBe("crisis");
  });

  it("detects emotion keywords as emotion", () => {
    expect(detectCrisis("今天好想哭")).toBe("emotion");
    expect(detectCrisis("好焦虑好崩溃")).toBe("emotion");
    expect(detectCrisis("感觉好孤独没人懂")).toBe("emotion");
  });

  it("returns null for normal text", () => {
    expect(detectCrisis("谁会做PPT")).toBe(null);
    expect(detectCrisis("今天天气不错")).toBe(null);
    expect(detectCrisis("")).toBe(null);
  });

  it("prioritizes crisis over emotion", () => {
    expect(detectCrisis("好焦虑想自杀")).toBe("crisis");
  });
});

describe("classifyHelpType", () => {
  it("classifies crisis/emotion content as EMOTION", () => {
    expect(classifyHelpType("不想活了")).toBe("EMOTION");
    expect(classifyHelpType("好想哭")).toBe("EMOTION");
  });

  it("classifies normal content as SKILL", () => {
    expect(classifyHelpType("谁会做PPT")).toBe("SKILL");
    expect(classifyHelpType("谁在图书馆")).toBe("SKILL");
  });
});
