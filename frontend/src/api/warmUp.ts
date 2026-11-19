import { API_BASE } from "./config";

let started = false;

/**
 * Fire-and-forget ping so a sleeping free-tier backend starts booting while
 * the user is still typing their credentials. Runs once per page load.
 */
export function warmUpBackend() {
  if (started || import.meta.env.MODE === "test") return;
  started = true;
  fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" }).catch(() => {
    /* best effort: the real request will report any problem */
  });
}
