import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Generate dummy sales order data
const generateDummySalesOrders = () => {
  const itemNames = ["Container Service", "Shipping Documentation", "Cargo Handling", "Storage Service", "Customs Clearance", "Freight Forwarding", "Warehouse Service", "Distribution Service"];
  const itemCodes = ["ITEM-001", "ITEM-002", "ITEM-003", "ITEM-004", "ITEM-005", "ITEM-006", "ITEM-007", "ITEM-008"];

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

    dummyOrders.push({
      id: i,
      lineItemCode: itemCodes[itemIndex],
      lineItemName: itemNames[itemIndex],
      startedDate: startDate.toISOString(),
      completedDate: completedDate.toISOString(),
      vatPercentage: vatPercentage,
      qty: qty,
      unitPrice: unitPrice,
      totalUnitAmount: totalUnitAmount,
      vatAmount: vatAmount,
      totalInSARWithVAT: totalWithVAT,
    });
  }
  return dummyOrders;
};

const SalesOrderList = ({ formValues, handleChange, cardColor }) => {
  const salesOrderList = formValues.salesOrderList || [];
  const billingEntity = formValues.billingEntity || "ABC Shipping Co.";
  const email = formValues.email || "billing@abccompany.com";
  const lineItem = formValues.lineItem || "Container Service";
  const lineItemTotal = formValues.lineItemTotal || 0;

  // State for accordion and form
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    lineItemCode: "",
    lineItemName: "",
    startedDate: "",
    startedTime: "",
    completedDate: "",
    completedTime: "",
    vatPercentage: 15,
    qty: 1,
    unitPrice: 100,
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
    const currentDate = new Date();
    const completedDate = new Date(currentDate);
    completedDate.setDate(completedDate.getDate() + 7);

    const formatDateForInput = (date) => {
      return date.toISOString().split('T')[0];
    };

    const formatTimeForInput = (date) => {
      return date.toTimeString().split(' ')[0].substring(0, 5);
    };

    setNewItemForm({
      lineItemCode: "",
      lineItemName: "",
      startedDate: formatDateForInput(currentDate),
      startedTime: formatTimeForInput(currentDate),
      completedDate: formatDateForInput(completedDate),
      completedTime: formatTimeForInput(completedDate),
      vatPercentage: 15,
      qty: 1,
      unitPrice: 100,
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

    // Combine date and time for startedDate
    const startedDateTime = newItemForm.startedDate && newItemForm.startedTime
      ? new Date(`${newItemForm.startedDate}T${newItemForm.startedTime}`).toISOString()
      : new Date().toISOString();

    // Combine date and time for completedDate
    const completedDateTime = newItemForm.completedDate && newItemForm.completedTime
      ? new Date(`${newItemForm.completedDate}T${newItemForm.completedTime}`).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const qty = parseFloat(newItemForm.qty) || 0;
    const unitPrice = parseFloat(newItemForm.unitPrice) || 0;
    const vatPercentage = parseFloat(newItemForm.vatPercentage) || 0;
    
    const totalUnitAmount = qty * unitPrice;
    const vatAmount = (totalUnitAmount * vatPercentage) / 100;
    const totalInSARWithVAT = totalUnitAmount + vatAmount;

    const newItem = {
      id: newId,
      lineItemCode: newItemForm.lineItemCode,
      lineItemName: newItemForm.lineItemName,
      startedDate: startedDateTime,
      completedDate: completedDateTime,
      vatPercentage: vatPercentage,
      qty: qty,
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
      lineItemCode: "",
      lineItemName: "",
      startedDate: "",
      startedTime: "",
      completedDate: "",
      completedTime: "",
      vatPercentage: 15,
      qty: 1,
      unitPrice: 100,
    });
  };

  const handleCancel = () => {
    setIsAccordionOpen(false);
    setNewItemForm({
      lineItemCode: "",
      lineItemName: "",
      startedDate: "",
      startedTime: "",
      completedDate: "",
      completedTime: "",
      vatPercentage: 15,
      qty: 1,
      unitPrice: 100,
    });
  };

  return (
    <div className="cardform-left-full sales-order-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="sales-order-list-header">
        <h3 className="sales-order-list-title">
          <span className="sales-order-list-title-bar"></span>
          SALES ORDER LIST
        </h3>
        <button
          type="button"
          onClick={handleAddNewItem}
          className="sales-order-add-button"
          style={{
            backgroundColor: cardColor,
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          <span>+</span>
          <span>Add Item</span>
        </button>
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
            <label className="sales-order-summary-label">Line Item Count</label>
            <div className="sales-order-summary-value sales-order-summary-total">
              {formValues?.salesOrderList?.length || 0}
            </div>
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
      {isAccordionOpen && (
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
            <div className="sales-order-add-form-grid">
              <div className="sales-order-add-form-field">
                <label>Line Item Code *</label>
                <input
                  type="text"
                  value={newItemForm.lineItemCode}
                  onChange={(e) => handleFormChange("lineItemCode", e.target.value)}
                  placeholder="e.g., ITEM-001"
                  className="sales-order-add-form-input"
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
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Started Date</label>
                <input
                  type="date"
                  value={newItemForm.startedDate}
                  onChange={(e) => handleFormChange("startedDate", e.target.value)}
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Started Time</label>
                <input
                  type="time"
                  value={newItemForm.startedTime}
                  onChange={(e) => handleFormChange("startedTime", e.target.value)}
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Completed Date</label>
                <input
                  type="date"
                  value={newItemForm.completedDate}
                  onChange={(e) => handleFormChange("completedDate", e.target.value)}
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Completed Time</label>
                <input
                  type="time"
                  value={newItemForm.completedTime}
                  onChange={(e) => handleFormChange("completedTime", e.target.value)}
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>VAT Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newItemForm.vatPercentage}
                  onChange={(e) => handleFormChange("vatPercentage", e.target.value)}
                  className="sales-order-add-form-input"
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
                  className="sales-order-add-form-input"
                />
              </div>
              <div className="sales-order-add-form-field">
                <label>Unit Price (SAR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemForm.unitPrice}
                  onChange={(e) => handleFormChange("unitPrice", e.target.value)}
                  className="sales-order-add-form-input"
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
                className="sales-order-add-form-save"
                style={{ backgroundColor: cardColor }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper table-responsive sales-order-table-container">
        <table className="table table-striped sales-order-table" style={{ "--card-color": cardColor }}>
          <thead>
            <tr>
              <th>LinedItem Code</th>
              <th>LinedItem Name</th>
              <th>Started</th>
              <th>Completed</th>
              <th>VAT (%)</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total Unit Amount</th>
              <th>VAT Amount</th>
              <th>Total in SAR with VAT</th>
            </tr>
          </thead>
          <tbody>
            {displayOrderList.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="sales-order-table-cell">
                    {order.lineItemCode || ""}
                  </div>
                </td>
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
                  </div>
                </td>
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
            ))}
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
};

export default SalesOrderList;

