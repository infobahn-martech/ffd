/**
 * Vessel Registration pass templates (pass_vesselreg_template) ship their `more_description`
 * as rich HTML from a WYSIWYG editor: a bilingual table (Arabic label | blank value cell(s) |
 * English label) followed by closing paragraphs. These helpers read that table to build an
 * editable field list, and write user-entered values back into the same blank cells for preview.
 */

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

/** Writes fieldValues (keyed by the same `row-N` fieldKey) into the blank cell(s) of each row. */
export function injectVesselRegFieldValues(html, fieldValues) {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");

  if (table) {
    Array.from(table.querySelectorAll("tr")).forEach((tr, index) => {
      const cells = getRowCells(tr);
      if (cells.length < 2) return;
      const value = fieldValues?.[`row-${index}`];
      if (!value) return;
      const valueCells = cells.length > 2 ? cells.slice(1, cells.length - 1) : [cells[cells.length - 1]];
      valueCells.forEach((cell) => {
        cell.textContent = value;
      });
    });
  }

  return doc.body.innerHTML;
}
