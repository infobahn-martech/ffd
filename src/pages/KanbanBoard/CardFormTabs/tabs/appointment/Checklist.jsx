import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SendReportButton } from "../../services/sendReportFullWidthView";
import callFileService from "../../../../../services/callFileService";
import checklistService from "../../../../../services/checklistService";
import "../../../../../design/scss/checklist.scss";
import ChecklistMultiSelect from "./checklistTab/ChecklistMultiSelect";
import ChecklistTypeBlock from "./checklistTab/ChecklistTypeBlock";
import ChecklistFooterActions from "./checklistTab/ChecklistFooterActions";
import ChecklistLoadingState from "./checklistTab/ChecklistLoadingState";
import ChecklistEmptyState from "./checklistTab/ChecklistEmptyState";
import { parseChecklistTypeListResponse } from "./checklistTab/checklistApi";
import { buildChecklistDataContext } from "./checklistTab/checklistContext";
import { getPrerequisiteStateFromContext } from "./checklistTab/checklistPrerequisites";
import {
  buildChecklistReportLines,
  collectItemIdsUnderSectionInBlocks,
  collectTreeSectionIds,
  flattenTreeItems,
  mapApiSectionsToTree,
  mapGetChecklistByIdResponse,
  mergeChecklistTypeOptions,
} from "./checklistTab/checklistMappers";

const FormField = ({ label, children, className = "" }) => (
  <div className={`cf-field ${className}`}>
    {label ? <label>{label}</label> : null}
    {children}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const toIdString = (v) => (v == null || String(v).trim() === "" ? null : String(v).trim());

const normalizeBackendFile = (file, fallbackKey) => ({
  id: file?.id ?? file?.file_id ?? `api_${fallbackKey}`,
  name: file?.name ?? file?.file_name ?? file?.filename ?? "File",
  fileName: file?.file_name ?? file?.name ?? file?.filename ?? "File",
  size: file?.size ?? null,
  url: file?.url ?? file?.link ?? null,
  link: file?.link ?? file?.url ?? null,
  fromApi: true,
});

const fetchCallDetail = async (callId) => {
  if (!callId) return null;
  const { data } = await callFileService.getCallDetail(callId);
  return data?.data ?? data ?? null;
};

const fetchChecklistTypes = async ({ vessel_type_id, barge_type_id, calltype, port_id }) => {
  const isNoChecklistError = (error) => {
    const status = error?.response?.status;
    const message = String(
      error?.response?.data?.message
        ?? error?.response?.data?.error
        ?? error?.message
        ?? ""
    ).toLowerCase();
    return status === 404 || message.includes("no checklist found");
  };

  const parseSourceResult = (result) => {
    if (result.status === "fulfilled") {
      return {
        rows: parseChecklistTypeListResponse(result.value),
        failed: false,
        errorMessage: "",
      };
    }
    if (isNoChecklistError(result.reason)) {
      return { rows: [], failed: false, errorMessage: "" };
    }
    return {
      rows: [],
      failed: true,
      errorMessage: result.reason?.message || "Failed to load checklist types.",
    };
  };

  const vesselCall = vessel_type_id
    ? checklistService.getChecklistsByVesselType({ vessel_type_id, calltype, port_id })
    : Promise.resolve(null);
  const bargeCall = barge_type_id
    ? checklistService.getChecklistsByBargeType({ barge_type_id, calltype, port_id })
    : Promise.resolve(null);

  const [vesselRes, bargeRes] = await Promise.allSettled([vesselCall, bargeCall]);
  const vesselParsed = parseSourceResult(vesselRes);
  const bargeParsed = parseSourceResult(bargeRes);
  const hasUsableData = vesselParsed.rows.length > 0 || bargeParsed.rows.length > 0;
  const hasFailures = vesselParsed.failed || bargeParsed.failed;

  return {
    vesselRows: vesselParsed.rows,
    bargeRows: bargeParsed.rows,
    hasUsableData,
    hasFailures,
    errorMessage: [vesselParsed.errorMessage, bargeParsed.errorMessage].filter(Boolean).join(" | "),
  };
};

const fetchChecklistById = async (checklistTypeId) => {
  const { data } = await checklistService.getChecklistById(checklistTypeId);
  return data;
};

const normalizeChecklistTypeOptions = (rowsBySource) =>
  mergeChecklistTypeOptions([rowsBySource.vesselRows, rowsBySource.bargeRows]);

const normalizeChecklistDetailResponse = (checklistTypeId, payload) => {
  const { checklistDetails, sections } = mapGetChecklistByIdResponse(payload);
  const typeId = toIdString(checklistTypeId);
  const typeName = checklistDetails?.checklist_name || `Checklist ${typeId}`;
  const tree = mapApiSectionsToTree(sections, typeId, typeName);
  return { typeId, typeName, tree, checklistDetails };
};

function Checklist({
  card,
  formValues,
  handleChange,
  onOpenReportPreview,
  cardColor: propCardColor,
  isViewOnly = false,
  isDAModule = false,
  cardDetail,
  callDetailLoading = false,
}) {
  const cardColor = propCardColor || card?.color || "#2A00FF";
  const currentCallId = useMemo(
    () => card?.call_id ?? formValues?.call_id ?? card?.callId ?? "",
    [card?.call_id, card?.callId, formValues?.call_id]
  );

  const [localCallDetail, setLocalCallDetail] = useState(null);
  const [callDetailLoad, setCallDetailLoad] = useState(false);
  const [callDetailError, setCallDetailError] = useState("");
  const [checklistTypeOptions, setChecklistTypeOptions] = useState([]);
  const [selectedChecklistTypeIds, setSelectedChecklistTypeIds] = useState([]);
  const [checklistBlocks, setChecklistBlocks] = useState([]);
  const [itemsData, setItemsData] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [openTypeGroups, setOpenTypeGroups] = useState({});
  const [typeLoading, setTypeLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [checklistError, setChecklistError] = useState("");
  const userChangedSelectionRef = useRef(false);

  useEffect(() => {
    if (cardDetail && typeof cardDetail === "object") {
      setLocalCallDetail(cardDetail);
      return;
    }
    if (!currentCallId) {
      setLocalCallDetail(null);
      return;
    }
    let cancelled = false;
    const loadCallDetail = async () => {
      setCallDetailLoad(true);
      setCallDetailError("");
      try {
        const detail = await fetchCallDetail(currentCallId);
        if (!cancelled) setLocalCallDetail(detail);
      } catch (error) {
        if (!cancelled) {
          setLocalCallDetail(null);
          setCallDetailError(error?.message || "Failed to load call detail.");
        }
      } finally {
        if (!cancelled) setCallDetailLoad(false);
      }
    };
    loadCallDetail();
    return () => {
      cancelled = true;
    };
  }, [cardDetail, currentCallId]);

  const effectiveCallDetailLoading = callDetailLoading || callDetailLoad;

  const dataContext = useMemo(
    () =>
      buildChecklistDataContext({
        card,
        cardDetail: cardDetail ?? localCallDetail,
        formValues,
        callDetailLoading: effectiveCallDetailLoading,
      }),
    [card, cardDetail, localCallDetail, formValues, effectiveCallDetailLoading]
  );

  const prerequisiteState = useMemo(() => getPrerequisiteStateFromContext(dataContext), [dataContext]);

  useEffect(() => {
    let cancelled = false;
    const loadChecklistTypes = async () => {
      if (!prerequisiteState.canLoadChecklists) {
        setChecklistTypeOptions([]);
        setSelectedChecklistTypeIds([]);
        setChecklistBlocks([]);
        setItemsData({});
        setOpenSections({});
        setOpenTypeGroups({});
        return;
      }
      setTypeLoading(true);
      setChecklistError("");
      try {
        const rowsBySource = await fetchChecklistTypes({
          vessel_type_id: dataContext.vesselTypeIdForApi,
          barge_type_id: dataContext.bargeTypeIdForApi,
          calltype: dataContext.calltypePayload,
          port_id: dataContext.portIdForApi,
        });
        if (cancelled) return;
        const options = normalizeChecklistTypeOptions(rowsBySource);
        setChecklistTypeOptions(options);
        setSelectedChecklistTypeIds((prev) => {
          const optionIds = new Set(options.map((o) => o.value));
          const retained = prev.filter((id) => optionIds.has(id));
          if (userChangedSelectionRef.current && retained.length > 0) return retained;
          return options.map((o) => o.value);
        });
        if (!cancelled) {
          if (!rowsBySource.hasUsableData && rowsBySource.hasFailures) {
            setChecklistError(rowsBySource.errorMessage || "Failed to load checklist types.");
          } else {
            setChecklistError("");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setChecklistTypeOptions([]);
          setSelectedChecklistTypeIds([]);
          setChecklistError(error?.message || "Failed to load checklist types.");
        }
      } finally {
        if (!cancelled) setTypeLoading(false);
      }
    };
    loadChecklistTypes();
    return () => {
      cancelled = true;
    };
  }, [dataContext, prerequisiteState.canLoadChecklists]);

  useEffect(() => {
    let cancelled = false;
    const loadChecklistDetails = async () => {
      if (selectedChecklistTypeIds.length === 0) {
        setChecklistBlocks([]);
        setItemsData({});
        setOpenSections({});
        setOpenTypeGroups({});
        return;
      }
      setDetailLoading(true);
      setChecklistError("");
      try {
        const responses = await Promise.all(selectedChecklistTypeIds.map((id) => fetchChecklistById(id)));
        if (cancelled) return;
        const blocks = responses.map((payload, index) =>
          normalizeChecklistDetailResponse(selectedChecklistTypeIds[index], payload)
        );
        const allSectionIds = blocks.flatMap((b) => collectTreeSectionIds(b.tree));
        const allItems = blocks.flatMap((b) => flattenTreeItems(b.tree));

        setChecklistBlocks(blocks);
        setOpenSections((prev) =>
          allSectionIds.reduce((acc, sectionId) => ({ ...acc, [sectionId]: prev[sectionId] ?? true }), {})
        );
        setOpenTypeGroups((prev) =>
          blocks.reduce((acc, b) => ({ ...acc, [b.typeId]: prev[b.typeId] ?? true }), {})
        );
        setItemsData((prev) =>
          allItems.reduce((acc, item) => {
            const existing = prev[item.id] || {};
            const apiFiles = (item.uploadedFromApi || []).map((f, idx) => normalizeBackendFile(f, `${item.id}_${idx}`));
            acc[item.id] = {
              checked: existing.checked === true,
              remarks: existing.remarks ?? "",
              expiryDate: existing.expiryDate ?? "",
              uploadedFile: existing.uploadedFile ?? null,
              apiUploadedFiles: existing.apiUploadedFiles ?? apiFiles,
              uploadedFiles: existing.uploadedFiles ?? apiFiles,
              requirement: item.requirement ?? null,
              description: item.description ?? "",
            };
            return acc;
          }, {})
        );
      } catch (error) {
        if (!cancelled) {
          setChecklistBlocks([]);
          setItemsData({});
          setChecklistError(error?.message || "Failed to load checklist details.");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    loadChecklistDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedChecklistTypeIds]);

  const handleChecklistTypeChange = (event) => {
    const next = Array.isArray(event?.target?.value) ? event.target.value.map(String) : [];
    userChangedSelectionRef.current = true;
    setSelectedChecklistTypeIds(next);
    if (handleChange) {
      handleChange("checklistType")({
        target: { name: "checklistType", value: next },
      });
    }
  };

  const handleItemChange = (id, nextData) => {
    setItemsData((prev) => ({ ...prev, [id]: { ...prev[id], ...nextData } }));
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleSelectAll = (sectionId, checked) => {
    const itemIds = collectItemIdsUnderSectionInBlocks(checklistBlocks, sectionId);
    setItemsData((prev) => {
      const next = { ...prev };
      itemIds.forEach((itemId) => {
        next[itemId] = { ...(next[itemId] || {}), checked };
      });
      return next;
    });
  };

  const handleTypeGroupToggle = (typeId) => {
    setOpenTypeGroups((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  const savePayload = useMemo(
    () => ({
      selected_checklist_type_ids: selectedChecklistTypeIds,
      checklist_data: checklistBlocks.map((block) => ({
        checklist_type_id: block.typeId,
        sections: block.tree.map((section) => ({
          checklist_section_id: section.id,
          items: flattenTreeItems([section]).map((item) => {
            const d = itemsData[item.id] || {};
            return {
              checklist_item_id: item.id,
              checked: d.checked === true,
              remarks: d.remarks || "",
              expiry_date: d.expiryDate || null,
              uploaded_file: d.uploadedFile || null,
            };
          }),
        })),
      })),
    }),
    [selectedChecklistTypeIds, checklistBlocks, itemsData]
  );

  const handleOpenChecklistReport = useCallback(() => {
    if (!onOpenReportPreview) return;
    const lines = ["Checklist report", ""];
    lines.push(...buildChecklistReportLines(checklistBlocks.map((b) => ({ typeName: b.typeName, tree: b.tree })), itemsData));
    onOpenReportPreview({
      tabName: "Check List",
      formSectionLabel: "Checklist Information",
      getBody: () => lines.join("\n"),
      getAttachments: () => [],
    });
  }, [onOpenReportPreview, checklistBlocks, itemsData]);

  const isLoading = effectiveCallDetailLoading || typeLoading || detailLoading;
  const hasChecklistData = checklistBlocks.some((b) => (b.tree || []).length > 0);

  return (
    <>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Checklist Information</h3>
        {onOpenReportPreview && !isViewOnly ? (
          <SendReportButton onClick={handleOpenChecklistReport} cardColor={cardColor} tabName="Check List" />
        ) : null}
      </div>

      <div className="cf-section-body checklist-tab-layout">
        <div className="checklist-form">
          <div className="form-group">
            <div className="cf-grid two">
              <FormField label="Checklist Type">
                <ChecklistMultiSelect
                  value={selectedChecklistTypeIds}
                  onChange={handleChecklistTypeChange}
                  options={checklistTypeOptions}
                  placeholder={checklistTypeOptions.length ? "Select checklist type..." : "No checklist types available"}
                  cardColor={cardColor}
                  disabled={isViewOnly || typeLoading || !prerequisiteState.canLoadChecklists}
                />
              </FormField>
            </div>
          </div>

          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-title">Checklist Items</div>
            </div>
            <div className="cf-section-body">
              {isLoading ? <ChecklistLoadingState /> : null}
              {!isLoading && callDetailError ? (
                <ChecklistEmptyState title="Call detail error" message={callDetailError} variant="error" />
              ) : null}
              {!isLoading && !callDetailError && !prerequisiteState.canLoadChecklists ? (
                <ChecklistEmptyState
                  title="Checklist prerequisites"
                  message="Checklist types will load after call type, port, and vessel/barge are available."
                  variant="prerequisite"
                />
              ) : null}
              {!isLoading && prerequisiteState.canLoadChecklists && checklistError ? (
                <ChecklistEmptyState title="Checklist loading failed" message={checklistError} variant="error" />
              ) : null}
              {!isLoading &&
              prerequisiteState.canLoadChecklists &&
              !checklistError &&
              selectedChecklistTypeIds.length === 0 ? (
                <ChecklistEmptyState
                  title="No checklist selected"
                  message="Select checklist type(s) to render checklist items."
                  variant="noData"
                />
              ) : null}
              {!isLoading &&
              prerequisiteState.canLoadChecklists &&
              !checklistError &&
              selectedChecklistTypeIds.length > 0 &&
              !hasChecklistData ? (
                <ChecklistEmptyState
                  title="No checklist details returned"
                  message="Selected checklist type(s) returned empty detail."
                  variant="noData"
                />
              ) : null}

              {!isLoading &&
                !checklistError &&
                hasChecklistData &&
                checklistBlocks.map((block) => (
                  <div className="checklist-type-group" key={block.typeId} style={{ "--card-color": cardColor }}>
                    <button
                      type="button"
                      className="checklist-type-title-accordion"
                      onClick={() => handleTypeGroupToggle(block.typeId)}
                      aria-expanded={openTypeGroups[block.typeId] !== false}
                    >
                      <span className="checklist-type-title-text">{block.typeName}</span>
                      <span className="checklist-type-accordion-icon">
                        {openTypeGroups[block.typeId] !== false ? "▼" : "▶"}
                      </span>
                    </button>
                    {openTypeGroups[block.typeId] !== false ? (
                      <ChecklistTypeBlock
                        typeTitle={block.typeName}
                        sectionTree={block.tree}
                        itemsData={itemsData}
                        onItemChange={handleItemChange}
                        openSections={openSections}
                        onSectionToggle={handleSectionToggle}
                        onSelectAll={handleSelectAll}
                        cardColor={cardColor}
                        isViewOnly={isViewOnly}
                        isDAModule={isDAModule}
                      />
                    ) : null}
                  </div>
                ))}
            </div>
          </div>

          {!isViewOnly ? (
            <div className="checklist-actions">
              <ChecklistFooterActions
                cardColor={cardColor}
                disabled={isLoading || selectedChecklistTypeIds.length === 0}
                onSaveConfirm={() => {
                  // Save API can be attached here when backend endpoint is finalized.
                  // eslint-disable-next-line no-console
                  console.log("Checklist save payload:", savePayload);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  onOpenReportPreview: PropTypes.func,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
  cardDetail: PropTypes.object,
  callDetailLoading: PropTypes.bool,
};

export default Checklist;
