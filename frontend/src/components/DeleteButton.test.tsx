import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteButton from "./DeleteButton";

describe("DeleteButton", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderButton(onDelete: () => Promise<void>) {
    render(
      <DeleteButton
        label="Delete Netflix"
        confirmMessage="Delete Netflix?"
        onDelete={onDelete}
      />
    );
    return screen.getByRole("button", { name: "Delete Netflix" });
  }

  it("renders with its accessible label", () => {
    const button = renderButton(vi.fn());
    expect(button).toHaveTextContent("Delete");
    expect(button).toBeEnabled();
  });

  it("does nothing when the user cancels the confirm dialog", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    await user.click(renderButton(onDelete));

    expect(window.confirm).toHaveBeenCalledWith("Delete Netflix?");
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onDelete after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    await user.click(renderButton(onDelete));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled();
  });

  it("shows a busy state and ignores extra clicks while deleting", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish!: () => void;
    const onDelete = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve))
    );
    const user = userEvent.setup();
    const button = renderButton(onDelete);

    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Deleting…");
    await user.click(button);
    expect(onDelete).toHaveBeenCalledTimes(1);

    finish();
    expect(await screen.findByText("Delete")).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("alerts with the error message when delete fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn().mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    const button = renderButton(onDelete);

    await user.click(button);

    expect(window.alert).toHaveBeenCalledWith("Could not delete. Server error");
    expect(button).toBeEnabled();
  });

  it("alerts with a generic message when the error has no message", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn().mockRejectedValue("oops");
    const user = userEvent.setup();

    await user.click(renderButton(onDelete));

    expect(window.alert).toHaveBeenCalledWith("Could not delete.");
  });
});
