/**
 * Safe guards for optional Kanban card UI (API-driven cards).
 */

/** True when value is a non-empty string or a finite number. */
export function hasText(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
}

/** True when progress can be shown (numeric, >= 0). */
export function isValidProgress(value) {
  if (value == null || value === "") return false;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0;
}

/** True when URL is non-empty and looks usable for <img src>. */
export function isValidImage(url) {
  if (url == null || typeof url !== "string") return false;
  const s = url.trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (s.startsWith("data:") || s.startsWith("/") || s.startsWith("./")) return true;
  return s.length > 3;
}

/** Primary line for API cards: vessel name, else card name, else title. */
export function getApiCardDisplayTitle(card) {
  if (!card || typeof card !== "object") return "";
  if (hasText(card.vesselName)) return String(card.vesselName).trim();
  if (hasText(card.cardName)) return String(card.cardName).trim();
  if (hasText(card.title)) return String(card.title).trim();
  return "";
}

/** First letter of username for avatar (uppercase). */
export function getUsernameInitial(username) {
  if (!hasText(username)) return "";
  const s = String(username).trim();
  return s ? s.charAt(0).toUpperCase() : "";
}
