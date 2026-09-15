import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionsPage from "./TransactionsPage";
import { apiFetch } from "../../api/api";
import type { AccountResponse, TransactionResponse } from "../../api/type";

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

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads transactions and accounts and shows the empty state when there are none", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    render(<TransactionsPage />);

    expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/transactions");
    expect(apiFetch).toHaveBeenCalledWith("/accounts");
  });

  it("renders fetched transactions in the table", async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce(accounts);

    render(<TransactionsPage />);

    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("-€42.50")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
  });

  it("submits a new transaction and prepends it to the list", async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(accounts);

    const created: TransactionResponse = {
      id: 2,
      description: "Salary",
      amount: 1000,
      date: "2026-09-15",
      type: "INCOME",
      accountId: 1,
      accountName: "Cash",
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(created);

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

    expect(await screen.findByText("Salary")).toBeInTheDocument();
  });
});
