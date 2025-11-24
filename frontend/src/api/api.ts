export const API_BASE = "http://localhost:8080/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
