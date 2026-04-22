import { extractChecklistTypeRows } from "./checklistMappers";

/**
 * Normalize axios response for checklist_by_vesseltype / checklist_by_bargetype.
 * Response body may be the row array or wrapped in { data }.
 */
export const parseChecklistTypeListResponse = (axiosResponse) => {
  const body = axiosResponse?.data;
  return extractChecklistTypeRows(body);
};
