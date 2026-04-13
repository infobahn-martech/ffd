import { useForm, useFieldArray } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { useState, useEffect } from "react";
import useCheckListReducer from "../../../store/CheckListReducer";
import useVesselTypeReducer from "../../../store/VesselTypeReducer";
import useBargeTypeReducer from "../../../store/BargeTypeReducer";

/** Map form item to API item (no file in payload) */
function mapItemToApi(item) {
  const doc = item?.document_details ?? {};
  return {
    item_name: item?.item_name ?? "",
    item_order: item?.item_order ?? 0,
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

const EMPTY_DEFAULTS = {
  callType: "",
  vesselType: "",
  bargeType: "",
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

function mapApiToForm(data) {
  const mapItem = (item) => ({
    item_name: item.item_name || "",
    item_order: Number(item.item_order) || 0,
    expiry_date_reqd: item.expiry_date_reqd == "1",
    description: item.description || "",
    document_details: {
      is_copy_required: item.document_details?.require_copy_only || false,
      required_copy_only: null,
      description: item.document_details?.description || ""
    }
  });
  const { vesselType, bargeType } = normalizeVesselBargeFormFields(data);
  return {
    callType: String(data.call_type_id || ""),
    vesselType,
    bargeType,
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

  useEffect(() => {
    if (showModal) {
      getVesselTypes({ params: { limit: 1000 } });
      getBargeTypes({ params: { limit: 1000 } });
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

    const payload = isEdit
      ? {
          checklist_type_id: showModal.checklist_type_id,
          call_type_id: callTypeId,
          vessel_type_id,
          barge_type_id,
          checklist_name: data.checklistName ?? "",
          sections: sectionsApi
        }
      : {
          call_type_id: callTypeId,
          checklist_name: data.checklistName ?? "",
          vessel_type_id,
          barge_type_id,
          sections: sectionsApi
        };

    const fileMap = collectItemFiles(data);
    const hasFiles = Object.keys(fileMap).length > 0;

    const cb = () => {
      closeModal();
      onSuccess?.();
    };

    if (hasFiles) {
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
    } else {
      if (isEdit) {
        editChecklist({ formData: payload, cb });
      } else {
        createChecklist({ formData: payload, cb });
      }
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

    return (
      <div style={{ marginTop: "20px" }}>
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
            Items
          </h6>
          <button
            type="button"
            onClick={() => append({
              item_name: "",
              description: "",
              item_order: fields.length + 1,
              document_details: {
                is_copy_required: false,
                expiry_date_reqd: false,
                required_copy_only: null,
                description: ""
              }
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
            + Add Item
          </button>
        </div>

        {fields.map((item, itemIndex) => (
          <div key={item.id} style={{
            border: "1px solid #e2e6ff",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "15px",
            backgroundColor: "#fafbfc",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#00368c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.04)";
              e.currentTarget.style.borderColor = "#e2e6ff";
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              paddingBottom: "12px",
              borderBottom: "1px solid #e2e6ff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#00368c",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  {itemIndex + 1}
                </div>
                <strong style={{ fontSize: "14px", color: "#1a1a1a" }}>Item {itemIndex + 1}</strong>
              </div>
              <button
                type="button"
                onClick={() => remove(itemIndex)}
                className="btn btn-sm"
                style={{
                  fontSize: "11px",
                  padding: "5px 12px",
                  backgroundColor: "#fff",
                  border: "1px solid #dc3545",
                  color: "#dc3545",
                  borderRadius: "6px",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = "#dc3545";
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginBottom: "12px" }}>
              <div>
                <div className="form-floating">
                  <input
                    className="form-control"
                    placeholder="Item Name"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.item_name`, {
                      required: "Item name is required"
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Item Name <span className="text-danger">*</span></label>
                </div>
              </div>
              <div>
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Item Order"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.item_order`, {
                      valueAsNumber: true
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Item Order</label>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  style={{ height: "90px", borderColor: "#e2e6ff", fontSize: "14px" }}
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.description`)}
                />
                <label style={{ fontSize: "13px", color: "#666" }}>Description</label>
              </div>
            </div>

            <div className="form-check mb-3" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`expiry_date_reqd_${sectionIndex}_${itemIndex}`}
                {...register(`sections.${sectionIndex}.items.${itemIndex}.expiry_date_reqd`)}
              />
              <label
                className="form-check-label"
                htmlFor={`expiry_date_reqd_${sectionIndex}_${itemIndex}`}
                style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}
              >
                Expiry Date Required
              </label>
            </div>

            {/* Document Details */}
            <div style={{
              marginTop: "15px",
              padding: "16px",
              backgroundColor: "#f8f9ff",
              borderRadius: "8px",
              border: "1px solid #e2e6ff"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e2e6ff"
              }}>
                <div style={{
                  width: "3px",
                  height: "16px",
                  backgroundColor: "#00368c",
                  borderRadius: "2px"
                }}></div>
                <strong style={{ fontSize: "13px", color: "#1a1a1a" }}>Document Details</strong>
              </div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "12px" }}>
                <div className="form-check" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`copy_required_${sectionIndex}_${itemIndex}`}
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.is_copy_required`)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`copy_required_${sectionIndex}_${itemIndex}`}
                    style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}
                  >
                    Is Copy Required
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "13px", color: "#666", fontWeight: "500", marginBottom: "6px" }}>Required Copy Only</label>
                <input
                  type="file"
                  className="form-control"
                  style={{ borderColor: "#e2e6ff", fontSize: "14px", padding: "10px" }}
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                />
              </div>
              <div className="mb-0">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    style={{ height: "70px", borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Description</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Component for Sub Section Items
  const SubSectionItems = ({ sectionIndex, subSectionIndex, items = [] }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `sections.${sectionIndex}.sub_sections.${subSectionIndex}.items`
    });

    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "2px solid #e2e6ff"
        }}>
          <strong style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              width: "3px",
              height: "16px",
              backgroundColor: "#00368c",
              borderRadius: "2px",
              display: "inline-block"
            }}></span>
            Items
          </strong>
          <button
            type="button"
            onClick={() => append({
              item_name: "",
              description: "",
              item_order: fields.length + 1,
              expiry_date_reqd: false,
              document_details: {
                is_copy_required: false,
                required_copy_only: null,
                description: ""
              }
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
            + Add Item
          </button>
        </div>

        {fields.map((item, itemIndex) => (
          <div key={item.id} style={{
            border: "1px solid #e2e6ff",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "15px",
            backgroundColor: "#fafbfc",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#00368c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.04)";
              e.currentTarget.style.borderColor = "#e2e6ff";
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              paddingBottom: "12px",
              borderBottom: "1px solid #e2e6ff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  backgroundColor: "#00368c",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700"
                }}>
                  {itemIndex + 1}
                </div>
                <strong style={{ fontSize: "13px", color: "#1a1a1a" }}>Item {itemIndex + 1}</strong>
              </div>
              <button
                type="button"
                onClick={() => remove(itemIndex)}
                className="btn btn-sm"
                style={{
                  fontSize: "11px",
                  padding: "5px 12px",
                  backgroundColor: "#fff",
                  border: "1px solid #dc3545",
                  color: "#dc3545",
                  borderRadius: "6px",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = "#dc3545";
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginBottom: "12px" }}>
              <div>
                <div className="form-floating">
                  <input
                    className="form-control"
                    placeholder="Item Name"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_name`, {
                      required: "Item name is required"
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Item Name <span className="text-danger">*</span></label>
                </div>
              </div>
              <div>
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Item Order"
                    style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_order`, {
                      valueAsNumber: true
                    })}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Item Order</label>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  style={{ height: "80px", borderColor: "#e2e6ff", fontSize: "14px" }}
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.description`)}
                />
                <label style={{ fontSize: "13px", color: "#666" }}>Description</label>
              </div>
            </div>

            <div className="form-check mb-3" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`expiry_date_reqd_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.expiry_date_reqd`)}
              />
              <label
                className="form-check-label"
                htmlFor={`expiry_date_reqd_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}
              >
                Expiry Date Required
              </label>
            </div>

            {/* Document Details */}
            <div style={{
              marginTop: "15px",
              padding: "16px",
              backgroundColor: "#f8f9ff",
              borderRadius: "8px",
              border: "1px solid #e2e6ff"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e2e6ff"
              }}>
                <div style={{
                  width: "3px",
                  height: "16px",
                  backgroundColor: "#00368c",
                  borderRadius: "2px"
                }}></div>
                <strong style={{ fontSize: "13px", color: "#1a1a1a" }}>Document Details</strong>
              </div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "12px" }}>
                <div className="form-check" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`copy_required_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.is_copy_required`)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`copy_required_${sectionIndex}_${subSectionIndex}_${itemIndex}`}
                    style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}
                  >
                    Is Copy Required
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "13px", color: "#666", fontWeight: "500", marginBottom: "6px" }}>Required Copy Only</label>
                <input
                  type="file"
                  className="form-control"
                  style={{ borderColor: "#e2e6ff", fontSize: "14px", padding: "10px" }}
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                />
              </div>
              <div className="mb-0">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    style={{ height: "70px", borderColor: "#e2e6ff", fontSize: "14px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <label style={{ fontSize: "13px", color: "#666" }}>Description</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Component for Sub Sections
  const SubSections = ({ sectionIndex, subSections = [] }) => {
    const { fields, append, remove } = useFieldArray({
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
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              backgroundColor: "#fafbfc",
              borderBottom: expandedSubSections[`${sectionIndex}-${subSectionIndex}`] ? "1px solid #e2e6ff" : "none"
            }}>
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
                  flex: 1,
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
              <button
                type="button"
                onClick={() => remove(subSectionIndex)}
                className="btn btn-sm"
                style={{
                  fontSize: "11px",
                  padding: "5px 12px",
                  backgroundColor: "#fff",
                  border: "1px solid #dc3545",
                  color: "#dc3545",
                  borderRadius: "6px",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = "#dc3545";
                }}
              >
                Remove
              </button>
            </div>

            {expandedSubSections[`${sectionIndex}-${subSectionIndex}`] && (
              <div style={{ padding: "18px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 150px",
                  gap: "15px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <div className="form-floating">
                      <input
                        className="form-control"
                        placeholder="Sub Section Title"
                        style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                        {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.title`, {
                          required: "Sub section title is required"
                        })}
                      />
                      <label style={{ fontSize: "13px", color: "#666" }}>Sub Section Title <span className="text-danger">*</span></label>
                    </div>
                  </div>
                  <div>
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Sort Order"
                        style={{ borderColor: "#e2e6ff", fontSize: "14px" }}
                        {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.sort_order`, {
                          required: "Sort order is required",
                          valueAsNumber: true
                        })}
                      />
                      <label style={{ fontSize: "13px", color: "#666" }}>Sort Order <span className="text-danger">*</span></label>
                    </div>
                  </div>
                </div>

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
    const { onChange: onVesselTypeChange, ...vesselTypeSelectRest } = register("vesselType", {
      validate: validateVesselOrBargeExclusive
    });
    const { onChange: onBargeTypeChange, ...bargeTypeSelectRest } = register("bargeType", {
      validate: validateVesselOrBargeExclusive
    });
    const vesselBargeFieldError = errors.vesselType || errors.bargeType;

    return (
    <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
      <div className="lead-form">
        <form id="checklistForm" onSubmit={handleSubmit(onSubmit)}>

          {/* Call Type - Select */}
          {/* Top Fields in 2 columns */}
          <div className="row g-3">
            {/* Checklist Name */}
            <div className="col-12 col-md-6">
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
            {/* Call Type */}
            <div className="col-12 col-md-6">
              <div className="form-floating desig-inp">
                <select
                  className={`form-select ${errors.callType ? "is-invalid" : ""}`}
                  {...register("callType", { required: "Call Type is required" })}
                  defaultValue=""
                >
                  <option value="">Select Call Type</option>

                  {(callTypesOptions ?? []).map((callType) => (
                    <option
                      key={callType?.call_type_id}
                      value={String(callType?.call_type_id)}
                    >
                      {callType?.call_type}
                    </option>
                  ))}
                </select>

                <label>
                  Call Type <span className="text-danger">*</span>
                </label>
                {errors.callType && (
                  <span className="error text-danger">{errors.callType.message}</span>
                )}
              </div>
            </div>

            {/* Vessel Type */}
            <div className="col-12 col-md-6">
              <div className="form-floating desig-inp">
                <select
                  className={`form-select ${vesselBargeFieldError ? "is-invalid" : ""}`}
                  {...vesselTypeSelectRest}
                  onChange={(e) => {
                    onVesselTypeChange(e);
                    if (e.target.value !== "") {
                      setValue("bargeType", "", { shouldValidate: true });
                    }
                    trigger(["vesselType", "bargeType"]);
                  }}
                  disabled={isLoadingVesselTypes}
                >
                  <option value="">Select Vessel Type</option>
                  {(vesselTypes ?? []).map((type) => {
                    const value = type.vessel_type_id ?? type._id ?? type.vessel_type ?? type.name;
                    const label = type.vessel_type ?? type.name ?? value;
                    return (
                      <option key={value} value={String(value)}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <label>
                  Vessel Type <span className="text-danger">*</span>
                </label>
                {vesselBargeFieldError && (
                  <span className="error text-danger">{vesselBargeFieldError.message}</span>
                )}
              </div>
            </div>

            {/* Barge Type */}
            <div className="col-12 col-md-6">
              <div className="form-floating desig-inp">
                <select
                  className={`form-select ${vesselBargeFieldError ? "is-invalid" : ""}`}
                  {...bargeTypeSelectRest}
                  onChange={(e) => {
                    onBargeTypeChange(e);
                    if (e.target.value !== "") {
                      setValue("vesselType", "", { shouldValidate: true });
                    }
                    trigger(["vesselType", "bargeType"]);
                  }}
                  disabled={isLoadingBargeTypes}
                >
                  <option value="">Select Barge Type</option>
                  {(bargeTypes ?? []).map((type) => {
                    const value = type.barge_type_id ?? type._id ?? type.barge_type ?? type.name;
                    const label = type.barge_type ?? type.name ?? value;
                    return (
                      <option key={value} value={String(value)}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <label>
                  Barge Type <span className="text-danger">*</span>
                </label>
                {vesselBargeFieldError && (
                  <span className="error text-danger">{vesselBargeFieldError.message}</span>
                )}
              </div>
            </div>
          </div>


          {/* Sections */}
          <div className="mb-lg-3 mb-sm-0">
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
                overflow: "hidden"
              }}>
                {/* Section Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  backgroundColor: "#f8f9ff",
                  borderBottom: expandedSections[sectionIndex] ? "1px solid #e2e6ff" : "none"
                }}>
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
                      flex: 1,
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
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="btn btn-sm"
                    style={{
                      fontSize: "12px",
                      padding: "6px 14px",
                      backgroundColor: "#fff",
                      border: "1px solid #dc3545",
                      color: "#dc3545",
                      borderRadius: "6px",
                      fontWeight: "600",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc3545";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.color = "#dc3545";
                    }}
                  >
                    Remove
                  </button>
                </div>

                {expandedSections[sectionIndex] && (
                  <div style={{ padding: "20px" }}>
                    {/* Section Title and Sort Order in Grid */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 150px",
                      gap: "15px",
                      marginBottom: "20px"
                    }}>
                      {/* Section Title */}
                      <div>
                        <div className="form-floating">
                          <input
                            className="form-control"
                            placeholder="Section Title"
                            style={{ borderColor: "#e2e6ff" }}
                            {...register(`sections.${sectionIndex}.title`, {
                              required: "Section title is required"
                            })}
                          />
                          <label style={{ color: "#666" }}>Section Title <span className="text-danger">*</span></label>
                        </div>
                      </div>

                      {/* Section Sort Order */}
                      <div>
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Sort Order"
                            style={{ borderColor: "#e2e6ff" }}
                            {...register(`sections.${sectionIndex}.sort_order`, {
                              required: "Sort order is required",
                              valueAsNumber: true
                            })}
                          />
                          <label style={{ color: "#666" }}>Sort Order <span className="text-danger">*</span></label>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{
                      height: "1px",
                      backgroundColor: "#e2e6ff",
                      margin: "20px 0",
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
      className="checklist-modal-lg"
      dialgName="modal-dialog modal-dialog-centered modal-xl"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
