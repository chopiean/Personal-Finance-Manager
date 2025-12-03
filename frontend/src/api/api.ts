const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080/api"
    : "https://personal-finance-manager-production-a787.up.railway.app/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || res.statusText);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await res.blob()) as T;
  }

  return (await res.json()) as T;
}
