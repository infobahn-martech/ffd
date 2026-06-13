import { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";
import eyeIcon from "../../../../../../../assets/images/eye.svg";

// Generate dummy order history data
const generateDummyOrderHistory = () => {
  const dummyOrders = [];
  for (let i = 1; i <= 10; i++) {
    const inboundDate = new Date();
    inboundDate.setDate(inboundDate.getDate() - Math.floor(Math.random() * 60));
    const landingDate = new Date(inboundDate);
    landingDate.setDate(landingDate.getDate() + Math.floor(Math.random() * 5) + 1);

    dummyOrders.push({
      id: i,
      inboundOrderNo: `INB-${String(i).padStart(5, "0")}`,
      inboundDate: inboundDate.toISOString().split("T")[0],
      landingNoteNo: i % 3 === 0 ? "" : `LN-${String(i).padStart(5, "0")}`,
      landingNoteDate: i % 3 === 0 ? "" : landingDate.toISOString().split("T")[0],
    });
  }
  return dummyOrders;
};

const OrderHistoryContent = ({ formValues, handleChange, cardColor }) => {
  const [orderHistory] = useState(generateDummyOrderHistory());
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingOrder(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderViewHeader = () => (
    <h1 className="modal-title">Order History Details</h1>
  );

  const renderViewBody = () => {
    if (!viewingOrder) return null;
    return (
      <div className="modal-body">
        <div className="lead-form">
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Inbound Order No</label>
                <div className="cf-input">
                  <input type="text" value={viewingOrder.inboundOrderNo || ""} readOnly />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Inbound Date</label>
                <div className="cf-input">
                  <input type="text" value={formatDate(viewingOrder.inboundDate)} readOnly />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Landing Note Number</label>
                <div className="cf-input">
                  <input type="text" value={viewingOrder.landingNoteNo || "—"} readOnly />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Landing Note Date</label>
                <div className="cf-input">
                  <input type="text" value={formatDate(viewingOrder.landingNoteDate)} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCloseViewModal}
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="cardform-left-full material-management-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="material-list-header">
        <h3 className="material-list-title">
          <span className="material-list-title-bar"></span>
          Order History
        </h3>
      </div>
      <div className="table-wrapper table-responsive material-table-container note-table-container">
        <div className="note-table-scroll">
          <table className="table table-striped material-table inbound-table note-table">
            <thead className="note-thead">
              <tr>
                <th>Inbound Order No</th>
                <th>Inbound Date</th>
                <th>Landing Note Number</th>
                <th>Landing Note Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.length > 0 ? (
                orderHistory.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="material-table-cell">{order.inboundOrderNo}</div>
                    </td>
                    <td>
                      <div className="material-table-cell">{formatDate(order.inboundDate)}</div>
                    </td>
                    <td>
                      <div className="material-table-cell">{order.landingNoteNo || "—"}</div>
                    </td>
                    <td>
                      <div className="material-table-cell">{formatDate(order.landingNoteDate)}</div>
                    </td>
                    <td className="note-actions-td">
                      <div className="material-table-cell note-actions-cell">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order)}
                          className="note-action-btn"
                        >
                          <img src={eyeIcon} alt="view" className="note-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="note-empty-td">
                    No order history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomModal
        className="material-management-modal"
        show={showViewModal}
        closeModal={handleCloseViewModal}
        header={renderViewHeader()}
        body={renderViewBody()}
        footer={renderViewFooter()}
      />
    </div>
  );
};

OrderHistoryContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default OrderHistoryContent;