import { describe, it, expect } from "vitest";
import { shouldShowMoodChart } from "../mood";

describe("shouldShowMoodChart", () => {
  it("returns false when fewer than 5 people responded", () => {
    expect(shouldShowMoodChart(0)).toBe(false);
    expect(shouldShowMoodChart(1)).toBe(false);
    expect(shouldShowMoodChart(4)).toBe(false);
  });

  it("returns true when 5 or more people responded", () => {
    expect(shouldShowMoodChart(5)).toBe(true);
    expect(shouldShowMoodChart(10)).toBe(true);
    expect(shouldShowMoodChart(50)).toBe(true);
  });
});
