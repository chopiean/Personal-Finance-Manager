import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "./api";

function mockFetchResponse({
  ok = true,
  status = 200,
  statusText = "OK",
  contentType = "application/json",
  jsonBody = {},
  textBody = "",
}: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  contentType?: string | null;
  jsonBody?: unknown;
  textBody?: string;
} = {}) {
  return {
    ok,
    status,
    statusText,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? contentType : null,
    },
    json: vi.fn().mockResolvedValue(jsonBody),
    text: vi.fn().mockResolvedValue(textBody),
    blob: vi.fn().mockResolvedValue(new Blob(["blob-content"])),
  } as unknown as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the request URL from the configured API base and path", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: { ok: true } }));

    await apiFetch("/accounts");

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/accounts");
  });

  it("sets Content-Type: application/json for non-FormData bodies", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: {} }));

    await apiFetch("/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "Cash" }),
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(JSON.stringify({ name: "Cash" }));
  });

  it("omits Content-Type header when the body is FormData", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: {} }));

    const formData = new FormData();
    formData.append("file", new Blob(["a"]), "a.csv");

    await apiFetch("/csv/import", { method: "POST", body: formData });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
    expect(options?.body).toBe(formData);
  });

  it("attaches an Authorization header when a token is present in localStorage", async () => {
    localStorage.setItem("token", "abc123");
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: {} }));

    await apiFetch("/accounts");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer abc123");
  });

  it("does not attach an Authorization header when no token is present", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: {} }));

    await apiFetch("/accounts");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("merges any caller-supplied headers", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ jsonBody: {} }));

    await apiFetch("/accounts", { headers: { "X-Custom": "yes" } });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers["X-Custom"]).toBe("yes");
  });

  it("returns null for a 204 No Content response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ status: 204, ok: true, contentType: null })
    );

    const result = await apiFetch("/accounts/1");
    expect(result).toBeNull();
  });

  it("parses and returns JSON for successful JSON responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ jsonBody: { id: 1, name: "Cash" } })
    );

    const result = await apiFetch<{ id: number; name: string }>("/accounts/1");
    expect(result).toEqual({ id: 1, name: "Cash" });
  });

  it("returns a blob when the response is not JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ contentType: "text/csv" })
    );

    const result = await apiFetch("/csv/transactions");
    expect(result).toBeInstanceOf(Blob);
  });

  it("throws an Error using the response body text when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        textBody: "Invalid payload",
      })
    );

    await expect(apiFetch("/accounts")).rejects.toThrow("Invalid payload");
  });

  it("falls back to statusText when the error body is empty", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 500,
        statusText: "Server Error",
        textBody: "",
      })
    );

    await expect(apiFetch("/accounts")).rejects.toThrow("Server Error");
  });
});
