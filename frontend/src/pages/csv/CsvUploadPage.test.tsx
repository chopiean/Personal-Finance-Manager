import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CsvUploadPage from "./CsvUploadPage";
import { apiFetch } from "../../api/api";

vi.mock("../../api/api", () => ({
  apiFetch: vi.fn(),
}));

describe("CsvUploadPage", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads accounts into the account selector", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ id: 1, name: "Cash" }]);

    render(<CsvUploadPage />);

    expect(await screen.findByRole("option", { name: "Cash" })).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/accounts");
  });

  it("shows an error message when accounts fail to load", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("network error"));

    render(<CsvUploadPage />);

    expect(await screen.findByText("Failed to load accounts")).toBeInTheDocument();
  });

  it("shows a validation message when uploading without selecting an account", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<CsvUploadPage />);
    await screen.findByText("-- Choose an account --");

    await user.click(screen.getByRole("button", { name: /Upload CSV/ }));

    expect(
      await screen.findByText("Please select an account.")
    ).toBeInTheDocument();
  });

  it("uploads the selected CSV file for the selected account", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ id: 1, name: "Cash" }]);
    localStorage.setItem("token", "abc123");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<CsvUploadPage />);

    await screen.findByRole("option", { name: "Cash" });

    await user.selectOptions(screen.getByRole("combobox"), "1");

    const file = new File(["a,b,c"], "transactions.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /Upload CSV/ }));

    await waitFor(() =>
      expect(
        screen.getByText("CSV uploaded successfully!")
      ).toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/csv/import?accountId=1");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer abc123");
    expect(options.body).toBeInstanceOf(FormData);
  });

  it("shows an error message when the upload request fails", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ id: 1, name: "Cash" }]);
    localStorage.setItem("token", "abc123");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Bad file"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<CsvUploadPage />);

    await screen.findByRole("option", { name: "Cash" });
    await user.selectOptions(screen.getByRole("combobox"), "1");

    const file = new File(["a,b,c"], "transactions.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /Upload CSV/ }));

    expect(await screen.findByText("Error: Bad file")).toBeInTheDocument();
  });
});
