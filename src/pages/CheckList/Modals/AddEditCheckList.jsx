import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import CommonSelect from "../../../components/CommonSelect";
import { FiTrash2, FiPlus } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/checklist.scss";
import { useState, useEffect, useMemo } from "react";
import useCheckListReducer from "../../../store/CheckListReducer";
import useVesselTypeReducer from "../../../store/VesselTypeReducer";
import useBargeTypeReducer from "../../../store/BargeTypeReducer";
import usePortReducer from "../../../store/PortReducer";
import useRoleReducer from "../../../store/RoleReducer";

function normalizeRoleIdsForApi(item) {
  const toNumbers = (ids) =>
    ids
      .filter((id) => id !== "" && id != null)
      .map((id) => Number(id))
      .filter((n) => !Number.isNaN(n));

  if (Array.isArray(item?.role_ids)) {
    return toNumbers(item.role_ids);
  }

  const doc = item?.document_details ?? {};
  if (Array.isArray(doc?.role_ids)) {
    return toNumbers(doc.role_ids);
  }
  if (doc?.role_id !== "" && doc?.role_id != null) {
    const n = Number(doc.role_id);
    return Number.isNaN(n) ? [] : [n];
  }
  return [];
}

function normalizeRoleIdsForForm(item) {
  const toStrings = (ids) =>
    ids
      .filter((id) => id != null && id !== "")
      .map((id) => String(id));

  if (Array.isArray(item?.role_ids)) {
    return toStrings(item.role_ids);
  }

  const doc = item?.document_details ?? {};
  if (Array.isArray(doc?.role_ids)) {
    return toStrings(doc.role_ids);
  }
  if (doc?.role_id != null && doc?.role_id !== "") {
    return [String(doc.role_id)];
  }
  return [];
}

/** Map form item to API item (no file in payload) */
function mapItemToApi(item) {
  const doc = item?.document_details ?? {};
  return {
    item_name: item?.item_name ?? "",
    description: item?.description ?? "",
    item_order: item?.item_order ?? 0,
    role_ids: normalizeRoleIdsForApi(item),
    expiry_date_reqd: item?.expiry_date_reqd ? 1 : 0,
    document_details: {
      require_copy_only: !!doc?.is_copy_required,
      description: doc?.description ?? ""
    }
  };
}

/** Map form section to API section (no files in payload) */
function mapSectionToApi(section) {
  return {
    title: section?.title ?? "",
    sort_order: section?.sort_order ?? 0,
    items: (section?.items ?? []).map(mapItemToApi),
    sub_sections: (section?.sub_sections ?? []).map((sub) => ({
      title: sub?.title ?? "",
      sort_order: sub?.sort_order ?? 0,
      items: (sub?.items ?? []).map(mapItemToApi)
    }))
  };
}

/** Collect files with global item index (1-based) -> { "item_1": File, ... } */
function collectItemFiles(data) {
  const map = {};
  let globalIndex = 1;
  const sections = data?.sections ?? [];
  for (const section of sections) {
    for (const item of section?.items ?? []) {
      const fileInput = item?.document_details?.required_copy_only;
      const file = fileInput?.length ? fileInput[0] : fileInput;
      if (file instanceof File && file.size > 0) {
        map[`item_${globalIndex}`] = file;
      }
      globalIndex++;
    }
    for (const sub of section?.sub_sections ?? []) {
      for (const item of sub?.items ?? []) {
        const fileInput = item?.document_details?.required_copy_only;
        const file = fileInput?.length ? fileInput[0] : fileInput;
        if (file instanceof File && file.size > 0) {
          map[`item_${globalIndex}`] = file;
        }
        globalIndex++;
      }
    }
  }
  return map;
}

function logFormDataEntries(formData) {
  console.log("[Checklist] FormData entries (before API call):");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(key, `[File: ${value.name}, ${value.size} bytes]`);
    } else {
      console.log(key, value);
    }
  }
}

/** API may return strings or objects; keep full URLs from file_name for preview (not sent in FormData). */
function normalizeUploadedFilesForForm(uploaded) {
  if (uploaded == null) return [];
  const list = Array.isArray(uploaded) ? uploaded : [uploaded];
  return list
    .map((u) => {
      if (typeof u === "string") return u.trim();
      if (u && typeof u === "object") {
        const n = u.file_name ?? u.name ?? u.filename ?? u.original_name;
        return n != null ? String(n).trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

function getSelectedFile(requiredCopyOnly) {
  if (requiredCopyOnly instanceof FileList && requiredCopyOnly.length > 0) {
    return requiredCopyOnly[0];
  }
  if (requiredCopyOnly instanceof File) {
    return requiredCopyOnly;
  }
  return null;
}

function displayNameFromFileRef(ref) {
  const s = String(ref ?? "").trim();
  if (!s) return "";
  try {
    if (/^https?:\/\//i.test(s) || s.startsWith("//")) {
      const urlStr = s.startsWith("//") ? `https:${s}` : s;
      const u = new URL(urlStr);
      const last = u.pathname.split("/").filter(Boolean).pop();
      return last ? decodeURIComponent(last.replace(/\+/g, " ")) : s;
    }
  } catch {
    /* ignore */
  }
  if (s.includes("/")) {
    const last = s.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last.replace(/\+/g, " ")) : s;
  }
  return s;
}

function ItemFilePreviewButton({ control, basePath, inputId }) {
  const requiredCopyOnly = useWatch({
    control,
    name: `${basePath}.document_details.required_copy_only`
  });
  const existingFiles = useWatch({
    control,
    name: `${basePath}.document_details.existing_files`
  });

  const selectedFile = getSelectedFile(requiredCopyOnly);
  const selectedName = selectedFile?.name ?? null;

  const existingList = Array.isArray(existingFiles)
    ? existingFiles.filter((x) => x != null && String(x).trim() !== "")
    : existingFiles != null && String(existingFiles).trim() !== ""
      ? [String(existingFiles).trim()]
      : [];

  const existingDisplayNames = existingList.map(displayNameFromFileRef).filter(Boolean);
  const existingTooltip = existingDisplayNames.join(", ");

  const hasNewFile = selectedFile != null;
  const hasExisting = existingList.length > 0;
  const canPreview = hasNewFile || hasExisting;

  const openPreview = () => {
    if (hasNewFile) {
      const url = URL.createObjectURL(selectedFile);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    const target = existingList[0];
    if (target) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  const titleText = selectedName
    ? `Selected file: ${selectedName}`
    : existingTooltip
      ? `Existing file: ${existingTooltip}`
      : "No file selected";

  return (
    <>
      <label htmlFor={inputId} className="checklist-upload-btn">
        <span aria-hidden="true">⤴</span>
        <span>Upload</span>
      </label>
      <button
        type="button"
        className="checklist-view-btn"
        title={titleText}
        aria-label={canPreview ? "Preview file" : titleText}
        onClick={openPreview}
        disabled={!canPreview}
      >
        <span aria-hidden="true">👁</span>
      </button>
    </>
  );
}

const EMPTY_DEFAULTS = {
  callType: "",
  vesselType: "",
  bargeType: "",
  port: "",
  checklistName: "",
  sections: []
};

/** Normalize API data so vessel and barge types are never both set (vessel wins if both present). */
function normalizeVesselBargeFormFields(data) {
  const vt = data?.vessel_type_id;
  const bt = data?.barge_type_id;
  const hasV = vt != null && vt !== "";
  const hasB = bt != null && bt !== "";
  if (hasV) {
    return { vesselType: String(vt), bargeType: "" };
  }
  if (hasB) {
    return { vesselType: "", bargeType: String(bt) };
  }
  return { vesselType: "", bargeType: "" };
}

function validateVesselOrBargeExclusive(_value, formValues) {
  const hasV = formValues.vesselType !== "" && formValues.vesselType != null;
  const hasB = formValues.bargeType !== "" && formValues.bargeType != null;
  if (!hasV && !hasB) return "Select either Vessel Type or Barge Type";
  if (hasV && hasB) return "Select only one of Vessel Type or Barge Type";
  return true;
}

function createSectionItemPayload(itemOrder) {
  return {
    item_name: "",
    description: "",
    item_order: itemOrder,
    role_ids: [],
    document_details: {
      is_copy_required: false,
      expiry_date_reqd: false,
      required_copy_only: null,
      existing_files: [],
      description: ""
    }
  };
}

function createSubSectionItemPayload(itemOrder) {
  return {
    item_name: "",
    description: "",
    item_order: itemOrder,
    role_ids: [],
    expiry_date_reqd: false,
    document_details: {
      is_copy_required: false,
      required_copy_only: null,
      existing_files: [],
      description: ""
    }
  };
}

function ChecklistItemRoleSelect({ control, name, roleSelectOptions, isLoadingRoles }) {
  const roleMsClassNames = {
    control: () => "checklist-role-ms__control",
    valueContainer: () => "checklist-role-ms__value-container",
    multiValue: () => "checklist-role-ms__multi-value",
    multiValueLabel: () => "checklist-role-ms__multi-value-label",
    multiValueRemove: () => "checklist-role-ms__multi-value-remove",
    placeholder: () => "checklist-role-ms__placeholder",
    indicatorsContainer: () => "checklist-role-ms__indicators",
    menu: () => "checklist-role-ms__menu",
    menuList: () => "checklist-role-ms__menu-list",
    option: () => "checklist-role-ms__option",
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CommonSelect
          isMulti
          options={roleSelectOptions}
          value={Array.isArray(field.value) ? field.value : []}
          onChange={(selected) => {
            const values = Array.isArray(selected)
              ? selected.map((item) => String(item.value))
              : [];
            field.onChange(values);
          }}
          placeholder="Select Role"
          className="checklist-compact-select role-multiselect checklist-role-multiselect"
          classNamePrefix="react-select"
          classNames={roleMsClassNames}
          maxheight={200}
          isDisabled={isLoadingRoles}
          isLoading={isLoadingRoles}
          closeMenuOnSelect={false}
        />
      )}
    />
  );
}

function mapApiToForm(data) {
  const mapItem = (item) => ({
    item_name: item.item_name || "",
    item_order: Number(item.item_order) || 0,
    expiry_date_reqd: item.expiry_date_reqd == "1",
    description: item.description || "",
    role_ids: normalizeRoleIdsForForm(item),
    document_details: {
      is_copy_required: item.document_details?.require_copy_only || false,
      required_copy_only: null,
      existing_files: normalizeUploadedFilesForForm(item.document_details?.uploaded_files),
      description: item.document_details?.description || ""
    }
  });
  const { vesselType, bargeType } = normalizeVesselBargeFormFields(data);
  return {
    callType: String(data.call_type_id || ""),
    vesselType,
    bargeType,
    port: data.port_id != null ? String(data.port_id) : "",
    checklistName: data.checklist_name || "",
    sections: (data.sections || []).map((section) => ({
      title: section.title || "",
      sort_order: Number(section.sort_order) || 0,
      items: (section.items || []).map(mapItem),
      sub_sections: (section.sub_sections || []).map((sub) => ({
        title: sub.title || "",
        sort_order: Number(sub.sort_order) || 0,
        items: (sub.items || []).map(mapItem)
      }))
    }))
  };
}

export function CheckListModal({ showModal, closeModal, callTypesOptions, onSuccess }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubSections, setExpandedSubSections] = useState({});

  const createChecklist = useCheckListReducer((s) => s.createChecklist);
  const editChecklist = useCheckListReducer((s) => s.editChecklist);
  const addEditLoader = useCheckListReducer((s) => s.addEditLoader);
  const { vesselTypes, getVesselTypes, isLoading: isLoadingVesselTypes } = useVesselTypeReducer((s) => s);
  const { bargeTypes, getBargeTypes, isLoading: isLoadingBargeTypes } = useBargeTypeReducer((s) => s);
  const { ports, getPorts, isLoading: isLoadingPorts } = usePortReducer((s) => s);
  const { fetchRoles, roles, isLoading: isLoadingRoles } = useRoleReducer((s) => s);

  const roleSelectOptions = useMemo(
    () =>
      (roles ?? []).map((r) => ({
        value: String(r?._id ?? r?.role_id ?? ""),
        label: String(r?.name ?? r?.role ?? "")
      })),
    [roles]
  );

  useEffect(() => {
    if (showModal) {
      getVesselTypes({ params: { limit: 1000 } });
      getBargeTypes({ params: { limit: 1000 } });
      getPorts({ params: { limit: 1000 } });
      fetchRoles({ params: { page: 1, limit: 100 } });
    }
  }, [showModal]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: EMPTY_DEFAULTS
  });

  useEffect(() => {
    if (showModal && showModal.checklist_type_id) {
      reset(mapApiToForm(showModal));
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [showModal, reset]);

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections"
  });

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSubSection = (sectionIndex, subSectionIndex) => {
    const key = `${sectionIndex}-${subSectionIndex}`;
    setExpandedSubSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addSection = () => {
    appendSection({
      title: "",
      sort_order: sections.length + 1,
      items: [],
      sub_sections: []
    });
  };

  const onSubmit = (data) => {
    const sectionsApi = (data.sections ?? []).map(mapSectionToApi);
    const num = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : null);
    const callTypeId = num(data.callType);
    const port_id = num(data.port);

    let vessel_type_id = null;
    let barge_type_id = null;
    const hasVessel = data.vesselType !== "" && data.vesselType != null;
    const hasBarge = data.bargeType !== "" && data.bargeType != null;
    if (hasVessel) {
      vessel_type_id = num(data.vesselType);
      barge_type_id = null;
    } else if (hasBarge) {
      barge_type_id = num(data.bargeType);
      vessel_type_id = null;
    }

    const isEdit = !!showModal?.checklist_type_id;

    const basePayload = {
      call_type_id: callTypeId,
      checklist_name: data.checklistName ?? "",
      vessel_type_id,
      barge_type_id,
      port_id,
      sections: sectionsApi
    };

    const payload = isEdit
      ? { ...basePayload, checklist_type_id: showModal.checklist_type_id }
      : basePayload;

    const fileMap = collectItemFiles(data);

    const cb = () => {
      closeModal();
      onSuccess?.();
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    Object.entries(fileMap).forEach(([key, file]) => {
      if (!(file instanceof File) || file.size === 0) return;
      formData.append(`documents[${key}][]`, file);
    });
    logFormDataEntries(formData);

    if (isEdit) {
      editChecklist({ formData, cb });
    } else {
      createChecklist({ formData, cb });
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?.checklist_type_id ? "Edit Checklist" : "Add Checklist"}
      </h1>
    </>
  );

  // Component for Section Items
  const SectionItems = ({ sectionIndex, items = [] }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `sections.${sectionIndex}.items`
    });

    const appendItem = () => append(createSectionItemPayload(fields.length + 1));

    return (
      <div className="checklist-items-builder">
        <div className="checklist-items-builder-header">
          <h6>Items</h6>
          <button
            type="button"
            onClick={appendItem}
            className="btn btn-sm"
          >
            + Add Item
          </button>
        </div>
        <div className="checklist-items-table-scroll">
          <div className="checklist-items-table">
            <div className="checklist-items-head">
              <span>#</span>
              <span></span>
              <span>Item Name</span>
              <span>Role</span>
              <span>Description</span>
              <span>Expiry Req.</span>
              <span>Copy Req.</span>
              <span>Upload</span>
              <span></span>
              <span>Doc Description</span>
              <span>Order</span>
              <span>Actions</span>
            </div>

            {fields.map((item, itemIndex) => {
              const uploadInputId = `section_item_upload_${sectionIndex}_${itemIndex}`;
              return (
                <div key={item.id} className="checklist-item-row">
                  <div className="checklist-icon-cell" title="Item drag">
                    <span aria-hidden="true">⋮⋮</span>
                  </div>
                  <div className="checklist-item-index">{itemIndex + 1}</div>
                  <input
                    className="form-control checklist-compact-input"
                    placeholder="Item name"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.item_name`, {
                      required: "Item name is required"
                    })}
                  />
                  <ChecklistItemRoleSelect
                    control={control}
                    name={`sections.${sectionIndex}.items.${itemIndex}.role_ids`}
                    roleSelectOptions={roleSelectOptions}
                    isLoadingRoles={isLoadingRoles}
                  />
                  <input
                    type="text"
                    className="form-control checklist-compact-input"
                    placeholder="Description"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.description`)}
                  />
                  <label className="checklist-checkbox-pill" htmlFor={`expiry_date_reqd_${sectionIndex}_${itemIndex}`}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`expiry_date_reqd_${sectionIndex}_${itemIndex}`}
                      {...register(`sections.${sectionIndex}.items.${itemIndex}.expiry_date_reqd`)}
                    />
                  </label>
                  <label className="checklist-checkbox-pill" htmlFor={`copy_required_${sectionIndex}_${itemIndex}`}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`copy_required_${sectionIndex}_${itemIndex}`}
                      {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.is_copy_required`)}
                    />
                  </label>
                  <input
                    type="file"
                    id={uploadInputId}
                    className="d-none"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                  />
                  <ItemFilePreviewButton
                    control={control}
                    basePath={`sections.${sectionIndex}.items.${itemIndex}`}
                    inputId={uploadInputId}
                  />
                  <input
                    type="text"
                    className="form-control checklist-compact-input"
                    placeholder="Doc description"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <input
                    type="number"
                    className="form-control checklist-compact-input"
                    placeholder="Order"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.item_order`, {
                      valueAsNumber: true
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => remove(itemIndex)}
                    className="checklist-remove-icon-btn"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <FiTrash2 aria-hidden size={18} />
                  </button>
                </div>
              );
            })}
            {fields.length > 0 && (
              <div className="checklist-items-table-footer">
                <button
                  type="button"
                  className="checklist-inline-add-btn"
                  onClick={appendItem}
                  title="Add item"
                  aria-label="Add item"
                >
                  <FiPlus aria-hidden size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component for Sub Section Items
  const SubSectionItems = ({ sectionIndex, subSectionIndex, items = [] }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `sections.${sectionIndex}.sub_sections.${subSectionIndex}.items`
    });

    const appendItem = () => append(createSubSectionItemPayload(fields.length + 1));

    return (
      <div className="checklist-items-builder">
          <div className="checklist-items-builder-header">
            <h6>Items</h6>
            <button
              type="button"
              onClick={appendItem}
              className="btn btn-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="checklist-items-table-scroll">
          <div className="checklist-items-table">
            <div className="checklist-items-head">
              <span>#</span>
              <span></span>
              <span>Item Name</span>
              <span>Role</span>
              <span>Description</span>
              <span>Expiry Req.</span>
              <span>Copy Req.</span>
              <span>Upload</span>
              <span></span>
              <span>Doc Description</span>
              <span>Order</span>
              <span>Actions</span>
            </div>

            {fields.map((item, itemIndex) => {
              const uploadInputId = `sub_section_item_upload_${sectionIndex}_${subSectionIndex}_${itemIndex}`;
              return (
                <div key={item.id} className="checklist-item-row">
                  <div className="checklist-icon-cell" title="Item drag">
                    <span aria-hidden="true">⋮⋮</span>
                  </div>
                  <div className="checklist-item-index">{itemIndex + 1}</div>
                  <input
                    className="form-control checklist-compact-input"
                    placeholder="Item name"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_name`, {
                      required: "Item name is required"
                    })}
                  />
                  <ChecklistItemRoleSelect
                    control={control}
                    name={`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.role_ids`}
                    roleSelectOptions={roleSelectOptions}
                    isLoadingRoles={isLoadingRoles}
                  />
                  <input
                    type="text"
                    className="form-control checklist-compact-input"
                    placeholder="Description"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.description`)}
                  />
                  <label
                    className="checklist-checkbox-pill"
                    htmlFor={`expiry_date_reqd_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`expiry_date_reqd_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                      {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.expiry_date_reqd`)}
                    />
                  </label>
                  <label
                    className="checklist-checkbox-pill"
                    htmlFor={`copy_required_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`copy_required_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                      {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.is_copy_required`)}
                    />
                  </label>
                  <input
                    type="file"
                    id={uploadInputId}
                    className="d-none"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                  />
                  <ItemFilePreviewButton
                    control={control}
                    basePath={`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}`}
                    inputId={uploadInputId}
                  />
                  <input
                    type="text"
                    className="form-control checklist-compact-input"
                    placeholder="Doc description"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <input
                    type="number"
                    className="form-control checklist-compact-input"
                    placeholder="Order"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_order`, {
                      valueAsNumber: true
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => remove(itemIndex)}
                    className="checklist-remove-icon-btn"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <FiTrash2 aria-hidden size={18} />
                  </button>
                </div>
              );
            })}
            {fields.length > 0 && (
              <div className="checklist-items-table-footer">
                <button
                  type="button"
                  className="checklist-inline-add-btn"
                  onClick={appendItem}
                  title="Add item"
                  aria-label="Add item"
                >
                  <FiPlus aria-hidden size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component for Sub Sections
  const SubSections = ({ sectionIndex, subSections = [] }) => {
    const {fields, append, remove} = useFieldArray({
          control,
          name: `sections.${sectionIndex}.sub_sections`
    });

        return (
        <div style={{ marginTop: "25px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "12px",
            borderBottom: "2px solid #e2e6ff"
          }}>
            <h6 style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "14px",
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{
                width: "4px",
                height: "18px",
                backgroundColor: "#00368c",
                borderRadius: "2px",
                display: "inline-block"
              }}></span>
              Sub Sections
            </h6>
            <button
              type="button"
              onClick={() => append({
                title: "",
                sort_order: fields.length + 1,
                items: []
              })}
              className="btn btn-sm"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                backgroundColor: "#00368c",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#002d6f";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00368c";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              + Add Sub Section
            </button>
          </div>

          {fields.map((subSection, subSectionIndex) => (
            <div key={subSection.id} style={{
              border: "1px solid #e2e6ff",
              borderRadius: "10px",
              padding: "0",
              marginBottom: "15px",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
              overflow: "visible"
            }}
            className="checklist-section-shell"
            >
              <div
                className="sub-section-header-row"
                style={{
                  padding: "14px 18px",
                  backgroundColor: "#fafbfc",
                  borderBottom: expandedSubSections[`${sectionIndex}-${subSectionIndex}`] ? "1px solid #e2e6ff" : "none"
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSubSection(sectionIndex, subSectionIndex)}
                  style={{
                    background: "none",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#1a1a1a",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: 0
                  }}
                >
                  <span style={{
                    fontSize: "16px",
                    color: "#00368c",
                    display: "inline-block",
                    transition: "transform 0.2s ease",
                    transform: expandedSubSections[`${sectionIndex}-${subSectionIndex}`] ? "rotate(90deg)" : "rotate(0deg)"
                  }}>
                    ▶
                  </span>
                  <span>Sub Section {subSectionIndex + 1}</span>
                </button>
                <div className="form-floating section-header-floating">
                  <input
                    className="form-control section-header-input"
                    placeholder="Sub Section Title"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.title`, {
                      required: "Sub section title is required"
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Sub Section Title <span className="text-danger">*</span></label>
                </div>
                <div className="form-floating section-header-floating">
                  <input
                    type="number"
                    className="form-control section-header-input"
                    placeholder="Sort Order"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.sort_order`, {
                      required: "Sort order is required",
                      valueAsNumber: true
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Sort Order <span className="text-danger">*</span></label>
                </div>
                <button
                  type="button"
                  onClick={() => remove(subSectionIndex)}
                  className="checklist-remove-icon-btn"
                  title="Remove sub section"
                  aria-label="Remove sub section"
                >
                  <FiTrash2 aria-hidden size={18} />
                </button>
              </div>

              {expandedSubSections[`${sectionIndex}-${subSectionIndex}`] && (
                <div style={{ padding: "18px" }}>
                  <SubSectionItems
                    sectionIndex={sectionIndex}
                    subSectionIndex={subSectionIndex}
                    items={subSection.items}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        );
  };

  const renderBody = () => {
    const vesselBargeFieldError = errors.vesselType || errors.bargeType;

        return (
        <div className="modal-body">
          <div className="lead-form">
            <form id="checklistForm" onSubmit={handleSubmit(onSubmit)}>

              <div className="checklist-top-fields-grid">
                <div className="checklist-top-field-item">
                  <div className="form-floating desig-inp">
                    <input
                      className={`form-control ${errors.checklistName ? "is-invalid" : ""}`}
                      placeholder="Checklist Name"
                      {...register("checklistName", { required: "Checklist Name is required" })}
                    />
                    <label>
                      Checklist Name <span className="text-danger">*</span>
                    </label>
                    {errors.checklistName && (
                      <span className="error text-danger">{errors.checklistName.message}</span>
                    )}
                  </div>
                </div>
                <div className="checklist-top-field-item">
                  <div className="phone-wrapper">
                    <label className="phone-label">
                      Call Type <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="callType"
                      control={control}
                      rules={{ required: "Call Type is required" }}
                      render={({ field }) => (
                        <PremiumSelect
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          options={(callTypesOptions ?? []).map((callType) => ({
                            value: String(callType?.call_type_id ?? ""),
                            label: String(callType?.call_type ?? ""),
                          }))}
                          placeholder="Select Call Type"
                          searchPlaceholder="Search call type..."
                          hasError={Boolean(errors.callType)}
                        />
                      )}
                    />
                    {errors.callType && (
                      <span className="error text-danger">{errors.callType.message}</span>
                    )}
                  </div>
                </div>

                <div className="checklist-top-field-item">
                  <div className="phone-wrapper">
                    <label className="phone-label">Vessel Type</label>
                    <Controller
                      name="vesselType"
                      control={control}
                      rules={{ validate: validateVesselOrBargeExclusive }}
                      render={({ field }) => (
                        <PremiumSelect
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v);
                            if (v !== "") {
                              setValue("bargeType", "", { shouldValidate: true });
                            }
                            trigger(["vesselType", "bargeType"]);
                          }}
                          options={(vesselTypes ?? []).map((type) => {
                            const value = type.vessel_type_id ?? type._id ?? type.vessel_type ?? type.name;
                            const label = type.vessel_type ?? type.name ?? value;
                            return { value: String(value ?? ""), label: String(label ?? "") };
                          })}
                          placeholder="Select Vessel Type"
                          searchPlaceholder="Search vessel type..."
                          disabled={isLoadingVesselTypes}
                          hasError={Boolean(vesselBargeFieldError)}
                        />
                      )}
                    />
                    {vesselBargeFieldError && (
                      <span className="error text-danger">{vesselBargeFieldError.message}</span>
                    )}
                  </div>
                </div>

                <div className="checklist-top-field-item">
                  <div className="phone-wrapper">
                    <label className="phone-label">Barge Type</label>
                    <Controller
                      name="bargeType"
                      control={control}
                      rules={{ validate: validateVesselOrBargeExclusive }}
                      render={({ field }) => (
                        <PremiumSelect
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v);
                            if (v !== "") {
                              setValue("vesselType", "", { shouldValidate: true });
                            }
                            trigger(["vesselType", "bargeType"]);
                          }}
                          options={(bargeTypes ?? []).map((type) => {
                            const value = type.barge_type_id ?? type._id ?? type.barge_type ?? type.name;
                            const label = type.barge_type ?? type.name ?? value;
                            return { value: String(value ?? ""), label: String(label ?? "") };
                          })}
                          placeholder="Select Barge Type"
                          searchPlaceholder="Search barge type..."
                          disabled={isLoadingBargeTypes}
                          hasError={Boolean(vesselBargeFieldError)}
                        />
                      )}
                    />
                    {vesselBargeFieldError && (
                      <span className="error text-danger">{vesselBargeFieldError.message}</span>
                    )}
                  </div>
                </div>

                <div className="checklist-top-field-item">
                  <div className="phone-wrapper">
                    <label className="phone-label">
                      Port <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="port"
                      control={control}
                      rules={{ required: "Port is required" }}
                      render={({ field }) => (
                        <PremiumSelect
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          options={(ports ?? []).map((portOption) => {
                            const value =
                              portOption.port_id != null && portOption.port_id !== ""
                                ? String(portOption.port_id)
                                : String(portOption._id ?? portOption.id ?? "");
                            const label = portOption.port ?? portOption.name ?? value;
                            return { value, label: String(label ?? "") };
                          })}
                          placeholder="Select Port"
                          searchPlaceholder="Search port..."
                          disabled={isLoadingPorts}
                          hasError={Boolean(errors.port)}
                        />
                      )}
                    />
                    {errors.port && (
                      <span className="error text-danger">{errors.port.message}</span>
                    )}
                  </div>
                </div>
              </div>


              {/* Sections */}
              <div className="mb-lg-3 mb-sm-0 sections-wrapper">
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "15px",
                  borderBottom: "2px solid #e2e6ff"
                }}>
                  <h5 style={{
                    margin: 0,
                    fontWeight: "700",
                    fontSize: "18px",
                    color: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      width: "4px",
                      height: "24px",
                      backgroundColor: "#00368c",
                      borderRadius: "2px"
                    }}></div>
                    Sections
                  </h5>
                  <button
                    type="button"
                    onClick={addSection}
                    className="btn"
                    style={{
                      fontSize: "13px",
                      padding: "10px 20px",
                      backgroundColor: "var(--card-color, #00368c)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0, 54, 140, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#002d6f";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 54, 140, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#00368c";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 54, 140, 0.3)";
                    }}
                  >
                    + Add Section
                  </button>
                </div>

                {sections.map((section, sectionIndex) => (
                  <div key={section.id} style={{
                    border: "1px solid #e2e6ff",
                    borderRadius: "12px",
                    padding: "0",
                    marginBottom: "20px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    overflow: "visible"
                  }}
                  className="checklist-section-shell"
                  >
                    {/* Section Header */}
                    <div
                      className="section-header-row"
                      style={{
                        padding: "16px 20px",
                        backgroundColor: "#f8f9ff",
                        borderBottom: expandedSections[sectionIndex] ? "1px solid #e2e6ff" : "none"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(sectionIndex)}
                        style={{
                          background: "none",
                          border: "none",
                          fontWeight: "700",
                          fontSize: "15px",
                          color: "#1a1a1a",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: 0
                        }}
                      >
                        <span style={{
                          fontSize: "18px",
                          color: "#00368c",
                          display: "inline-block",
                          transition: "transform 0.2s ease",
                          transform: expandedSections[sectionIndex] ? "rotate(90deg)" : "rotate(0deg)"
                        }}>
                          ▶
                        </span>
                        <span>Section {sectionIndex + 1}</span>
                      </button>
                      <div className="form-floating section-header-floating">
                        <input
                          className="form-control section-header-input"
                          placeholder="Section Title"
                          style={{ borderColor: "#e2e6ff" }}
                          {...register(`sections.${sectionIndex}.title`, {
                            required: "Section title is required"
                          })}
                        />
                        <label style={{ color: "#666" }}>Section Title <span className="text-danger">*</span></label>
                      </div>
                      <div className="form-floating section-header-floating">
                        <input
                          type="number"
                          className="form-control section-header-input"
                          placeholder="Sort Order"
                          style={{ borderColor: "#e2e6ff" }}
                          {...register(`sections.${sectionIndex}.sort_order`, {
                            required: "Sort order is required",
                            valueAsNumber: true
                          })}
                        />
                        <label style={{ color: "#666" }}>Sort Order <span className="text-danger">*</span></label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="checklist-remove-icon-btn"
                        title="Remove section"
                        aria-label="Remove section"
                      >
                        <FiTrash2 aria-hidden size={18} />
                      </button>
                    </div>

                    {expandedSections[sectionIndex] && (
                      <div style={{ padding: "20px" }}>
                        {/* Divider */}
                        <div style={{
                          height: "1px",
                          backgroundColor: "#e2e6ff",
                          margin: "4px 0 20px",
                          width: "100%"
                        }}></div>

                        <SectionItems sectionIndex={sectionIndex} items={section.items} />
                        <SubSections sectionIndex={sectionIndex} subSections={section.sub_sections} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </form>
          </div>
        </div>
        );
  };

  const renderFooter = () => (
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={closeModal} disabled={addEditLoader}>
            Close
          </button>
          <button type="submit" form="checklistForm" className="btn btn-primary" disabled={addEditLoader}>
            {addEditLoader ? "Saving..." : "Save"}
          </button>
        </div>
        );

        return (
        <CustomModal
          className="checklist-modal-xl-wide"
          dialgName="modal-dialog modal-dialog-centered"
          show={!!showModal}
          closeModal={() => closeModal(null)}
          body={renderBody()}
          footer={renderFooter()}
          header={renderHeader()}
        />
        );
}
