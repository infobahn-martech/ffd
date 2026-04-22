import { extractChecklistTypeRows } from "./checklistMappers";

/**
 * Normalize axios response for checklist_by_vesseltype / checklist_by_bargetype.
 * Response body `data` may be an array, a single row object, or the body may be a bare array/row.
 */
export const parseChecklistTypeListResponse = (axiosResponse) => {
  const body = axiosResponse?.data;
  return extractChecklistTypeRows(body);
};
