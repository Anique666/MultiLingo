/**
 * Centralized API base URL.
 *
 * All requests go through the Next.js rewrite proxy at /api,
 * which forwards to the actual backend (NEXT_PUBLIC_API_URL or localhost:8000).
 * This eliminates CORS issues since the browser only talks to the same origin.
 */
export const API_BASE = "/api";
