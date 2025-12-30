import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../components/CustomModal";
import { FormField, FormInput, FormSelect } from "./Husbandry.components";

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

  // Form state
  const [formData, setFormData] = useState({
    orderNo: "",
    date: "",
    poDo: "",
    quantity: "",
    packageType: "",
    description: "",
  });

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

  const handleOpenModal = () => {
    setFormData({
      orderNo: "",
      date: "",
      poDo: "",
      quantity: "",
      packageType: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      orderNo: "",
      date: "",
      poDo: "",
      quantity: "",
      packageType: "",
      description: "",
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOrder = {
      id: ordersList.length > 0 ? Math.max(...ordersList.map(m => m.id)) + 1 : 1,
      orderNo: formData.orderNo || `ORD-${String(ordersList.length + 1).padStart(5, '0')}`,
      date: formData.date,
      poDo: formData.poDo,
      quantity: formData.quantity,
      packageType: formData.packageType,
      description: formData.description,
    };

    const updatedList = [...ordersList, newOrder];
    setOrdersList(updatedList);

    // Update formValues
    const syntheticEvent = { target: { value: updatedList } };
    handleChange("inboundOrdersList")(syntheticEvent);

    handleCloseModal();
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
      <h1 className="modal-title">Add Inbound Order</h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="inboundOrderForm" onSubmit={handleSubmit}>
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-3">
              <FormField label="Order No">
                <FormInput
                  type="text"
                  value={formData.orderNo}
                  onChange={(e) => handleFormChange("orderNo", e.target.value)}
                  placeholder="Enter order number..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Date">
                <div className="cf-input">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    placeholder="Select date"
                  />
                </div>
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="PO/DO">
                <FormInput
                  type="text"
                  value={formData.poDo}
                  onChange={(e) => handleFormChange("poDo", e.target.value)}
                  placeholder="Enter PO/DO number..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Quantity">
                <FormInput
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  placeholder="Enter quantity..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Package Type">
                <FormSelect
                  value={formData.packageType}
                  onChange={(e) => handleFormChange("packageType", e.target.value)}
                  options={packageTypeOptions}
                  placeholder="Select package type..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Description">
                <FormInput
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Enter description..."
                />
              </FormField>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCloseModal}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="inboundOrderForm"
        className="btn btn-primary"
        style={{ backgroundColor: "#00368c" }}
      >
        Add Order
      </button>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
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

