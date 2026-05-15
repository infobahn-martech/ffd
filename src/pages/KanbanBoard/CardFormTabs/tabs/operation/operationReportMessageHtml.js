const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

export function isHtmlString(value) {
  if (value == null || value === "") return false;
  const str = String(value);
  return HTML_TAG_PATTERN.test(str);
}

const escapeHtmlText = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Convert plain-text report bodies to HTML for React Quill. */
export function plainTextToHtml(value) {
  if (value == null || value === "") return "";
  const text = String(value).replace(/\r\n/g, "\n");
  if (isHtmlString(text)) return text;

  return text
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((line) => !String(line).trim())) return "<p><br></p>";
      const inner = lines
        .map((line) => {
          if (!String(line).trim()) return "<br>";
          return escapeHtmlText(line);
        })
        .join("<br>");
      return `<p>${inner}</p>`;
    })
    .join("");
}

/** Keep API/template HTML intact; convert plain text for Quill display. */
export function ensureHtmlForQuill(value) {
  if (value == null || value === "") return "";
  const str = String(value);
  return isHtmlString(str) ? str : plainTextToHtml(str);
}

/** Prefer edited HTML message; fall back to generated plain body as HTML. */
export function resolveReportBodyHtml(message, fallbackPlain) {
  const primary = message != null ? String(message).trim() : "";
  if (primary) return primary;
  return ensureHtmlForQuill(fallbackPlain);
}
