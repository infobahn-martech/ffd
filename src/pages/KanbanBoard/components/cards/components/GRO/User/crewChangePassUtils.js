// Crew Change CG/Zawil Pass panel helpers (no JSX)
import { firstNonEmptyGroDisplay } from "./groCardUtils";

/** POST crew/get_crew_list response → { rows, pagination }. Mirrors useCrewReducer.fetchCallCrewList's parsing. */
export const normalizeCrewChangeListResponse = (res) => {
  const root = res?.data?.data ?? res?.data ?? {};
  const crew = root?.crew ?? (Array.isArray(root) ? root : []);
  const rows = Array.isArray(crew) ? crew : [];
  const pagination = {
    total: Number(root?.pagination?.total ?? root?.total ?? rows.length ?? 0) || 0,
    page: Number(root?.pagination?.page ?? root?.page ?? 1) || 1,
    limit: Number(root?.pagination?.limit ?? root?.limit ?? 5) || 5,
  };
  return { rows, pagination };
};

/** Stable crew id for selection/upload payloads. */
export const getCrewChangeCrewId = (crew) => {
  const raw = crew?.crew_id ?? crew?.id;
  if (raw == null || String(raw).trim() === "") return null;
  return raw;
};

/** Display fields for the crew roster table columns. */
export const crewChangeRowFields = (crew) => ({
  crewId: getCrewChangeCrewId(crew),
  crewName: firstNonEmptyGroDisplay(crew?.crew_name, crew?.name, crew?.crewName),
  nationality: firstNonEmptyGroDisplay(crew?.nationality),
  rank: firstNonEmptyGroDisplay(crew?.rank),
  movementType: firstNonEmptyGroDisplay(crew?.movement_type, crew?.movementType),
  passport: firstNonEmptyGroDisplay(crew?.passport_no, crew?.passportNo),
  iqama: firstNonEmptyGroDisplay(crew?.iqama_no, crew?.iqamaNo),
  visa: firstNonEmptyGroDisplay(crew?.visa_no, crew?.visaNo),
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** RTL crew roster table appended to the CG Pass template preview, matching the pass_no/iqama/nationality/name/count columns. */
export const buildCrewRosterTableHtml = (selectedRows, zawilNoByCrewId = {}) => {
  const rows = Array.isArray(selectedRows) ? selectedRows : [];
  const bodyRows = rows
    .map((row, index) => {
      const f = crewChangeRowFields(row);
      const zawilNo = zawilNoByCrewId?.[f.crewId] ?? "";
      const passportIqama = [f.passport, f.iqama].filter((v) => v && v !== "-").join(" / ");
      return `<tr>
        <td>${escapeHtml(zawilNo || "-")}</td>
        <td>${escapeHtml(passportIqama || "-")}</td>
        <td>${escapeHtml(f.nationality)}</td>
        <td>${escapeHtml(f.crewName)}</td>
        <td>${index + 1}</td>
      </tr>`;
    })
    .join("");

  return `<table class="bulk-pass-arabic-crew-table">
    <thead>
      <tr>
        <th>رقم زاول</th>
        <th>رقم الجواز/الاقامة</th>
        <th>الجنسية</th>
        <th>اسم البحار</th>
        <th>العدد</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>`;
};
