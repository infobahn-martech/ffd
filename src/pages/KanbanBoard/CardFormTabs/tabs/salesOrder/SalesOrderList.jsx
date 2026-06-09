import React, { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { FiFilePlus, FiFileText } from "react-icons/fi";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "../../../../../design/scss/salesOrder.scss";
import { PORT_OPTIONS } from "../../../../../shared/constants/ports";

const BP_CURRENCY_OPTIONS = ["SAR", "USD", "EURO"];
const USD_TO_SAR_RATE = 3.75;

// Group Checkbox Component with indeterminate support
const GroupCheckbox = ({ checked, indeterminate, onChange, onClick }) => {
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={onClick}
      style={{
        width: "18px",
        height: "18px",
        cursor: "pointer",
      }}
    />
  );
};

GroupCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  indeterminate: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Work Order Creation Modal Component - Premium UI
const WorkOrderCreationModal = ({ show, onClose, onCreate, selectedItems, salesOrderList, cardColor, vesselName = "", portName = "" }) => {
  const accentColor = cardColor || "#2A00FF";
  const [formData, setFormData] = useState({
    workOrderName: "",
    relatedCallFile: "",
    assignedTo: "",
    vesselName: "",
    portName: "",
    startDate: "",
    endDate: "",
    remarks: "",
    createAs: "Draft",
  });

  // Get selected line items details
  const selectedLineItems = salesOrderList.filter((item) => selectedItems.includes(item.id));

  // Get unique call files from selected items
  const relatedCallFiles = [...new Set(selectedLineItems.map((item) => item.callFile).filter(Boolean))];
  const callFileDisplay = relatedCallFiles.length === 1 ? relatedCallFiles[0] : relatedCallFiles.join(", ");

  // Auto-generate work order name and pre-fill vessel/port
  useEffect(() => {
    if (show && selectedLineItems.length > 0) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const itemNames = selectedLineItems.slice(0, 2).map((item) => item.itemDescription || item.itemNo || "").join(", ");
      const generatedName = `WO-${timestamp}-${itemNames.substring(0, 30)}${itemNames.length > 30 ? "..." : ""}`;
      setFormData((prev) => ({
        ...prev,
        workOrderName: generatedName,
        relatedCallFile: callFileDisplay,
        vesselName: vesselName || prev.vesselName,
        portName: portName || prev.portName,
      }));
    }
  }, [show, selectedLineItems, callFileDisplay, vesselName, portName]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    ...formData,
    assignedDepartment: formData.assignedTo,
    dueDate: formData.endDate,
    internalNotes: formData.remarks,
    selectedLineItems: selectedLineItems,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(buildPayload());
  };

  const handleShare = (channel) => {
    const payload = buildPayload();
    onCreate({ ...payload, shareVia: channel });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!show) return null;

  const headerGradient = `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`;
  const inputBase = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  };
  const inputFocus = { borderColor: accentColor, boxShadow: `0 0 0 3px ${accentColor}20` };
  const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "13px" };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "720px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Modal Header - Sticky, always visible */}
        <div
          style={{
            flexShrink: 0,
            padding: "24px 28px",
            background: headerGradient,
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#0rgb(51, 65, 85)", letterSpacing: "-0.02em", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
            Work Order Creation
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#ffffff",
              padding: "6px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
          >
            ×
          </button>
        </div>

        {/* Modal Body - Header and footer stay fixed, only content scrolls */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div style={{ overflowY: "auto", flex: 1, padding: "28px" }}>
            {/* Work Order Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Work Order Name</label>
              <input
                type="text"
                value={formData.workOrderName}
                onChange={(e) => handleInputChange("workOrderName", e.target.value)}
                style={inputBase}
                onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: "#e2e8f0", boxShadow: "none" })}
                required
              />
            </div>

            {/* Call File */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Call File</label>
              <input
                type="text"
                value={formData.relatedCallFile || callFileDisplay}
                readOnly
                style={{ ...inputBase, backgroundColor: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
              />
            </div>

            {/* Vessel Name & Port Name - Single Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Vessel Name</label>
                <input
                  type="text"
                  value={formData.vesselName}
                  onChange={(e) => handleInputChange("vesselName", e.target.value)}
                  placeholder="Enter vessel name"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: "#e2e8f0", boxShadow: "none" })}
                />
              </div>
              <div>
                <label style={labelStyle}>Port Name</label>
                <input
                  type="text"
                  value={formData.portName}
                  onChange={(e) => handleInputChange("portName", e.target.value)}
                  placeholder="Enter port name"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: "#e2e8f0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Selected Line */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Selected Line ({selectedLineItems.length})</label>
              <div
                style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                }}
              >
                {selectedLineItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "12px 14px",
                      marginBottom: index < selectedLineItems.length - 1 ? "10px" : 0,
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 80px",
                      gap: "16px",
                      alignItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Internal Code</span>
                      <div style={{ fontWeight: "500", color: "#1e293b", marginTop: "2px" }}>{item.itemNo || "—"}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Job Description</span>
                      <div style={{ fontWeight: "500", color: "#1e293b", marginTop: "2px" }}>{item.itemDescription || "—"}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Quantity</span>
                      <div style={{ fontWeight: "500", color: "#1e293b", marginTop: "2px" }}>{item.qty ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned To */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                style={inputBase}
                required
              >
                <option value="">Select department or team...</option>
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Customs">Customs</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>

            {/* Start Date & End Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  style={inputBase}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  style={inputBase}
                  required
                />
              </div>
            </div>

            {/* remarks */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                rows={4}
                style={{ ...inputBase, resize: "vertical" }}
                placeholder="Enter any internal notes or instructions..."
                onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: "#e2e8f0", boxShadow: "none" })}
              />
            </div>

            {/* Create as */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Create as</label>
              <select
                value={formData.createAs}
                onChange={(e) => handleInputChange("createAs", e.target.value)}
                style={inputBase}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Modal Footer - Create Work & Share Buttons - Single Row */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexWrap: "nowrap",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "20px 28px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#fafbfc",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 22px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleShare("whatsapp")}
              style={{
                padding: "12px 20px",
                backgroundColor: "#25D366",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaWhatsapp size={18} />
              Share
            </button>
            <button
              type="button"
              onClick={() => handleShare("email")}
              style={{
                padding: "12px 20px",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaEnvelope size={16} />
              Share
            </button>
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                backgroundColor: accentColor,
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              Generate
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
  onCreate: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.number).isRequired,
  salesOrderList: PropTypes.array.isRequired,
  cardColor: PropTypes.string,
  vesselName: PropTypes.string,
  portName: PropTypes.string,
};

// Preview Modal Component for Generate Invoice and Create Purchase Order
const PreviewModal = ({ show, onClose, onSend, modalType }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalTitle = () => {
    if (modalType === "invoice") {
      return "PREVIEW: INVOICE";
    } else if (modalType === "purchaseOrder") {
      return "PREVIEW: PURCHASE ORDER";
    }
    return "PREVIEW";
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "24px",
              backgroundColor: "#4169E1",
              borderRadius: "2px",
            }}
          />
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>
            {getModalTitle()}
          </h2>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "550px",
          }}
        >
          {/* Document Preview */}
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "30px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              position: "relative",
              minHeight: "468px",
            }}
          >
            {/* Folded corner effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)",
                borderTopRightRadius: "4px",
              }}
            />

            {/* PDF Badge */}
            <div
              style={{
                backgroundColor: "#DC143C",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-block",
                marginBottom: "20px",
              }}
            >
              PDF
            </div>

            {/* Placeholder lines */}
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  height: "12px",
                  backgroundColor: "#666",
                  borderRadius: "2px",
                  marginBottom: "12px",
                  width: "100%",
                }}
              />
              <div
                style={{
                  height: "12px",
                  backgroundColor: "#666",
                  borderRadius: "2px",
                  marginBottom: "12px",
                  width: "85%",
                }}
              />
              <div
                style={{
                  height: "12px",
                  backgroundColor: "#666",
                  borderRadius: "2px",
                  marginBottom: "12px",
                  width: "75%",
                }}
              />
              <div
                style={{
                  height: "12px",
                  backgroundColor: "#666",
                  borderRadius: "2px",
                  width: "60%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 24px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            CLOSE
          </button>
          <button
            type="button"
            onClick={onSend}
            style={{
              padding: "10px 24px",
              backgroundColor: "#8B5CF6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

PreviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  modalType: PropTypes.oneOf(["invoice", "purchaseOrder"]).isRequired,
};

const TAX_CODE_OPTIONS = ["15%", "5%", "0%"];
const TYPE_OF_PO_OPTIONS = ["Inhouse", "Outhouse PO", "Multiple PO"];

const DUMMY_VENDORS = [
  { code: "VEND-001", name: "Al Rashid Trading Co." },
  { code: "VEND-002", name: "Gulf Marine Supplies" },
  { code: "VEND-003", name: "Eastern Shipping LLC" },
  { code: "VEND-004", name: "Red Sea Logistics" },
  { code: "VEND-005", name: "Arabian Cargo Services" },
  { code: "VEND-006", name: "Jubail Maritime Group" },
  { code: "VEND-007", name: "Dammam Port Services" },
  { code: "VEND-008", name: "Saudi Freight Solutions" },
];

const DUMMY_DOCUMENTS = [
  { id: 1, name: "Port Clearance Document.pdf", type: "PDF" },
  { id: 2, name: "Vessel Certificate.pdf", type: "PDF" },
  { id: 3, name: "Agency Agreement.docx", type: "DOCX" },
  { id: 4, name: "Transport Instruction.pdf", type: "PDF" },
  { id: 5, name: "Customs Declaration.pdf", type: "PDF" },
];

// Vendor List Modal
const VendorListModal = ({ show, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  if (!show) return null;

  const filtered = DUMMY_VENDORS.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "10px", width: "480px", maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a2e" }}>Select Vendor</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #eee" }}>
          <input
            type="text"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #dde0ea", borderRadius: "7px", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#888", fontSize: "13px" }}>No vendors found.</div>
          ) : (
            filtered.map((v) => (
              <div
                key={v.code}
                onClick={() => { onSelect(v); onClose(); }}
                style={{ padding: "12px 22px", cursor: "pointer", borderBottom: "1px solid #f4f4f8", display: "flex", alignItems: "center", gap: "14px", transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#5a5f8a", background: "#f0f2ff", padding: "3px 8px", borderRadius: "5px", flexShrink: 0 }}>{v.code}</span>
                <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "500" }}>{v.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

VendorListModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

// Document List Modal
const DocumentListModal = ({ show, onClose, onSave, initialSelected = [] }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (show) {
      setSelected(new Set((initialSelected || []).map((d) => d.id)));
      setSearch("");
    }
    // Only reset when modal opens; initialSelected is captured at open time via key on parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const filtered = DUMMY_DOCUMENTS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDocument = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    const documents = DUMMY_DOCUMENTS.filter((d) => selected.has(d.id));
    onSave(documents);
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px", boxSizing: "border-box" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "10px", width: "90%", maxWidth: "520px", maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a2e" }}>Select Documents</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #eee", flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search by document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #dde0ea", borderRadius: "7px", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#888", fontSize: "13px" }}>No documents found.</div>
          ) : (
            filtered.map((d) => (
              <label
                key={d.id}
                style={{ padding: "12px 22px", cursor: "pointer", borderBottom: "1px solid #f4f4f8", display: "flex", alignItems: "center", gap: "14px", transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <input
                  type="checkbox"
                  checked={selected.has(d.id)}
                  onChange={() => toggleDocument(d.id)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#5a5f8a", background: "#f0f2ff", padding: "3px 8px", borderRadius: "5px", flexShrink: 0 }}>{d.type}</span>
                <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "500", minWidth: 0, wordBreak: "break-word" }}>{d.name}</span>
              </label>
            ))
          )}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "8px 18px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "5px", background: "#f5f5f5", color: "#333", cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ padding: "8px 18px", fontSize: "13px", border: "none", borderRadius: "5px", background: "#00368c", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

DocumentListModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialSelected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
};

const SalesOrderList = ({
  formValues,
  handleChange,
  cardColor,
  readOnly = false,
  showPOStatus = false,
  isDAModule = false,
  isLoadingSalesOrder = false,
  salesOrderError = null,
}) => {
  const salesOrderList = formValues.salesOrderList || [];
  const billingEntity = formValues.billingEntity || "";
  const lineItemTotal = formValues.lineItemTotal || 0;

  // SO Header fields (no mock defaults — values come from API via mapSalesOrderResponse or user edits)
  const soCustomerCode = formValues.soCustomerCode || "";
  const soCustomerName = formValues.soCustomerName || "";
  const soContactPerson = formValues.soContactPerson || "";
  const soBpCurrency = formValues.soBpCurrency || "";
  const soEuroRate = formValues.soEuroRate || "";
  const soPoNo = formValues.soPoNo || "";
  const soPort = formValues.soPort || "";
  const soSoNo = formValues.soSoNo || "";
  const soPostingDate = formValues.soPostingDate || "";
  const soDeliveryDate = formValues.soDeliveryDate || "";
  const soDocumentDate = formValues.soDocumentDate || "";
  const soShipName = formValues.soShipName || "";
  const soProjectName = formValues.soProjectName || "";
  const branch = formValues.branch || "";
  const soContactEmail = formValues.email || "";
  const srtNumber = formValues.srtNumber || "";

  const portOptions = useMemo(() => {
    if (!soPort || PORT_OPTIONS.includes(soPort)) return PORT_OPTIONS;
    return [soPort, ...PORT_OPTIONS];
  }, [soPort]);

  // Status: use backend so_status when present; otherwise derive OPEN/CLOSED from delivery date
  const soStatusDisplay = (() => {
    const fromApi = (formValues.soStatus ?? "").trim();
    if (fromApi) return fromApi;
    if (!soDeliveryDate) return "OPEN";
    return new Date(soDeliveryDate) >= new Date(new Date().toDateString()) ? "OPEN" : "CLOSED";
  })();

  const soStatusBadgeClass = (() => {
    const s = soStatusDisplay.toLowerCase();
    if (s.includes("close")) return "closed";
    if (s.includes("open")) return "open";
    return "open";
  })();

  // State for accordion and form
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [expandedCallFiles, setExpandedCallFiles] = useState(new Set());
  const [newItemForm, setNewItemForm] = useState({
    callFile: "",
    itemNo: "",
    itemDescription: "",
    qty: "",
    unitPrice: "",
    discount: "0",
    taxCode: "15%",
    typeOfPo: "",
    supplierCode: "",
    supplierName: "",
    documents: [],
  });

  // State for checkbox selection (exclude DA module)
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const bulkActionBarRef = useRef(null);

  // State for preview modal (DA module only)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewModalType, setPreviewModalType] = useState(null);

  // State for Generate PO loading popup
  const [showGeneratePOPopup, setShowGeneratePOPopup] = useState(false);

  // State for vendor modal (row-level supplier picker)
  const [vendorModalTarget, setVendorModalTarget] = useState(null); // orderId or "new"

  // State for document modal (row-level document picker)
  const [documentModalTarget, setDocumentModalTarget] = useState(null); // orderId or "new"

  const displayOrderList = Array.isArray(salesOrderList) ? salesOrderList : [];

  // Group items by callFile
  const groupByCallFile = (orders) => {
    const grouped = {};
    const ungrouped = [];

    orders.forEach((order) => {
      const callFile = order.callFile;
      if (callFile) {
        if (!grouped[callFile]) {
          grouped[callFile] = [];
        }
        grouped[callFile].push(order);
      } else {
        ungrouped.push(order);
      }
    });

    return { grouped, ungrouped };
  };

  const { grouped, ungrouped } = groupByCallFile(displayOrderList);

  // Toggle accordion for callFile
  const toggleCallFileAccordion = (callFile) => {
    setExpandedCallFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(callFile)) {
        newSet.delete(callFile);
      } else {
        newSet.add(callFile);
      }
      return newSet;
    });
  };

  const calcRowTotal = (order, overrides = {}) => {
    const qty = parseFloat(overrides.qty ?? order.qty) || 0;
    const unitPrice = parseFloat(overrides.unitPrice ?? order.unitPrice) || 0;
    const discount = parseFloat(overrides.discount ?? order.discount) || 0;
    const taxCode = overrides.taxCode ?? order.taxCode ?? "15%";
    const taxRate = (parseFloat(String(taxCode).replace(/%/g, "")) || 0) / 100;
    const discountedPrice = unitPrice * (1 - discount / 100);
    const totalBeforeTax = qty * discountedPrice;
    return Math.round((totalBeforeTax + totalBeforeTax * taxRate) * 100) / 100;
  };

  // Calculate total line item total from list if not provided
  const calculatedLineItemTotal = lineItemTotal || displayOrderList.reduce((sum, item) => {
    return sum + (parseFloat(item.totalAmount) || 0);
  }, 0);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrencySAR = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get PO Status color
  const getPOStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "#FFA500"; // Orange
      case "Issued":
        return "#4169E1"; // Royal Blue
      case "Completed":
        return "#008000"; // Green
      default:
        return "#666666"; // Gray
    }
  };

  // Get PO Status background color (lighter version)
  const getPOStatusBgColor = (status) => {
    switch (status) {
      case "Draft":
        return "#FFF4E6"; // Light Orange
      case "Issued":
        return "#E6EDFF"; // Light Blue
      case "Completed":
        return "#E6F7E6"; // Light Green
      default:
        return "#F5F5F5"; // Light Gray
    }
  };

  const handleFieldChange = (orderId, field, value) => {
    const updatedList = salesOrderList.map((order) => {
      if (order.id !== orderId) return order;
      const overrides = { [field]: value };
      return { ...order, ...overrides, totalAmount: calcRowTotal(order, overrides) };
    });
    handleChange("salesOrderList")({ target: { value: updatedList } });
  };

  const handleVendorSelect = (vendor) => {
    if (vendorModalTarget === "new") {
      setNewItemForm((prev) => ({ ...prev, supplierCode: vendor.code, supplierName: vendor.name }));
    } else if (vendorModalTarget !== null) {
      const updatedList = salesOrderList.map((order) =>
        order.id === vendorModalTarget ? { ...order, supplierCode: vendor.code, supplierName: vendor.name } : order
      );
      handleChange("salesOrderList")({ target: { value: updatedList } });
    }
    setVendorModalTarget(null);
  };

  const handleDocumentSave = (documents) => {
    if (documentModalTarget === "new") {
      setNewItemForm((prev) => ({ ...prev, documents }));
    } else if (documentModalTarget !== null) {
      const updatedList = salesOrderList.map((order) =>
        order.id === documentModalTarget ? { ...order, documents } : order
      );
      handleChange("salesOrderList")({ target: { value: updatedList } });
    }
    setDocumentModalTarget(null);
  };

  const getDocumentModalInitialSelected = () => {
    if (documentModalTarget === "new") return newItemForm.documents || [];
    if (documentModalTarget !== null) {
      const order = salesOrderList.find((o) => o.id === documentModalTarget);
      return order?.documents || [];
    }
    return [];
  };

  const formatDocumentCount = (documents) => {
    const count = documents?.length || 0;
    if (!count) return "—";
    return `${count} Document${count > 1 ? "s" : ""}`;
  };

  const handleAddNewItem = () => {
    setNewItemForm({
      callFile: "",
      itemNo: "",
      itemDescription: "",
      qty: "",
      unitPrice: "",
      discount: "0",
      taxCode: "15%",
      typeOfPo: "",
      supplierCode: "",
      supplierName: "",
      documents: [],
    });
    setIsAccordionOpen(true);
  };

  const handleFormChange = (field, value) => {
    setNewItemForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewItem = () => {
    if (!newItemForm.itemNo || !newItemForm.itemDescription) {
      alert("Please fill in Item No and Item Description");
      return;
    }

    const currentList = salesOrderList.length > 0 ? salesOrderList : [];
    const maxId = currentList.length > 0 ? Math.max(...currentList.map((item) => item.id || 0)) : 0;

    const newItem = {
      id: maxId + 1,
      callFile: newItemForm.callFile || null,
      itemNo: newItemForm.itemNo,
      itemDescription: newItemForm.itemDescription,
      qty: parseFloat(newItemForm.qty) || 1,
      unitPrice: parseFloat(newItemForm.unitPrice) || 0,
      discount: parseFloat(newItemForm.discount) || 0,
      taxCode: newItemForm.taxCode || "15%",
      typeOfPo: newItemForm.typeOfPo || "",
      supplierCode: newItemForm.supplierCode || "",
      supplierName: newItemForm.supplierName || "",
      documents: newItemForm.documents || [],
      poStatus: "Draft",
    };
    newItem.totalAmount = calcRowTotal(newItem);

    handleChange("salesOrderList")({ target: { value: [...currentList, newItem] } });

    const emptyForm = { callFile: "", itemNo: "", itemDescription: "", qty: "", unitPrice: "", discount: "0", taxCode: "15%", typeOfPo: "", supplierCode: "", supplierName: "", documents: [] };
    setIsAccordionOpen(false);
    setNewItemForm(emptyForm);
  };

  const handleCancel = () => {
    const emptyForm = { callFile: "", itemNo: "", itemDescription: "", qty: "", unitPrice: "", discount: "0", taxCode: "15%", typeOfPo: "", supplierCode: "", supplierName: "", documents: [] };
    setIsAccordionOpen(false);
    setNewItemForm(emptyForm);
  };

  // Checkbox selection handlers (only for non-DA module)
  const handleItemCheckboxChange = (itemId, checked) => {
    if (isDAModule) return; // Exclude DA module

    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleGroupSelectAll = (callFile, orders, checked) => {
    if (isDAModule) return; // Exclude DA module

    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        orders.forEach((order) => newSet.add(order.id));
      } else {
        orders.forEach((order) => newSet.delete(order.id));
      }
      return newSet;
    });
  };

  const isGroupAllSelected = (orders) => {
    if (isDAModule || orders.length === 0) return false;
    return orders.every((order) => selectedItems.has(order.id));
  };

  const isGroupSomeSelected = (orders) => {
    if (isDAModule || orders.length === 0) return false;
    return orders.some((order) => selectedItems.has(order.id)) && !isGroupAllSelected(orders);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleGenerateWorkOrder = () => {
    if (selectedItems.size === 0) return;
    setShowWorkOrderModal(true);
  };

  const handleCloseWorkOrderModal = () => {
    setShowWorkOrderModal(false);
  };

  const handleCreateWorkOrder = (workOrderData) => {
    const shareVia = workOrderData.shareVia;
    if (shareVia === "whatsapp") {
      // TODO: Implement WhatsApp share (e.g. open wa.me link with work order summary)
      const text = encodeURIComponent(`Work Order: ${workOrderData.workOrderName}\nCall File: ${workOrderData.relatedCallFile}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    } else if (shareVia === "email") {
      // TODO: Implement Email share (e.g. open mailto: link)
      const subject = encodeURIComponent(`Work Order: ${workOrderData.workOrderName}`);
      const body = encodeURIComponent(`Work Order: ${workOrderData.workOrderName}\nCall File: ${workOrderData.relatedCallFile}\nAssigned To: ${workOrderData.assignedDepartment || workOrderData.assignedTo}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    }
    // TODO: Implement API call to create work order (when not sharing)
    console.log("Creating work order:", workOrderData);

    setShowWorkOrderModal(false);
    setSelectedItems(new Set());
  };

  // Handlers for preview modal (DA module only)
  const handleOpenPreviewModal = (type) => {
    setPreviewModalType(type);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewModalType(null);
  };

  const handleGeneratePO = () => {
    if (selectedItems.size === 0) return;
    setShowGeneratePOPopup(true);
    // TODO: Implement actual Generate PO API call - for now just show loading popup
  };

  const handleCloseGeneratePOPopup = () => {
    setShowGeneratePOPopup(false);
  };

  const handleSendPreview = () => {
    // TODO: Implement send functionality
    console.log("Sending:", previewModalType);
    handleClosePreviewModal();
  };

  // Helper function to render table header with tooltip if label > 10 chars (DAModule only)
  const renderTableHeader = (label, className = "") => {
    const thProps = { className: className || undefined };
    if (isDAModule && label.length > 10) {
      const tooltipId = `header-tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`;
      const truncatedLabel = label.substring(0, 10) + "...";
      return <th {...thProps} data-tooltip-id={tooltipId}>{truncatedLabel}</th>;
    }
    return <th {...thProps}>{label}</th>;
  };

  const cellStyle = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "4px 8px",
    textAlign: "center",
    fontSize: "14px",
    fontFamily: "inherit",
  };

  // Render a single order row
  const renderOrderRow = (order) => (
    <tr key={order.id}>
      {!isDAModule && (
        <td>
          <div className="sales-order-table-cell" style={{ textAlign: "center", padding: "8px", paddingRight: "21px" }}>
            <input
              type="checkbox"
              checked={selectedItems.has(order.id)}
              onChange={(e) => handleItemCheckboxChange(order.id, e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          </div>
        </td>
      )}

      {/* Item No */}
      <td>
        <div className="sales-order-table-cell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span>{order.itemNo || ""}</span>
          {isDAModule && (
            <>
              <Tooltip id="create-purchase-order-tooltip" place="top" content="Create Purchase Order" />
              <Tooltip id="generate-invoice-tooltip" place="top" content="Generate Invoice" />
              {order.poStatus === "Draft" && (
                <FiFilePlus
                  data-tooltip-id="create-purchase-order-tooltip"
                  style={{ cursor: "pointer", color: "#FFD700", fontSize: "18px", flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); handleOpenPreviewModal("purchaseOrder"); }}
                />
              )}
              {order.poStatus === "Completed" && (
                <FiFileText
                  data-tooltip-id="generate-invoice-tooltip"
                  style={{ cursor: "pointer", color: "#008000", fontSize: "18px", flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); handleOpenPreviewModal("invoice"); }}
                />
              )}
            </>
          )}
        </div>
      </td>

      {/* Item Description */}
      <td>
        <div className="sales-order-table-cell">{order.itemDescription || ""}</div>
      </td>

      {/* Qty */}
      <td>
        <div className="sales-order-table-cell">
          {readOnly ? (order.qty ?? 0) : (
            <input
              type="number"
              min="0"
              step="1"
              value={order.qty ?? 0}
              onChange={(e) => handleFieldChange(order.id, "qty", e.target.value)}
              className="sales-order-qty-input"
              style={cellStyle}
            />
          )}
        </div>
      </td>

      {/* Unit Price */}
      <td>
        <div className="sales-order-table-cell">
          {formatCurrencySAR(order.unitPrice || 0)}
        </div>
      </td>

      {/* Discount % */}
      <td>
        <div className="sales-order-table-cell">
          {`${order.discount ?? 0}%`}
        </div>
      </td>

      {/* Tax Code */}
      <td>
        <div className="sales-order-table-cell">
          {order.taxCode || "15%"}
        </div>
      </td>

      {/* Total Amount */}
      <td>
        <div className="sales-order-table-cell sales-order-table-cell-total">
          {formatCurrencySAR(order.totalAmount || 0)}
        </div>
      </td>

      {/* Type of PO */}
      <td>
        <div className="sales-order-table-cell">
          {readOnly ? (order.typeOfPo || "—") : (
            <select
              value={order.typeOfPo || ""}
              onChange={(e) => handleFieldChange(order.id, "typeOfPo", e.target.value)}
              className="sales-order-type-po-select"
            >
              <option value="">— Select —</option>
              {TYPE_OF_PO_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </td>

      {/* Document Picker */}
      <td>
        <div className="sales-order-table-cell sales-order-supplier-cell">
          {readOnly ? (
            <span>{formatDocumentCount(order.documents)}</span>
          ) : (
            <>
              <span
                className={`sales-order-supplier-code-text${order.documents?.length ? "" : " is-empty"}`}
              >
                {formatDocumentCount(order.documents)}
              </span>
              <button
                type="button"
                onClick={() => setDocumentModalTarget(order.id)}
                className="sales-order-supplier-select-btn"
              >
                {order.documents?.length ? "Change" : "Select"}
              </button>
            </>
          )}
        </div>
      </td>

      {/* Supplier Code */}
      <td>
        <div className="sales-order-table-cell sales-order-supplier-cell">
          {readOnly ? (
            <span title={order.supplierName || ""}>{order.supplierCode || "—"}</span>
          ) : (
            <>
              <span
                title={order.supplierName || ""}
                className={`sales-order-supplier-code-text${order.supplierCode ? "" : " is-empty"}`}
              >
                {order.supplierCode ? `${order.supplierCode}` : "—"}
              </span>
              <button
                type="button"
                onClick={() => setVendorModalTarget(order.id)}
                title={order.supplierName || "Select Vendor"}
                className="sales-order-supplier-select-btn"
              >
                {order.supplierCode ? "Change" : "Select"}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="cardform-left-full sales-order-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="sales-order-list-header">
        <h3 className="sales-order-list-title">
          <span className="sales-order-list-title-bar"></span>
          SALES ORDER LIST
        </h3>
        {!readOnly && (
          <button
            type="button"
            className="sales-order-add-button"
            onClick={handleAddNewItem}
          >
            + Add Item
          </button>
        )}
      </div>

      {salesOrderError && (
        <div
          role="alert"
          style={{
            margin: "0 16px 12px",
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {salesOrderError}
        </div>
      )}

      {/* SO Header Fields Panel */}
      <div className="so-header-panel">
        {/* Row 1: Customer Code | Customer Name | Contact Person | Contact Email */}
        <div className="so-header-row">
          <div className="so-header-field">
            <label className="so-header-label">Customer Code</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={soCustomerCode}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Customer Name</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={soCustomerName}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Contact Person</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={soContactPerson}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Contact Email</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={soContactEmail}
              readOnly
            />
          </div>
        </div>

        {/* Row 2: PO No | SRT Number | Project Name | Port */}
        <div className="so-header-row">
          <div className="so-header-field">
            <label className="so-header-label">PO No <span className="so-required">*</span></label>
            <input
              type="text"
              className={"so-header-input" + (!soPoNo && !readOnly ? " so-input-required" : "")}
              placeholder="Enter PO No..."
              value={soPoNo}
              onChange={handleChange("soPoNo")}
              readOnly={readOnly}
              required
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">SRT Number</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={srtNumber}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Project Name <span className="so-required">*</span></label>
            <input
              type="text"
              className={"so-header-input" + (!soProjectName && !readOnly ? " so-input-required" : "")}
              placeholder="Enter project name..."
              value={soProjectName}
              onChange={handleChange("soProjectName")}
              readOnly={readOnly}
              required
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Port</label>
            <select
              className="so-header-select"
              value={soPort}
              onChange={handleChange("soPort")}
              disabled={readOnly}
            >
              <option value="">Select Port...</option>
              {portOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Branch | SO No | Posting Date | Delivery Date */}
        <div className="so-header-row">
          <div className="so-header-field">
            <label className="so-header-label">Branch</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={branch}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">SO No</label>
            <input
              type="text"
              className="so-header-input so-header-input-readonly"
              value={soSoNo}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Posting Date</label>
            <input
              type="date"
              className="so-header-input so-header-input-readonly"
              value={soPostingDate}
              readOnly
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Delivery Date</label>
            <input
              type="date"
              className="so-header-input"
              value={soDeliveryDate}
              onChange={handleChange("soDeliveryDate")}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Row 4: Document Date | Ship Name | BP Currency | Status | Conversion rate (USD/EURO/SAR placeholder) */}
        <div className="so-header-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          <div className="so-header-field">
            <label className="so-header-label">Document Date</label>
            <input
              type="date"
              className="so-header-input"
              value={soDocumentDate}
              onChange={handleChange("soDocumentDate")}
              readOnly={readOnly}
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">Ship Name</label>
            <input
              type="text"
              className="so-header-input"
              placeholder="Enter ship name..."
              value={soShipName}
              onChange={handleChange("soShipName")}
              readOnly={readOnly}
            />
          </div>
          <div className="so-header-field">
            <label className="so-header-label">BP Currency</label>
            <select
              className="so-header-select"
              value={soBpCurrency}
              onChange={handleChange("soBpCurrency")}
              disabled={readOnly}
            >
              <option value="">—</option>
              {BP_CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c === "EURO" ? "EURO (€)" : c}</option>
              ))}
            </select>
          </div>
          <div className="so-header-field">
            {soBpCurrency === "USD" && (
              <>
                <label className="so-header-label">USD → SAR Rate</label>
                <span className="so-currency-rate so-currency-rate-block">
                  1 USD = {USD_TO_SAR_RATE} SAR
                </span>
              </>
            )}
            {soBpCurrency === "EURO" && (
              <>
                <label className="so-header-label">Conversion Rate (€ → SAR) <span className="so-required">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={"so-header-input" + (!soEuroRate && !readOnly ? " so-input-required" : "")}
                  placeholder="Enter EUR → SAR rate..."
                  value={soEuroRate}
                  onChange={handleChange("soEuroRate")}
                  readOnly={readOnly}
                  required
                />
              </>
            )}
            {soBpCurrency !== "USD" && soBpCurrency !== "EURO" && (
              <>
                <label className="so-header-label">&nbsp;</label>
                <input
                  type="text"
                  className="so-header-input so-header-input-readonly"
                  value=""
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </>
            )}
          </div>
          <div className="so-header-field so-header-field-status">
            <label className="so-header-label">Status</label>
            <span className={"so-status-badge so-status-" + soStatusBadgeClass}>
              {soStatusDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {/* <div className="sales-order-summary-section">
        <div className="sales-order-summary-grid">
          <div className="sales-order-summary-item">
            <label className="sales-order-summary-label">Billing Entity</label>
            <div className="sales-order-summary-value">{billingEntity}</div>
          </div>
          <div className="sales-order-summary-item">
            <label className="sales-order-summary-label">Email</label>
            <div className="sales-order-summary-value">{soContactEmail}</div>
          </div>
          <div className="sales-order-summary-item sales-order-summary-item-highlight">
            <label className="sales-order-summary-label">Line Item Total</label>
            <div className="sales-order-summary-value sales-order-summary-total">
              {formatCurrencySAR(calculatedLineItemTotal)}
            </div>
          </div>
        </div>
      </div> */}

      {/* Add Item Accordion */}
      {!readOnly && isAccordionOpen && (
        <div className="sales-order-add-accordion" style={{ "--card-color": cardColor }}>
          <div className="sales-order-add-accordion-header">
            <h4 className="sales-order-add-accordion-title">Add New Sales Order Item</h4>
            <button
              type="button"
              onClick={handleCancel}
              className="sales-order-add-accordion-close"
              style={{ color: cardColor }}
            >
              ×
            </button>
          </div>
          <div className="sales-order-add-accordion-body">
            <div className="sales-order-add-form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="sales-order-add-form-field">
                <label>Call File</label>
                <select
                  value={newItemForm.callFile}
                  onChange={(e) => handleFormChange("callFile", e.target.value)}
                  className="sales-order-add-form-input"
                >
                  <option value="">Select Call File...</option>
                  <option value="CALL-001">CALL-001</option>
                  <option value="CALL-002">CALL-002</option>
                  <option value="CALL-003">CALL-003</option>
                  <option value="CALL-004">CALL-004</option>
                  <option value="CALL-005">CALL-005</option>
                </select>
              </div>
              <div className="sales-order-add-form-field">
                <label>Item No <span style={{ color: "#e53935" }}>*</span></label>
                <input
                  type="text"
                  value={newItemForm.itemNo}
                  onChange={(e) => handleFormChange("itemNo", e.target.value)}
                  placeholder="e.g., ITEM-001"
                  className="sales-order-add-form-input"
                  required
                />
              </div>
              <div className="sales-order-add-form-field" style={{ gridColumn: "span 2" }}>
                <label>Item Description <span style={{ color: "#e53935" }}>*</span></label>
                <input
                  type="text"
                  value={newItemForm.itemDescription}
                  onChange={(e) => handleFormChange("itemDescription", e.target.value)}
                  placeholder="e.g., Container Handling Service"
                  className="sales-order-add-form-input"
                  required
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newItemForm.qty}
                  onChange={(e) => handleFormChange("qty", e.target.value)}
                  placeholder="1"
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemForm.unitPrice}
                  onChange={(e) => handleFormChange("unitPrice", e.target.value)}
                  placeholder="0.00"
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newItemForm.discount}
                  onChange={(e) => handleFormChange("discount", e.target.value)}
                  placeholder="0"
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Tax Code</label>
                <select
                  value={newItemForm.taxCode}
                  onChange={(e) => handleFormChange("taxCode", e.target.value)}
                  className="sales-order-add-form-input"
                >
                  {TAX_CODE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sales-order-add-form-field">
                <label>Type of PO</label>
                <select
                  value={newItemForm.typeOfPo}
                  onChange={(e) => handleFormChange("typeOfPo", e.target.value)}
                  className="sales-order-add-form-input"
                >
                  <option value="">— Select —</option>
                  {TYPE_OF_PO_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sales-order-add-form-field">
                <label>Document Picker</label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="text"
                    value={newItemForm.documents?.length ? formatDocumentCount(newItemForm.documents) : ""}
                    readOnly
                    placeholder="— Select documents —"
                    className="sales-order-add-form-input"
                    style={{ flex: 1, cursor: "default", background: "#f6f7fb" }}
                  />
                  <button
                    type="button"
                    onClick={() => setDocumentModalTarget("new")}
                    style={{ flexShrink: 0, padding: "6px 12px", fontSize: "12px", border: "1px solid #b3baff", borderRadius: "5px", background: "#f0f2ff", color: "#2A00FF", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                  >
                    {newItemForm.documents?.length ? "Change" : "Select"}
                  </button>
                </div>
              </div>
              <div className="sales-order-add-form-field">
                <label>Supplier Code</label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="text"
                    value={newItemForm.supplierCode ? `${newItemForm.supplierCode} — ${newItemForm.supplierName}` : ""}
                    readOnly
                    placeholder="— Select vendor —"
                    className="sales-order-add-form-input"
                    style={{ flex: 1, cursor: "default", background: "#f6f7fb" }}
                  />
                  <button
                    type="button"
                    onClick={() => setVendorModalTarget("new")}
                    style={{ flexShrink: 0, padding: "6px 12px", fontSize: "12px", border: "1px solid #b3baff", borderRadius: "5px", background: "#f0f2ff", color: "#2A00FF", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                  >
                    {newItemForm.supplierCode ? "Change" : "Select"}
                  </button>
                </div>
              </div>
            </div>
            <div className="sales-order-add-form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="sales-order-add-form-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewItem}
                className="btn btn-primary sales-order-add-form-save"
                style={{ backgroundColor: "#00368c" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bulk Action Bar */}
      {!isDAModule && selectedItems.size > 0 && (
        <div
          ref={bulkActionBarRef}
          style={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderTop: "2px solid #00368c",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 100,
            marginTop: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontWeight: "600", color: "#1a1a1a" }}>
              {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                padding: "4px 12px",
                backgroundColor: "transparent",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Clear Selection
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                padding: "8px 20px",
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGeneratePO}
              style={{
                padding: "8px 20px",
                backgroundColor: "#e2e6ff",
                color: "rgb(44, 54, 73)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Generate PO
            </button>
            <button
              type="button"
              onClick={handleGenerateWorkOrder}
              style={{
                padding: "8px 20px",
                backgroundColor: "#e2e6ff",
                color: "rgb(44, 54, 73)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Generate Work Order
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper sales-order-table-container" style={{ position: "relative" }}>
        {isLoadingSalesOrder && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              backgroundColor: "rgba(255, 255, 255, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
            aria-busy="true"
            aria-live="polite"
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #e2e8f0",
                borderTopColor: cardColor || "#2A00FF",
                borderRadius: "50%",
                animation: "salesOrderSpin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes salesOrderSpin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Loading sales order…</span>
          </div>
        )}
        {/* Tooltips for table headers (DAModule only, labels > 10 chars) */}
        {isDAModule && (
          <>
            <Tooltip id="header-tooltip-item-description" place="top" content="Item Description" className="small-header-tooltip" />
            <Tooltip id="header-tooltip-total-amount" place="top" content="Total Amount" className="small-header-tooltip" />
          </>
        )}
        <table className="table table-striped sales-order-table sales-order-list-table" style={{ "--card-color": "#e2e6ff" }}>
          <thead>
            <tr>
              {!isDAModule && <th className="col-checkbox"></th>}
              {renderTableHeader("Item No", "col-item-no")}
              {renderTableHeader("Item Description", "col-item-desc")}
              {renderTableHeader("Quantity", "col-qty")}
              {renderTableHeader("Unit Price", "col-unit-price")}
              {renderTableHeader("Discount %", "col-discount")}
              {renderTableHeader("Tax Code", "col-tax")}
              {renderTableHeader("Total Amount", "col-total")}
              {renderTableHeader("Type of PO", "col-type-po")}
              {renderTableHeader("Document Picker", "col-documents")}
              {renderTableHeader("Supplier Code", "col-supplier")}
            </tr>
          </thead>
          <tbody>
            {displayOrderList.length === 0 && !isLoadingSalesOrder && (
              <tr>
                <td
                  colSpan={isDAModule ? 10 : 11}
                  style={{ padding: "28px 16px", textAlign: "center", color: "#64748b", fontSize: "14px" }}
                >
                  No sales order line items for this call.
                </td>
              </tr>
            )}
            {/* Render grouped items with accordion (2+ items per callFile) */}
            {Object.entries(grouped).map(([callFile, orders]) => {
              if (orders.length < 2) {
                // If only 1 item, render as regular row
                return renderOrderRow(orders[0]);
              }

              const isExpanded = expandedCallFiles.has(callFile);
              const groupAllSelected = isGroupAllSelected(orders);
              const groupSomeSelected = isGroupSomeSelected(orders);

              return (
                <React.Fragment key={callFile}>
                  {/* Accordion header row */}
                  <tr
                    className="sales-order-accordion-header-row"
                    onClick={(e) => {
                      // Don't toggle if clicking on checkbox
                      if (!isDAModule && e.target.type === "checkbox") {
                        e.stopPropagation();
                        return;
                      }
                      toggleCallFileAccordion(callFile);
                    }}
                    style={{ cursor: "pointer", backgroundColor: isExpanded ? "rgba(42, 0, 255, 0.05)" : "#ffffff" }}
                  >
                    <td colSpan={isDAModule ? 10 : 11} style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {!isDAModule && (
                            <GroupCheckbox
                              checked={groupAllSelected}
                              indeterminate={groupSomeSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleGroupSelectAll(callFile, orders, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <span
                            style={{
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                              color: cardColor,
                              fontWeight: "bold",
                              fontSize: "16px"
                            }}
                          >
                            ▶
                          </span>
                          <span style={{ fontWeight: "600", color: "#1a1a1a" }}>
                            Call File: {callFile}
                          </span>
                          <span style={{
                            fontSize: "12px",
                            color: "#666",
                            backgroundColor: "rgba(42, 0, 255, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "12px"
                          }}>
                            {orders.length} item{orders.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* Accordion content rows */}
                  {isExpanded && orders.map((order) => renderOrderRow(order))}
                </React.Fragment>
              );
            })}
            {/* Render ungrouped items (no callFile) */}
            {ungrouped.map((order) => renderOrderRow(order))}
          </tbody>
        </table>
      </div>

      {/* Accounting Summary Panel */}
      {(() => {
        const amountFromForm = (v) => {
          if (v == null || v === "") return null;
          const n = parseFloat(String(v).replace(/,/g, ""));
          return Number.isFinite(n) ? n : null;
        };

        const subtotalCalc = displayOrderList.reduce((sum, item) => {
          const qty = parseFloat(item.qty) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          return sum + qty * unitPrice;
        }, 0);
        const totalDiscountCalc = displayOrderList.reduce((sum, item) => {
          const qty = parseFloat(item.qty) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discount = parseFloat(item.discount) || 0;
          return sum + qty * unitPrice * (discount / 100);
        }, 0);
        const totalTaxCalc = displayOrderList.reduce((sum, item) => {
          const qty = parseFloat(item.qty) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discount = parseFloat(item.discount) || 0;
          const taxRate = (parseFloat(String(item.taxCode || "").replace(/%/g, "")) || 0) / 100;
          const discountedTotal = qty * unitPrice * (1 - discount / 100);
          return sum + discountedTotal * taxRate;
        }, 0);
        const grandTotalCalc = subtotalCalc - totalDiscountCalc + totalTaxCalc;

        const subtotal = amountFromForm(formValues.soSubtotal) ?? subtotalCalc;
        const totalDiscount = amountFromForm(formValues.soTotalDiscount) ?? totalDiscountCalc;
        const totalTax = amountFromForm(formValues.soTotalTax) ?? totalTaxCalc;
        const grandTotal = amountFromForm(formValues.soGrandTotal) ?? grandTotalCalc;
        const currencyLabel = soBpCurrency === "EURO" ? "EURO (€)" : soBpCurrency;

        return (
          <div className="so-accounting-summary">
            <div className="so-accounting-title">
              <span className="so-accounting-title-bar"></span>
              ACCOUNTING SUMMARY
            </div>
            <div className="so-accounting-body">
              {/* Left: info fields */}
              <div className="so-accounting-info">
                <div className="so-accounting-info-field">
                  <label className="so-accounting-info-label">Owner</label>
                  <input
                    type="text"
                    className="so-accounting-info-value"
                    value={formValues.soOwner || ""}
                    readOnly
                  />
                </div>
                <div className="so-accounting-info-field">
                  <label className="so-accounting-info-label">Project Name</label>
                  <input
                    type="text"
                    className="so-accounting-info-value"
                    value={formValues.soProjectName || ""}
                    readOnly
                  />
                </div>
                <div className="so-accounting-info-field">
                  <label className="so-accounting-info-label">Remarks</label>
                  <textarea
                    className="so-accounting-info-textarea"
                    placeholder="Enter remarks..."
                    value={formValues.soRemarks || ""}
                    onChange={readOnly ? undefined : handleChange("soRemarks")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              {/* Right: accounting card */}
              <div className="so-accounting-right">
                <div className="so-accounting-card-title">Accounting</div>
                <div className="so-accounting-grid">
                  <div className="so-accounting-row">
                    <span className="so-accounting-label">Currency</span>
                    <span className="so-accounting-value so-accounting-currency">{currencyLabel}</span>
                  </div>
                  <div className="so-accounting-divider" />
                  <div className="so-accounting-row">
                    <span className="so-accounting-label">Subtotal</span>
                    <span className="so-accounting-value">{formatCurrencySAR(subtotal)}</span>
                  </div>
                  {formValues.soDiscountPercentage != null && String(formValues.soDiscountPercentage).trim() !== "" && (
                    <div className="so-accounting-row">
                      <span className="so-accounting-label">Discount %</span>
                      <span className="so-accounting-value">
                        {String(formValues.soDiscountPercentage).replace(/%$/, "")}%
                      </span>
                    </div>
                  )}
                  <div className="so-accounting-row">
                    <span className="so-accounting-label">Total Discount</span>
                    <span className="so-accounting-value so-accounting-discount">− {formatCurrencySAR(totalDiscount)}</span>
                  </div>
                  <div className="so-accounting-row">
                    <span className="so-accounting-label">Total Tax</span>
                    <span className="so-accounting-value">{formatCurrencySAR(totalTax)}</span>
                  </div>
                  <div className="so-accounting-divider" />
                  <div className="so-accounting-row so-accounting-grand">
                    <span className="so-accounting-label">Grand Total</span>
                    <span className="so-accounting-value so-accounting-grand-value">{formatCurrencySAR(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Work Order Creation Modal */}
      {showWorkOrderModal && (
        <WorkOrderCreationModal
          show={showWorkOrderModal}
          onClose={handleCloseWorkOrderModal}
          onCreate={handleCreateWorkOrder}
          selectedItems={Array.from(selectedItems)}
          salesOrderList={displayOrderList}
          cardColor={cardColor}
          vesselName={soShipName}
          portName={soPort}
        />
      )}

      {/* Preview Modal for DA Module (Generate Invoice / Create Purchase Order) */}
      {isDAModule && showPreviewModal && previewModalType && (
        <PreviewModal
          show={showPreviewModal}
          onClose={handleClosePreviewModal}
          onSend={handleSendPreview}
          modalType={previewModalType}
        />
      )}

      {/* Generate PO Loading Popup */}
      {showGeneratePOPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
          onClick={(e) => e.target === e.currentTarget && handleCloseGeneratePOPopup()}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "32px 48px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              minWidth: "280px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid #e0e0e0",
                borderTopColor: cardColor || "#2A00FF",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>Generating PO...</span>
            <button
              type="button"
              onClick={handleCloseGeneratePOPopup}
              style={{
                padding: "8px 20px",
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Vendor List Modal */}
      <VendorListModal
        show={vendorModalTarget !== null}
        onClose={() => setVendorModalTarget(null)}
        onSelect={handleVendorSelect}
      />

      {/* Document List Modal */}
      <DocumentListModal
        key={documentModalTarget ?? "closed"}
        show={documentModalTarget !== null}
        onClose={() => setDocumentModalTarget(null)}
        onSave={handleDocumentSave}
        initialSelected={getDocumentModalInitialSelected()}
      />
    </div>
  );
};

SalesOrderList.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  readOnly: PropTypes.bool,
  showPOStatus: PropTypes.bool,
  isDAModule: PropTypes.bool,
  isLoadingSalesOrder: PropTypes.bool,
  salesOrderError: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
};

export default SalesOrderList;

