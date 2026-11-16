import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionsPage from "./TransactionsPage";
import { apiFetch } from "../../api/api";
import type {
  AccountResponse,
  BudgetResponse,
  TransactionResponse,
} from "../../api/type";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

const accounts: AccountResponse[] = [
  { id: 1, name: "Cash", currency: "EUR", initialBalance: 100, type: "CASH" },
];

const transactions: TransactionResponse[] = [
  {
    id: 1,
    description: "Groceries",
    amount: 42.5,
    date: "2026-09-01",
    type: "EXPENSE",
    accountId: 1,
    accountName: "Cash",
  },
];

function mockApi(opts: {
  transactions?: TransactionResponse[];
  accounts?: AccountResponse[];
  budgets?: BudgetResponse[] | Error;
  created?: TransactionResponse;
}) {
  vi.mocked(apiFetch).mockImplementation(async (path: string, init?: RequestInit) => {
    if (init?.method === "DELETE") return null as never;
    if (path === "/transactions") {
      if (init?.method === "POST") return opts.created as never;
      return (opts.transactions ?? []) as never;
    }
    if (path === "/accounts") return (opts.accounts ?? []) as never;
    if (path.startsWith("/budgets")) {
      if (opts.budgets instanceof Error) throw opts.budgets;
      return (opts.budgets ?? []) as never;
    }
    throw new Error(`unexpected path ${path}`);
  });
}

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads transactions and accounts and shows the empty state when there are none", async () => {
    mockApi({});

    render(<TransactionsPage />);

    expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/transactions");
    expect(apiFetch).toHaveBeenCalledWith("/accounts");
  });

  it("renders fetched transactions in the table", async () => {
    mockApi({ transactions, accounts });

    render(<TransactionsPage />);

    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("-€42.50")).toBeInTheDocument();
    expect(screen.getByText("01-09-2026")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
  });

  it("submits a new transaction and prepends it to the list", async () => {
    const created: TransactionResponse = {
      id: 2,
      description: "Salary",
      amount: 1000,
      date: "2026-09-15",
      type: "INCOME",
      accountId: 1,
      accountName: "Cash",
    };
    mockApi({ accounts, created });

    const user = userEvent.setup();
    render(<TransactionsPage />);

    await screen.findByText("No transactions yet.");
    // wait for accounts to populate the select
    await screen.findByRole("option", { name: "Cash (EUR)" });

    await user.type(
      screen.getByPlaceholderText("Groceries, Rent, Salary…"),
      "Salary"
    );
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "1000");

    const [typeSelect, accountSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(typeSelect, "INCOME");
    await user.selectOptions(accountSelect, "1");

    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const today = new Date().toISOString().slice(0, 10);

    await waitFor(() =>
      expect(apiFetch).toHaveBeenLastCalledWith("/transactions", {
        method: "POST",
        body: JSON.stringify({
          description: "Salary",
          amount: 1000,
          date: today,
          type: "INCOME",
          accountId: 1,
        }),
      })
    );

    expect(await screen.findByRole("cell", { name: "Salary" })).toBeInTheDocument();
  });

  it("lists budget categories in the dropdown and sends the chosen category", async () => {
    const budgets: BudgetResponse[] = [
      { id: 1, category: "Streaming", limitAmount: 50, month: 11, year: 2026, accountId: 1 },
    ];
    const created: TransactionResponse = {
      id: 3,
      description: "Netflix",
      amount: 30,
      date: "2026-11-16",
      type: "EXPENSE",
      accountId: 1,
      accountName: "Cash",
    };
    mockApi({ accounts, budgets, created });

    const user = userEvent.setup();
    render(<TransactionsPage />);

    await screen.findByRole("option", { name: "Cash (EUR)" });
    await screen.findByRole("option", { name: "Streaming" });

    await user.type(
      screen.getByPlaceholderText("Groceries, Rent, Salary…"),
      "Netflix"
    );
    await user.type(screen.getByRole("spinbutton"), "30");
    const [, accountSelect, categorySelect] = screen.getAllByRole("combobox");
    await user.selectOptions(accountSelect, "1");
    await user.selectOptions(categorySelect, "Streaming");

    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const today = new Date().toISOString().slice(0, 10);
    await waitFor(() =>
      expect(apiFetch).toHaveBeenLastCalledWith("/transactions", {
        method: "POST",
        body: JSON.stringify({
          description: "Netflix",
          amount: 30,
          date: today,
          type: "EXPENSE",
          accountId: 1,
          category: "Streaming",
        }),
      })
    );
  });

  it("falls back to default categories when budgets fail to load", async () => {
    mockApi({ accounts, budgets: new Error("boom") });

    render(<TransactionsPage />);

    expect(
      await screen.findByRole("option", { name: "Subscriptions" })
    ).toBeInTheDocument();
  });

  it("shows income categories for income and resets the category on type change", async () => {
    mockApi({ accounts });

    const user = userEvent.setup();
    render(<TransactionsPage />);

    const category = await screen.findByRole("combobox", { name: "Category" });
    await user.selectOptions(category, "Groceries");

    const [typeSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(typeSelect, "INCOME");

    expect(category).toHaveValue("");
    expect(screen.getByRole("option", { name: "Salary" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Groceries" })).toBeNull();
  });

  it("deletes a transaction after confirmation", async () => {
    mockApi({ transactions, accounts });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(<TransactionsPage />);

    await screen.findByText("Groceries");
    await user.click(screen.getByRole("button", { name: "Delete Groceries" }));

    expect(apiFetch).toHaveBeenCalledWith("/transactions/1", { method: "DELETE" });
    expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
  });
});
