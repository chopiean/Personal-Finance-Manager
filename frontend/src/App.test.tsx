import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { apiFetch } from "./api/api";

vi.mock("./api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({
      summary: { totalBalance: 0, income: 0, expenses: 0, savingsRate: 0 },
      recentTransactions: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the welcome page at /", () => {
    renderAt("/");
    expect(screen.getByText("Personal Finance Manager")).toBeInTheDocument();
  });

  it("redirects /dashboard to /login when there is no auth token", () => {
    renderAt("/dashboard");
    expect(
      screen.getByPlaceholderText("Username or email address")
    ).toBeInTheDocument();
  });

  it("renders the dashboard at /dashboard when authenticated", async () => {
    localStorage.setItem("token", "abc123");
    renderAt("/dashboard");

    expect(await screen.findByText("Welcome back 👋")).toBeInTheDocument();
  });
});
