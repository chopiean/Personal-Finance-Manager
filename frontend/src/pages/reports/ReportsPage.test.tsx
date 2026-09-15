import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportsPage from "./ReportsPage";
import { apiFetch } from "../../api/api";
import type { MonthlySummaryResponse } from "../../api/type";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

// jsdom has no canvas support, so stub out the chart components and assert
// on how ReportsPage feeds them, rather than rendering real canvases.
vi.mock("react-chartjs-2", () => ({
  Doughnut: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="doughnut-chart">{data.labels.join(",")}</div>
  ),
  Bar: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="bar-chart">{data.labels.join(",")}</div>
  ),
}));

const summary: MonthlySummaryResponse = {
  year: 2026,
  month: 9,
  accountId: null,
  totalIncome: 1200,
  totalExpense: 450,
  netBalance: 750,
  categories: [
    { category: "Groceries", totalIncome: 0, totalExpense: 300, net: -300 },
    { category: "Salary", totalIncome: 1200, totalExpense: 0, net: 1200 },
  ],
  budgetStatuses: [],
};

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state while fetching the report", () => {
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {}));

    render(<ReportsPage />);

    expect(screen.getByText("Loading report…")).toBeInTheDocument();
  });

  it("shows an empty state when there is no data for the month", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ...summary, categories: [] });

    render(<ReportsPage />);

    expect(
      await screen.findByText("No transactions for this month.")
    ).toBeInTheDocument();
  });

  it("renders charts and the monthly summary once data loads", async () => {
    vi.mocked(apiFetch).mockResolvedValue(summary);

    render(<ReportsPage />);

    expect(await screen.findByTestId("doughnut-chart")).toHaveTextContent(
      "Groceries"
    );
    expect(screen.getByTestId("bar-chart")).toHaveTextContent(
      "Groceries,Salary"
    );
    expect(screen.getByText("€1200.00")).toBeInTheDocument();
    expect(screen.getByText("€450.00")).toBeInTheDocument();
    expect(screen.getByText("€750.00")).toBeInTheDocument();
  });

  it("requests the previous month's report when the left arrow is clicked", async () => {
    vi.mocked(apiFetch).mockResolvedValue(summary);
    const user = userEvent.setup();

    render(<ReportsPage />);

    await screen.findByTestId("doughnut-chart");

    const today = new Date();
    const initialCalls = vi.mocked(apiFetch).mock.calls.length;

    await user.click(screen.getByText("‹"));

    let expectedMonth = today.getMonth(); // getMonth() is 0-indexed = current month - 1
    let expectedYear = today.getFullYear();
    if (expectedMonth < 1) {
      expectedMonth = 12;
      expectedYear -= 1;
    }

    expect(vi.mocked(apiFetch).mock.calls.length).toBeGreaterThan(
      initialCalls
    );
    expect(apiFetch).toHaveBeenLastCalledWith(
      `/reports/monthly?year=${expectedYear}&month=${expectedMonth}`
    );
  });
});
