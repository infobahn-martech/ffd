/** Gregorian "YYYY/MM/DD" for a Date. */
export function formatGregorianDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

/** Hijri (Umm al-Qura) "YYYY/MM/DD" for a Date. */
export function formatHijriDate(date) {
  const parts = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}/${get("month")}/${get("day")}`;
}

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Replaces ASCII 0-9 with their Arabic-Indic digit equivalents. */
export function toArabicIndicDigits(value) {
  return String(value ?? "").replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}
