import type { ProfileIn, ApiResponse } from "./types";

// Vide en prod (même origine sur Vercel) ; en dev local on pointe vers http://localhost:8000 via .env.local
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_BASE_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

export async function postTargets(profile: ProfileIn): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE_URL}/api/targets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status}: ${txt}`);
  }
  return res.json();
}
