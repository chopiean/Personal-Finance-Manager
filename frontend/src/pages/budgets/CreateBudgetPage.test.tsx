import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CreateBudgetPage from "./CreateBudgetPage";
import { apiFetch } from "../../api/api";
import type { AccountResponse } from "../../api/type";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

const accounts: AccountResponse[] = [
  { id: 1, name: "Cash", currency: "EUR", initialBalance: 100, type: "CASH" },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/budgets/new"]}>
      <Routes>
        <Route path="/budgets/new" element={<CreateBudgetPage />} />
        <Route path="/budgets" element={<div>Budgets Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CreateBudgetPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads accounts into the account dropdown", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(accounts);

    renderPage();

    expect(
      await screen.findByRole("option", { name: "Cash (EUR)" })
    ).toBeInTheDocument();
  });

  it("submits the form with the entered values and navigates to /budgets", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(accounts);
    vi.mocked(apiFetch).mockResolvedValueOnce({});

    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("option", { name: "Cash (EUR)" });

    await user.type(
      screen.getByPlaceholderText("Or enter custom category…"),
      "Groceries"
    );

    const [limitInput] = screen.getAllByRole("spinbutton");
    await user.type(limitInput, "200");

    const [, accountSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(accountSelect, "1");

    await user.click(screen.getByRole("button", { name: "Create Budget" }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenLastCalledWith("/budgets", {
        method: "POST",
        body: JSON.stringify({
          category: "Groceries",
          limitAmount: 200,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          accountId: 1,
        }),
      })
    );

    expect(window.alert).toHaveBeenCalledWith("Budget created!");
    expect(await screen.findByText("Budgets Page")).toBeInTheDocument();
  });
});
