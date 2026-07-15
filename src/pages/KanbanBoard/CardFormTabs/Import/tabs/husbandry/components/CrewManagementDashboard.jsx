import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { FiSearch, FiEdit2, FiCheck, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CREW_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import { HusbIcon } from "./Husbandry.components";
import CrewServiceSelectPage from "./CrewServiceSelectPage";
import CrewListUploadBox from "./CrewListUploadBox";
import CrewUploadDropzones from "./CrewUploadDropzones";
import CrewUploadedListsPanel from "./CrewUploadedListsPanel";
import CrewUploadPreviewModal from "./CrewUploadPreviewModal";
import DatePickerField from "../../../../shared/components/DatePickerField";
import useCrewReducer from "../../../../../../../store/CrewReducer";
import callFileService from "../../../../../../../services/callFileService";
import { notify } from "../../../../../../../components/Toaster";

const INITIAL_UPLOAD_STEPS = {
  crewList: { status: "pending", files: [], progress: 0 },
  passport: { status: "pending", files: [], progress: 0 },
  iqama: { status: "pending", files: [], progress: 0 },
  visa: { status: "pending", files: [], progress: 0 },
};

const SUMMARY_PAGE_SIZE = 10;

// Top counter/service cards shown on the Crew Management dashboard. Crew
// Change and Port Pass are intentionally not listed here — they remain
// reachable from the left sidebar (see GATED_SIDEBAR_TABS in Husbandry.jsx),
// they're just no longer shown as a card in this grid.
const CREW_SERVICE_CARDS = [
  {
    id: CREW_MANAGEMENT_SUBTABS.TRANSPORT,
    tabName: "transport",
    label: "Transport",
    description: "Arrange crew pickup and drop-off transport for sign on/off movements.",
    crewField: "selectedCrew",
    hasServiceForm: true,
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE,
    tabName: "medicalService",
    label: "Medical",
    description: "Coordinate medical checks, clinic visits and health clearance for crew.",
    crewField: "medicalServiceSelectedCrew",
    hasServiceForm: true,
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.HOTEL,
    tabName: "hotel",
    label: "Hotel",
    description: "Book crew accommodation and manage hotel stay arrangements.",
    crewField: "hotelSelectedCrew",
    hasServiceForm: true,
  },
];

// Backend-friendly movement type values sent with the crew list import and
// used to label/describe imported crew across the dashboard.
const MOVEMENT_TYPE_OPTIONS = [
  { value: "Sign On", label: "Sign On", hint: "Joining the vessel" },
  { value: "Sign Off", label: "Sign Off", hint: "Leaving the vessel" },
];

const getCrewOptionId = (crew, index) =>
  String(crew?.crew_change_id ?? crew?.crew_id ?? crew?.id ?? index);

const getCrewIdsForMovementType = (list, movementType) =>
  list.reduce((ids, crew, index) => {
    if ((crew?.movement_type ?? crew?.movementType) === movementType) ids.push(getCrewOptionId(crew, index));
    return ids;
  }, []);

const hasDocumentUrl = (url) =>
  typeof url === "string" && url.trim() !== "" && url.trim().toLowerCase() !== "null";

// Fields editable inline from the Crew Summary table's Action column.
const EDITABLE_SUMMARY_FIELDS = ["crewName", "dateOfBirth", "nationality", "rank"];

// Read-only doc status icon for the Passport/Iqama, Visa, CG Pass and Zawil
// Pass columns — green preview icon when the document is available, blank
// cell when it's missing (no red "missing" indicator).
const DocStatusIcon = ({ available, label }) => {
  if (!available) {
    return <div className="crew-table-cell crew-table-cell--doc-action" aria-hidden="true" />;
  }
  return (
    <div className="crew-table-cell crew-table-cell--doc-action">
      <div className="crew-doc-cell__inner">
        <span
          className="crew-doc-btn crew-doc-btn--preview"
          aria-label={`${label} available`}
          title={`${label} available`}
        >
          <svg className="crew-doc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "#00AA00" }} />
            <circle cx="12" cy="12" r="3" strokeWidth="2" style={{ stroke: "#00AA00" }} />
          </svg>
        </span>
      </div>
    </div>
  );
};

DocStatusIcon.propTypes = {
  available: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

const CarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

CarIcon.propTypes = { size: PropTypes.number };

const HotelIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

HotelIcon.propTypes = { size: PropTypes.number };

const MedicalIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

MedicalIcon.propTypes = { size: PropTypes.number };

const SERVICE_ICONS = { transport: CarIcon, hotel: HotelIcon, medical: MedicalIcon };

// Transport / Hotel / Medical column cell — green service icon when crew has
// been assigned to that service, blank otherwise (no count badge).
const ServiceStatusIcon = ({ type, active, label }) => {
  if (!active) {
    return <div className="crew-table-cell crew-service-cell crew-service-cell--empty" aria-hidden="true" />;
  }
  const Icon = SERVICE_ICONS[type];
  return (
    <div className="crew-table-cell crew-service-cell" aria-label={`${label} assigned`}>
      <div className="crew-status-icon crew-status-icon--done">
        <Icon size={14} />
      </div>
    </div>
  );
};

ServiceStatusIcon.propTypes = {
  type: PropTypes.oneOf(["transport", "hotel", "medical"]).isRequired,
  active: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

// Compact radio card for choosing the crew list's movement type — the whole
// card (not just the native radio) is clickable via the wrapping <label>.
const MovementTypeRadioCard = ({ option, checked, onSelect }) => (
  <label className={`crew-movement-radio-card${checked ? " crew-movement-radio-card--selected" : ""}`}>
    <input
      type="radio"
      className="crew-movement-radio-card__input"
      name="crew-movement-type"
      value={option.value}
      checked={checked}
      onChange={() => onSelect(option.value)}
    />
    <span className="crew-movement-radio-card__radio" aria-hidden="true" />
    <span className="crew-movement-radio-card__text">
      <span className="crew-movement-radio-card__label">{option.label}</span>
      <span className="crew-movement-radio-card__hint">{option.hint}</span>
    </span>
  </label>
);

MovementTypeRadioCard.propTypes = {
  option: PropTypes.shape({ value: PropTypes.string, label: PropTypes.string, hint: PropTypes.string }).isRequired,
  checked: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

// Crew Management landing view — hero (movement type selection + crew list
// upload in the middle, "Uploaded Crew Lists" preview panel on the right —
// the single source of truth for Sign On/Sign Off upload state),
// counters/service cards, and the real Crew Summary. Each service card
// opens a "Select Crew" popup fed by the crew list already uploaded here;
// on submit the selection is saved to the matching service field and the
// existing service form is opened via onNavigateToTab.
const CrewManagementDashboard = ({ formValues, handleChange, cardColor, onNavigateToTab }) => {
  const importCrewFile = useCrewReducer((state) => state.importCrewFile);
  const fetchCallCrewList = useCrewReducer((state) => state.fetchCallCrewList);
  const uploadPassportCopies = useCrewReducer((state) => state.uploadPassportCopies);
  const uploadIqamaCopies = useCrewReducer((state) => state.uploadIqamaCopies);
  const updateCrewInfo = useCrewReducer((state) => state.updateCrewInfo);

  const [uploadedCrewList, setUploadedCrewList] = useState(
    Array.isArray(formValues?.crewList) ? formValues.crewList : []
  );
  const [uploadSteps, setUploadSteps] = useState(INITIAL_UPLOAD_STEPS);
  const [movementType, setMovementType] = useState("");
  // Per-movement-type upload state — { Sign On: {...} | null, Sign Off: {...} | null }.
  // Each entry: { name, size, movementType, status, crewCount, crewIds }.
  const [crewUploads, setCrewUploads] = useState({ "Sign On": null, "Sign Off": null });
  const [previewMovementType, setPreviewMovementType] = useState(null);
  const [replaceTargetType, setReplaceTargetType] = useState(null);
  const replaceFileInputRef = useRef(null);

  const [selectedServiceForCrew, setSelectedServiceForCrew] = useState(null);
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [showCrewSelectView, setShowCrewSelectView] = useState(false);

  // { [tabName]: [crewIds] } — seeded from formValues so a saved selection
  // survives this component remounting (e.g. after navigating away and back).
  const [selectedServiceCrewMap, setSelectedServiceCrewMap] = useState(() =>
    CREW_SERVICE_CARDS.reduce((acc, card) => {
      const ids = formValues?.[card.crewField];
      if (Array.isArray(ids) && ids.length > 0) acc[card.tabName] = ids;
      return acc;
    }, {})
  );
  const [summarySelectedIds, setSummarySelectedIds] = useState([]);
  const [summarySearch, setSummarySearch] = useState("");
  const [debouncedSummarySearch, setDebouncedSummarySearch] = useState("");
  const [summaryMovementTypeFilter, setSummaryMovementTypeFilter] = useState("");
  const [summaryPage, setSummaryPage] = useState(1);
  // Crew Summary table's own server-fetched page — separate from
  // `uploadedCrewList` (the unfiltered full crew list used by the service
  // "select crew" popups and the per-movement-type preview modal), since the
  // table is now paginated/searched/filtered via crew/get_crew_list params
  // rather than sliced client-side.
  const [summaryCrewList, setSummaryCrewList] = useState([]);
  const [summaryTotal, setSummaryTotal] = useState(0);
  // Starts true so the "no crew match" empty state can't flash before the
  // first crew/get_crew_list fetch resolves.
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  // Bumped after any mutation (upload, inline edit, bulk doc upload) that
  // should be reflected in the Crew Summary table on its next fetch.
  const [summaryRefreshTick, setSummaryRefreshTick] = useState(0);
  // Local-only override so the bulk "Upload Visa" action can flip a crew's
  // doc status icon on even though Crew Summary rows are otherwise derived
  // straight from the real uploaded crew list. Passport/Iqama no longer use
  // this — they're backed by real upload endpoints (see handleBulkCopyUpload
  // below) and the crew list is refetched after each upload instead.
  const [manualDocOverrides, setManualDocOverrides] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingPassports, setIsUploadingPassports] = useState(false);
  const [isUploadingIqamas, setIsUploadingIqamas] = useState(false);
  const summaryPassportInputRef = useRef(null);
  const summaryIqamaInputRef = useRef(null);
  const summaryVisaInputRef = useRef(null);

  const resolveCallAndVesselIds = useCallback(async () => {
    let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);
    let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId);

    if ((!resolvedCallId || !resolvedVesselId) && resolvedCallId) {
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] ||
          callDetailResponse?.data ||
          callDetailResponse?.detail ||
          callDetailResponse;
        if (!resolvedCallId) resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        if (!resolvedVesselId) resolvedVesselId = Number(callDetailData?.vessel_id);
      } catch {
        // resolvedCallId/resolvedVesselId stay unset — handled by callers
      }
    }

    return { resolvedCallId, resolvedVesselId };
  }, [formValues?.call_id, formValues?.callId, formValues?.vessel_id, formValues?.vesselId]);

  // Populate the crew list already uploaded for this call/vessel on load.
  // Also mirrors into formValues.crewList (not just local state) so the
  // gated service listings in Husbandry.jsx — which filter this same list
  // by each service's selected crew ids — see the real crew even when this
  // dashboard was never opened this session (sidebar deep-links straight
  // into a service's crew listing without mounting this component first).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId || !resolvedVesselId) return;
      const list = await fetchCallCrewList({
        payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
      });
      if (cancelled || !Array.isArray(list)) return;
      setUploadedCrewList(list);
      handleChange("crewList")({ target: { value: list } });
      handleChange("crewCount")({ target: { value: list.length } });

      // Pull each movement type's tracked upload record (uploaded_crew_file)
      // so the "Uploaded Crew Lists" panel reflects the file actually saved
      // on the backend, not just files uploaded during this session.
      MOVEMENT_TYPE_OPTIONS.forEach((option) => {
        fetchCallCrewList({
          payload: {
            call_id: resolvedCallId,
            vessel_id: resolvedVesselId,
            page: 1,
            limit: 1,
            movement_type: option.value,
          },
          cb: (_rows, _pagination, uploadedFile) => {
            if (cancelled || !uploadedFile) return;
            const idsForType = getCrewIdsForMovementType(list, option.value);
            setCrewUploads((prev) => ({
              ...prev,
              [option.value]: {
                name: uploadedFile.crew_file || `${option.label} crew list`,
                size: undefined,
                movementType: option.value,
                status: "completed",
                crewCount: idsForType.length,
                crewIds: idsForType,
                uploadedAt: uploadedFile.uploaded_at,
                fileUrl: uploadedFile.crew_file_url,
              },
            }));
          },
        });
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveCallAndVesselIds, fetchCallCrewList, handleChange]);

  // Debounce the Crew Summary search box before it drives a server request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSummarySearch(summarySearch.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [summarySearch]);

  // A new search term or movement-type filter always starts back at page 1.
  useEffect(() => {
    setSummaryPage(1);
  }, [debouncedSummarySearch, summaryMovementTypeFilter]);

  const totalSummaryPages = Math.max(1, Math.ceil(summaryTotal / SUMMARY_PAGE_SIZE));
  const effectiveSummaryPage = Math.min(Math.max(summaryPage, 1), totalSummaryPages);

  // Crew Summary table — server-driven page/search/movement-type-filter via
  // crew/get_crew_list (call_id, vessel_id, page, limit, search, movement_type).
  // Separate from the mount effect above, which keeps fetching the full,
  // unfiltered crew list for the service "select crew" popups and the
  // per-movement-type preview modal.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId || !resolvedVesselId) return;
      setIsSummaryLoading(true);
      const list = await fetchCallCrewList({
        payload: {
          call_id: resolvedCallId,
          vessel_id: resolvedVesselId,
          page: effectiveSummaryPage,
          limit: SUMMARY_PAGE_SIZE,
          search: debouncedSummarySearch || undefined,
          movement_type: summaryMovementTypeFilter || undefined,
        },
        cb: (rows, pagination) => {
          if (cancelled) return;
          setSummaryTotal(Number(pagination?.total ?? (Array.isArray(rows) ? rows.length : 0)));
        },
      });
      if (cancelled) return;
      setSummaryCrewList(Array.isArray(list) ? list : []);
      setIsSummaryLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    resolveCallAndVesselIds,
    fetchCallCrewList,
    effectiveSummaryPage,
    debouncedSummarySearch,
    summaryMovementTypeFilter,
    summaryRefreshTick,
  ]);

  const handleCrewListBlocked = () => {
    notify("Select a movement type before uploading the crew list.", "error");
  };

  // `targetType` defaults to the currently-selected radio, but Replace passes
  // an explicit type so it can re-upload a specific movement type's file
  // without disturbing the current selection.
  const handleCrewListFile = async (file, targetType = movementType) => {
    if (!file) return;
    if (!targetType) {
      handleCrewListBlocked();
      return;
    }
    if (crewUploads[targetType]?.status === "uploading") return;

    setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "uploading" } }));
    setCrewUploads((prev) => ({
      ...prev,
      [targetType]: {
        ...(prev[targetType] || {}),
        name: file.name,
        size: file.size,
        movementType: targetType,
        status: "uploading",
        crewCount: prev[targetType]?.crewCount ?? 0,
        crewIds: prev[targetType]?.crewIds ?? [],
      },
    }));

    const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
    if (!resolvedCallId || !resolvedVesselId) {
      setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "failed" } }));
      setCrewUploads((prev) => ({ ...prev, [targetType]: { ...(prev[targetType] || {}), status: "failed" } }));
      notify("Unable to upload: missing call or vessel information.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("call_id", String(resolvedCallId));
    formData.append("vessel_id", String(resolvedVesselId));
    formData.append("movement_type", targetType);
    formData.append("file", file);

    try {
      await importCrewFile({ formData });
      const list = await fetchCallCrewList({
        payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
      });
      const refreshedList = Array.isArray(list) ? list : [];
      setUploadedCrewList(refreshedList);
      handleChange("crewList")({ target: { value: refreshedList } });
      handleChange("crewCount")({ target: { value: refreshedList.length } });
      setUploadSteps((prev) => ({
        ...prev,
        crewList: { status: "completed", files: [{ name: file.name }], progress: 100 },
      }));

      // Crew belonging to this batch = everything not already known to
      // belong to the other movement type (prefers a real movement_type
      // field from the backend when present).
      const otherType = targetType === "Sign On" ? "Sign Off" : "Sign On";
      const otherIds = new Set(crewUploads[otherType]?.crewIds || []);
      const idsForThisType = [];
      refreshedList.forEach((crew, index) => {
        const id = getCrewOptionId(crew, index);
        const backendTag = crew?.movement_type ?? crew?.movementType;
        const belongsHere = backendTag === targetType || (!backendTag && !otherIds.has(id));
        if (belongsHere) idsForThisType.push(id);
      });

      setCrewUploads((prev) => ({
        ...prev,
        [targetType]: {
          name: file.name,
          size: file.size,
          movementType: targetType,
          status: "completed",
          crewCount: idsForThisType.length,
          crewIds: idsForThisType,
        },
      }));
      setSummarySelectedIds([]);
      setSummaryRefreshTick((tick) => tick + 1);

      const movementTypeLabel = MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === targetType)?.label || "";
      notify(`${movementTypeLabel} crew list uploaded — ${idsForThisType.length} crew member(s) loaded.`, "success");
    } catch {
      setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "failed" } }));
      setCrewUploads((prev) => ({ ...prev, [targetType]: { ...(prev[targetType] || {}), status: "failed" } }));
      notify("Failed to upload crew list. Please try again.", "error");
    }
  };

  const handleReplaceClick = (type) => {
    setReplaceTargetType(type);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTargetType) return;
    handleCrewListFile(file, replaceTargetType);
    setReplaceTargetType(null);
  };

  const handleRemoveUpload = (type) => {
    const label = MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;
    if (!window.confirm(`Remove the ${label} crew list? This only clears it from this view.`)) return;
    setCrewUploads((prev) => ({ ...prev, [type]: null }));
    setSummarySelectedIds([]);
  };

  const handlePreviewClick = (type) => setPreviewMovementType(type);
  const handleClosePreview = () => setPreviewMovementType(null);

  // Passport/Iqama dropzones — crew/upload_passport_copies + passports[], or
  // crew/upload_iqama_copies + iqamas[]. Payload is just the file array, no
  // call_id/vessel_id/crew_ids — same real-endpoint pattern as the Crew
  // Summary bulk actions. Refetches crew/get_crew_list afterwards so the doc
  // status icons reflect the real result.
  const handleCrewDocCopyUpload = (kind) => async (fileList) => {
    if (uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const stepKey = kind === "passport" ? "passport" : "iqama";
    const uploadAction = kind === "passport" ? uploadPassportCopies : uploadIqamaCopies;
    const fileFieldName = kind === "passport" ? "passports[]" : "iqamas[]";
    const label = kind === "passport" ? "Passport" : "Iqama";

    setUploadSteps((prev) => ({ ...prev, [stepKey]: { ...prev[stepKey], status: "uploading" } }));

    const formData = new FormData();
    files.forEach((file) => formData.append(fileFieldName, file));

    try {
      await uploadAction({ formData });
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (resolvedCallId && resolvedVesselId) {
        const list = await fetchCallCrewList({
          payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
        });
        if (Array.isArray(list)) {
          setUploadedCrewList(list);
          handleChange("crewList")({ target: { value: list } });
          handleChange("crewCount")({ target: { value: list.length } });
        }
      }
      setSummaryRefreshTick((tick) => tick + 1);
      setUploadSteps((prev) => ({ ...prev, [stepKey]: { status: "completed", files, progress: 100 } }));
      notify(`${label} uploaded — ${files.length} file(s).`, "success");
    } catch {
      setUploadSteps((prev) => ({ ...prev, [stepKey]: { ...prev[stepKey], status: "failed" } }));
      notify(`Failed to upload ${label.toLowerCase()} copies. Please try again.`, "error");
    }
  };

  const handlePassportFiles = handleCrewDocCopyUpload("passport");
  const handleIqamaFiles = handleCrewDocCopyUpload("iqama");

  // No bulk backend endpoint exists yet for visa files, so this step stays
  // local-only — files are kept in formValues to be submitted with the rest
  // of the card, same as CrewContent's own wizard.
  const handleVisaFiles = (fileList) => {
    if (uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    handleChange("crewVisaFiles")({
      target: { value: files.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type })) },
    });
    setUploadSteps((prev) => ({ ...prev, visa: { status: "completed", files, progress: 100 } }));
  };

  const handleServiceCardClick = (card) => {
    setSelectedServiceForCrew(card);
    // Default to "all crew selected" the first time a service is opened;
    // re-opening it later restores whatever was picked last.
    const existingSelection = selectedServiceCrewMap[card.tabName];
    setSelectedCrewIds(existingSelection || crewWithIds.map(({ id }) => id));
    setShowCrewSelectView(true);
  };

  const handleBackFromCrewSelect = () => {
    setShowCrewSelectView(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  // Submitting the crew selection goes straight to the request step — the
  // service's own form for services that have one (Transport/Medical/
  // Hotel), or a submission confirmation for ones that don't yet.
  const handleSubmitCrewSelection = () => {
    if (!selectedServiceForCrew || selectedCrewIds.length === 0) return;
    handleChange(selectedServiceForCrew.crewField)({ target: { value: selectedCrewIds } });
    setSelectedServiceCrewMap((prev) => ({ ...prev, [selectedServiceForCrew.tabName]: selectedCrewIds }));

    if (selectedServiceForCrew.hasServiceForm) {
      onNavigateToTab?.(selectedServiceForCrew.tabName);
    } else {
      notify(`${selectedServiceForCrew.label} request submitted.`, "success");
    }

    setShowCrewSelectView(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  const crewWithIds = uploadedCrewList.map((crew, index) => ({
    crew,
    index,
    id: getCrewOptionId(crew, index),
  }));

  // Shared row-shaping for both the full crew list (preview modal, "select
  // all" default) and the server-paginated Crew Summary table below.
  // manualDocOverrides layers local-only doc-flag edits on top since there's
  // no per-crew document-flag update endpoint yet. Name/DOB/nationality/rank
  // are backed by crew/update_crew (see handleSaveEdit), so those come
  // straight from the refetched crew list with no client-side override.
  const toCrewSummaryRow = useCallback(
    (crew, id) => {
      const docOverrides = manualDocOverrides[id] || {};
      const movementTypeRaw = crew?.movement_type || "";
      const movementTypeValue = movementTypeRaw.toLowerCase().trim().replace(/\s+/g, "_");
      const assignedTo = (tabName) => Boolean(selectedServiceCrewMap[tabName]?.includes(id));

      return {
        id,
        crewId: crew?.crew_id ?? crew?.crew_change_id ?? id,
        crewName: crew?.crew_name ?? "",
        dateOfBirth: crew?.date_of_birth ?? "",
        nationality: crew?.nationality ?? "N/A",
        rank: crew?.rank ?? "",
        movementType: movementTypeRaw,
        movementTypeValue,
        passport: hasDocumentUrl(crew?.passport_copy_url) || Boolean(docOverrides.passport),
        iqama: hasDocumentUrl(crew?.iqama_copy_url) || Boolean(docOverrides.iqama),
        visa: hasDocumentUrl(crew?.visa_copy_url) || Boolean(docOverrides.visa),
        cgPass: false,
        zawilPass: false,
        transportCount: assignedTo("transport") ? 1 : 0,
        hotelCount: assignedTo("hotel") ? 1 : 0,
        medicalCount: assignedTo("medicalService") ? 1 : 0,
      };
    },
    [manualDocOverrides, selectedServiceCrewMap]
  );

  // Full, unfiltered crew list — feeds the per-movement-type preview modal
  // and the "no crew uploaded yet" empty state, independent of whatever
  // search/filter/page is currently applied to the Crew Summary table.
  const crewSummaryRows = useMemo(
    () => crewWithIds.map(({ crew, id }) => toCrewSummaryRow(crew, id)),
    [crewWithIds, toCrewSummaryRow]
  );

  // Crew Summary table rows — already search/filter/paginated server-side
  // (see the crew/get_crew_list fetch effect above), so this is just row
  // shaping, no further client-side slicing.
  const summaryTableRows = useMemo(() => {
    const withIds = summaryCrewList.map((crew, index) => ({ crew, id: getCrewOptionId(crew, index) }));
    return withIds.map(({ crew, id }) => toCrewSummaryRow(crew, id));
  }, [summaryCrewList, toCrewSummaryRow]);

  const previewCrewRows = previewMovementType
    ? crewSummaryRows.filter((row) => row.movementTypeValue === previewMovementType)
    : [];
  const previewMovementTypeLabel = MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === previewMovementType)?.label || "";

  const totalSummaryItems = summaryTotal;
  const startSummaryItem = totalSummaryItems === 0 ? 0 : (effectiveSummaryPage - 1) * SUMMARY_PAGE_SIZE + 1;
  const endSummaryItem = totalSummaryItems === 0 ? 0 : Math.min(effectiveSummaryPage * SUMMARY_PAGE_SIZE, totalSummaryItems);

  const summaryPaginationPages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, effectiveSummaryPage - 2);
    const end = Math.min(totalSummaryPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [effectiveSummaryPage, totalSummaryPages]);

  const handleSummarySearchChange = (e) => {
    setSummarySearch(e.target.value);
  };

  const handleSummaryRowToggle = (rowId) => {
    setSummarySelectedIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSummarySelectAll = () => {
    setSummarySelectedIds((prev) =>
      prev.length === summaryTableRows.length ? [] : summaryTableRows.map((row) => row.id)
    );
  };

  // Marks the given doc field(s) as available for every currently-checked
  // summary row — stands in for a real per-crew document upload until the
  // backend supports one, so picking a file just flips the status icon on.
  const handleSummaryBulkDocUpload = (fields) => (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || summarySelectedIds.length === 0) return;
    setManualDocOverrides((prev) => {
      const next = { ...prev };
      summarySelectedIds.forEach((id) => {
        next[id] = { ...(next[id] || {}), ...Object.fromEntries(fields.map((field) => [field, true])) };
      });
      return next;
    });
  };

  // Passport/Iqama bulk upload — crew/upload_passport_copies + passports[],
  // or crew/upload_iqama_copies + iqamas[]. Payload is just the file array,
  // no call_id/vessel_id/crew_ids. Unlike the local-only Visa override
  // above, this hits a real endpoint, then refetches crew/get_crew_list so
  // the doc status icons reflect the real result.
  const handleBulkCopyUpload = (kind) => async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const setUploading = kind === "passport" ? setIsUploadingPassports : setIsUploadingIqamas;
    const uploadAction = kind === "passport" ? uploadPassportCopies : uploadIqamaCopies;
    const fileFieldName = kind === "passport" ? "passports[]" : "iqamas[]";
    const label = kind === "passport" ? "Passport" : "Iqama";

    const formData = new FormData();
    files.forEach((file) => formData.append(fileFieldName, file));

    setUploading(true);
    try {
      await uploadAction({ formData });
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (resolvedCallId && resolvedVesselId) {
        const list = await fetchCallCrewList({
          payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
        });
        if (Array.isArray(list)) {
          setUploadedCrewList(list);
          handleChange("crewList")({ target: { value: list } });
          handleChange("crewCount")({ target: { value: list.length } });
        }
      }
      setSummaryRefreshTick((tick) => tick + 1);
      notify(`${label} uploaded — ${files.length} file(s).`, "success");
    } catch {
      notify(`Failed to upload ${label.toLowerCase()} copies. Please try again.`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleStartEdit = (row) => {
    setEditingRowId(row.id);
    setEditDraft(Object.fromEntries(EDITABLE_SUMMARY_FIELDS.map((field) => [field, row[field]])));
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditDraft(null);
  };

  const handleEditFieldChange = (field) => (e) => {
    const { value } = e.target;
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  // Persists inline Crew Summary edits via crew/update_crew, then refetches
  // crew/get_crew_list so the table reflects the saved values.
  const handleSaveEdit = async () => {
    if (!editingRowId || !editDraft) return;
    const row = crewSummaryRows.find((summaryRow) => summaryRow.id === editingRowId);
    const crewIdNum = Number(row?.crewId);
    if (!crewIdNum) {
      notify("Unable to save: missing crew id.", "error");
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateCrewInfo({
        payload: {
          crew_id: crewIdNum,
          crew_name: editDraft.crewName,
          date_of_birth: editDraft.dateOfBirth,
          nationality: editDraft.nationality,
          rank: editDraft.rank,
        },
      });

      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (resolvedCallId && resolvedVesselId) {
        const list = await fetchCallCrewList({
          payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
        });
        if (Array.isArray(list)) {
          setUploadedCrewList(list);
          handleChange("crewList")({ target: { value: list } });
          handleChange("crewCount")({ target: { value: list.length } });
        }
      }
      setSummaryRefreshTick((tick) => tick + 1);

      notify("Crew details updated.", "success");
      setEditingRowId(null);
      setEditDraft(null);
    } catch {
      // error already surfaced via notify in the store; keep editing state so the user can retry
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (showCrewSelectView && selectedServiceForCrew) {
    return (
      <CrewServiceSelectPage
        service={selectedServiceForCrew}
        crewRows={crewSummaryRows}
        selectedCrewIds={selectedCrewIds}
        onChangeSelected={setSelectedCrewIds}
        cardColor={cardColor}
        onBack={handleBackFromCrewSelect}
        onSubmit={handleSubmitCrewSelection}
      />
    );
  }

  const selectedMovementTypeLabel = MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === movementType)?.label || "";
  const otherMovementType = movementType === "Sign On" ? "Sign Off" : "Sign On";
  const otherMovementTypeLabel = MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === otherMovementType)?.label || "";
  const crewListStatus = movementType ? crewUploads[movementType]?.status || "pending" : "pending";

  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <div className="husbandry-service-hero">
          <div className="crew-mgmt-hero-row">
            <div className="crew-mgmt-hero-left">
              <div className="crew-mgmt-hero-text">
                <h2 className="husbandry-service-selection-title">Crew Management</h2>
              </div>

              <div className="crew-mgmt-hero-middle">
                <div className="crew-movement-select-block">
                  <div className="crew-movement-radio-group">
                    {MOVEMENT_TYPE_OPTIONS.map((option) => (
                      <MovementTypeRadioCard
                        key={option.value}
                        option={option}
                        checked={movementType === option.value}
                        onSelect={setMovementType}
                      />
                    ))}
                  </div>
                  {!movementType && (
                    <p className="crew-movement-helper-text">
                      Select a movement type before uploading the crew list.
                    </p>
                  )}
                </div>

                <div className="crew-mgmt-crewlist-block">
                  <CrewListUploadBox
                    movementType={movementType}
                    movementTypeLabel={selectedMovementTypeLabel}
                    otherMovementTypeLabel={otherMovementTypeLabel}
                    status={crewListStatus}
                    onSelectFile={handleCrewListFile}
                    onBlocked={handleCrewListBlocked}
                  />
                  <CrewUploadDropzones
                    steps={uploadSteps}
                    onSelectPassportFiles={handlePassportFiles}
                    onSelectIqamaFiles={handleIqamaFiles}
                    onSelectVisaFiles={handleVisaFiles}
                  />
                </div>
              </div>
            </div>

            <CrewUploadedListsPanel
              movementTypeOptions={MOVEMENT_TYPE_OPTIONS}
              crewUploads={crewUploads}
              cardColor={cardColor}
              onPreview={handlePreviewClick}
              onReplace={handleReplaceClick}
              onRemove={handleRemoveUpload}
            />
          </div>

          <input
            ref={replaceFileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="crew-doc-input"
            onChange={handleReplaceFileChange}
          />

          <div className="crew-mgmt-service-grid">
            {CREW_SERVICE_CARDS.map((card) => {
              const assignedCount = selectedServiceCrewMap[card.tabName]?.length || 0;
              const isAssigned = assignedCount > 0;
              const isDisabled = crewWithIds.length === 0;

              return (
                <button
                  key={card.id}
                  type="button"
                  className={`crew-mgmt-service-box${isDisabled ? " crew-mgmt-service-box--disabled" : ""}`}
                  onClick={() => handleServiceCardClick(card)}
                  disabled={isDisabled}
                  title={isDisabled ? "Upload a crew list to enable this service." : undefined}
                  style={{ "--card-color": cardColor }}
                >
                  {isAssigned && (
                    <span
                      className="crew-mgmt-service-box-badge booked-status-completed"
                      aria-label={`${card.label} status: Completed`}
                    >
                      Completed
                    </span>
                  )}
                  <div className="crew-mgmt-service-box-icon">
                    <HusbIcon id={card.id} />
                  </div>
                  <div className="crew-mgmt-service-box-content">
                    <span className="crew-mgmt-service-box-label">{card.label}</span>
                    <span className="crew-mgmt-service-box-count">{assignedCount} Crew Assigned</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="crew-mgmt-summary-section">
          <div className="crew-listing-header">
            <div>
              <h2 className="crew-listing-title">Crew Summary</h2>
              <p className="crew-listing-subtitle">Overview of crew documents and assigned services.</p>
            </div>

            <div className="crew-summary-header-actions">
              <div className="crew-summary-search">
                <FiSearch size={14} className="crew-summary-search__icon" />
                <input
                  type="text"
                  className="crew-summary-search__input"
                  placeholder="Search crew name"
                  value={summarySearch}
                  onChange={handleSummarySearchChange}
                />
              </div>

              <div className="crew-summary-movement-filter" role="tablist" aria-label="Filter by movement type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={summaryMovementTypeFilter === ""}
                  className={`crew-summary-movement-filter__btn${summaryMovementTypeFilter === "" ? " crew-summary-movement-filter__btn--active" : ""}`}
                  onClick={() => setSummaryMovementTypeFilter("")}
                >
                  All
                </button>
                {MOVEMENT_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={summaryMovementTypeFilter === option.value}
                    className={`crew-summary-movement-filter__btn${summaryMovementTypeFilter === option.value ? " crew-summary-movement-filter__btn--active" : ""}`}
                    onClick={() => setSummaryMovementTypeFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {summarySelectedIds.length > 0 && (
                <div className="crew-summary-bulk-actions">
                  <button
                    type="button"
                    className="crew-header-btn"
                    disabled={isUploadingPassports}
                    onClick={() => summaryPassportInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">
                      {isUploadingPassports ? "Uploading Passport…" : "Upload Passport"}
                    </span>
                  </button>
                  <input
                    ref={summaryPassportInputRef}
                    type="file"
                    multiple
                    className="crew-doc-input"
                    onChange={handleBulkCopyUpload("passport")}
                  />
                  <button
                    type="button"
                    className="crew-header-btn"
                    disabled={isUploadingIqamas}
                    onClick={() => summaryIqamaInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">
                      {isUploadingIqamas ? "Uploading Iqama…" : "Upload Iqama"}
                    </span>
                  </button>
                  <input
                    ref={summaryIqamaInputRef}
                    type="file"
                    multiple
                    className="crew-doc-input"
                    onChange={handleBulkCopyUpload("iqama")}
                  />
                  <button
                    type="button"
                    className="crew-header-btn"
                    onClick={() => summaryVisaInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">Upload Visa</span>
                  </button>
                  <input
                    ref={summaryVisaInputRef}
                    type="file"
                    className="crew-doc-input"
                    onChange={handleSummaryBulkDocUpload(["visa"])}
                  />
                </div>
              )}
            </div>
          </div>

          {crewSummaryRows.length === 0 ? (
            <p className="crew-summary-empty">
              No crew uploaded yet. Select a movement type and upload a crew list to see it here.
            </p>
          ) : !isSummaryLoading && summaryTotal === 0 ? (
            <p className="crew-summary-empty">
              No crew match your {summaryMovementTypeFilter ? "filter" : "search"}.
            </p>
          ) : (
            <div className="crew-table-wrapper">
              <div className="table-wrapper table-responsive crew-table-container crew-table-scroll">
                <table
                  className="table table-striped crew-table crew-list-table crew-summary-table"
                  style={{ "--card-color": cardColor, tableLayout: "fixed", width: "100%" }}
                >
                  <thead>
                    <tr>
                      <th className="crew-checkbox-cell-header">
                        <input
                          className="crew-list-checkbox crew-list-checkbox--header"
                          type="checkbox"
                          checked={summarySelectedIds.length === summaryTableRows.length && summaryTableRows.length > 0}
                          onChange={handleSummarySelectAll}
                        />
                      </th>
                      <th><span className="crew-th">Crew name</span></th>
                      <th><span className="crew-th">Date of birth</span></th>
                      <th><span className="crew-th">Nationality</span></th>
                      <th><span className="crew-th">Rank</span></th>
                      <th><span className="crew-th">Movement type</span></th>
                      <th><span className="crew-th">Passport / Iqama</span></th>
                      <th><span className="crew-th">Visa</span></th>
                      <th><span className="crew-th">CG Pass</span></th>
                      <th><span className="crew-th">Zawil Pass</span></th>
                      <th><span className="crew-th">Transport</span></th>
                      <th><span className="crew-th">Hotel</span></th>
                      <th><span className="crew-th">Medical</span></th>
                      <th><span className="crew-th">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryTableRows.map((row) => {
                      const isEditing = editingRowId === row.id;
                      return (
                        <tr key={row.id} className={summarySelectedIds.includes(row.id) ? "crew-row-selected" : ""}>
                          <td className="crew-checkbox-cell">
                            <input
                              className="crew-list-checkbox"
                              type="checkbox"
                              checked={summarySelectedIds.includes(row.id)}
                              onChange={() => handleSummaryRowToggle(row.id)}
                            />
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="crew-edit-input"
                                value={editDraft?.crewName ?? ""}
                                onChange={handleEditFieldChange("crewName")}
                              />
                            ) : (
                              <div className="crew-table-cell crew-name-cell" title={row.crewName}>
                                <span className="crew-name-info">
                                  <span className="crew-name-text">{row.crewName}</span>
                                  <span className="crew-name-id">{`ID · ${String(row.crewId).padStart(5, "0")}`}</span>
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <DatePickerField
                                dateValue={editDraft?.dateOfBirth ?? ""}
                                onDateChange={handleEditFieldChange("dateOfBirth")}
                                dateFieldName="dateOfBirth"
                                placeholder="Select DOB"
                                maxDate={new Date()}
                                className="crew-edit-date-field"
                              />
                            ) : (
                              <div className="crew-table-cell" title={row.dateOfBirth}>{row.dateOfBirth || "-"}</div>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="crew-edit-input"
                                value={editDraft?.nationality ?? ""}
                                onChange={handleEditFieldChange("nationality")}
                              />
                            ) : (
                              <div className="crew-table-cell" title={row.nationality}>{row.nationality}</div>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="crew-edit-input"
                                value={editDraft?.rank ?? ""}
                                onChange={handleEditFieldChange("rank")}
                              />
                            ) : (
                              <div className="crew-table-cell" title={row.rank}>{row.rank}</div>
                            )}
                          </td>
                          <td>
                            <span className="crew-movement-pill" title={row.movementType}>{row.movementType}</span>
                          </td>
                          <td><DocStatusIcon available={row.passport || row.iqama} label="Passport / Iqama" /></td>
                          <td><DocStatusIcon available={row.visa} label="Visa" /></td>
                          <td><DocStatusIcon available={row.cgPass} label="CG Pass" /></td>
                          <td><DocStatusIcon available={row.zawilPass} label="Zawil Pass" /></td>
                          <td><ServiceStatusIcon type="transport" active={row.transportCount > 0} label="Transport" /></td>
                          <td><ServiceStatusIcon type="hotel" active={row.hotelCount > 0} label="Hotel" /></td>
                          <td><ServiceStatusIcon type="medical" active={row.medicalCount > 0} label="Medical" /></td>
                          <td>
                            <div className="crew-table-cell crew-action-cell">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="crew-action-btn crew-action-btn--save"
                                    aria-label="Save changes"
                                    title="Save"
                                    disabled={isSavingEdit}
                                    onClick={handleSaveEdit}
                                  >
                                    {isSavingEdit ? (
                                      <span className="crew-action-btn__spinner" aria-hidden="true" />
                                    ) : (
                                      <FiCheck size={14} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    className="crew-action-btn crew-action-btn--cancel"
                                    aria-label="Cancel editing"
                                    title="Cancel"
                                    disabled={isSavingEdit}
                                    onClick={handleCancelEdit}
                                  >
                                    <FiX size={14} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="crew-action-btn crew-action-btn--edit"
                                  aria-label="Edit crew"
                                  title="Edit"
                                  onClick={() => handleStartEdit(row)}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="crew-pagination">
                <div className="crew-pagination-info">
                  Showing <strong>{startSummaryItem}–{endSummaryItem}</strong> of {totalSummaryItems} crew members
                  {isSummaryLoading ? " (refreshing…)" : ""}
                </div>
                <div className="crew-pagination-actions">
                  <button
                    type="button"
                    className="crew-pagination-btn crew-pagination-btn--icon"
                    aria-label="Previous page"
                    disabled={effectiveSummaryPage <= 1}
                    onClick={() => setSummaryPage((prev) => Math.max(1, prev - 1))}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  {summaryPaginationPages.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`crew-pagination-btn${pageNum === effectiveSummaryPage ? " active" : ""}`}
                      onClick={() => setSummaryPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="crew-pagination-btn crew-pagination-btn--icon"
                    aria-label="Next page"
                    disabled={effectiveSummaryPage >= totalSummaryPages}
                    onClick={() => setSummaryPage((prev) => Math.min(totalSummaryPages, prev + 1))}
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CrewUploadPreviewModal
        show={Boolean(previewMovementType)}
        movementTypeLabel={previewMovementTypeLabel}
        crewRows={previewCrewRows}
        cardColor={cardColor}
        onClose={handleClosePreview}
      />
    </div>
  );
};

CrewManagementDashboard.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onNavigateToTab: PropTypes.func,
};

export default CrewManagementDashboard;
