import { useForm, useFieldArray } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { useState } from "react";

export function CheckListModal({ showModal, closeModal }) {
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
      <div style={{ marginLeft: "20px", marginTop: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h6 style={{ margin: 0 }}>Items</h6>
          <button
            type="button"
            onClick={() => append({
              item_name: "",
              description: "",
              item_order: fields.length + 1,
              document_details: {
                sample_url: "",
                required_copy_only: null,
                description: ""
              }
            })}
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            + Add Item
          </button>
        </div>

        {fields.map((item, itemIndex) => (
          <div key={item.id} style={{ 
            border: "1px solid #ddd", 
            borderRadius: "6px", 
            padding: "12px", 
            marginBottom: "10px",
            backgroundColor: "#fff"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <strong>Item {itemIndex + 1}</strong>
              <button
                type="button"
                onClick={() => remove(itemIndex)}
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: "11px", padding: "2px 6px" }}
              >
                Remove
              </button>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <input
                  className="form-control form-control-sm"
                  placeholder="Item Name"
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.item_name`, {
                    required: "Item name is required"
                  })}
                />
                <label style={{ fontSize: "13px" }}>Item Name <span className="text-danger">*</span></label>
              </div>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <textarea
                  className="form-control form-control-sm"
                  placeholder="Description"
                  style={{ height: "80px" }}
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.description`)}
                />
                <label style={{ fontSize: "13px" }}>Description</label>
              </div>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Item Order"
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.item_order`, {
                    valueAsNumber: true
                  })}
                />
                <label style={{ fontSize: "13px" }}>Item Order</label>
              </div>
            </div>

            {/* Document Details */}
            <div style={{ marginLeft: "15px", marginTop: "10px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <strong style={{ fontSize: "13px" }}>Document Details</strong>
              <div className="mb-2 mt-2">
                <div className="form-floating">
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="Sample URL"
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.sample_url`)}
                  />
                  <label style={{ fontSize: "13px" }}>Sample URL</label>
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>Required Copy Only</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                />
              </div>
              <div className="mb-2">
                <div className="form-floating">
                  <textarea
                    className="form-control form-control-sm"
                    placeholder="Description"
                    style={{ height: "60px" }}
                    {...register(`sections.${sectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <label style={{ fontSize: "13px" }}>Description</label>
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
      <div style={{ marginLeft: "15px", marginTop: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <strong style={{ fontSize: "13px" }}>Items</strong>
          <button
            type="button"
            onClick={() => append({
              item_name: "",
              description: "",
              item_order: fields.length + 1,
              document_details: {
                sample_url: "",
                required_copy_only: null,
                description: ""
              }
            })}
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: "11px", padding: "2px 6px" }}
          >
            + Add Item
          </button>
        </div>

        {fields.map((item, itemIndex) => (
          <div key={item.id} style={{ 
            border: "1px solid #eee", 
            borderRadius: "4px", 
            padding: "10px", 
            marginBottom: "8px",
            backgroundColor: "#fafafa"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <strong style={{ fontSize: "12px" }}>Item {itemIndex + 1}</strong>
              <button
                type="button"
                onClick={() => remove(itemIndex)}
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: "10px", padding: "2px 4px" }}
              >
                Remove
              </button>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <input
                  className="form-control form-control-sm"
                  placeholder="Item Name"
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_name`, {
                    required: "Item name is required"
                  })}
                />
                <label style={{ fontSize: "12px" }}>Item Name <span className="text-danger">*</span></label>
              </div>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <textarea
                  className="form-control form-control-sm"
                  placeholder="Description"
                  style={{ height: "60px" }}
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.description`)}
                />
                <label style={{ fontSize: "12px" }}>Description</label>
              </div>
            </div>

            <div className="mb-2">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Item Order"
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.item_order`, {
                    valueAsNumber: true
                  })}
                />
                <label style={{ fontSize: "12px" }}>Item Order</label>
              </div>
            </div>

            {/* Document Details */}
            <div style={{ marginLeft: "10px", marginTop: "8px", padding: "8px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
              <strong style={{ fontSize: "12px" }}>Document Details</strong>
              <div className="mb-2 mt-2">
                <div className="form-floating">
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="Sample URL"
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.sample_url`)}
                  />
                  <label style={{ fontSize: "12px" }}>Sample URL</label>
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "12px" }}>Required Copy Only</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.required_copy_only`)}
                />
              </div>
              <div className="mb-2">
                <div className="form-floating">
                  <textarea
                    className="form-control form-control-sm"
                    placeholder="Description"
                    style={{ height: "50px" }}
                    {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.items.${itemIndex}.document_details.description`)}
                  />
                  <label style={{ fontSize: "12px" }}>Description</label>
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
      <div style={{ marginLeft: "20px", marginTop: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h6 style={{ margin: 0 }}>Sub Sections</h6>
          <button
            type="button"
            onClick={() => append({
              title: "",
              sort_order: fields.length + 1,
              items: []
            })}
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            + Add Sub Section
          </button>
        </div>

        {fields.map((subSection, subSectionIndex) => (
          <div key={subSection.id} style={{ 
            border: "1px solid #ddd", 
            borderRadius: "6px", 
            padding: "12px", 
            marginBottom: "10px",
            backgroundColor: "#fff"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => toggleSubSection(sectionIndex, subSectionIndex)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontWeight: "600",
                  cursor: "pointer",
                  flex: 1,
                  textAlign: "left"
                }}
              >
                {expandedSubSections[`${sectionIndex}-${subSectionIndex}`] ? "▼" : "▶"} Sub Section {subSectionIndex + 1}
              </button>
              <button
                type="button"
                onClick={() => remove(subSectionIndex)}
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: "11px", padding: "2px 6px" }}
              >
                Remove
              </button>
            </div>

            {expandedSubSections[`${sectionIndex}-${subSectionIndex}`] && (
              <>
                <div className="mb-2">
                  <div className="form-floating">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Sub Section Title"
                      {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.title`, {
                        required: "Sub section title is required"
                      })}
                    />
                    <label style={{ fontSize: "13px" }}>Sub Section Title <span className="text-danger">*</span></label>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="form-floating">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Sort Order"
                      {...register(`sections.${sectionIndex}.sub_sections.${subSectionIndex}.sort_order`, {
                        required: "Sort order is required",
                        valueAsNumber: true
                      })}
                    />
                    <label style={{ fontSize: "13px" }}>Sort Order <span className="text-danger">*</span></label>
                  </div>
                </div>

                <SubSectionItems 
                  sectionIndex={sectionIndex} 
                  subSectionIndex={subSectionIndex}
                  items={subSection.items}
                />
              </>
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
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <select
                className={`form-select ${errors.callType ? "is-invalid" : ""}`}
                {...register("callType", {
                  required: "Call Type is required"
                })}
              >
                <option value="">Select Call Type</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="both">Both</option>
              </select>
              <label>
                Call Type <span className="text-danger">*</span>
              </label>
              {errors.callType && (
                <span className="error text-danger">
                  {errors.callType.message}
                </span>
              )}
            </div>
          </div>

          {/* Vessel Type - Select */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <select
                className={`form-select ${errors.vesselType ? "is-invalid" : ""}`}
                {...register("vesselType", {
                  required: "Vessel Type is required"
                })}
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
                <span className="error text-danger">
                  {errors.vesselType.message}
                </span>
              )}
            </div>
          </div>

          {/* Barge Type - Select */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <select
                className={`form-select ${errors.bargeType ? "is-invalid" : ""}`}
                {...register("bargeType", {
                  required: "Barge Type is required"
                })}
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
                <span className="error text-danger">
                  {errors.bargeType.message}
                </span>
              )}
            </div>
          </div>

          {/* Checklist Name - Text */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <input
                className={`form-control ${errors.checklistName ? "is-invalid" : ""}`}
                placeholder="Checklist Name"
                {...register("checklistName", {
                  required: "Checklist Name is required"
                })}
              />
              <label>
                Checklist Name <span className="text-danger">*</span>
              </label>
              {errors.checklistName && (
                <span className="error text-danger">
                  {errors.checklistName.message}
                </span>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="mb-lg-3 mb-sm-0">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h5 style={{ margin: 0, fontWeight: "600" }}>Sections</h5>
              <button
                type="button"
                onClick={addSection}
                className="btn btn-sm btn-primary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                + Add Section
              </button>
            </div>

            {sections.map((section, sectionIndex) => (
              <div key={section.id} style={{ 
                border: "1px solid #e0e0e0", 
                borderRadius: "8px", 
                padding: "15px", 
                marginBottom: "15px",
                backgroundColor: "#f9f9f9"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionIndex)}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      fontWeight: "600",
                      cursor: "pointer",
                      flex: 1,
                      textAlign: "left"
                    }}
                  >
                    {expandedSections[sectionIndex] ? "▼" : "▶"} Section {sectionIndex + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="btn btn-sm btn-danger"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    Remove
                  </button>
                </div>

                {expandedSections[sectionIndex] && (
                  <>
                    {/* Section Title */}
                    <div className="mb-3">
                      <div className="form-floating">
                        <input
                          className="form-control"
                          placeholder="Section Title"
                          {...register(`sections.${sectionIndex}.title`, {
                            required: "Section title is required"
                          })}
                        />
                        <label>Section Title <span className="text-danger">*</span></label>
                      </div>
                    </div>

                    {/* Section Sort Order */}
                    <div className="mb-3">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Sort Order"
                          {...register(`sections.${sectionIndex}.sort_order`, {
                            required: "Sort order is required",
                            valueAsNumber: true
                          })}
                        />
                        <label>Sort Order <span className="text-danger">*</span></label>
                      </div>
                    </div>

                    <SectionItems sectionIndex={sectionIndex} items={section.items} />
                    <SubSections sectionIndex={sectionIndex} subSections={section.sub_sections} />
                  </>
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
