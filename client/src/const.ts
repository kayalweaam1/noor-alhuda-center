export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "نور الهدى";

export const APP_LOGO = "";

// Fallback login URL used by hooks when redirecting unauthenticated users
export function getLoginUrl(): string {
  return "/login";
}
