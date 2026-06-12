import { ensureHtmlForQuill } from "./operationReportMessageHtml";

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

export const extractReportTemplateFields = (templatePayload) => {
  const rawData = templatePayload?.data?.data ?? templatePayload?.data ?? templatePayload ?? {};
  const row = Array.isArray(rawData) ? rawData[0] || {} : rawData;
  const rawBody = firstNonEmptyString(row?.message, row?.body, row?.email_body, row?.template);
  return {
    from: firstNonEmptyString(row?.from, row?.from_email, row?.sender_email, row?.sender),
    subject: htmlToPlainText(firstNonEmptyString(row?.subject, row?.email_subject)),
    message: ensureHtmlForQuill(rawBody),
  };
};
