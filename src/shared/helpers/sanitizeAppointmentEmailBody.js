/**
 * Strips embedded data-URI images from appointment email HTML before create_call_file submit.
 * Preserves http/https images and remaining markup (text, styles, links, tables, etc.).
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitizeAppointmentEmailBody(html = "") {
  const input = String(html ?? "");
  if (!input) return "";

  let sanitized = input;

  // <img ... src="data:image/..." ...> or src='data:image/...'
  sanitized = sanitized.replace(
    /<img\b(?=[^>]*\bsrc\s*=\s*["']data:image\/)[^>]*>/gi,
    ""
  );

  // <img ... src=data:image/...> (unquoted)
  sanitized = sanitized.replace(
    /<img\b(?=[^>]*\bsrc\s*=\s*data:image\/)[^>]*>/gi,
    ""
  );

  // srcset may list data-URI sources
  sanitized = sanitized.replace(
    /\bsrcset\s*=\s*["'][^"']*data:image\/[^"']*["']/gi,
    ""
  );

  // Inline styles: background / background-image with data: URIs (common in signatures)
  sanitized = sanitized.replace(
    /background(?:-image)?\s*:\s*[^;]*url\s*\(\s*["']?data:image\/[^)"']*["']?\s*\)[^;]*/gi,
    ""
  );

  return sanitized;
}
