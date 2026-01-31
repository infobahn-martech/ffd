import { useForm, useFieldArray } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { useState } from "react";

export function CheckListModal({ showModal, closeModal, callTypesOptions }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubSections, setExpandedSubSections] = useState({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: showModal?._id
      ? {
        callType: showModal?.callType || "",
        vesselType: showModal?.vesselType || "",
        bargeType: showModal?.bargeType || "",
        checklistName: showModal?.checklistName || "",
        sections: showModal?.sections || []
      }
      : {
        callType: "",
        vesselType: "",
        bargeType: "",
        checklistName: "",
        sections: []
      }
  });

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
    console.log("CHECKLIST FORM SUBMITTED:", data);
    closeModal();
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Checklist" : "Add Checklist"}
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
              <div className="mb-3">
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
              <div className="mb-3">
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

  const renderBody = () => (
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
                  className={`form-select ${errors.vesselType ? "is-invalid" : ""}`}
                  {...register("vesselType", { required: "Vessel Type is required" })}
                >
                  <option value="">Select Vessel Type</option>
                  <option value="cargo">Cargo</option>
                  <option value="tanker">Tanker</option>
                  <option value="container">Container</option>
                  <option value="bulk">Bulk Carrier</option>
                </select>
                <label>
                  Vessel Type <span className="text-danger">*</span>
                </label>
                {errors.vesselType && (
                  <span className="error text-danger">{errors.vesselType.message}</span>
                )}
              </div>
            </div>

            {/* Barge Type */}
            <div className="col-12 col-md-6">
              <div className="form-floating desig-inp">
                <select
                  className={`form-select ${errors.bargeType ? "is-invalid" : ""}`}
                  {...register("bargeType", { required: "Barge Type is required" })}
                >
                  <option value="">Select Barge Type</option>
                  <option value="flat">Flat Barge</option>
                  <option value="hopper">Hopper Barge</option>
                  <option value="deck">Deck Barge</option>
                  <option value="tank">Tank Barge</option>
                </select>
                <label>
                  Barge Type <span className="text-danger">*</span>
                </label>
                {errors.bargeType && (
                  <span className="error text-danger">{errors.bargeType.message}</span>
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

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={closeModal}>
        Close
      </button>
      <button type="submit" form="checklistForm" className="btn btn-primary">
        Save
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
