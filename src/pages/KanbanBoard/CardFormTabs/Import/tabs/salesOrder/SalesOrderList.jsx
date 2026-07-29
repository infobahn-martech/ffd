import React, { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { FiFilePlus, FiFileText, FiClipboard, FiTool, FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "../../../../../../design/scss/salesOrder.scss";
import { PORT_OPTIONS, PORT_OPTIONS_WITH_ID } from "../../../../../../shared/constants/ports";
import salesOrderService from "../../../../../../services/salesOrderService";
import callFileService from "../../../../../../services/callFileService";
import useAlertReducer from "../../../../../../store/AlertReducer";
import WorkOrderCreationModal from "./WorkOrderCreationModal";
import GeneratePOModal from "./GeneratePOModal";
import GoodsReceiptPOModal from "./GoodsReceiptPOModal";

const BP_CURRENCY_OPTIONS = ["SAR", "USD", "EURO"];
const USD_TO_SAR_RATE = 3.75;
const SALES_ORDER_PAGE_SIZE = 10;

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

const EMPTY_NEW_ITEM_FORM = {
  callFile: "",
  itemNo: "",
  tariffId: "",
  itemDescription: "",
  qty: "",
  unitPrice: "",
  discount: "0",
  taxCode: "15%",
  typeOfPo: "",
  supplierCode: "",
  supplierName: "",
  documents: [],
};

const isThirdParty = (value) => value === 1 || value === "1" || value === true;

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
      <div style={{ background: "#fff", borderRadius: "10px", width: "90%", maxWidth: "640px", maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a2e" }}>Select Supporting Documents</h3>
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
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", alignContent: "start" }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "24px", textAlign: "center", color: "#888", fontSize: "13px" }}>No documents found.</div>
          ) : (
            filtered.map((d) => {
              const isChecked = selected.has(d.id);
              return (
                <label
                  key={d.id}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 14px",
                    border: `1px solid ${isChecked ? "#b3baff" : "#e6e9f2"}`,
                    borderRadius: "10px",
                    background: isChecked ? "#f3f4ff" : "#ffffff",
                    boxShadow: isChecked ? "0 2px 8px rgba(42, 0, 255, 0.08)" : "0 1px 3px rgba(15, 23, 42, 0.05)",
                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = "#f7f8ff"; }}
                  onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = "#ffffff"; }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDocument(d.id)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0, accentColor: "#2A00FF" }}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "9px",
                      background: "#eef1ff",
                      color: "#2A00FF",
                      flexShrink: 0,
                    }}
                  >
                    <FiFileText size={20} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "600", minWidth: 0, wordBreak: "break-word" }}>{d.name}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5f8a", background: "#f0f2ff", padding: "2px 7px", borderRadius: "4px", alignSelf: "flex-start" }}>{d.type}</span>
                  </span>
                </label>
              );
            })
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

// Premium pagination control for the sales order table
const SalesOrderPagination = ({ page, total, limit, onPageChange, compact = false }) => {
  if (!total || total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    let rangeStart = Math.max(2, page - 1);
    let rangeEnd = Math.min(totalPages - 1, page + 1);
    if (page <= 2) rangeEnd = 4;
    if (page >= totalPages - 1) rangeStart = totalPages - 3;
    if (rangeStart > 2) pages.push("ellipsis-start");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push("ellipsis-end");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={`so-pagination${compact ? " so-pagination--compact" : ""}`}>
      <span className="so-pagination-info">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong> entries
      </span>
      <div className="so-pagination-controls">
        <button
          type="button"
          className="so-pagination-btn so-pagination-nav"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>
        {getPageNumbers().map((p) =>
          typeof p === "number" ? (
            <button
              key={p}
              type="button"
              className={`so-pagination-btn so-pagination-page${page === p ? " is-active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={p} className="so-pagination-ellipsis">
              &hellip;
            </span>
          )
        )}
        <button
          type="button"
          className="so-pagination-btn so-pagination-nav"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

SalesOrderPagination.propTypes = {
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

const SalesOrderList = ({
  card,
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

  // State for accordion and form
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showSummaryPopover, setShowSummaryPopover] = useState(false);
  const [expandedCallFiles, setExpandedCallFiles] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [newItemForm, setNewItemForm] = useState(EMPTY_NEW_ITEM_FORM);

  // Item code lookup + item details autofill (sales_order/get_item_codes, sales_order/get_item_details)
  const [itemCodeOptions, setItemCodeOptions] = useState([]);
  const [isLoadingItemCodes, setIsLoadingItemCodes] = useState(false);
  const [isLoadingItemDetails, setIsLoadingItemDetails] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  const callId = card?.call_id ?? card?.callId ?? null;

  // card_file/get_call_detail — the kanban `card` prop doesn't carry port_id/main_billing_entity_id,
  // so fetch it directly (same pattern used by Operation.jsx / General.jsx).
  const [callDetailData, setCallDetailData] = useState(null);

  useEffect(() => {
    if (!callId) {
      setCallDetailData(null);
      return;
    }
    let cancelled = false;
    callFileService
      .getCallDetail(callId)
      .then((response) => {
        if (cancelled) return;
        const body = response?.data;
        setCallDetailData(body?.data ?? body ?? null);
      })
      .catch(() => {
        if (!cancelled) setCallDetailData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const entityId =
    callDetailData?.main_billing_entity_id ??
    formValues.mainBillingEntity ??
    card?.main_billing_entity_id ??
    card?.mainBillingEntity ??
    null;
  const portId = useMemo(
    () =>
      callDetailData?.port_id ??
      card?.port_id ??
      card?.portId ??
      PORT_OPTIONS_WITH_ID.find((p) => p.name === soPort)?.id ??
      null,
    [callDetailData, card, soPort]
  );

  // State for checkbox selection (exclude DA module)
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [isGeneratingWorkOrder, setIsGeneratingWorkOrder] = useState(false);
  const bulkActionBarRef = useRef(null);

  // State for preview modal (DA module only)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewModalType, setPreviewModalType] = useState(null);

  // State for Generate PO modal
  const [showGeneratePOPopup, setShowGeneratePOPopup] = useState(false);
  const [isGeneratingPO, setIsGeneratingPO] = useState(false);
  const [generatePOError, setGeneratePOError] = useState(null);
  const [generatePOItemIds, setGeneratePOItemIds] = useState([]);

  // State for Goods Receipt PO (GRN) modal - opened via "Copy To" on the Generate PO modal
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [grnDetails, setGrnDetails] = useState(null);

  // State for vendor modal (row-level supplier picker)
  const [vendorModalTarget, setVendorModalTarget] = useState(null); // orderId or "new"

  // State for document modal (row-level document picker)
  const [documentModalTarget, setDocumentModalTarget] = useState(null); // orderId or "new"

  const displayOrderList = Array.isArray(salesOrderList) ? salesOrderList : [];

  const totalOrderCount = displayOrderList.length;
  const totalOrderPages = Math.max(1, Math.ceil(totalOrderCount / SALES_ORDER_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalOrderPages) setCurrentPage(totalOrderPages);
  }, [currentPage, totalOrderPages]);

  const paginationStart = (currentPage - 1) * SALES_ORDER_PAGE_SIZE;
  const paginatedOrderList = displayOrderList.slice(paginationStart, paginationStart + SALES_ORDER_PAGE_SIZE);

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

  const { grouped, ungrouped } = groupByCallFile(paginatedOrderList);

  // Load item codes for the SO's port as soon as the Sales Order tab is opened
  useEffect(() => {
    if (!portId) {
      setItemCodeOptions([]);
      return;
    }
    let cancelled = false;
    setIsLoadingItemCodes(true);
    salesOrderService
      .getItemCodes(portId)
      .then((response) => {
        if (cancelled) return;
        const body = response?.data;
        setItemCodeOptions(body?.status === "success" && Array.isArray(body?.data) ? body.data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setItemCodeOptions([]);
        useAlertReducer.getState().error("Failed to load item codes for the selected port.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingItemCodes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portId]);

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

  // Supporting Documents chip/button control (shared by table rows and add-item form)
  const renderSupportingDocsControl = (documents, onOpen, disabled = false) => {
    const count = documents?.length || 0;

    if (count > 0) {
      return (
        <div className="so-docs-control">
          <span className="so-docs-chip">
            <FiFileText className="so-docs-chip-icon" />
            <span className="so-docs-chip-count">
              {count} file{count > 1 ? "s" : ""}
            </span>
          </span>
          {!readOnly && (
            <button type="button" className="so-docs-action-btn" onClick={onOpen} disabled={disabled}>
              View/Edit
            </button>
          )}
        </div>
      );
    }

    if (readOnly) {
      return <span className="so-docs-empty">—</span>;
    }

    return (
      <button type="button" className="so-docs-add-btn" onClick={onOpen} disabled={disabled}>
        <FiFilePlus className="so-docs-add-icon" />
        Add Docs
      </button>
    );
  };

  // Row-level status badge (defaults to "Pending")
  const getRowStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("approve")) return "so-row-status-approved";
    if (s.includes("reject") || s.includes("cancel")) return "so-row-status-rejected";
    return "so-row-status-pending";
  };

  const handleAddNewItem = () => {
    setNewItemForm(EMPTY_NEW_ITEM_FORM);
    setIsAccordionOpen(true);
  };

  const handleFormChange = (field, value) => {
    setNewItemForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Item code selected from the port's tariff list — autofill description/price via get_item_details
  const handleItemCodeSelect = async (itemCode) => {
    const option = itemCodeOptions.find((o) => o.item_code === itemCode);
    setNewItemForm((prev) => ({ ...prev, itemNo: itemCode, tariffId: option?.tariff_id ?? "" }));

    if (!option?.tariff_id) return;

    setIsLoadingItemDetails(true);
    try {
      const response = await salesOrderService.getItemDetails(option.tariff_id, entityId);
      const body = response?.data;
      if (body?.status === "success" && body?.data) {
        const details = body.data;
        setNewItemForm((prev) => ({
          ...prev,
          itemDescription: details.item_name || prev.itemDescription,
          unitPrice: details.price ?? details.default_price ?? prev.unitPrice,
        }));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load item details.";
      useAlertReducer.getState().error(msg);
    } finally {
      setIsLoadingItemDetails(false);
    }
  };

  const handleSaveNewItem = async () => {
    if (!newItemForm.tariffId || !newItemForm.itemDescription) {
      alert("Please select an Item No");
      return;
    }
    if (!callId) {
      useAlertReducer.getState().error("No call identifier available for this card.");
      return;
    }
    if (isSavingItem) return;

    const payload = {
      call_id: callId,
      tariff_id: newItemForm.tariffId,
      quantity: parseFloat(newItemForm.qty) || 1,
      type_PO: newItemForm.typeOfPo || "",
      supporting_docu: (newItemForm.documents || []).map((d) => d.name).join(", "),
      vendor_id: newItemForm.supplierCode || "",
      discount: parseFloat(newItemForm.discount) || 0,
    };

    setIsSavingItem(true);
    try {
      const response = await salesOrderService.saveSalesOrderItem(payload);
      const body = response?.data;
      if (body?.status !== "success") {
        throw new Error(body?.message || "Failed to save sales order item.");
      }

      const currentList = salesOrderList.length > 0 ? salesOrderList : [];
      const maxId = currentList.length > 0 ? Math.max(...currentList.map((item) => item.id || 0)) : 0;

      const newItem = {
        id: body.so_item_id ?? maxId + 1,
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
        workOrder: "",
      };
      newItem.totalAmount = calcRowTotal(newItem);

      handleChange("salesOrderList")({ target: { value: [...currentList, newItem] } });
      useAlertReducer.getState().success("Sales order item saved successfully.");

      setIsAccordionOpen(false);
      setNewItemForm(EMPTY_NEW_ITEM_FORM);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save sales order item.";
      useAlertReducer.getState().error(msg);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleCancel = () => {
    setIsAccordionOpen(false);
    setNewItemForm(EMPTY_NEW_ITEM_FORM);
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

  const handleCreateWorkOrder = async () => {
    if (selectedItems.size === 0 || isGeneratingWorkOrder) return;

    const payload = { so_item_ids: Array.from(selectedItems) };
    setIsGeneratingWorkOrder(true);
    try {
      await salesOrderService.generateWorkOrder(payload.so_item_ids);
      useAlertReducer.getState().success("Work order generated successfully.");
      setShowWorkOrderModal(false);
      setSelectedItems(new Set());
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate work order.";
      useAlertReducer.getState().error(msg);
    } finally {
      setIsGeneratingWorkOrder(false);
    }
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
    setGeneratePOItemIds(Array.from(selectedItems));
    setGeneratePOError(null);
    setShowGeneratePOPopup(true);
  };

  const handleCloseGeneratePOPopup = () => {
    if (isGeneratingPO) return;
    setShowGeneratePOPopup(false);
  };

  const handleCopyToGoodsReceipt = (poDetails) => {
    setGrnDetails(poDetails);
    setShowGRNModal(true);
    setShowGeneratePOPopup(false);
  };

  const handleCloseGRNModal = () => {
    setShowGRNModal(false);
    setGrnDetails(null);
  };

  const handleConfirmGeneratePO = async (vendorRefNo) => {
    if (generatePOItemIds.length === 0 || isGeneratingPO) return;

    const discountPercentage =
      formValues.soDiscountPercentage != null && String(formValues.soDiscountPercentage).trim() !== ""
        ? Number(formValues.soDiscountPercentage)
        : 0;

    const payload = {
      so_item_ids: generatePOItemIds,
      vendor_ref_no: vendorRefNo || "",
      contact_person: soContactPerson,
      branch,
      currency: soBpCurrency,
      delivery_date: soDeliveryDate,
      document_date: soDocumentDate,
      discount_percentage: discountPercentage,
      rounding: 0,
      remarks: formValues.soRemarks || "",
    };

    setIsGeneratingPO(true);
    setGeneratePOError(null);
    try {
      const response = await salesOrderService.generatePO(payload);
      const body = response?.data;
      if (body?.status !== "success") {
        throw new Error(body?.message || "Failed to generate purchase order.");
      }

      useAlertReducer.getState().success("Purchase order generated successfully.");

      setShowGeneratePOPopup(false);
      setSelectedItems(new Set());
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate purchase order.";
      setGeneratePOError(msg);
      useAlertReducer.getState().error(msg);
    } finally {
      setIsGeneratingPO(false);
    }
  };

  const handleSendPreview = () => {
    // TODO: Implement send functionality
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
  const renderOrderRow = (order) => {
    const hasWorkOrder = Boolean(order.workOrder) || Number(order.woStatus) === 1;
    const defaultTypeOfPo = !isThirdParty(order.is_third_party) ? "Inhouse" : "";

    return (
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

      {/* Work Order No. */}
      <td>
        <div className="sales-order-table-cell">
          {order.workOrder || "—"}
        </div>
      </td>

      {/* Type of PO */}
      <td>
        <div className="sales-order-table-cell">
          {readOnly ? (order.typeOfPo || defaultTypeOfPo || "—") : (
            <select
              value={order.typeOfPo || defaultTypeOfPo}
              onChange={(e) => handleFieldChange(order.id, "typeOfPo", e.target.value)}
              className="sales-order-type-po-select"
              disabled={!hasWorkOrder}
            >
              <option value="">— Select —</option>
              {TYPE_OF_PO_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </td>

      {/* Third Party */}
      <td>
        <div className="sales-order-table-cell">
          {isThirdParty(order.is_third_party) ? (
            <FiCheck className="so-third-party-tick" aria-label="Third party" />
          ) : (
            <span className="so-docs-empty">—</span>
          )}
        </div>
      </td>

      {/* Supporting Documents */}
      <td>
        <div className="sales-order-table-cell">
          {renderSupportingDocsControl(order.documents, () => setDocumentModalTarget(order.id), !hasWorkOrder)}
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
                disabled={!hasWorkOrder}
              >
                {order.supplierCode ? "Change" : "Select"}
              </button>
            </>
          )}
        </div>
      </td>

      {/* Status */}
      <td>
        <div className="sales-order-table-cell">
          <span className={`so-row-status-badge ${getRowStatusClass(order.status)}`}>
            {order.status || "Pending"}
          </span>
        </div>
      </td>
    </tr>
    );
  };

  return (
    <div className="cardform-left-full sales-order-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="sales-order-list-header">
        <h3 className="sales-order-list-title">
          <span className="sales-order-list-title-bar"></span>
          SALES ORDER LIST
        </h3>
        <div className="sales-order-list-header-actions">
          <SalesOrderPagination
            page={currentPage}
            total={totalOrderCount}
            limit={SALES_ORDER_PAGE_SIZE}
            onPageChange={setCurrentPage}
            compact
          />
          <button
            type="button"
            className="sales-order-add-button sales-order-summary-button"
            onClick={() => setShowSummaryPopover(true)}
          >
            Summary
          </button>
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

      <div className="so-main-layout">
        {/* Left: SO Header Fields Panel — scrollable field list */}
        <div className="so-left-panel">
          <div className="so-left-panel-title">Order Details</div>
          <div className="so-left-field-list">
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
            {soBpCurrency === "USD" && (
              <div className="so-header-field">
                <label className="so-header-label">USD → SAR Rate</label>
                <span className="so-currency-rate so-currency-rate-block">
                  1 USD = {USD_TO_SAR_RATE} SAR
                </span>
              </div>
            )}
            {soBpCurrency === "EURO" && (
              <div className="so-header-field">
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
              </div>
            )}
          </div>
        </div>

        {/* Right: Table view + Accounting Summary — wider column */}
        <div className="so-right-panel">
          {/* Add Item Popover */}
          {!readOnly && isAccordionOpen && (
            <>
              <div className="sales-order-add-popover-backdrop" onClick={handleCancel} />
              <div className="sales-order-add-accordion sales-order-add-popover" style={{ "--card-color": cardColor }}>
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
                    <label>Item No <span style={{ color: "#e53935" }}>*</span></label>
                    <select
                      value={newItemForm.itemNo}
                      onChange={(e) => handleItemCodeSelect(e.target.value)}
                      className="sales-order-add-form-input"
                      disabled={!portId || isLoadingItemCodes || isLoadingItemDetails}
                      required
                    >
                      <option value="">
                        {!portId
                          ? "Select Port first..."
                          : isLoadingItemCodes
                          ? "Loading item codes..."
                          : "Select Item No..."}
                      </option>
                      {itemCodeOptions.map((o) => (
                        <option key={o.tariff_id} value={o.item_code}>{o.item_code}</option>
                      ))}
                    </select>
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
                    <label>Discount</label>
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
                    <label>Supporting Documents</label>
                    <div className="sales-order-add-form-docs">
                      {renderSupportingDocsControl(newItemForm.documents, () => setDocumentModalTarget("new"))}
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
                        className="sales-order-supplier-select-btn"
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
                    className="sales-order-add-form-save"
                    disabled={isSavingItem}
                  >
                    {isSavingItem ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              </div>
            </>
          )}

          {/* Accounting Summary Popover — opened via the Summary button in the header */}
          {showSummaryPopover && (() => {
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
              <div
                className="so-summary-modal-backdrop"
                onClick={(e) => { if (e.target === e.currentTarget) setShowSummaryPopover(false); }}
              >
                <div className="so-summary-modal">
                  <div className="so-summary-modal-header">
                    <h3 className="so-summary-modal-title">Accounting Summary</h3>
                    <button
                      type="button"
                      onClick={() => setShowSummaryPopover(false)}
                      className="so-summary-modal-close"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="so-summary-modal-body">
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
                          <span className="so-accounting-label">Discount</span>
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

          {/* Sticky Bulk Action Bar */}
          {!isDAModule && selectedItems.size > 0 && (
            <div ref={bulkActionBarRef} className="so-bulk-action-bar">
              <div className="so-bulk-action-info">
                <span className="so-bulk-action-count">
                  {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="so-bulk-btn so-bulk-btn-clear"
                >
                  Clear Selection
                </button>
              </div>
              <div className="so-bulk-action-buttons">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="so-bulk-btn so-bulk-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePO}
                  className="so-bulk-btn so-bulk-btn-generate-po"
                >
                  <FiClipboard className="so-bulk-btn-icon" />
                  Generate PO
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWorkOrder}
                  className="so-bulk-btn so-bulk-btn-generate-wo"
                >
                  <FiTool className="so-bulk-btn-icon" />
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
                  {renderTableHeader("Discount", "col-discount")}
                  {renderTableHeader("Tax Code", "col-tax")}
                  {renderTableHeader("Total Amount", "col-total")}
                  {renderTableHeader("Work Order No.", "col-work-order")}
                  {renderTableHeader("Type of PO", "col-type-po")}
                  {renderTableHeader("Third Party", "col-third-party")}
                  {renderTableHeader("Supporting Documents", "col-documents")}
                  {renderTableHeader("Supplier Code", "col-supplier")}
                  {renderTableHeader("Status", "col-status")}
                </tr>
              </thead>
              <tbody>
                {displayOrderList.length === 0 && !isLoadingSalesOrder && (
                  <tr>
                    <td
                      colSpan={isDAModule ? 13 : 14}
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
                        <td colSpan={isDAModule ? 13 : 14} style={{ padding: "12px 16px" }}>
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
        </div>
      </div>

      {/* Work Order Creation Modal */}
      {showWorkOrderModal && (
        <WorkOrderCreationModal
          show={showWorkOrderModal}
          onClose={handleCloseWorkOrderModal}
          onGenerate={handleCreateWorkOrder}
          isSubmitting={isGeneratingWorkOrder}
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

      {/* Generate PO Modal */}
      {showGeneratePOPopup && (
        <GeneratePOModal
          show={showGeneratePOPopup}
          onClose={handleCloseGeneratePOPopup}
          onGenerate={handleConfirmGeneratePO}
          isSubmitting={isGeneratingPO}
          error={generatePOError}
          selectedItems={generatePOItemIds}
          salesOrderList={displayOrderList}
          soNumber={soSoNo}
          status={formValues.soStatus || ""}
          postingDate={soPostingDate}
          deliveryDate={soDeliveryDate}
          documentDate={soDocumentDate}
          branch={branch}
          contactPerson={soContactPerson}
          localCurrency={soBpCurrency}
          owner={formValues.soOwner || ""}
          remarks={formValues.soRemarks || ""}
          onCopyToGoodsReceipt={handleCopyToGoodsReceipt}
        />
      )}

      {/* Goods Receipt PO (GRN) Modal - opened via Copy To on the Generate PO modal */}
      {showGRNModal && (
        <GoodsReceiptPOModal show={showGRNModal} onClose={handleCloseGRNModal} poDetails={grnDetails} />
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
  card: PropTypes.object,
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

