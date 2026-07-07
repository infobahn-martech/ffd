import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Work Order Creation Modal - premium UI, styles live in salesOrder.scss
const WorkOrderCreationModal = ({
  show,
  onClose,
  onGenerate,
  isSubmitting = false,
  selectedItems,
  salesOrderList,
  cardColor,
  vesselName = "",
  portName = "",
}) => {
  const [formData, setFormData] = useState({
    workOrderName: "",
    vesselName: "",
    portName: "",
    createAs: "Draft",
  });

  const selectedLineItems = salesOrderList.filter((item) => selectedItems.includes(item.id));

  // Auto-generate work order name and pre-fill vessel/port
  useEffect(() => {
    if (show && selectedLineItems.length > 0) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const itemNames = selectedLineItems.slice(0, 2).map((item) => item.itemDescription || item.itemNo || "").join(", ");
      const generatedName = `WO-${timestamp}-${itemNames.substring(0, 30)}${itemNames.length > 30 ? "..." : ""}`;
      setFormData((prev) => ({
        ...prev,
        workOrderName: generatedName,
        vesselName: vesselName || prev.vesselName,
        portName: portName || prev.portName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    onGenerate(formData);
  };

  if (!show) return null;

  return (
    <div className="so-wo-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="so-wo-modal"
        style={{ "--card-color": cardColor || "#2A00FF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="so-wo-modal-header">
          <h2 className="so-wo-modal-title">Work Order Creation</h2>
          <button type="button" className="so-wo-modal-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="so-wo-modal-form">
          <div className="so-wo-modal-body">
            <div className="so-wo-field">
              <label className="so-wo-label">Work Order Name</label>
              <input
                type="text"
                className="so-wo-input"
                value={formData.workOrderName}
                onChange={(e) => handleInputChange("workOrderName", e.target.value)}
                required
              />
            </div>

            <div className="so-wo-field-row">
              <div className="so-wo-field">
                <label className="so-wo-label">Vessel Name</label>
                <input
                  type="text"
                  className="so-wo-input"
                  value={formData.vesselName}
                  onChange={(e) => handleInputChange("vesselName", e.target.value)}
                  placeholder="Enter vessel name"
                />
              </div>
              <div className="so-wo-field">
                <label className="so-wo-label">Port Name</label>
                <input
                  type="text"
                  className="so-wo-input"
                  value={formData.portName}
                  onChange={(e) => handleInputChange("portName", e.target.value)}
                  placeholder="Enter port name"
                />
              </div>
            </div>

            <div className="so-wo-field">
              <label className="so-wo-label">Selected Line ({selectedLineItems.length})</label>
              <div className="so-wo-line-list">
                {selectedLineItems.map((item) => (
                  <div key={item.id} className="so-wo-line-item">
                    <div className="so-wo-line-cell">
                      <span className="so-wo-line-cell-label">Internal Code</span>
                      <div className="so-wo-line-cell-value">{item.itemNo || "—"}</div>
                    </div>
                    <div className="so-wo-line-cell">
                      <span className="so-wo-line-cell-label">Job Description</span>
                      <div className="so-wo-line-cell-value">{item.itemDescription || "—"}</div>
                    </div>
                    <div className="so-wo-line-cell so-wo-line-cell-qty">
                      <span className="so-wo-line-cell-label">Quantity</span>
                      <div className="so-wo-line-cell-value">{item.qty ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="so-wo-field">
              <label className="so-wo-label">Create As</label>
              <select
                className="so-wo-input"
                value={formData.createAs}
                onChange={(e) => handleInputChange("createAs", e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="so-wo-modal-footer">
            <button type="button" className="so-wo-btn so-wo-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="so-wo-btn so-wo-btn-generate" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

WorkOrderCreationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  selectedItems: PropTypes.arrayOf(PropTypes.number).isRequired,
  salesOrderList: PropTypes.array.isRequired,
  cardColor: PropTypes.string,
  vesselName: PropTypes.string,
  portName: PropTypes.string,
};

export default WorkOrderCreationModal;
