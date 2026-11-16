// src/constants/categories.ts
// Single source of truth for category names used by transactions and budgets.
// Budgets match transactions by category name, so both forms must offer the
// same names.

export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Restaurants",
  "Housing",
  "Bills",
  "Transport",
  "Subscriptions",
  "Entertainment",
  "Shopping",
  "Health",
  "Education",
  "Travel",
  "Gifts",
  "Savings",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Side Income",
  "Refund",
  "Gift Received",
  "Investment",
  "Other",
] as const;

export type CategoryKind = "INCOME" | "EXPENSE";

export function categoriesFor(kind: CategoryKind): string[] {
  return [...(kind === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)];
}

/** Trim and drop empty / case-insensitive duplicates, keeping first spelling. */
export function uniqueCategories(names: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names) {
    const c = raw?.trim();
    if (!c || seen.has(c.toLowerCase())) continue;
    seen.add(c.toLowerCase());
    result.push(c);
  }
  return result;
}

export function sameCategory(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
