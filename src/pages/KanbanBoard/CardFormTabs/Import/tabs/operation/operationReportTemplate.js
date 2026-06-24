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

const normalizeTemplateAttachments = (rawAttachments) => {
  const list = Array.isArray(rawAttachments) ? rawAttachments : [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const fileUrl = firstNonEmptyString(item.file_url, item.fileUrl, item.url, item.path);
      if (!fileUrl) return null;
      const fileName =
        firstNonEmptyString(item.file_name, item.fileName, item.name, item.original_name) ||
        String(fileUrl).split("/").pop() ||
        "Attachment";
      return { file_name: fileName, file_url: fileUrl };
    })
    .filter(Boolean);
};

export const extractReportTemplateFields = (templatePayload) => {
  const rawData = templatePayload?.data?.data ?? templatePayload?.data ?? templatePayload ?? {};
  const row = Array.isArray(rawData) ? rawData[0] || {} : rawData;
  const rawBody = firstNonEmptyString(row?.message, row?.body, row?.email_body, row?.template);
  return {
    from: firstNonEmptyString(row?.from, row?.from_email, row?.sender_email, row?.sender),
    to: firstNonEmptyString(row?.to, row?.to_email, row?.recipient_email, row?.recipient),
    cc: firstNonEmptyString(row?.cc, row?.cc_emails, row?.cc_email),
    subject: htmlToPlainText(firstNonEmptyString(row?.subject, row?.email_subject)),
    message: ensureHtmlForQuill(rawBody),
    attachments: normalizeTemplateAttachments(row?.attachments),
  };
};
