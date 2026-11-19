import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import { apiFetch } from "../../api/api";
import FeedbackProvider from "../../components/feedback/FeedbackProvider";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderRegister() {
  return render(
    <FeedbackProvider>
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Welcome Page</div>} />
      </Routes>
    </MemoryRouter>
    </FeedbackProvider>
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
      screen.getByPlaceholderText("Create password")
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
      screen.getByPlaceholderText("Create password"),
      "Secret12!"
    );
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "jane",
        password: "Secret12!",
        email: "jane@example.com",
      }),
    });

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(screen.getByText("Account created! Please log in.")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("shows an error toast when registration fails", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Username taken"));
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByPlaceholderText("Choose username"), "jane");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "jane@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Create password"),
      "Secret12!"
    );
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByRole("button", { name: "Register" })
    ).toBeEnabled();
    expect(
      await screen.findByText("Registration failed. Username taken")
    ).toBeInTheDocument();
  });

  it("navigates to /login when the login link is clicked", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByText("Login"));

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("blocks submit and shows an error for an invalid email", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText("Choose username"), "jane");
    await user.type(screen.getByPlaceholderText("Email address"), "jane@example");
    await user.type(screen.getByPlaceholderText("Create password"), "Secret12!");
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it.each([
    ["Sh0rt!", "Password must be at least 8 characters."],
    ["NoDigits!!", "Password must contain a number."],
    ["NoSpecial123", "Password must contain a special character."],
  ])("blocks submit for weak password %s", async (pw, msg) => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText("Choose username"), "jane");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "jane@example.com"
    );
    await user.type(screen.getByPlaceholderText("Create password"), pw);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText(msg)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
