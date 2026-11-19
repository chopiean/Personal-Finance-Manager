import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPasswordPage from "./ResetPasswordPage";
import FeedbackProvider from "../../components/feedback/FeedbackProvider";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({ apiFetch: vi.fn() }));

function renderPage(url = "/reset-password?token=abc123") {
  return render(
    <FeedbackProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/forgot-password" element={<div>Forgot Page</div>} />
        </Routes>
      </MemoryRouter>
    </FeedbackProvider>
  );
}

async function fill(password: string, confirm = password) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("New password"), password);
  await user.type(screen.getByPlaceholderText("Confirm new password"), confirm);
  await user.click(screen.getByRole("button", { name: "Reset password" }));
  return user;
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("resets the password with the token from the link, then goes to login", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ message: "ok" });
    renderPage();

    await fill("NewPass1!");

    expect(apiFetch).toHaveBeenCalledWith("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "abc123", password: "NewPass1!" }),
    });
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(
      screen.getByText("Password updated! Please log in with your new password.")
    ).toBeInTheDocument();
  });

  it("rejects a weak password before calling the API", async () => {
    renderPage();
    await fill("short");
    expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("rejects passwords that don't match before calling the API", async () => {
    renderPage();
    await fill("NewPass1!", "Different1!");
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("shows the server message and a way to get a new link when the token expired", async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new Error("This reset link is invalid or has expired. Please request a new one.")
    );
    renderPage();

    const user = await fill("NewPass1!");

    expect(await screen.findByRole("alert")).toHaveTextContent("has expired");
    await user.click(screen.getByRole("button", { name: "Request a new link" }));
    expect(screen.getByText("Forgot Page")).toBeInTheDocument();
  });

  it("explains when the link has no token", () => {
    renderPage("/reset-password");
    expect(screen.getByText("Link not valid")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("New password")).toBeNull();
  });
});
