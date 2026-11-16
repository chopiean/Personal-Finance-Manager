import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats ISO dates as dd-mm-yyyy", () => {
    expect(formatDate("2026-11-16")).toBe("16-11-2026");
    expect(formatDate("2025-03-05")).toBe("05-03-2025");
  });

  it("ignores a time part", () => {
    expect(formatDate("2026-01-02T23:30:00Z")).toBe("02-01-2026");
  });

  it("handles empty and non-ISO input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not a date")).toBe("not a date");
  });
});
