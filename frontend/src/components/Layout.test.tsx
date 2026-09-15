import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

function renderLayout(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Welcome Page</div>} />
        <Route element={<Layout />}>
          <Route path="dashboard" element={<div>Dashboard Content</div>} />
          <Route path="accounts" element={<div>Accounts Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("Layout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the sidebar navigation links", () => {
    renderLayout();

    [
      "Dashboard",
      "Accounts",
      "Transactions",
      "Budgets",
      "Reports",
      "Import / Export",
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders the nested route content via Outlet", () => {
    renderLayout("/dashboard");
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("renders a different page's content when navigating to another nested route", () => {
    renderLayout("/accounts");
    expect(screen.getByText("Accounts Content")).toBeInTheDocument();
  });

  it("clears the stored user and navigates home when Logout is clicked", async () => {
    localStorage.setItem("user", "someone");
    const user = userEvent.setup();

    renderLayout("/dashboard");

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(localStorage.getItem("user")).toBeNull();
    expect(screen.getByText("Welcome Page")).toBeInTheDocument();
  });
});
