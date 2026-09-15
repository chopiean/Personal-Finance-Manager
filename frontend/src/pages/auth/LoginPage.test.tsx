import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/" element={<div>Welcome Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiFetch).mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login form", () => {
    renderLogin();

    expect(
      screen.getByPlaceholderText("Username or email address")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("logs in successfully: stores the token and navigates to /dashboard", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ token: "jwt-token" });
    const user = userEvent.setup();

    renderLogin();

    await user.type(
      screen.getByPlaceholderText("Username or email address"),
      "jane"
    );
    await user.type(screen.getByPlaceholderText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "jane", password: "secret" }),
    });

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(localStorage.getItem("username")).toBe("jane");
  });

  it("shows an alert with the error message when login fails", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();

    renderLogin();

    await user.type(
      screen.getByPlaceholderText("Username or email address"),
      "jane"
    );
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("button", { name: "Login" })).toBeEnabled();
    expect(window.alert).toHaveBeenCalledWith(
      "Login failed: Invalid credentials"
    );
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("navigates to /register when the sign up link is clicked", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText("Sign up"));

    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });

  it("navigates home when Back to Home is clicked", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "← Back to Home" }));

    expect(screen.getByText("Welcome Page")).toBeInTheDocument();
  });
});
