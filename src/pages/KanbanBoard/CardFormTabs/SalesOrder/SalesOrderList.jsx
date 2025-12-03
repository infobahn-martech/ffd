import { useEffect } from "react";
import PropTypes from "prop-types";

// Generate dummy sales order data
const generateDummySalesOrders = () => {
  const customers = ["ABC Shipping Co.", "Global Logistics Ltd.", "Maritime Transport Inc.", "Ocean Freight Solutions", "International Cargo Group"];
  const statuses = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];
  const paymentStatuses = ["Paid", "Pending", "Partial", "Overdue"];

  const dummyOrders = [];
  for (let i = 1; i <= 20; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 30) + 7);

    dummyOrders.push({
      id: i,
      orderNumber: `SO-${String(10000 + i).padStart(6, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      orderDate: orderDate.toISOString().split('T')[0],
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      amount: (Math.random() * 100000 + 10000).toFixed(2),
      items: Math.floor(Math.random() * 10) + 1,
    });
  }
  return dummyOrders;
};

const SalesOrderList = ({ formValues, handleChange, cardColor }) => {
  const salesOrderList = formValues.salesOrderList || [];

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Pending: "status-pending",
      Confirmed: "status-confirmed",
      "In Progress": "status-in-progress",
      Completed: "status-completed",
      Cancelled: "status-cancelled",
    };
    return statusMap[status] || "";
  };

  const getPaymentStatusClass = (status) => {
    const statusMap = {
      Paid: "payment-paid",
      Pending: "payment-pending",
      Partial: "payment-partial",
      Overdue: "payment-overdue",
    };
    return statusMap[status] || "";
  };

  return (
    <div className="cardform-left-full sales-order-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="sales-order-list-header">
        <h3 className="sales-order-list-title">
          <span className="sales-order-list-title-bar"></span>
          SALES ORDER LIST
        </h3>
      </div>
      <div className="table-wrapper table-responsive sales-order-table-container">
        <table className="table table-striped sales-order-table" style={{ "--card-color": cardColor }}>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Amount</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {displayOrderList.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="sales-order-table-cell">{order.orderNumber || ""}</div>
                </td>
                <td>
                  <div className="sales-order-table-cell">{order.customerName || ""}</div>
                </td>
                <td>
                  <div className="sales-order-table-cell">{formatDate(order.orderDate)}</div>
                </td>
                <td>
                  <div className="sales-order-table-cell">{formatDate(order.deliveryDate)}</div>
                </td>
                <td>
                  <div className={`sales-order-table-cell ${getStatusClass(order.status)}`}>
                    {order.status || ""}
                  </div>
                </td>
                <td>
                  <div className={`sales-order-table-cell ${getPaymentStatusClass(order.paymentStatus)}`}>
                    {order.paymentStatus || ""}
                  </div>
                </td>
                <td>
                  <div className="sales-order-table-cell">{formatCurrency(order.amount)}</div>
                </td>
                <td>
                  <div className="sales-order-table-cell">{order.items || 0}</div>
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

