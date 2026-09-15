import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BudgetsPage from "./BudgetsPage";
import { apiFetch } from "../../api/api";
import type { MonthlySummaryResponse } from "../../api/type";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/budgets"]}>
      <Routes>
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/budgets/new" element={<div>Create Budget Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const summary: MonthlySummaryResponse = {
  year: 2026,
  month: 9,
  accountId: null,
  totalIncome: 1000,
  totalExpense: 400,
  netBalance: 600,
  categories: [],
  budgetStatuses: [
    {
      category: "Groceries",
      budgetLimit: 300,
      actualExpense: 320,
      difference: -20,
      overBudget: true,
    },
    {
      category: "Entertainment",
      budgetLimit: 100,
      actualExpense: 40,
      difference: 60,
      overBudget: false,
    },
  ],
};

describe("BudgetsPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state while fetching", () => {
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText("Loading budgets…")).toBeInTheDocument();
  });

  it("shows the empty state when there are no budgets", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ...summary, budgetStatuses: [] });

    renderPage();

    expect(
      await screen.findByText(/No budgets configured for this month/)
    ).toBeInTheDocument();
  });

  it("renders budget statuses with over-budget and on-track badges", async () => {
    vi.mocked(apiFetch).mockResolvedValue(summary);

    renderPage();

    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Over budget")).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByText("Limit: €300.00")).toBeInTheDocument();
  });

  it("navigates to /budgets/new when Add Budget is clicked", async () => {
    vi.mocked(apiFetch).mockResolvedValue(summary);
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Groceries");
    await user.click(screen.getByRole("button", { name: "Add Budget" }));

    expect(screen.getByText("Create Budget Page")).toBeInTheDocument();
  });
});
