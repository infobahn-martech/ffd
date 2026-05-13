import { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { notify } from "../../../../../../components/Toaster";
import groService from "../../../../../../services/groService";
import GroSummaryCard from "./GroSummaryCard";
import InwardClearanceView, { InwardClearanceToolbar } from "./InwardClearanceView";
import PassRequestsView from "./PassRequestsView";
import {
  GRO_MAIN_VIEWS,
  buildGroFallbackDocuments,
  enrichGroDocWithRowKey,
  parseGroDocumentsResponse,
  groApiErrorMessage,
  resolveGroCallId,
  splitInwardDateTimeString,
  parseGroPassRequestsResponse,
  firstNonEmptyGroDisplay,
} from "./groCardUtils";

function GROCardView({ card }) {
  const inwardAnchorRef = useRef(null);
  const inwardFileInputRef = useRef(null);
  const [showInwardClearance, setShowInwardClearance] = useState(false);
  const [inwardFile, setInwardFile] = useState(null);
  const [inwardDateTime, setInwardDateTime] = useState("");
  const [documentRemarks, setDocumentRemarks] = useState({});
  const [activeRemarkDoc, setActiveRemarkDoc] = useState(null);
  const [remarkDraft, setRemarkDraft] = useState("");
  const [callDetail, setCallDetail] = useState(null);
  const [documents, setDocuments] = useState(() => buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
  const [isGroLoading, setIsGroLoading] = useState(false);
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [isSavingInward, setIsSavingInward] = useState(false);
  const [groMainView, setGroMainView] = useState(GRO_MAIN_VIEWS.inward);
  const [passRequestsState, setPassRequestsState] = useState({
    callId: null,
    cg: undefined,
    zawil: undefined,
  });
  const [passRequestsLoading, setPassRequestsLoading] = useState(false);
  const [passRequestsError, setPassRequestsError] = useState(null);
  const [expandedPassWoIds, setExpandedPassWoIds] = useState(() => new Set());

  const callId = resolveGroCallId(card);

  const callTypeSummary = firstNonEmptyGroDisplay(
    callDetail?.call_type,
    callDetail?.call_type_name,
    card?.typeOfCall,
    callDetail?.call_type_id != null && callDetail.call_type_id !== "" ? String(callDetail.call_type_id) : ""
  );
  const billingEntitySummary = firstNonEmptyGroDisplay(callDetail?.billing_entity);
  let portFromDetail = "";
  if (typeof callDetail?.port === "string") {
    portFromDetail = callDetail.port;
  } else if (callDetail?.port && typeof callDetail.port === "object") {
    portFromDetail =
      [callDetail.port.label, callDetail.port.name]
        .map((x) => (x != null ? String(x).trim() : ""))
        .find(Boolean) || "";
  }
  const portSummary = firstNonEmptyGroDisplay(
    callDetail?.port_name,
    portFromDetail,
    callDetail?.port_id != null && callDetail.port_id !== "" ? String(callDetail.port_id) : ""
  );
  const vesselNameSummary = firstNonEmptyGroDisplay(callDetail?.vessel_name, card?.vesselName);
  const assignedOperatorFromDetail =
    typeof callDetail?.assigned_operator === "string" ? callDetail.assigned_operator : "";
  const assignedOperatorSummary = firstNonEmptyGroDisplay(
    callDetail?.requested_operator,
    callDetail?.assigned_operator_name,
    assignedOperatorFromDetail,
    callDetail?.assigned_operator_id != null && callDetail.assigned_operator_id !== ""
      ? String(callDetail.assigned_operator_id)
      : ""
  );

  const resetInwardClearanceFields = () => {
    setInwardFile(null);
    setInwardDateTime("");
    if (inwardFileInputRef.current) {
      inwardFileInputRef.current.value = "";
    }
  };

  const inwardPickerParts = splitInwardDateTimeString(inwardDateTime);

  useEffect(() => {
    setPassRequestsState({ callId: null, cg: undefined, zawil: undefined });
    setPassRequestsError(null);
    setPassRequestsLoading(false);
    setExpandedPassWoIds(new Set());
  }, [callId]);

  useEffect(() => {
    if (groMainView === GRO_MAIN_VIEWS.inward) return;
    if (callId == null || callId === "") {
      setPassRequestsError("Unable to load pass requests: missing call id.");
      return;
    }
    if (passRequestsState.callId === callId && passRequestsState.cg !== undefined) return;

    let cancelled = false;
    setPassRequestsLoading(true);
    setPassRequestsError(null);

    const run = async () => {
      try {
        const res = await groService.getPassRequests(callId);
        if (cancelled) return;
        const parsed = parseGroPassRequestsResponse(res);
        setPassRequestsState({
          callId,
          cg: parsed.cg,
          zawil: parsed.zawil,
        });
      } catch (err) {
        if (!cancelled) {
          setPassRequestsError(groApiErrorMessage(err, "Failed to load pass requests."));
          setPassRequestsState({
            callId,
            cg: [],
            zawil: [],
          });
        }
      } finally {
        if (!cancelled) setPassRequestsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [groMainView, callId, passRequestsState.callId, passRequestsState.cg]);

  const switchGroMainView = useCallback((next) => {
    setGroMainView(next);
    if (next !== GRO_MAIN_VIEWS.inward) {
      setShowInwardClearance(false);
    }
  }, []);

  const retryPassRequests = useCallback(() => {
    setPassRequestsState({ callId: null, cg: undefined, zawil: undefined });
    setPassRequestsError(null);
  }, []);

  const togglePassWoExpand = useCallback((woKey) => {
    setExpandedPassWoIds((prev) => {
      const next = new Set(prev);
      if (next.has(woKey)) next.delete(woKey);
      else next.add(woKey);
      return next;
    });
  }, []);

  const refreshGroDocuments = useCallback(async (cid) => {
    if (cid == null || cid === "") return;
    try {
      const docsRes = await groService.getGroCustomDocs(cid);
      const rawList = parseGroDocumentsResponse(docsRes);
      if (rawList.length > 0) {
        setDocuments(rawList.map((d, i) => enrichGroDocWithRowKey(d, i)));
      } else {
        setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      }
    } catch {
      setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
    }
  }, []);

  useEffect(() => {
    if (callId == null || callId === "") {
      notify("Unable to load GRO data: missing call id.", "error");
      setCallDetail(null);
      setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      return undefined;
    }

    let cancelled = false;
    const load = async () => {
      setIsGroLoading(true);
      try {
        const [detailRes, docsRes] = await Promise.all([
          groService.getCallDetailById(callId),
          groService.getGroCustomDocs(callId),
        ]);
        if (cancelled) return;
        const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
        setCallDetail(detail);
        const rawList = parseGroDocumentsResponse(docsRes);
        if (rawList.length > 0) {
          setDocuments(rawList.map((d, i) => enrichGroDocWithRowKey(d, i)));
        } else {
          setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
        }
      } catch (err) {
        if (cancelled) return;
        notify(groApiErrorMessage(err, "Failed to load GRO card data."), "error");
        setCallDetail(null);
        setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      } finally {
        if (!cancelled) setIsGroLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const handleInwardDateTimePickerChange = useCallback(({ date, time }) => {
    if (!date) {
      setInwardDateTime("");
      return;
    }
    const formattedTime = time ? String(time).slice(0, 5) : "00:00";
    setInwardDateTime(`${date} ${formattedTime}:00`);
  }, []);

  const handleInwardCancel = () => {
    setShowInwardClearance(false);
    resetInwardClearanceFields();
  };

  const handleInwardSubmit = async () => {
    if (callId == null || callId === "") {
      notify("Call id is missing.", "error");
      return;
    }
    if (!inwardFile) {
      notify("Please select a document.", "warn");
      return;
    }
    if (!String(inwardDateTime ?? "").trim()) {
      notify("Please select document date and time.", "warn");
      return;
    }
    const formData = new FormData();
    formData.append("call_id", callId);
    formData.append("document", inwardFile);
    formData.append("document_date", inwardDateTime);
    setIsSavingInward(true);
    try {
      await groService.saveArrivalDocument(formData);
      notify("Inward clearance saved successfully.", "success");
      setShowInwardClearance(false);
      resetInwardClearanceFields();
      await refreshGroDocuments(callId);
      try {
        const detailRes = await groService.getCallDetailById(callId);
        setCallDetail(detailRes?.data?.data ?? detailRes?.data ?? {});
      } catch {
        /* optional refresh */
      }
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to save inward clearance."), "error");
    } finally {
      setIsSavingInward(false);
    }
  };

  useEffect(() => {
    if (!showInwardClearance) return undefined;
    const inwardClickIgnoresOutsideClose = [
      ".gro-inward-popover",
      ".MuiPopover-root",
      ".MuiPickersPopper-root",
      ".MuiDialog-root",
      ".MuiModal-root",
      ".MuiDateCalendar-root",
    ];
    const onPointerDown = (e) => {
      const path = typeof e.composedPath === "function" ? e.composedPath() : [e.target];
      for (const node of path) {
        if (!(node instanceof Element)) continue;
        if (inwardClickIgnoresOutsideClose.some((sel) => node.closest(sel))) {
          return;
        }
      }
      if (inwardAnchorRef.current && !inwardAnchorRef.current.contains(e.target)) {
        setShowInwardClearance(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [showInwardClearance]);

  const canVerifyDocument = useCallback(
    (doc) =>
      doc.document_id != null &&
      doc.call_task_document_id != null &&
      callId != null &&
      callId !== "",
    [callId]
  );

  const handleCrossClick = (rowKey, doc) => {
    if (verifyingDocId) return;
    if (activeRemarkDoc === rowKey) {
      setActiveRemarkDoc(null);
      setRemarkDraft("");
      return;
    }
    setActiveRemarkDoc(rowKey);
    setRemarkDraft(documentRemarks[rowKey] ?? doc?.remarks ?? "");
  };

  const handleRemarkCancel = () => {
    setActiveRemarkDoc(null);
    setRemarkDraft("");
  };

  const handleRemarkSubmit = async () => {
    if (!activeRemarkDoc) return;
    const doc = documents.find((d) => d.__rowKey === activeRemarkDoc);
    if (!doc || !canVerifyDocument(doc)) {
      notify("This document cannot be rejected (missing reference).", "error");
      return;
    }
    setVerifyingDocId(activeRemarkDoc);
    try {
      await groService.verifyGroDocs({
        call_id: Number(callId),
        document_id: Number(doc.document_id),
        call_task_document_id: Number(doc.call_task_document_id),
        status: 2,
        remarks: remarkDraft,
      });
      setDocumentRemarks((prev) => ({ ...prev, [activeRemarkDoc]: remarkDraft }));
      setDocuments((prev) => prev.map((d) => (d.__rowKey === activeRemarkDoc ? { ...d, status: 2, remarks: remarkDraft } : d)));
      notify("Document marked for reupload.", "success");
      setActiveRemarkDoc(null);
      setRemarkDraft("");
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to update document."), "error");
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleTickClick = async (doc, rowKey) => {
    if (!canVerifyDocument(doc)) {
      notify("This document cannot be verified (missing reference).", "error");
      return;
    }
    setVerifyingDocId(rowKey);
    try {
      await groService.verifyGroDocs({
        call_id: Number(callId),
        document_id: Number(doc.document_id),
        call_task_document_id: Number(doc.call_task_document_id),
        status: 1,
        remarks: "",
      });
      setDocuments((prev) => prev.map((d) => (d.__rowKey === rowKey ? { ...d, status: 1 } : d)));
      notify("Document verified.", "success");
      if (activeRemarkDoc === rowKey) {
        setActiveRemarkDoc(null);
        setRemarkDraft("");
      }
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to verify document."), "error");
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleDocumentDownload = (doc) => {
    const url = doc?.file_url;
    if (!url || String(url).trim() === "") {
      notify("File not available.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const passTableWorkOrders =
    groMainView === GRO_MAIN_VIEWS.cg ? passRequestsState.cg : groMainView === GRO_MAIN_VIEWS.zawil ? passRequestsState.zawil : null;

  const documentsSectionTitle =
    groMainView === GRO_MAIN_VIEWS.cg
      ? "CG Pass"
      : groMainView === GRO_MAIN_VIEWS.zawil
        ? "Zawil Pass"
        : "Documents";

  return (
    <div className="gro-card-view">
      <div className="gro-summary-grid">
        <GroSummaryCard label="Call Type" value={callTypeSummary} />
        <GroSummaryCard label="Billing Entity" value={billingEntitySummary} />
        <GroSummaryCard label="Port" value={portSummary} />
        <GroSummaryCard label="Vessel Name" value={vesselNameSummary} />
        <GroSummaryCard label="Assigned Operator" value={assignedOperatorSummary} />
      </div>

      <div className="gro-document-section">
        <div className="gro-document-header">
          <h3 className="gro-documents-heading">{documentsSectionTitle}</h3>
          <div className="gro-document-header-actions gro-document-header-actions--with-segments">
            <div className="gro-pass-segments" role="tablist" aria-label="Pass and clearance views">
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.cg}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.cg ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.cg)}
              >
                CG Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.zawil}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.zawil ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.zawil)}
              >
                Zawil Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.inward}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.inward ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.inward)}
              >
                Inward Clearance
              </button>
            </div>
            {groMainView === GRO_MAIN_VIEWS.inward ? (
              <InwardClearanceToolbar
                inwardAnchorRef={inwardAnchorRef}
                inwardFileInputRef={inwardFileInputRef}
                showInwardClearance={showInwardClearance}
                onToggleInwardPopover={() => setShowInwardClearance(!showInwardClearance)}
                inwardFile={inwardFile}
                onInwardFileChange={(e) => setInwardFile(e.target.files?.[0] ?? null)}
                inwardPickerParts={inwardPickerParts}
                onInwardDateTimeChange={handleInwardDateTimePickerChange}
                onInwardCancel={handleInwardCancel}
                onInwardSubmit={handleInwardSubmit}
                isSavingInward={isSavingInward}
                isGroLoadingDisabled={isGroLoading || isSavingInward || callId == null || callId === ""}
              />
            ) : null}
          </div>
        </div>

        {groMainView === GRO_MAIN_VIEWS.inward ? (
          <InwardClearanceView
            documents={documents}
            isGroLoading={isGroLoading}
            activeRemarkDoc={activeRemarkDoc}
            remarkDraft={remarkDraft}
            verifyingDocId={verifyingDocId}
            onRemarkDraftChange={(e) => setRemarkDraft(e.target.value)}
            onCrossClick={handleCrossClick}
            onRemarkCancel={handleRemarkCancel}
            onRemarkSubmit={handleRemarkSubmit}
            onTickClick={handleTickClick}
            onDocumentDownload={handleDocumentDownload}
            canVerifyDocument={canVerifyDocument}
          />
        ) : (
          <PassRequestsView
            workOrders={Array.isArray(passTableWorkOrders) ? passTableWorkOrders : []}
            loading={passRequestsLoading}
            errorMessage={
              groMainView !== GRO_MAIN_VIEWS.inward && passRequestsError
                ? passRequestsError
                : groMainView !== GRO_MAIN_VIEWS.inward && (callId == null || callId === "") && !passRequestsLoading
                  ? "Unable to load pass requests: missing call id."
                  : null
            }
            onRetry={retryPassRequests}
            expandedWoIds={expandedPassWoIds}
            onToggleWoExpand={(key) => togglePassWoExpand(key)}
          />
        )}
      </div>
    </div>
  );
}

GROCardView.propTypes = {
  card: PropTypes.object,
};

export default GROCardView;
