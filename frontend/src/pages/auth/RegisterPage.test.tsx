import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Welcome Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiFetch).mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the registration form", () => {
    renderRegister();

    expect(screen.getByPlaceholderText("Choose username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Create password (min 6 characters)")
    ).toBeInTheDocument();
  });

  it("registers successfully and navigates to /login", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);
    localStorage.setItem("token", "stale-token");
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByPlaceholderText("Choose username"), "jane");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "jane@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Create password (min 6 characters)"),
      "secret1"
    );
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "jane",
        password: "secret1",
        email: "jane@example.com",
      }),
    });

    expect(window.alert).toHaveBeenCalledWith("Registration successfil");
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("shows an alert with the error message when registration fails", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Username taken"));
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByPlaceholderText("Choose username"), "jane");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "jane@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Create password (min 6 characters)"),
      "secret1"
    );
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByRole("button", { name: "Register" })
    ).toBeEnabled();
    expect(window.alert).toHaveBeenCalledWith(
      "Registration failed. Username taken"
    );
  });

  it("navigates to /login when the login link is clicked", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByText("Login"));

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
