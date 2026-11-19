import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("switches between light and dark and remembers the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle).toHaveTextContent("Light mode");
    expect(document.documentElement.dataset.theme).toBe("mint");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveTextContent("Dark mode");
    expect(document.documentElement.dataset.theme).toBe("midnight");
    expect(localStorage.getItem("theme")).toBe("midnight");

    await user.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("mint");
  });

  it.each([
    ["midnight", "true"],
    ["dark", "true"],
    ["light", "false"],
    ["mint", "false"],
  ])("starts from a saved %s choice", (saved, checked) => {
    localStorage.setItem("theme", saved);
    render(<ThemeToggle />);
    expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute(
      "aria-checked",
      checked
    );
  });
});
