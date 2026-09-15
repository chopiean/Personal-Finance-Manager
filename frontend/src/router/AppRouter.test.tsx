import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { apiFetch } from "../api/api";

vi.mock("../api/api", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>
  );
}

describe("AppRouter", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockImplementation((path: string) => {
      if (path.startsWith("/reports/monthly")) {
        return Promise.resolve({
          year: 2026,
          month: 9,
          accountId: null,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          categories: [],
          budgetStatuses: [],
        });
      }
      if (path === "/dashboard") {
        return Promise.resolve({
          summary: { totalBalance: 0, income: 0, expenses: 0, savingsRate: 0 },
          recentTransactions: [],
        });
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the welcome page at /", () => {
    renderAt("/");
    expect(screen.getByText("Personal Finance Manager")).toBeInTheDocument();
  });

  it("renders the login page at /login", () => {
    renderAt("/login");
    expect(
      screen.getByPlaceholderText("Username or email address")
    ).toBeInTheDocument();
  });

  it("renders the register page at /register", () => {
    renderAt("/register");
    expect(screen.getByPlaceholderText("Choose username")).toBeInTheDocument();
  });

  it("redirects protected routes (e.g. /dashboard) to /login when logged out", () => {
    renderAt("/dashboard");
    expect(
      screen.getByPlaceholderText("Username or email address")
    ).toBeInTheDocument();
  });

  it("renders the dashboard inside the Layout when authenticated", async () => {
    localStorage.setItem("token", "abc123");
    renderAt("/dashboard");

    expect(await screen.findByText("Welcome back 👋")).toBeInTheDocument();
    // Layout sidebar should be visible
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders the accounts page inside the Layout when authenticated", async () => {
    localStorage.setItem("token", "abc123");
    renderAt("/accounts");

    expect(
      await screen.findByText("Manage the wallets and bank accounts used in your budget.")
    ).toBeInTheDocument();
  });

  it("redirects /home to /dashboard", async () => {
    localStorage.setItem("token", "abc123");
    renderAt("/home");

    expect(await screen.findByText("Welcome back 👋")).toBeInTheDocument();
  });

  it("redirects unknown routes to /", () => {
    renderAt("/some/unknown/path");
    expect(screen.getByText("Personal Finance Manager")).toBeInTheDocument();
  });
});
