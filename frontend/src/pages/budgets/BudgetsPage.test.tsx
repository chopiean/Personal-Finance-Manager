import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
      budgetId: 1,
      category: "Groceries",
      budgetLimit: 300,
      actualExpense: 320,
      difference: -20,
      overBudget: true,
    },
    {
      budgetId: 2,
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

  it("deletes a budget after confirmation", async () => {
    vi.mocked(apiFetch).mockImplementation(async (path: string) =>
      (path.startsWith("/reports") ? summary : null) as never
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Groceries");
    await user.click(screen.getByRole("button", { name: "Delete Groceries budget" }));

    expect(apiFetch).toHaveBeenCalledWith("/budgets/1", { method: "DELETE" });
    await waitFor(() => expect(screen.queryByText("Groceries")).toBeNull());
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
  });

  it("lists this month's expenses in the category when a budget is clicked", async () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const txs = [
      { id: 1, description: "Lidl", amount: 42.5, date: `${thisMonth}-03`, type: "EXPENSE", accountId: 1, category: "groceries " },
      { id: 2, description: "Cinema", amount: 12, date: `${thisMonth}-04`, type: "EXPENSE", accountId: 1, category: "Entertainment" },
      { id: 3, description: "Old shop", amount: 9, date: "2000-01-01", type: "EXPENSE", accountId: 1, category: "Groceries" },
    ];
    vi.mocked(apiFetch).mockImplementation(async (path: string) =>
      (path.startsWith("/reports") ? summary : txs) as never
    );
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: "Show Groceries transactions" }));

    const list = await screen.findByRole("list", { name: "Groceries transactions" });
    expect(list).toHaveTextContent("Lidl");
    expect(list).toHaveTextContent("€42.50");
    expect(list).not.toHaveTextContent("Cinema");
    expect(list).not.toHaveTextContent("Old shop");

    await user.click(screen.getByRole("button", { name: "Hide Groceries transactions" }));
    expect(screen.queryByRole("list", { name: "Groceries transactions" })).toBeNull();
  });

  it("keeps the budget when deletion is cancelled", async () => {
    vi.mocked(apiFetch).mockResolvedValue(summary);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Groceries");
    await user.click(screen.getByRole("button", { name: "Delete Groceries budget" }));

    expect(apiFetch).not.toHaveBeenCalledWith("/budgets/1", { method: "DELETE" });
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });
});
