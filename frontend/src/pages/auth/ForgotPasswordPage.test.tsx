import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ForgotPasswordPage from "./ForgotPasswordPage";
import FeedbackProvider from "../../components/feedback/FeedbackProvider";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({ apiFetch: vi.fn() }));

function renderPage() {
  return render(
    <FeedbackProvider>
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </FeedbackProvider>
  );
}

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("requests a reset link and shows the check-your-email screen", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Email or username"), " jane@example.com ");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(apiFetch).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier: "jane@example.com" }),
    });
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("lets the user go back and try again", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Email or username"), "jane");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    await user.click(await screen.findByRole("button", { name: "Didn't get it? Try again" }));

    expect(screen.getByRole("button", { name: "Send reset link" })).toBeInTheDocument();
  });

  it("shows an error toast when the request fails", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Server down"));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Email or username"), "jane");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText("Could not send the reset link. Server down")
    ).toBeInTheDocument();
    expect(screen.queryByText("Check your email")).toBeNull();
  });

  it("goes back to login", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "← Back to Login" }));
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
