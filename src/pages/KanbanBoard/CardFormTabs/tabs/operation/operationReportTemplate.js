const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

const htmlToPlainText = (html = "") =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const htmlToEditableText = (html = "") =>
  String(html || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const extractReportTemplateFields = (templatePayload) => {
  const rawData = templatePayload?.data?.data ?? templatePayload?.data ?? templatePayload ?? {};
  const row = Array.isArray(rawData) ? rawData[0] || {} : rawData;
  const rawBody = firstNonEmptyString(row?.message, row?.body, row?.email_body, row?.template);
  return {
    from: firstNonEmptyString(row?.from, row?.from_email, row?.sender_email, row?.sender),
    subject: htmlToPlainText(firstNonEmptyString(row?.subject, row?.email_subject)),
    message: firstNonEmptyString(htmlToEditableText(rawBody), htmlToPlainText(rawBody)),
  };
};
