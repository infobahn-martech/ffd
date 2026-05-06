import { getDocument } from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

const APPOINTMENT_SCHEMA_TEMPLATE = {
  appointment_received_date: "",
  port: "",
  type_of_call: "",
  vessel_name: "",
  service_requestor_name: "",
  service_requestor_email: "",
};

const stripCodeFence = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  return raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return {};
  }
};

const parseRetryDelaySeconds = (errorPayload) => {
  const details = Array.isArray(errorPayload?.error?.details) ? errorPayload.error.details : [];
  const retryInfo = details.find((item) => {
    const type = String(item?.["@type"] ?? "");
    return type.includes("google.rpc.RetryInfo");
  });
  const retryDelayRaw = String(retryInfo?.retryDelay ?? "").trim();
  if (!retryDelayRaw) return null;

  const secondsMatch = retryDelayRaw.match(/^(\d+)(?:\.\d+)?s$/i);
  if (secondsMatch?.[1]) {
    return Number.parseInt(secondsMatch[1], 10);
  }
  return null;
};

const getMimeType = (file) => String(file?.type ?? "").toLowerCase();
const getFileExtension = (fileName = "") => {
  const parts = String(fileName).toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
};

const isPdfFile = (file) => getMimeType(file) === "application/pdf" || getFileExtension(file?.name) === "pdf";
const isTextLikeFile = (file) => {
  const mimeType = getMimeType(file);
  const extension = getFileExtension(file?.name);
  const allowedExtensions = new Set(["txt", "eml", "html", "htm", "csv"]);

  if (mimeType.startsWith("text/")) return true;
  if (mimeType === "message/rfc822") return true;
  return allowedExtensions.has(extension);
};

const extractTextFromPdf = async (file) => {
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdfDoc = await loadingTask.promise;
  const pages = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += 1) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item?.str ? String(item.str) : ""))
      .filter(Boolean)
      .join(" ");
    if (pageText.trim()) {
      pages.push(pageText.trim());
    }
  }

  return pages.join("\n");
};

export const extractTextFromFile = async (file) => {
  if (!file) return "";
  if (isPdfFile(file)) {
    return extractTextFromPdf(file);
  }
  if (isTextLikeFile(file)) {
    return file.text();
  }
  throw new Error("UNSUPPORTED_FILE_FORMAT");
};

export const extractAppointmentDetailsWithGemini = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_GEMINI_API_KEY");
  }

  const prompt = `
You are an extraction engine.
Extract only from the provided document/email text and return ONLY valid JSON with no markdown.
Do not hallucinate values. If a field is not clearly available, return empty string.

Expected JSON format exactly:
{
  "appointment_received_date": "",
  "port": "",
  "type_of_call": "",
  "vessel_name": "",
  "service_requestor_name": "",
  "service_requestor_email": ""
}

Rules:
- appointment_received_date: format as "YYYY-MM-DD HH:mm:ss" if possible, otherwise empty string.
- port: port/terminal/anchorage mentioned in text.
- type_of_call: service such as Inward Clearance, Export Clearance, OH Inspection, Crew Change, etc.
- vessel_name: exact vessel name.
- service_requestor_name: sender/requestor/contact person name.
- service_requestor_email: requestor email if available.
- Return JSON only.

Document text:
${text}
`.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    if (response.status === 404) {
      throw new Error("Gemini model not found or not supported. Please check VITE_GEMINI_MODEL.");
    }
    if (response.status === 429) {
      const retrySeconds = parseRetryDelaySeconds(errorPayload);
      const retrySuffix = retrySeconds ? ` Retry after ${retrySeconds} seconds.` : "";
      throw new Error(`Gemini quota exceeded. Please retry after some time or check billing/quota.${retrySuffix}`);
    }
    throw new Error(`GEMINI_API_ERROR_${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = safeJsonParse(stripCodeFence(rawText));

  return {
    ...APPOINTMENT_SCHEMA_TEMPLATE,
    ...(parsed && typeof parsed === "object" ? parsed : {}),
  };
};
