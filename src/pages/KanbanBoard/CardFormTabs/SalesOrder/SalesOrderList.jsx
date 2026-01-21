import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Generate dummy sales order data
const generateDummySalesOrders = () => {
  const itemNames = ["Container Service", "Shipping Documentation", "Cargo Handling", "Storage Service", "Customs Clearance", "Freight Forwarding", "Warehouse Service", "Distribution Service"];
  const itemCodes = ["ITEM-001", "ITEM-002", "ITEM-003", "ITEM-004", "ITEM-005", "ITEM-006", "ITEM-007", "ITEM-008"];
  const callFiles = ["CALL-001", "CALL-002", "CALL-003", "CALL-004", null]; // Some items may not have callFile
  const poStatuses = ["Draft", "Issued", "Completed"]; // PO Status options

  const dummyOrders = [];
  for (let i = 1; i <= 20; i++) {
    const itemIndex = Math.floor(Math.random() * itemNames.length);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
    const completedDate = new Date(startDate);
    completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 30) + 7);

    const vatPercentage = [5, 15, 20][Math.floor(Math.random() * 3)];
    const qty = Math.floor(Math.random() * 100) + 1;
    const unitPrice = Math.random() * 5000 + 100;
    const totalUnitAmount = qty * unitPrice;
    const vatAmount = (totalUnitAmount * vatPercentage) / 100;
    const totalWithVAT = totalUnitAmount + vatAmount;

    // Assign callFile - some items share the same callFile to create groups
    const callFileIndex = Math.floor(Math.random() * callFiles.length);
    const callFile = callFiles[callFileIndex];

    // Assign random PO Status
    const poStatusIndex = Math.floor(Math.random() * poStatuses.length);
    const poStatus = poStatuses[poStatusIndex];

    dummyOrders.push({
      id: i,
      callFile: callFile,
      lineItemCode: itemCodes[itemIndex],
      lineItemName: itemNames[itemIndex],
      startedDate: startDate.toISOString(),
      completedDate: completedDate.toISOString(),
      vatPercentage: vatPercentage,
      qty: qty,
      poStatus: poStatus,
      unitPrice: unitPrice,
      totalUnitAmount: totalUnitAmount,
      vatAmount: vatAmount,
      totalInSARWithVAT: totalWithVAT,
    });
  }
  return dummyOrders;
};

const SalesOrderList = ({ formValues, handleChange, cardColor, readOnly = false, showPOStatus = false }) => {
  const salesOrderList = formValues.salesOrderList || [];
  const billingEntity = formValues.billingEntity || "ABC Shipping Co.";
  const email = formValues.email || "billing@abccompany.com";
  const lineItem = formValues.lineItem || "Container Service";
  const lineItemTotal = formValues.lineItemTotal || 0;

  // State for accordion and form
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [expandedCallFiles, setExpandedCallFiles] = useState(new Set());
  const [newItemForm, setNewItemForm] = useState({
    callFile: "",
    lineItemCode: "",
    lineItemName: "",
  });

  // Initialize with dummy data on mount if empty
  useEffect(() => {
    if (!formValues.salesOrderList || formValues.salesOrderList.length === 0) {
      const dummyData = generateDummySalesOrders();
      const syntheticEvent = { target: { value: dummyData } };
      handleChange("salesOrderList")(syntheticEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const displayOrderList = salesOrderList.length > 0 ? salesOrderList : generateDummySalesOrders();

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

  // Calculate total line item total from list if not provided
  const calculatedLineItemTotal = lineItemTotal || displayOrderList.reduce((sum, item) => {
    return sum + (parseFloat(item.totalInSARWithVAT) || 0);
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

  const handleQtyChange = (orderId, newQty) => {
    const updatedList = salesOrderList.map((order) => {
      if (order.id === orderId) {
        const qty = parseFloat(newQty) || 0;
        const unitPrice = parseFloat(order.unitPrice) || 0;
        const vatPercentage = parseFloat(order.vatPercentage) || 0;

        const totalUnitAmount = qty * unitPrice;
        const vatAmount = (totalUnitAmount * vatPercentage) / 100;
        const totalInSARWithVAT = totalUnitAmount + vatAmount;

        return {
          ...order,
          qty: qty,
          totalUnitAmount: totalUnitAmount,
          vatAmount: vatAmount,
          totalInSARWithVAT: totalInSARWithVAT,
        };
      }
      return order;
    });

    const syntheticEvent = { target: { value: updatedList } };
    handleChange("salesOrderList")(syntheticEvent);
  };

  const handleAddNewItem = () => {
    // Set default values and open accordion
    setNewItemForm({
      callFile: "",
      lineItemCode: "",
      lineItemName: "",
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
    // Validate required fields
    if (!newItemForm.lineItemCode || !newItemForm.lineItemName) {
      alert("Please fill in Line Item Code and Line Item Name");
      return;
    }

    const currentList = salesOrderList.length > 0 ? salesOrderList : [];

    // Generate a unique ID for the new item
    const maxId = currentList.length > 0
      ? Math.max(...currentList.map(item => item.id || 0))
      : 0;
    const newId = maxId + 1;

    // Set default values for removed fields
    const currentDate = new Date();
    const completedDate = new Date(currentDate);
    completedDate.setDate(completedDate.getDate() + 7);

    const startedDateTime = currentDate.toISOString();
    const completedDateTime = completedDate.toISOString();

    const qty = 1;
    const unitPrice = 100;
    const vatPercentage = 15;
    const poStatuses = ["Draft", "Issued", "Completed"];
    const poStatus = poStatuses[Math.floor(Math.random() * poStatuses.length)];

    const totalUnitAmount = qty * unitPrice;
    const vatAmount = (totalUnitAmount * vatPercentage) / 100;
    const totalInSARWithVAT = totalUnitAmount + vatAmount;

    const newItem = {
      id: newId,
      callFile: newItemForm.callFile || null,
      lineItemCode: newItemForm.lineItemCode,
      lineItemName: newItemForm.lineItemName,
      startedDate: startedDateTime,
      completedDate: completedDateTime,
      vatPercentage: vatPercentage,
      qty: qty,
      poStatus: poStatus,
      unitPrice: unitPrice,
      totalUnitAmount: totalUnitAmount,
      vatAmount: vatAmount,
      totalInSARWithVAT: totalInSARWithVAT,
    };

    const updatedList = [...currentList, newItem];
    const syntheticEvent = { target: { value: updatedList } };
    handleChange("salesOrderList")(syntheticEvent);

    // Reset form and close accordion
    setIsAccordionOpen(false);
    setNewItemForm({
      callFile: "",
      lineItemCode: "",
      lineItemName: "",
    });
  };

  const handleCancel = () => {
    setIsAccordionOpen(false);
    setNewItemForm({
      callFile: "",
      lineItemCode: "",
      lineItemName: "",
    });
  };

  // Render a single order row
  const renderOrderRow = (order) => (
    <tr key={order.id}>
      <td>
        <div className="sales-order-table-cell">
          {order.lineItemName || ""}
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          <div className="sales-order-date">{formatDate(order.startedDate)}</div>
          <div className="sales-order-time">{formatTime(order.startedDate)}</div>
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          <div className="sales-order-date">{formatDate(order.completedDate)}</div>
          <div className="sales-order-time">{formatTime(order.completedDate)}</div>
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          {order.vatPercentage ? `${order.vatPercentage}%` : ""}
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          {readOnly ? (
            (order.qty ?? 0)
          ) : (
            <input
              type="number"
              min="0"
              step="1"
              value={order.qty || 0}
              onChange={(e) => handleQtyChange(order.id, e.target.value)}
              className="sales-order-qty-input"
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "4px 8px",
                textAlign: "center",
                fontSize: "14px",
              }}
            />
          )}
        </div>
      </td>
      {showPOStatus && (
        <td>
          <div className="sales-order-table-cell">
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
                color: getPOStatusColor(order.poStatus || "Draft"),
                backgroundColor: getPOStatusBgColor(order.poStatus || "Draft"),
                border: `1px solid ${getPOStatusColor(order.poStatus || "Draft")}`,
              }}
            >
              {order.poStatus || "Draft"}
            </span>
          </div>
        </td>
      )}
      <td>
        <div className="sales-order-table-cell">
          {formatCurrencySAR(order.unitPrice || 0)}
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          {formatCurrencySAR(order.totalUnitAmount || 0)}
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell">
          {formatCurrencySAR(order.vatAmount || 0)}
        </div>
      </td>
      <td>
        <div className="sales-order-table-cell sales-order-table-cell-total">
          {formatCurrencySAR(order.totalInSARWithVAT || 0)}
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

      {/* Summary Section */}
      <div className="sales-order-summary-section">
        <div className="sales-order-summary-grid">
          <div className="sales-order-summary-item">
            <label className="sales-order-summary-label">Billing Entity</label>
            <div className="sales-order-summary-value">{billingEntity}</div>
          </div>
          <div className="sales-order-summary-item">
            <label className="sales-order-summary-label">Email</label>
            <div className="sales-order-summary-value">{email}</div>
          </div>
          <div className="sales-order-summary-item sales-order-summary-item-highlight">
            <label className="sales-order-summary-label">Line Item Total</label>
            <div className="sales-order-summary-value sales-order-summary-total">
              {formatCurrencySAR(calculatedLineItemTotal)}
            </div>
          </div>
        </div>
      </div>

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
            <div className="sales-order-add-form-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
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
                <label>Line Item Code *</label>
                <input
                  type="text"
                  value={newItemForm.lineItemCode}
                  onChange={(e) => handleFormChange("lineItemCode", e.target.value)}
                  placeholder="e.g., ITEM-001"
                  className="sales-order-add-form-input"
                  required
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Line Item Name *</label>
                <input
                  type="text"
                  value={newItemForm.lineItemName}
                  onChange={(e) => handleFormChange("lineItemName", e.target.value)}
                  placeholder="e.g., Container Service"
                  className="sales-order-add-form-input"
                  required
                />
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

      <div className="table-wrapper table-responsive sales-order-table-container">
        <table className="table table-striped sales-order-table" style={{ "--card-color": "#e2e6ff" }}>
          <thead>
            <tr>
              <th>LinedItem Name</th>
              <th>Started</th>
              <th>Completed</th>
              <th>VAT (%)</th>
              <th>Qty</th>
              {showPOStatus && <th>PO Status</th>}
              <th>Unit Price</th>
              <th>Total Unit Amount</th>
              <th>VAT Amount</th>
              <th>Total in SAR with VAT</th>
            </tr>
          </thead>
          <tbody>
            {/* Render grouped items with accordion (2+ items per callFile) */}
            {Object.entries(grouped).map(([callFile, orders]) => {
              if (orders.length < 2) {
                // If only 1 item, render as regular row
                return renderOrderRow(orders[0]);
              }

              const isExpanded = expandedCallFiles.has(callFile);
              const groupTotal = orders.reduce((sum, item) => sum + (parseFloat(item.totalInSARWithVAT) || 0), 0);

              return (
                <React.Fragment key={callFile}>
                  {/* Accordion header row */}
                  <tr
                    className="sales-order-accordion-header-row"
                    onClick={() => toggleCallFileAccordion(callFile)}
                    style={{ cursor: "pointer", backgroundColor: isExpanded ? "rgba(42, 0, 255, 0.05)" : "#ffffff" }}
                  >
                    <td colSpan={showPOStatus ? 10 : 9} style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                        <div style={{ fontWeight: "600", color: "rgb(120, 120, 120)", paddingRight: "13px" }}>
                          Total: {formatCurrencySAR(groupTotal)}
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
  );
};

SalesOrderList.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  readOnly: PropTypes.bool,
  showPOStatus: PropTypes.bool,
};

export default SalesOrderList;

