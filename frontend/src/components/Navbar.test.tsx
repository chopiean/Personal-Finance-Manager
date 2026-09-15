import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders the brand name", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText("Finance Manager")).toBeInTheDocument();
  });

  it("renders a nav link for each section with the correct href", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const expected = [
      ["Dashboard", "/dashboard"],
      ["Accounts", "/accounts"],
      ["Transactions", "/transactions"],
      ["Budgets", "/budgets"],
    ];

    for (const [label, href] of expected) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
    }
  });

  it("marks the current route's link as active", () => {
    render(
      <MemoryRouter initialEntries={["/accounts"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Accounts" })).toHaveClass(
      "nav-link-active"
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "nav-link-active"
    );
  });
});
