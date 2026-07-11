/**
 * Centralized API base URL.
 *
 * Set NEXT_PUBLIC_API_URL on Vercel to point at the Render backend.
 * Falls back to localhost for local development.
 */
export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
