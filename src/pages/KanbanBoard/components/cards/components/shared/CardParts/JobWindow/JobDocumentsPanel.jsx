import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import PropTypes from "prop-types";
import kanbanBoardService from "../../../../../../../../services/kanbanBoardService";
import { notify } from "../../../../../../../../components/Toaster";

const DOCUMENT_TYPES = [
  { key: "rate_request", label: "Rate Request File" },
  { key: "quotation", label: "Quotation File" },
  { key: "costing", label: "Costing File" },
  { key: "delivery_note", label: "Delivery Note" },
];

const APPROVAL_LABELS = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

/**
 * Controlled documents tab — Rate Request/Quotation/Costing/Delivery Note. Mock
 * records only (metadata + approval lifecycle): no real PDF/template output exists
 * anywhere in this codebase, so "Download" is an honest no-op, not a fake file.
 * The margin/sale approval rule (margin < 15% or sale > SR.5000) is enforced in
 * mockKanbanBoardService.generateDocument (src/mocks/ffd/index.js) and surfaces
 * on the Dashboard's Pending Approvals panel once generated.
 */
function JobDocumentsPanel({ card }) {
  const cardId = card?.id ?? card?.card_id;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].key);
  const [marginPercent, setMarginPercent] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [generating, setGenerating] = useState(false);

  const needsMarginFields = selectedType === "quotation" || selectedType === "costing";

  const loadDocuments = useCallback(() => {
    if (!cardId) return;
    setLoading(true);
    kanbanBoardService
      .listDocumentsForCard(cardId)
      .then((res) => setDocuments(res?.data?.data ?? []))
      .finally(() => setLoading(false));
  }, [cardId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleGenerate = async () => {
    if (!cardId) return;
    setGenerating(true);
    try {
      const res = await kanbanBoardService.generateDocument({
        card_id: cardId,
        document_type: selectedType,
        margin_percent: needsMarginFields && marginPercent !== "" ? Number(marginPercent) : null,
        sale_amount: needsMarginFields && saleAmount !== "" ? Number(saleAmount) : null,
        fields: card?.job?.numbers || {},
      });
      const body = res?.data;
      if (body?.status === "error") throw new Error(body.message || "Could not generate document.");
      notify(
        body?.data?.needs_manager_approval
          ? "Document generated — pending manager approval."
          : "Document generated.",
        "success"
      );
      setMarginPercent("");
      setSaleAmount("");
      loadDocuments();
    } catch (err) {
      notify(err?.message || "Could not generate document.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (documentId) => {
    try {
      await kanbanBoardService.approveDocument({ document_id: documentId });
      notify("Document approved.", "success");
      loadDocuments();
    } catch {
      notify("Could not approve document.", "error");
    }
  };

  const handleDownload = () => {
    notify("Download isn't available in demo mode.", "info");
  };

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <FileText size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Documents</div>
      </div>
      <div className="cf-section-body">
        <div className="job-documents-generate-row">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          {needsMarginFields && (
            <>
              <input
                type="number"
                placeholder="Margin %"
                value={marginPercent}
                onChange={(e) => setMarginPercent(e.target.value)}
              />
              <input
                type="number"
                placeholder="Sale amount (SR)"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
              />
            </>
          )}
          <button type="button" onClick={handleGenerate} disabled={generating}>
            Generate
          </button>
        </div>

        {loading ? (
          <p className="followups-subheading">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="followups-subheading">No documents generated yet.</p>
        ) : (
          <ul className="job-documents-list">
            {documents.map((doc) => {
              const typeLabel = DOCUMENT_TYPES.find((t) => t.key === doc.document_type)?.label ?? doc.document_type;
              return (
                <li key={doc.document_id} className="job-documents-list-item">
                  <div className="job-documents-list-main">
                    <span className="job-documents-list-type">{typeLabel}</span>
                    <span className="job-documents-list-date">{formatDate(doc.generated_at)}</span>
                    {doc.approval_status !== "none" && (
                      <span className={`job-documents-status job-documents-status--${doc.approval_status}`}>
                        {APPROVAL_LABELS[doc.approval_status] ?? doc.approval_status}
                      </span>
                    )}
                  </div>
                  <div className="job-documents-list-actions">
                    {doc.approval_status === "pending" && (
                      <button type="button" onClick={() => handleApprove(doc.document_id)}>
                        Approve
                      </button>
                    )}
                    <button type="button" onClick={handleDownload}>
                      Download
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

JobDocumentsPanel.propTypes = {
  card: PropTypes.object,
};

export default JobDocumentsPanel;
