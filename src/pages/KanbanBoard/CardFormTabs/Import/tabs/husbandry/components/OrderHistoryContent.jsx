import { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import CardTabListLoading from "../../../../../../../components/CardTabListLoading";
import inboundOrderService from "../../../../../../../services/inboundOrderService";
import orderHistoryService from "../../../../../../../services/orderHistoryService";
import "../../../../../../../design/scss/order-history.scss";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const stripHtml = (value) => (value ? String(value).replace(/<[^>]*>/g, "").trim() : "");

const FieldRow = ({ label, value }) => (
  <div className="order-history-field">
    <span className="order-history-field-label">{label}</span>
    <span className="order-history-field-value">
      {value !== null && value !== undefined && value !== "" ? value : "—"}
    </span>
  </div>
);

FieldRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const OrderHistoryContent = ({ formValues, cardColor }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [chainLoadingIds, setChainLoadingIds] = useState(() => new Set());
  const [chainCache, setChainCache] = useState({});

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

  const fetchChain = async (inboundId) => {
    setChainLoadingIds((prev) => new Set(prev).add(inboundId));
    try {
      const res = await orderHistoryService.getOrderHistory("inbound", inboundId);
      setChainCache((prev) => ({ ...prev, [inboundId]: res?.data?.data ?? null }));
    } catch {
      setChainCache((prev) => ({ ...prev, [inboundId]: null }));
    } finally {
      setChainLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(inboundId);
        return next;
      });
    }
  };

  const toggleExpand = (order) => {
    const id = order.inbound_id;
    const isExpanding = !expandedIds.has(id);

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (isExpanding && chainCache[id] === undefined) {
      fetchChain(id);
    }
  };

  const renderChainSections = (order) => {
    const id = order.inbound_id;
    if (chainLoadingIds.has(id)) {
      return <CardTabListLoading message="Loading details..." cardColor={cardColor} />;
    }

    const chain = chainCache[id];
    if (!chain) {
      return <p className="note-empty-td order-history-empty">No details available.</p>;
    }

    const { landing_note: landingNote, dispatch_note: dispatchNote } = chain;

    return (
      <div className="order-history-sections">
        <div className="order-history-section">
          <div className="order-history-section-title">Landing Note</div>
          {landingNote ? (
            <div className="order-history-fields">
              <FieldRow label="Document No" value={landingNote.document_no} />
              <FieldRow label="Date" value={formatDate(landingNote.landing_date || landingNote.date)} />
              <FieldRow label="Received From" value={landingNote.received_from} />
              <FieldRow label="Quantity" value={landingNote.quantity} />
            </div>
          ) : (
            <p className="order-history-not-created">Not created yet.</p>
          )}
        </div>

        <div className="order-history-section">
          <div className="order-history-section-title">Dispatch Note</div>
          {dispatchNote ? (
            <div className="order-history-fields">
              <FieldRow label="Document No" value={dispatchNote.document_no} />
              <FieldRow label="Date" value={formatDate(dispatchNote.dispatch_date || dispatchNote.date)} />
              <FieldRow label="Delivered To" value={dispatchNote.delivered_to} />
              <FieldRow label="Remarks" value={stripHtml(dispatchNote.remarks)} />
            </div>
          ) : (
            <p className="order-history-not-created">Not created yet.</p>
          )}
        </div>
      </div>
    );
  };

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
            <CardTabListLoading message="Loading orders..." cardColor={cardColor} />
          ) : (
            <table className="table table-striped material-table inbound-table note-table">
              <thead className="note-thead">
                <tr>
                  <th width="44" className="custom-table-expand-header" aria-label="Expand row" />
                  <th>Inbound Order No</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const isExpanded = expandedIds.has(order.inbound_id);
                    return (
                      <Fragment key={order.inbound_id}>
                        <tr className="order-history-row">
                          <td className="custom-table-expand-cell">
                            <button
                              type="button"
                              className="order-history-expand-toggle"
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              onClick={() => toggleExpand(order)}
                            >
                              <span className={`custom-table-expand-chevron${isExpanded ? " is-open" : ""}`} />
                            </button>
                          </td>
                          <td>
                            <div className="material-table-cell">{order.inbound_no || "—"}</div>
                          </td>
                          <td>
                            <div className="material-table-cell">{formatDate(order.inbound_date)}</div>
                          </td>
                          <td>
                            <div className="material-table-cell">{order.status || "—"}</div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="custom-table-expanded-row">
                            <td colSpan={4} className="p-0">
                              <div className="custom-table-expanded-inner">
                                {renderChainSections(order)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
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
    </div>
  );
};

OrderHistoryContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func,
  cardColor: PropTypes.string,
};

export default OrderHistoryContent;
