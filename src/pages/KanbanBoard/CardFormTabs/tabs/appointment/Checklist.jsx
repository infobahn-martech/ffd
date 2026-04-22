import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { SendReportButton } from "../../services/sendReportFullWidthView";
import ChecklistService from "../../../../../services/checklistService";
import "../../../../../design/scss/checklist.scss";

import { USE_CHECKLIST_MOCK_DATA } from "./checklistTab/checklistUiConfig";
import { MOCK_CHECKLIST_BY_ID, MOCK_CHECKLIST_TYPE_ROWS } from "./checklistTab/checklistMockData";
import {
  extractChecklistTypeRows,
  mergeChecklistTypeOptions,
  mapGetChecklistByIdResponse,
  mapApiSectionsToTree,
  flattenTreeItems,
  collectTreeSectionIds,
  buildChecklistReportLines,
} from "./checklistTab/checklistMappers";
import { parseChecklistTypeListResponse } from "./checklistTab/checklistApi";
import { buildChecklistDataContext } from "./checklistTab/checklistContext";
import { getPrerequisiteStateFromContext, getChecklistInfoHelper } from "./checklistTab/checklistPrerequisites";
import ChecklistContextBar from "./checklistTab/ChecklistContextBar";
import ChecklistTypeSelector from "./checklistTab/ChecklistTypeSelector";
import ChecklistTypeBlock from "./checklistTab/ChecklistTypeBlock";
import ChecklistFooterActions from "./checklistTab/ChecklistFooterActions";
import ChecklistLoadingState from "./checklistTab/ChecklistLoadingState";

const normalizeSelectedChecklistIds = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => String(v)).filter((v) => v.length > 0);
};

const getDummyFileForItem = (itemId, itemLabel) => {
  const fileName = `${String(itemLabel).replace(/[^a-z0-9]/gi, "_").toLowerCase()}_document.pdf`;
  return {
    name: fileName,
    fileName: fileName,
    size: Math.floor(Math.random() * 500000) + 100000,
    type: "application/pdf",
  };
};

const getDummyRemarksForItem = (itemId, itemLabel) => {
  const remarksTemplates = [
    "Document has been reviewed and verified. All requirements are met.",
    "Submitted on time. No discrepancies found. Ready for processing.",
    "All necessary information is complete. Document is in order.",
    "Verified and approved. All conditions satisfied.",
    "Documentation is complete and accurate. No issues identified.",
  ];
  return remarksTemplates[(itemId || "").toString().charCodeAt(0) % remarksTemplates.length] || "—";
};

function Checklist({
  card,
  formValues,
  handleChange,
  onOpenReportPreview,
  cardColor: propCardColor,
  isViewOnly = false,
  isDAModule = false,
  contextLabels: contextLabelsProp,
  /** GET call_file/get_call_detail row — preferred source for checklist prerequisites */
  cardDetail = null,
  /** When true, wait before calling checklist list APIs (card detail in flight) */
  callDetailLoading = false,
}) {
  const cardColor = propCardColor || card?.color || "#2A00FF";

  const [checklistTypeOptions, setChecklistTypeOptions] = useState([]);
  const [checklistOptionsLoading, setChecklistOptionsLoading] = useState(false);
  const [checklistOptionsError, setChecklistOptionsError] = useState(null);

  const [checklistType, setChecklistType] = useState(() => normalizeSelectedChecklistIds(formValues?.checklistType));
  const [checklistDetailsMap, setChecklistDetailsMap] = useState({});
  const [checklistDetailsLoading, setChecklistDetailsLoading] = useState(false);

  const detailsMapRef = useRef({});
  useEffect(() => {
    detailsMapRef.current = checklistDetailsMap;
  }, [checklistDetailsMap]);

  const dataCtx = useMemo(
    () =>
      buildChecklistDataContext({
        card,
        cardDetail,
        formValues,
        contextLabels: contextLabelsProp,
        callDetailLoading,
        useChecklistMock: USE_CHECKLIST_MOCK_DATA,
      }),
    [card, cardDetail, formValues, contextLabelsProp, callDetailLoading]
  );

  const prereq = useMemo(() => getPrerequisiteStateFromContext(dataCtx), [dataCtx]);

  const callTypeLabel = dataCtx.displayCallType;
  const portLabel = dataCtx.displayPort;
  const vesselTypeLabel = dataCtx.displayVessel;
  const bargeTypeLabel = dataCtx.displayBarge;

  const callScopeId = useMemo(
    () => String(card?.call_id ?? formValues?.call_id ?? card?.callId ?? cardDetail?.call_id ?? ""),
    [card?.call_id, card?.callId, formValues?.call_id, cardDetail?.call_id]
  );
  const prevCallScopeRef = useRef(null);

  useEffect(() => {
    if (USE_CHECKLIST_MOCK_DATA) return;
    const key = callScopeId;
    if (prevCallScopeRef.current === null) {
      prevCallScopeRef.current = key;
      return;
    }
    if (prevCallScopeRef.current === key) return;
    if (prevCallScopeRef.current !== "" && key !== "" && prevCallScopeRef.current !== key) {
      setChecklistTypeOptions([]);
      setChecklistType([]);
      setChecklistDetailsMap({});
      detailsMapRef.current = {};
      if (handleChange) {
        handleChange("checklistType")({ target: { value: [], name: "checklistType" } });
      }
    }
    prevCallScopeRef.current = key;
  }, [callScopeId, handleChange]);

  useEffect(() => {
    if (USE_CHECKLIST_MOCK_DATA) {
      setChecklistTypeOptions(mergeChecklistTypeOptions([extractChecklistTypeRows({ data: MOCK_CHECKLIST_TYPE_ROWS })]));
      setChecklistOptionsError(null);
      setChecklistOptionsLoading(false);
      return;
    }

    if (!prereq.canLoadChecklists) {
      setChecklistTypeOptions([]);
      setChecklistOptionsError(null);
      return;
    }

    if (dataCtx.calltypePayload == null) {
      setChecklistTypeOptions([]);
      setChecklistOptionsError(null);
      return;
    }

    const hasVessel = dataCtx.hasVessel;
    const hasBarge = dataCtx.hasBarge;

    let cancelled = false;
    setChecklistOptionsLoading(true);
    setChecklistOptionsError(null);

    const basePayload = { calltype: dataCtx.calltypePayload, ...dataCtx.portPayload };
    const normalizedPortId = dataCtx.portPayload?.port_id ?? dataCtx.portIdForApi;
    const normalizedVesselTypeId = hasVessel ? dataCtx.vesselTypeIdForApi : undefined;
    const normalizedBargeTypeId = hasBarge ? dataCtx.bargeTypeIdForApi : undefined;
    // eslint-disable-next-line no-console
    console.log("Checklist Payload:", {
      calltype: dataCtx.calltypePayload,
      port_id: normalizedPortId,
      vessel_type_id: normalizedVesselTypeId,
      barge_type_id: normalizedBargeTypeId,
    });
    const requests = [];
    if (hasVessel) {
      requests.push(
        ChecklistService.getChecklistsByVesselType({
          vessel_type_id: dataCtx.vesselTypeIdForApi,
          ...basePayload,
        }).then((res) => parseChecklistTypeListResponse(res))
      );
    }
    if (hasBarge) {
      requests.push(
        ChecklistService.getChecklistsByBargeType({
          barge_type_id: dataCtx.bargeTypeIdForApi,
          ...basePayload,
        }).then((res) => parseChecklistTypeListResponse(res))
      );
    }

    Promise.all(requests)
      .then((lists) => {
        if (cancelled) return;
        setChecklistTypeOptions(mergeChecklistTypeOptions(lists));
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[Checklist] Failed to load checklist types", err);
        setChecklistOptionsError(err?.response?.data?.message ?? err?.message ?? "Failed to load checklist types");
        setChecklistTypeOptions([]);
      })
      .finally(() => {
        if (!cancelled) setChecklistOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [prereq.canLoadChecklists, dataCtx]);

  useEffect(() => {
    if (!checklistTypeOptions.length) return;
    const valid = new Set(checklistTypeOptions.map((o) => o.value));
    setChecklistType((prev) => {
      const filtered = prev.filter((id) => valid.has(String(id)));
      if (filtered.length === prev.length) return prev;
      if (handleChange) {
        handleChange("checklistType")({ target: { value: filtered, name: "checklistType" } });
      }
      return filtered;
    });
  }, [checklistTypeOptions, handleChange]);

  const handleChecklistTypeChange = useCallback(
    (e) => {
      const newValue = normalizeSelectedChecklistIds(e.target.value);
      setChecklistType(newValue);
      if (handleChange) {
        handleChange("checklistType")({ target: { value: newValue, name: "checklistType" } });
      }
    },
    [handleChange]
  );

  useEffect(() => {
    if (checklistOptionsLoading) return;
    if (checklistTypeOptions.length !== 1) return;
    if (checklistType.length > 0) return;
    const only = checklistTypeOptions[0].value;
    handleChecklistTypeChange({ target: { value: [only] } });
  }, [checklistOptionsLoading, checklistTypeOptions, checklistType.length, handleChecklistTypeChange]);

  useEffect(() => {
    const ids = normalizeSelectedChecklistIds(checklistType);
    if (ids.length === 0) {
      setChecklistDetailsMap({});
      detailsMapRef.current = {};
      setChecklistDetailsLoading(false);
      return;
    }

    const toFetch = ids.filter((id) => {
      const cur = detailsMapRef.current[id];
      return !Array.isArray(cur?.sections);
    });
    if (toFetch.length === 0) return;

    let cancelled = false;
    setChecklistDetailsLoading(true);
    (async () => {
      const fetched = {};
      try {
        if (USE_CHECKLIST_MOCK_DATA) {
          toFetch.forEach((id) => {
            const { checklistDetails, sections } = mapGetChecklistByIdResponse(MOCK_CHECKLIST_BY_ID);
            fetched[id] = { checklistDetails, sections };
          });
        } else {
          await Promise.all(
            toFetch.map(async (id) => {
              try {
                const res = await ChecklistService.getChecklistById(String(id));
                const body = res?.data ?? res;
                const { checklistDetails, sections } = mapGetChecklistByIdResponse(body);
                if (Array.isArray(sections)) {
                  fetched[id] = { checklistDetails, sections };
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error("[Checklist] get_checklist_by_id failed", id, err);
              }
            })
          );
        }
        if (!cancelled && Object.keys(fetched).length > 0) {
          setChecklistDetailsMap((prev) => {
            const next = { ...prev, ...fetched };
            detailsMapRef.current = next;
            return next;
          });
        }
      } finally {
        if (!cancelled) {
          setChecklistDetailsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      setChecklistDetailsLoading(false);
    };
  }, [checklistType]);

  const selectedBlocks = useMemo(() => {
    const ids = normalizeSelectedChecklistIds(checklistType);
    return ids
      .map((id) => {
        const entry = checklistDetailsMap[id];
        if (!entry) return null;
        const d = entry.checklistDetails || {};
        const name = d.checklist_name || `Checklist ${id}`;
        const sections = entry.sections;
        if (!Array.isArray(sections)) return null;
        const tree = mapApiSectionsToTree(sections, id, name);
        if (!tree.length) return null;
        return {
          typeId: id,
          typeName: name,
          tree,
          details: d,
        };
      })
      .filter(Boolean);
  }, [checklistType, checklistDetailsMap]);

  const [itemsData, setItemsData] = useState({});
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    setItemsData((prev) => {
      const newItemsData = {};
      const allItems = selectedBlocks.flatMap((b) => flattenTreeItems(b.tree));

      allItems.forEach((item) => {
        const base = {
          checked: false,
          remarks: "",
          uploadedFile: null,
          apiUploadedFiles: (item.uploadedFromApi && item.uploadedFromApi.length ? [...item.uploadedFromApi] : []),
          ...(item.expiryDateRequired ? { expiryDate: "" } : {}),
        };
        const persisted = card?.checklistItemsData?.[item.id];
        const existing = prev[item.id];
        if (!existing) {
          if (isViewOnly) {
            newItemsData[item.id] = {
              ...base,
              checked: true,
              remarks: getDummyRemarksForItem(item.id, item.title),
              uploadedFile: getDummyFileForItem(item.id, item.title),
            };
          } else {
            newItemsData[item.id] = persisted ? { ...base, ...persisted } : base;
          }
        } else if (isViewOnly && (!existing.uploadedFile || !existing.remarks)) {
          newItemsData[item.id] = {
            ...existing,
            apiUploadedFiles: base.apiUploadedFiles,
            checked: true,
            remarks: existing.remarks || getDummyRemarksForItem(item.id, item.title),
            uploadedFile: existing.uploadedFile || getDummyFileForItem(item.id, item.title),
          };
        } else {
          newItemsData[item.id] = { ...existing };
          if (item.expiryDateRequired && newItemsData[item.id].expiryDate === undefined) {
            newItemsData[item.id].expiryDate = "";
          }
          if (!newItemsData[item.id].apiUploadedFiles && base.apiUploadedFiles.length) {
            newItemsData[item.id].apiUploadedFiles = base.apiUploadedFiles;
          }
        }
      });
      return newItemsData;
    });

    setOpenSections((prev) => {
      const next = { ...prev };
      selectedBlocks.forEach((b) => {
        collectTreeSectionIds(b.tree).forEach((sid) => {
          if (next[sid] === undefined) next[sid] = true;
        });
      });
      return next;
    });
  }, [selectedBlocks, isViewOnly, card?.checklistItemsData]);

  const handleItemChange = (id, newData) => {
    setItemsData((prev) => ({
      ...prev,
      [id]: newData,
    }));
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSections((p) => ({ ...p, [sectionId]: !p[sectionId] }));
  };

  const handleSelectAll = () => {};

  const checklistTypeLabelList = useMemo(() => {
    const map = new Map(checklistTypeOptions.map((o) => [o.value, o.label]));
    return (checklistType || []).map((id) => map.get(String(id)) || id);
  }, [checklistType, checklistTypeOptions]);

  const buildMeta = (d) => ({
    checklistName: d?.checklist_name,
    callType: d?.call_type != null && String(d.call_type) ? String(d.call_type) : callTypeLabel,
    port:
      d?.port_name
      || (d?.port != null && String(d.port))
      || (d?.port_id != null && String(d.port_id))
      || portLabel,
    vesselType: d?.vessel_type != null && String(d.vessel_type) ? String(d.vessel_type) : vesselTypeLabel || null,
    bargeType: d?.barge_type != null && String(d.barge_type) ? String(d.barge_type) : bargeTypeLabel || null,
    createdAt: d?.created_date ?? d?.created_at,
  });

  const handleOpenChecklistReport = useCallback(() => {
    if (!onOpenReportPreview) return;
    const lines = ["Checklist report", `Checklist types: ${checklistTypeLabelList.join("; ")}`, "", ...buildChecklistReportLines(selectedBlocks, itemsData)];
    onOpenReportPreview({
      tabName: "Check List",
      formSectionLabel: "Checklist Information",
      getBody: () => lines.join("\n"),
      getAttachments: () => [],
    });
  }, [onOpenReportPreview, checklistTypeLabelList, selectedBlocks, itemsData]);

  const selectorDisabled = isViewOnly || !prereq.canLoadChecklists;
  const hasNoTypeResults = prereq.canLoadChecklists && !checklistOptionsLoading && checklistTypeOptions.length === 0;

  return (
    <div className="cl-checklist-v2" style={{ "--cl-accent": cardColor }}>
      <div className="cl-checklist-v2__scroll">
        <div className="operation-content-header cl-op-header">
          <div>
            <h3 className="operation-content-title cl-op-header__title">Checklist Information</h3>
            <p className="cl-op-header__help">{getChecklistInfoHelper(prereq)}</p>
          </div>
          {onOpenReportPreview && !isViewOnly && (
            <SendReportButton onClick={handleOpenChecklistReport} cardColor={cardColor} tabName="Check List" />
          )}
        </div>

        <div className="cl-checklist-v2__panel-wrap">
          <div className="cl-panel">
            <ChecklistContextBar
              callType={callTypeLabel}
              port={portLabel}
              vesselType={vesselTypeLabel}
              bargeType={bargeTypeLabel}
            />

            <ChecklistTypeSelector
              value={checklistType}
              onChange={handleChecklistTypeChange}
              options={checklistTypeOptions}
              loading={checklistOptionsLoading}
              disabled={selectorDisabled}
              cardColor={cardColor}
              prerequisiteReady={prereq.canLoadChecklists}
              hasNoResults={hasNoTypeResults}
              errorText={checklistOptionsError}
            />

            {checklistDetailsLoading && checklistType.length > 0 && (
              <div className="cl-details-loading">
                <p className="cl-details-loading__label">Loading checklist…</p>
                <ChecklistLoadingState />
              </div>
            )}

            {selectedBlocks.length > 0 && (
              <div className="cl-blocks">
                {selectedBlocks.map((block) => (
                  <ChecklistTypeBlock
                    key={block.typeId}
                    typeTitle={block.typeName}
                    sectionTree={block.tree}
                    meta={buildMeta(block.details)}
                    itemsData={itemsData}
                    onItemChange={handleItemChange}
                    openSections={openSections}
                    onSectionToggle={handleSectionToggle}
                    onSelectAll={handleSelectAll}
                    cardColor={cardColor}
                    isViewOnly={isViewOnly}
                    isDAModule={isDAModule}
                    context={{
                      callType: callTypeLabel,
                      port: portLabel,
                      vesselType: vesselTypeLabel,
                      bargeType: bargeTypeLabel,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {!isViewOnly && (
            <ChecklistFooterActions
              className="cl-footer--attached"
              cardColor={cardColor}
              onSaveConfirm={() => {
                // eslint-disable-next-line no-console
                console.log("Saving Checklist data:", { checklistType, itemsData, selectedBlocks });
              }}
            />
          )}
        </div>
      </div>
    </div>
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
  contextLabels: PropTypes.shape({
    callType: PropTypes.string,
    port: PropTypes.string,
    vesselType: PropTypes.string,
    bargeType: PropTypes.string,
  }),
};

export default Checklist;
