import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountsPage from "./AccountsPage";
import { apiFetch } from "../../api/api";
import type { AccountResponse } from "../../api/type";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

const accounts: AccountResponse[] = [
  { id: 1, name: "Cash", currency: "EUR", initialBalance: 100, type: "CASH" },
  { id: 2, name: "Bank", currency: "USD", initialBalance: 500, type: "BANK" },
];

describe("AccountsPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state when there are no accounts", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<AccountsPage />);

    expect(
      await screen.findByText("You have no accounts yet. Add one on the left.")
    ).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/accounts");
  });

  it("renders the fetched accounts in the table", async () => {
    vi.mocked(apiFetch).mockResolvedValue(accounts);

    render(<AccountsPage />);

    expect(await screen.findByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("Bank")).toBeInTheDocument();
    expect(screen.getByText("€100.00")).toBeInTheDocument();
    expect(screen.getByText("€500.00")).toBeInTheDocument();
  });

  it("submits the new account form and appends the created account to the list", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce([]);
    const created: AccountResponse = {
      id: 3,
      name: "Savings",
      currency: "EUR",
      initialBalance: 250,
      type: "SAVINGS",
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(created);

    const user = userEvent.setup();
    render(<AccountsPage />);

    await screen.findByText("You have no accounts yet. Add one on the left.");

    await user.type(
      screen.getByPlaceholderText("e.g. Nordea Bank, Cash"),
      "Savings"
    );
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "250");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name: "Savings",
          currency: "EUR",
          initialBalance: 250,
        }),
      })
    );

    expect(await screen.findByText("Savings")).toBeInTheDocument();
    expect(screen.getByText("€250.00")).toBeInTheDocument();
  });
});
