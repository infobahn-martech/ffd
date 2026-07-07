import React from "react";
import PropTypes from "prop-types";

const formatCurrencySAR = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const calcLineAmounts = (item) => {
  const qty = parseFloat(item.qty) || 0;
  const unitPrice = parseFloat(item.unitPrice) || 0;
  const discount = parseFloat(item.discount) || 0;
  const taxRate = (parseFloat(String(item.taxCode || "0").replace(/%/g, "")) || 0) / 100;
  const subtotal = qty * unitPrice * (1 - discount / 100);
  const tax = subtotal * taxRate;
  const total = item.totalAmount ?? subtotal + tax;
  return { subtotal, tax, total };
};

// Generate PO Modal - printable PO preview only; submission result is reported via toast
const GeneratePOModal = ({
  show,
  onClose,
  onGenerate,
  isSubmitting = false,
  error,
  selectedItems,
  salesOrderList,
  soNumber = "",
  documentDate = "",
  customerCode = "",
  customerName = "",
  vesselName = "",
  portName = "",
  branch = "",
  shipVia = "",
  fob = "",
  shippingTerms = "",
  shippingFee = 0,
}) => {
  const selectedLineItems = salesOrderList.filter((item) => selectedItems.includes(item.id));

  const vendorNames = [...new Set(selectedLineItems.map((item) => item.supplierName).filter(Boolean))];
  const vendorCodes = [...new Set(selectedLineItems.map((item) => item.supplierCode).filter(Boolean))];
  const vendorLabel =
    vendorNames.length === 0
      ? "—"
      : vendorNames.length === 1
      ? vendorNames[0]
      : `Multiple Vendors (${vendorNames.length})`;
  const vendorCodeLabel = vendorCodes.length === 1 ? vendorCodes[0] : vendorCodes.join(", ") || "—";

  const lineAmounts = selectedLineItems.map((item) => ({ item, ...calcLineAmounts(item) }));
  const subtotal = lineAmounts.reduce((sum, l) => sum + l.subtotal, 0);
  const tax = lineAmounts.reduce((sum, l) => sum + l.tax, 0);
  const grandTotal = subtotal + tax + (parseFloat(shippingFee) || 0);

  const taxCodes = [...new Set(selectedLineItems.map((item) => item.taxCode).filter(Boolean))];
  const taxLabel = taxCodes.length === 1 ? `${taxCodes[0]} Tax/VAT` : "Tax/VAT";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  if (!show) return null;

  return (
    <div className="so-po-modal-backdrop" onClick={handleBackdropClick}>
      <div className="so-po-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="so-po-modal-close" onClick={onClose} disabled={isSubmitting}>
          ×
        </button>

        <div className="so-po-modal-body">
          <div className="so-po-doc">
            <h3 className="so-po-doc-title">PURCHASE ORDER</h3>

            <div className="so-po-doc-header">
              <div className="so-po-doc-company">
                <div className="so-po-doc-company-name">{branch || "Sedres"}</div>
                <div className="so-po-doc-party-sub">{customerCode}</div>
                <div className="so-po-doc-party-sub">{customerName}</div>
              </div>
              <div className="so-po-doc-meta">
                <div className="so-po-doc-meta-row">
                  <span className="so-po-doc-meta-label">Request No</span>
                  <span className="so-po-doc-meta-value">{soNumber || "—"}</span>
                </div>
                <div className="so-po-doc-meta-row">
                  <span className="so-po-doc-meta-label">Ship Via</span>
                  <span className="so-po-doc-meta-value">{shipVia || "—"}</span>
                </div>
                <div className="so-po-doc-meta-row">
                  <span className="so-po-doc-meta-label">FOB</span>
                  <span className="so-po-doc-meta-value">{fob || "—"}</span>
                </div>
                <div className="so-po-doc-meta-row">
                  <span className="so-po-doc-meta-label">Shipping Terms</span>
                  <span className="so-po-doc-meta-value">{shippingTerms || "—"}</span>
                </div>
                <div className="so-po-doc-meta-row">
                  <span className="so-po-doc-meta-label">Date</span>
                  <span className="so-po-doc-meta-value">
                    {documentDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            <div className="so-po-doc-parties">
              <div className="so-po-doc-party">
                <span className="so-po-doc-party-label">Vendor</span>
                <div className="so-po-doc-party-name">{vendorLabel}</div>
                <div className="so-po-doc-party-sub">{vendorCodeLabel}</div>
              </div>
              <div className="so-po-doc-party">
                <span className="so-po-doc-party-label">Ship To</span>
                <div className="so-po-doc-party-name">{vesselName || "—"}</div>
                <div className="so-po-doc-party-sub">{portName}</div>
              </div>
            </div>

            <table className="so-po-doc-table">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {lineAmounts.map(({ item, total }) => (
                  <tr key={item.id}>
                    <td>
                      <div className="so-po-doc-item-desc">{item.itemDescription || "—"}</div>
                      <div className="so-po-doc-item-no">{item.itemNo || ""}</div>
                    </td>
                    <td>{item.qty ?? 0}</td>
                    <td>{formatCurrencySAR(item.unitPrice)}</td>
                    <td>{formatCurrencySAR(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="so-po-doc-totals">
              <div className="so-po-doc-totals-row">
                <span>Sub Total</span>
                <span>{formatCurrencySAR(subtotal)}</span>
              </div>
              <div className="so-po-doc-totals-row">
                <span>{taxLabel}</span>
                <span>{formatCurrencySAR(tax)}</span>
              </div>
              {parseFloat(shippingFee) > 0 && (
                <div className="so-po-doc-totals-row">
                  <span>Shipping Fee</span>
                  <span>{formatCurrencySAR(shippingFee)}</span>
                </div>
              )}
              <div className="so-po-doc-totals-row so-po-doc-totals-grand">
                <span>Total</span>
                <span>{formatCurrencySAR(grandTotal)}</span>
              </div>
            </div>

            {error && <div className="so-po-doc-error">{error}</div>}
          </div>
        </div>

        <div className="so-po-modal-footer">
          <button type="button" className="so-po-btn so-po-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="so-po-btn so-po-btn-generate" onClick={onGenerate} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

GeneratePOModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
  selectedItems: PropTypes.arrayOf(PropTypes.number).isRequired,
  salesOrderList: PropTypes.array.isRequired,
  soNumber: PropTypes.string,
  documentDate: PropTypes.string,
  customerCode: PropTypes.string,
  customerName: PropTypes.string,
  vesselName: PropTypes.string,
  portName: PropTypes.string,
  branch: PropTypes.string,
  shipVia: PropTypes.string,
  fob: PropTypes.string,
  shippingTerms: PropTypes.string,
  shippingFee: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default GeneratePOModal;
