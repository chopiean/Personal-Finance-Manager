import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./WelcomePage";

function renderWelcome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("WelcomePage", () => {
  it("renders the app title and call-to-action buttons", () => {
    renderWelcome();

    expect(screen.getByText("Personal Finance Manager")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  it("navigates to /login when Login is clicked", async () => {
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("navigates to /register when Register is clicked", async () => {
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });
});
