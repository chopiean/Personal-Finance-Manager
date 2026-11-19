import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import FeedbackProvider from "./FeedbackProvider";
import { useConfirm, useToast } from "./useFeedback";

function Demo() {
  const toast = useToast();
  const confirm = useConfirm();
  const [answer, setAnswer] = useState("none");
  return (
    <>
      <button onClick={() => toast("Saved!", "success")}>Toast</button>
      <button
        onClick={async () =>
          setAnswer(String(await confirm({ title: "Remove it?", message: "Really remove?" })))
        }
      >
        Ask
      </button>
      <p>answer: {answer}</p>
    </>
  );
}

describe("FeedbackProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a toast that can be dismissed", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider>
        <Demo />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "Toast" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved!");

    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await vi.waitFor(() => expect(screen.queryByText("Saved!")).toBeNull());
  });

  it("resolves confirm with true when confirmed", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider>
        <Demo />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(screen.getByRole("alertdialog", { name: "Remove it?" })).toHaveTextContent(
      "Really remove?"
    );
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText("answer: true")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("resolves confirm with false on cancel or Escape", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider>
        <Demo />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("answer: false")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("falls back to native dialogs without a provider", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();

    function ErrorDemo() {
      const toast = useToast();
      return <button onClick={() => toast("Boom", "error")}>Fail</button>;
    }

    render(
      <>
        <Demo />
        <ErrorDemo />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(await screen.findByText("answer: true")).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledWith("Really remove?");

    await user.click(screen.getByRole("button", { name: "Fail" }));
    expect(alert).toHaveBeenCalledWith("Boom");
  });
});
