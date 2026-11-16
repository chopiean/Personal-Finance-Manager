import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWidget from "./ChatWidget";

vi.mock("../api/api", () => ({
  apiFetch: vi.fn(),
}));

function renderWithOutside() {
  return render(
    <div>
      <p>Page content</p>
      <ChatWidget />
    </div>
  );
}

describe("ChatWidget", () => {
  it("closes when clicking outside the panel", async () => {
    const user = userEvent.setup();
    renderWithOutside();

    await user.click(screen.getByRole("button", { name: "Open AI assistant" }));
    expect(screen.getByRole("dialog", { name: "AI assistant" })).toBeInTheDocument();

    await user.click(screen.getByText("Page content"));
    expect(screen.queryByRole("dialog", { name: "AI assistant" })).toBeNull();
  });

  it("stays open when clicking inside the panel", async () => {
    const user = userEvent.setup();
    renderWithOutside();

    await user.click(screen.getByRole("button", { name: "Open AI assistant" }));
    const panel = screen.getByRole("dialog", { name: "AI assistant" });
    await user.click(panel);

    expect(screen.getByRole("dialog", { name: "AI assistant" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithOutside();

    await user.click(screen.getByRole("button", { name: "Open AI assistant" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "AI assistant" })).toBeNull();
  });

  it("toggle button still closes the panel", async () => {
    const user = userEvent.setup();
    renderWithOutside();

    await user.click(screen.getByRole("button", { name: "Open AI assistant" }));
    await user.click(screen.getByRole("button", { name: "Close AI assistant" }));

    expect(screen.queryByRole("dialog", { name: "AI assistant" })).toBeNull();
  });
});
