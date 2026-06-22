import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";
import CardTabListLoading from "../../../../../../../components/CardTabListLoading";
import eyeIcon from "../../../../../../../assets/images/eye.svg";
import inboundOrderService from "../../../../../../../services/inboundOrderService";
import orderHistoryService from "../../../../../../../services/orderHistoryService";

const OrderHistoryContent = ({ formValues, cardColor }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingChain, setViewingChain] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);

  const callId = Number(formValues?.call_id || formValues?.callId || formValues?.card_call_id || 0);

  useEffect(() => {
    if (!callId) return;
    setIsLoading(true);
    inboundOrderService
      .getAllInboundSummary(callId)
      .then((res) => {
        setOrders(res?.data?.data ?? []);
      })
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [callId]);

  const handleViewOrder = async (order) => {
    setViewingChain(null);
    setChainLoading(true);
    setShowViewModal(true);
    try {
      const res = await orderHistoryService.getOrderHistory("inbound", order.inbound_id);
      setViewingChain(res?.data?.data ?? null);
    } catch {
      setViewingChain(null);
    } finally {
      setChainLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingChain(null);
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
    if (chainLoading) {
      return (
        <div className="modal-body">
          <CardTabListLoading />
        </div>
      );
    }
    if (!viewingChain) {
      return (
        <div className="modal-body">
          <p className="note-empty-td">No data available.</p>
        </div>
      );
    }

    const { inbound, landing_note, dispatch_note } = viewingChain;

    return (
      <div className="modal-body">
        <div className="lead-form">
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-2">
              <strong>Inbound Order</strong>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Document No</label>
                <div className="cf-input">
                  <input type="text" value={inbound?.document_no || "—"} readOnly />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Date</label>
                <div className="cf-input">
                  <input type="text" value={formatDate(inbound?.date)} readOnly />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="cf-field">
                <label>Quantity</label>
                <div className="cf-input">
                  <input type="text" value={inbound?.quantity ?? "—"} readOnly />
                </div>
              </div>
            </div>

            <div className="col-12 mb-2 mt-2">
              <strong>Landing Note</strong>
            </div>
            {landing_note ? (
              <>
                <div className="col-12 mb-3">
                  <div className="cf-field">
                    <label>Document No</label>
                    <div className="cf-input">
                      <input type="text" value={landing_note.document_no || "—"} readOnly />
                    </div>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="cf-field">
                    <label>Date</label>
                    <div className="cf-input">
                      <input type="text" value={formatDate(landing_note.date)} readOnly />
                    </div>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="cf-field">
                    <label>Received From</label>
                    <div className="cf-input">
                      <input type="text" value={landing_note.received_from || "—"} readOnly />
                    </div>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="cf-field">
                    <label>Quantity</label>
                    <div className="cf-input">
                      <input type="text" value={landing_note.quantity ?? "—"} readOnly />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12 mb-3">
                <p className="text-muted small">Not created yet.</p>
              </div>
            )}

            <div className="col-12 mb-2 mt-2">
              <strong>Dispatch Note</strong>
            </div>
            {dispatch_note ? (
              <div className="col-12 mb-3">
                <div className="cf-field">
                  <label>Document No</label>
                  <div className="cf-input">
                    <input type="text" value={dispatch_note.document_no || "—"} readOnly />
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-12 mb-3">
                <p className="text-muted small">Not created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderViewFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-secondary" onClick={handleCloseViewModal}>
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
          {isLoading ? (
            <CardTabListLoading />
          ) : (
            <table className="table table-striped material-table inbound-table note-table">
              <thead className="note-thead">
                <tr>
                  <th>Inbound Order No</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.inbound_id}>
                      <td>
                        <div className="material-table-cell">{order.inbound_no || "—"}</div>
                      </td>
                      <td>
                        <div className="material-table-cell">{formatDate(order.inbound_date)}</div>
                      </td>
                      <td>
                        <div className="material-table-cell">{order.status || "—"}</div>
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
                    <td colSpan="4" className="note-empty-td">
                      No order history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
  handleChange: PropTypes.func,
  cardColor: PropTypes.string,
};

export default OrderHistoryContent;
