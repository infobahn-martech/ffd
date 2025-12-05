import { useEffect } from "react";
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

  return (
    <div className="cardform-left-full sales-order-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="sales-order-list-header">
        <h3 className="sales-order-list-title">
          <span className="sales-order-list-title-bar"></span>
          SALES ORDER LIST
        </h3>
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
                  <div className="sales-order-table-cell">{order.qty || 0}</div>
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

