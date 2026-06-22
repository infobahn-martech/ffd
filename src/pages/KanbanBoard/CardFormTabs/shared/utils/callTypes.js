/** Backend `call_type_id` for Export calls (see `call_file/get_call_detail`). */
export const EXPORT_CALL_TYPE_ID = "2";

export const resolveCallTypeId = (card, formValues, callDetail = null) =>
  String(
    formValues?.call_type_id ??
      formValues?.typeOfCall ??
      callDetail?.call_type_id ??
      card?.call_type_id ??
      card?.typeOfCall ??
      card?.raw?.call_type_id ??
      ""
  ).trim();

export const isExportCallType = (callTypeId) =>
  String(callTypeId ?? "").trim() === EXPORT_CALL_TYPE_ID;

export const isExportCall = (card, formValues, callDetail = null) =>
  isExportCallType(resolveCallTypeId(card, formValues, callDetail));
