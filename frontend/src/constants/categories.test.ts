import { describe, it, expect } from "vitest";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  categoriesFor,
  sameCategory,
  uniqueCategories,
} from "./categories";

describe("categoriesFor", () => {
  it("returns expense categories for EXPENSE", () => {
    expect(categoriesFor("EXPENSE")).toEqual([...EXPENSE_CATEGORIES]);
  });

  it("returns income categories for INCOME", () => {
    expect(categoriesFor("INCOME")).toEqual([...INCOME_CATEGORIES]);
  });

  it("returns a copy that callers can mutate safely", () => {
    const list = categoriesFor("EXPENSE");
    list.push("Mutated");
    expect(categoriesFor("EXPENSE")).not.toContain("Mutated");
  });
});

describe("uniqueCategories", () => {
  it("trims names and drops empty, null and undefined values", () => {
    expect(uniqueCategories(["  Food ", "", "   ", null, undefined, "Rent"])).toEqual([
      "Food",
      "Rent",
    ]);
  });

  it("removes case-insensitive duplicates, keeping the first spelling", () => {
    expect(uniqueCategories(["groceries", "Groceries", "GROCERIES ", "Bills"])).toEqual([
      "groceries",
      "Bills",
    ]);
  });

  it("returns an empty list for empty input", () => {
    expect(uniqueCategories([])).toEqual([]);
  });
});

describe("sameCategory", () => {
  it("ignores case and surrounding whitespace", () => {
    expect(sameCategory(" Groceries", "groceries ")).toBe(true);
  });

  it("returns false for different names", () => {
    expect(sameCategory("Groceries", "Restaurants")).toBe(false);
  });
});
