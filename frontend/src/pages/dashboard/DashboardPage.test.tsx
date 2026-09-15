import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./DashboardPage";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders default values before data has loaded", () => {
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />);

    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("€0.00")).toBeInTheDocument();
    expect(screen.getByText("No recent transactions.")).toBeInTheDocument();
  });

  it("renders the fetched summary and recent transactions", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      summary: {
        totalBalance: 1500,
        income: 2000,
        expenses: 500,
        savingsRate: 75,
      },
      recentTransactions: [
        {
          id: 1,
          description: "Salary",
          amount: 1800,
          date: "2026-09-01",
          type: "INCOME",
        },
        {
          id: 2,
          description: "Rent",
          amount: 450,
          date: "2026-09-02",
          type: "EXPENSE",
        },
      ],
    });

    render(<DashboardPage />);

    expect(await screen.findByText("€1500.00")).toBeInTheDocument();
    expect(screen.getByText("+€2000.00")).toBeInTheDocument();
    expect(screen.getByText("-€500.00")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("+€1800.00")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("-€450.00")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/dashboard");
  });
});
