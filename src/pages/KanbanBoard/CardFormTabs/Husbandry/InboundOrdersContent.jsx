import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CustomModal from "../../../../components/CustomModal";
import { FormField, FormInput, FormSelect } from "./Husbandry.components";
import editIcon from "../../../../assets/images/edit.svg";
import deleteIcon from "../../../../assets/images/delete.svg";

// Generate dummy inbound orders data
const generateDummyInboundOrders = () => {
  const packageTypes = ["Box", "Pallet", "Crate", "Bag", "Container"];
  const descriptions = [
    "Spare parts for vessel maintenance",
    "Safety equipment and supplies",
    "Food and beverage items",
    "Technical equipment",
    "Cleaning supplies",
    "Medical supplies",
    "Office supplies",
    "Tools and hardware"
  ];

  const dummyOrders = [];
  for (let i = 1; i <= 10; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

    dummyOrders.push({
      id: i,
      orderNo: `ORD-${String(i).padStart(5, '0')}`,
      date: orderDate.toISOString().split('T')[0],
      poDo: `PO-${String(i).padStart(4, '0')}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      packageType: packageTypes[Math.floor(Math.random() * packageTypes.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
    });
  }
  return dummyOrders;
};

const InboundOrdersContent = ({ formValues, handleChange, cardColor }) => {
  const [showModal, setShowModal] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({ 1: true }); // First order expanded by default

  // Form state - Basic Details
  const [formData, setFormData] = useState({
    date: "",
    vesselName: "",
    clientName: "",
    warehouse: "",
    orders: [{ id: 1, poDo: "", quantity: "", packageType: "", description: "" }], // Order Details array
  });

  // Dummy options for dropdowns
  const vesselOptions = [
    { value: "vessel1", label: "MV Ocean Star" },
    { value: "vessel2", label: "MV Red Sea" },
    { value: "vessel3", label: "MV Blue Wave" },
    { value: "vessel4", label: "MV Golden Sun" },
  ];

  const clientOptions = [
    { value: "client1", label: "Client A" },
    { value: "client2", label: "Client B" },
    { value: "client3", label: "Client C" },
    { value: "client4", label: "Client D" },
  ];

  const warehouseOptions = [
    { value: "warehouse1", label: "Warehouse 1" },
    { value: "warehouse2", label: "Warehouse 2" },
    { value: "warehouse3", label: "Warehouse 3" },
    { value: "warehouse4", label: "Warehouse 4" },
  ];

  // Initialize with dummy data on mount if empty
  useEffect(() => {
    const orders = formValues.inboundOrdersList || [];
    if (orders.length === 0) {
      const dummyData = generateDummyInboundOrders();
      const syntheticEvent = { target: { value: dummyData } };
      handleChange("inboundOrdersList")(syntheticEvent);
      setOrdersList(dummyData);
    } else {
      setOrdersList(orders);
    }
  }, [formValues.inboundOrdersList, handleChange]);

  // Update local list when formValues change
  useEffect(() => {
    if (formValues.inboundOrdersList) {
      setOrdersList(formValues.inboundOrdersList);
    }
  }, [formValues.inboundOrdersList]);

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      const orderItems = order.orders || [{ id: 1, poDo: "", quantity: "", packageType: "", description: "" }];
      setFormData({
        date: order.date || "",
        vesselName: order.vesselName || "",
        clientName: order.clientName || "",
        warehouse: order.warehouse || "",
        orders: orderItems,
      });
      // Set expanded state for all orders
      const expandedState = {};
      orderItems.forEach((item) => {
        expandedState[item.id] = true;
      });
      setExpandedOrders(expandedState);
    } else {
      setEditingOrder(null);
      setFormData({
        date: "",
        vesselName: "",
        clientName: "",
        warehouse: "",
        orders: [{ id: 1, poDo: "", quantity: "", packageType: "", description: "" }],
      });
      setExpandedOrders({ 1: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      date: "",
      vesselName: "",
      clientName: "",
      warehouse: "",
      orders: [{ id: 1, poDo: "", quantity: "", packageType: "", description: "" }],
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrderChange = (orderId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      ),
    }));
  };

  const handleAddNewOrder = () => {
    const newOrderId = formData.orders.length > 0 ? Math.max(...formData.orders.map((o) => o.id)) + 1 : 1;
    setFormData((prev) => ({
      ...prev,
      orders: [
        ...prev.orders,
        {
          id: newOrderId,
          poDo: "",
          quantity: "",
          packageType: "",
          description: "",
        },
      ],
    }));
    // Expand the new order by default
    setExpandedOrders((prev) => ({
      ...prev,
      [newOrderId]: true,
    }));
  };

  const handleRemoveOrder = (orderId) => {
    if (formData.orders.length > 1) {
      setFormData((prev) => ({
        ...prev,
        orders: prev.orders.filter((order) => order.id !== orderId),
      }));
      // Remove from expandedOrders if it exists
      setExpandedOrders((prev) => {
        const newExpanded = { ...prev };
        delete newExpanded[orderId];
        return newExpanded;
      });
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create orders from formData.orders array
    const newOrders = formData.orders.map((order, index) => ({
      id: editingOrder
        ? editingOrder.id + index
        : ordersList.length > 0
        ? Math.max(...ordersList.map((m) => m.id)) + index + 1
        : index + 1,
      orderNo: `ORD-${String(ordersList.length + index + 1).padStart(5, "0")}`,
      date: formData.date,
      vesselName: formData.vesselName,
      clientName: formData.clientName,
      warehouse: formData.warehouse,
      poDo: order.poDo,
      quantity: order.quantity,
      packageType: order.packageType,
      description: order.description,
    }));

    if (editingOrder) {
      // Update existing orders - replace all orders with same basic details
      const updatedList = ordersList.filter((order) => order.id !== editingOrder.id);
      const finalList = [...updatedList, ...newOrders];
      setOrdersList(finalList);

      // Update formValues
      const syntheticEvent = { target: { value: finalList } };
      handleChange("inboundOrdersList")(syntheticEvent);
    } else {
      // Create new orders
      const updatedList = [...ordersList, ...newOrders];
      setOrdersList(updatedList);

      // Update formValues
      const syntheticEvent = { target: { value: updatedList } };
      handleChange("inboundOrdersList")(syntheticEvent);
    }

    handleCloseModal();
  };

  const handleReset = () => {
    setFormData({
      date: "",
      vesselName: "",
      clientName: "",
      warehouse: "",
      orders: [{ id: 1, poDo: "", quantity: "", packageType: "", description: "" }],
    });
    setExpandedOrders({ 1: true });
  };

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updatedList = ordersList.filter(order => order.id !== orderId);
      setOrdersList(updatedList);

      // Update formValues
      const syntheticEvent = { target: { value: updatedList } };
      handleChange("inboundOrdersList")(syntheticEvent);
    }
  };

  const handleConvertToLanding = (order) => {
    // Convert order to landing note
    // This could navigate to Landing Note tab or add to landing notes list
    if (window.confirm("Convert this order to Landing Note?")) {
      // You can implement the conversion logic here
      // For now, just show a confirmation
      console.log("Converting order to landing:", order);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const packageTypeOptions = [
    { value: "Box", label: "Box" },
    { value: "Pallet", label: "Pallet" },
    { value: "Crate", label: "Crate" },
    { value: "Bag", label: "Bag" },
    { value: "Container", label: "Container" },
  ];

  const renderHeader = () => (
    <>
      <h1 className="modal-title">{editingOrder ? "Edit Inbound Order" : "Create Inbound Order"}</h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="inboundOrderForm" onSubmit={handleSubmit}>
          {/* Basic Details Section */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#1a1a1a" }}>
              Basic Details
            </h3>
            <div className="row mb-lg-3">
              <div className="col-md-3 mb-3">
                <FormField label="Date">
                  <div className="cf-input" style={{ position: "relative" }}>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange("date", e.target.value)}
                      placeholder="Select date"
                      style={{ width: "100%", paddingRight: "40px" }}
                    />
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#666",
                      }}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </FormField>
              </div>

              <div className="col-md-3 mb-3">
                <FormField label="Vessel Name">
                  <FormSelect
                    value={formData.vesselName}
                    onChange={(e) => handleFormChange("vesselName", e.target.value)}
                    options={vesselOptions}
                    placeholder="Select vessel"
                  />
                </FormField>
              </div>

              <div className="col-md-3 mb-3">
                <FormField label="Client Name">
                  <FormSelect
                    value={formData.clientName}
                    onChange={(e) => handleFormChange("clientName", e.target.value)}
                    options={clientOptions}
                    placeholder="Select client"
                  />
                </FormField>
              </div>

              <div className="col-md-3 mb-3">
                <FormField label="Warehouse">
                  <FormSelect
                    value={formData.warehouse}
                    onChange={(e) => handleFormChange("warehouse", e.target.value)}
                    options={warehouseOptions}
                    placeholder="Select warehouse"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#1a1a1a" }}>
                Order Details
              </h3>
              <button
                type="button"
                onClick={handleAddNewOrder}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "#00368c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add New Order
              </button>
            </div>

            {formData.orders.map((order, index) => (
              <div
                key={order.id}
                style={{
                  marginBottom: "12px",
                  border: "1px solid #e2e2ea",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div
                  onClick={() => toggleOrderExpand(order.id)}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a1a" }}>
                    Order {index + 1}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {formData.orders.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOrder(order.id);
                        }}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    )}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform: expandedOrders[order.id] ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path d="M6 9L12 15L18 9" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {expandedOrders[order.id] && (
                  <div style={{ padding: "16px", backgroundColor: "white" }}>
                    <div className="row mb-lg-3">
                      <div className="col-md-6 mb-3">
                        <FormField label="PO/DO">
                          <FormInput
                            type="text"
                            value={order.poDo}
                            onChange={(e) => handleOrderChange(order.id, "poDo", e.target.value)}
                            placeholder="Enter PO/DO number..."
                          />
                        </FormField>
                      </div>

                      <div className="col-md-6 mb-3">
                        <FormField label="Quantity">
                          <FormInput
                            type="number"
                            value={order.quantity}
                            onChange={(e) => handleOrderChange(order.id, "quantity", e.target.value)}
                            placeholder="Enter quantity..."
                          />
                        </FormField>
                      </div>

                      <div className="col-md-6 mb-3">
                        <FormField label="Package Type">
                          <FormSelect
                            value={order.packageType}
                            onChange={(e) => handleOrderChange(order.id, "packageType", e.target.value)}
                            options={packageTypeOptions}
                            placeholder="Select package type..."
                          />
                        </FormField>
                      </div>

                      <div className="col-md-6 mb-3">
                        <FormField label="Description">
                          <FormInput
                            type="text"
                            value={order.description}
                            onChange={(e) => handleOrderChange(order.id, "description", e.target.value)}
                            placeholder="Enter description..."
                          />
                        </FormField>
                      </div>
                    </div>
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
    <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px" }}>
      <button
        type="button"
        onClick={handleReset}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          color: "#333",
          border: "1px solid #e2e2ea",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Reset
      </button>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={handleCloseModal}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "1px solid #e2e2ea",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          form="inboundOrderForm"
          style={{
            padding: "10px 20px",
            backgroundColor: "#00368c",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="cardform-left-full material-management-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="material-list-header">
        <h3 className="material-list-title">
          <span className="material-list-title-bar"></span>
          INBOUND ORDERS
        </h3>
        <button
          type="button"
          className="material-add-btn"
          onClick={handleOpenModal}
          style={{ backgroundColor: "#00368c" }}
        >
          + Add
        </button>
      </div>
      <div className="table-wrapper table-responsive material-table-container">
        <table className="table table-striped material-table" style={{ "--card-color": "#e2e6ff" }}>
          <thead>
            <tr>
              <th>Order No</th>
              <th>Date</th>
              <th>PO/DO</th>
              <th>Quantity</th>
              <th>Package Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.length > 0 ? (
              ordersList.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="material-table-cell">{order.orderNo || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {formatDate(order.date)}
                    </div>
                  </td>
                  <td>
                    <div className="material-table-cell">{order.poDo || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{order.quantity || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{order.packageType || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{order.description || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      <div className="table-actions" style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <Tooltip 
                          id={`convert-${order.id}`} 
                          place="right" 
                          content="Convert to Landing"
                          className="material-table-tooltip"
                        />
                        <Tooltip 
                          id={`edit-${order.id}`} 
                          place="right" 
                          content="Edit"
                          className="material-table-tooltip"
                        />
                        <Tooltip 
                          id={`delete-${order.id}`} 
                          place="right" 
                          content="Delete"
                          className="material-table-tooltip"
                        />
                        <span
                          data-tooltip-id={`convert-${order.id}`}
                          type="button"
                          className="btn-action btn-convert"
                          onClick={() => handleConvertToLanding(order)}
                          style={{ 
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 18L4 16L6 18L8 16L10 18L12 16L14 18L16 16L18 18L20 16L22 18" stroke="#00368c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 10L12 4L22 10" stroke="#00368c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 4V18" stroke="#00368c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span
                          data-tooltip-id={`edit-${order.id}`}
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleOpenModal(order)}
                          style={{ 
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img src={editIcon} alt="edit" style={{ width: "18px", height: "18px" }} />
                        </span>
                        <span
                          data-tooltip-id={`delete-${order.id}`}
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(order.id)}
                          style={{ 
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img src={deleteIcon} alt="delete" style={{ width: "18px", height: "18px" }} />
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No inbound orders added yet. Click "Add" to add a new order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomModal
        className="material-management-modal"
        show={showModal}
        closeModal={handleCloseModal}
        header={renderHeader()}
        body={renderBody()}
        footer={renderFooter()}
      />
    </div>
  );
};

InboundOrdersContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default InboundOrdersContent;

