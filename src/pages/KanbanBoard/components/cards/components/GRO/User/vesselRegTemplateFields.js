/**
 * Vessel Registration pass templates (pass_vesselreg_template) ship their `more_description`
 * as rich HTML from a WYSIWYG editor: a bilingual table (Arabic label | blank value cell(s) |
 * English label) followed by closing paragraphs. These helpers read that table to build an
 * editable field list, and write user-entered values back into the same blank cells for preview.
 */

import translationService from "../../../../../../../services/translationService";
import { toArabicIndicDigits } from "./groArabicDate";

const TABLE_CELL_TAGS = new Set(["TD", "TH"]);

const getRowCells = (tr) => Array.from(tr.children).filter((el) => TABLE_CELL_TAGS.has(el.tagName));

/** One field per table row: label(s) come from the outer cells, value goes in the inner cell(s). */
export function extractVesselRegTemplateFields(html) {
  if (!html || typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];

  return Array.from(table.querySelectorAll("tr"))
    .map((tr, index) => {
      const cells = getRowCells(tr);
      if (cells.length < 2) return null;
      const labelAr = cells[0]?.textContent?.trim() ?? "";
      const labelEn = cells.length > 2 ? cells[cells.length - 1]?.textContent?.trim() ?? "" : "";
      const displayLabel = [labelEn, labelAr].filter(Boolean).join(" / ") || `Field ${index + 1}`;
      return { fieldKey: `row-${index}`, labelAr, labelEn, displayLabel };
    })
    .filter(Boolean);
}

const normalizeLabel = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

// vessel/get_vessel_by_call response key -> normalized substrings its template row's
// English label is expected to contain (template labels vary per port, so match loosely).
const VESSEL_API_FIELD_PATTERNS = [
  ["imo_number", ["imo"]],
  ["call_sign", ["callsign", "callsignal"]],
  ["vessel_name", ["shipsname", "vesselname"]],
  ["agent", ["agent"]],
  ["owner", ["owner"]],
  ["captain_name", ["captain"]],
  ["type_of_vessel", ["typeofvessel"]],
  ["flag", ["flag"]],
  ["no_of_crew", ["noofcrew", "numberofcrew"]],
  ["grt", ["grt"]],
  ["nrt", ["nrt"]],
  ["length", ["length"]],
  ["width", ["width", "beam"]],
  ["draft", ["draft", "draught"]],
  ["type_of_load", ["typeofload", "typeofcargo"]],
  ["arriving_from", ["arrivingfrom"]],
  ["dey", ["dey"]],
  ["leaving_for", ["leavingfor"]],
  ["date_of_sailing", ["dateofsailing"]],
  ["purpose_of_dep", ["purposeofdep", "purposeofdeparture"]],
];

/** Matches a template field's English label to its vessel/get_vessel_by_call response key. */
export function matchVesselApiFieldKey(labelEn) {
  const normalized = normalizeLabel(labelEn);
  if (!normalized) return null;
  const match = VESSEL_API_FIELD_PATTERNS.find(([, patterns]) =>
    patterns.some((pattern) => normalized.includes(pattern))
  );
  return match ? match[0] : null;
}

// A bare code/identifier (e.g. call sign "D5FF3"): mixed letters+digits, no spaces — not
// natural language, so it's left completely unchanged rather than translated or digit-shaped.
const isCodeValue = (v) => /^[A-Za-z0-9]+$/.test(v) && /[A-Za-z]/.test(v) && /[0-9]/.test(v);

// A value that's only digits (e.g. IMO number, GRT, crew count): shaped into Arabic-Indic
// digits locally, no translation call needed.
const isPureNumericValue = (v) => /^\d+(\.\d+)?$/.test(v);

/** Arabic rendering of a single field value: digit-shaped, transliterated/translated, or left as-is. */
async function buildArabicValue(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) return "";
  if (isCodeValue(value)) return value;
  if (isPureNumericValue(value)) return toArabicIndicDigits(value);
  const translated = await translationService.translateToArabic(value);
  // Model output isn't reliably digit-shaped even when asked, so any embedded numbers
  // (e.g. "228 متر") are re-shaped locally rather than trusting the translation for that part.
  return toArabicIndicDigits(translated);
}

/**
 * Writes fieldValues (keyed by the same `row-N` fieldKey) into each row's blank cell(s) and
 * reorders/relabels the row into the required 4-column layout:
 *   <td>English Label</td><td>English Value</td><td class="arabic-value">Arabic Value</td>
 *   <td class="arabic-label">Arabic Label</td>
 * DOM order is left-to-right as written above — the table stays direction: ltr overall, with
 * only the Arabic cells individually flipped to rtl via the arabic-value/arabic-label classes
 * (see cardForm.scss), so this never reorders or reverses elements to fake RTL.
 */
export async function injectVesselRegFieldValues(html, fieldValues) {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return doc.body.innerHTML;

  table.classList.add("document-preview-table");

  const rows = Array.from(table.querySelectorAll("tr"))
    .map((tr, index) => {
      const cells = getRowCells(tr);
      if (cells.length < 2) return null;
      const labelArCell = cells[0];
      const labelEnCell = cells.length > 2 ? cells[cells.length - 1] : null;
      const valueCells = labelEnCell ? cells.slice(1, cells.length - 1) : [cells[cells.length - 1]];
      const value = fieldValues?.[`row-${index}`] ?? "";
      return { tr, labelArCell, labelEnCell, valueCells, value };
    })
    .filter(Boolean);

  const arabicValues = await Promise.all(
    rows.map((row) => (row.value ? buildArabicValue(row.value) : Promise.resolve("")))
  );

  rows.forEach((row, i) => {
    const { tr, labelArCell, labelEnCell, valueCells, value } = row;

    const englishCell = valueCells[0];
    const arabicCell = valueCells.length > 1 ? valueCells[1] : englishCell.cloneNode(false);
    if (value) englishCell.textContent = value;
    arabicCell.textContent = arabicValues[i];
    arabicCell.classList.add("arabic-value");
    labelArCell.classList.add("arabic-label");

    if (labelEnCell) tr.appendChild(labelEnCell);
    tr.appendChild(englishCell);
    tr.appendChild(arabicCell);
    tr.appendChild(labelArCell);
  });

  return doc.body.innerHTML;
}
