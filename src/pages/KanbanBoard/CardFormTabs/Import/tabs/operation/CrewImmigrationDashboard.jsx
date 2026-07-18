import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { FiSearch, FiChevronLeft, FiChevronRight, FiCheck, FiNavigation } from "react-icons/fi";
import CrewListUploadBox from "../husbandry/components/CrewListUploadBox";
import CrewUploadDropzones from "../husbandry/components/CrewUploadDropzones";
import CrewUploadPreviewModal from "../husbandry/components/CrewUploadPreviewModal";
import LaunchHireInlineForm from "../husbandry/components/LaunchHireInlineForm";
import useCrewReducer from "../../../../../../store/CrewReducer";
import useLaunchHireServiceReducer from "../../../../../../store/LaunchHireServiceReducer";
import callFileService from "../../../../../../services/callFileService";
import { buildApiDateTime } from "../../../../../../shared/helpers/dateTimeFieldUtils";
import { notify } from "../../../../../../components/Toaster";

const LISTING_PAGE_SIZE = 10;

const createUploadSteps = () => ({
  crewList: { status: "pending", files: [], progress: 0 },
  passport: { status: "pending", files: [], progress: 0 },
  iqama: { status: "pending", files: [], progress: 0 },
  visa: { status: "pending", files: [], progress: 0 },
});

const createBatch = (id) => ({
  id,
  label: `Batch ${id}`,
  uploadSteps: createUploadSteps(),
  crewCount: 0,
  fileMeta: null,
});

const getCrewOptionId = (crew, index) =>
  String(crew?.crew_change_id ?? crew?.crew_id ?? crew?.id ?? index);

const hasDocumentUrl = (url) =>
  typeof url === "string" && url.trim() !== "" && url.trim().toLowerCase() !== "null";

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M13 2v7h7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

// Read-only doc status icon — green preview icon when the document is
// available, blank cell when missing. Mirrors DocStatusIcon in
// CrewManagementDashboard so the Crew Listing table matches its look.
const DocStatusIcon = ({ available, label }) => {
  if (!available) {
    return <div className="crew-table-cell crew-table-cell--doc-action" aria-hidden="true" />;
  }
  return (
    <div className="crew-table-cell crew-table-cell--doc-action">
      <div className="crew-doc-cell__inner">
        <span className="crew-doc-btn crew-doc-btn--preview" aria-label={`${label} available`} title={`${label} available`}>
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

// One uploaded batch's crew-list summary card — same visual language as
// CrewUploadedCard in CrewUploadedListsPanel (husbandry Crew Management),
// grouped here by batch instead of movement type.
const BatchUploadedCard = ({ batch, onPreview, onReplace }) => {
  const isUploading = batch.uploadSteps.crewList.status === "uploading";
  const isFailed = batch.uploadSteps.crewList.status === "failed";

  return (
    <div className="crew-uploaded-card">
      <span className="crew-uploaded-card__icon" aria-hidden="true">
        <FileIcon />
      </span>
      <div className="crew-uploaded-card__details">
        <span className="crew-uploaded-card__title">{batch.label} Crew List</span>
        <div className="crew-uploaded-card__filename" title={batch.fileMeta?.name}>
          {batch.fileMeta?.name || batch.uploadSteps.crewList.files?.[0]?.name || ""}
        </div>
        <div className="crew-uploaded-card__meta">
          {batch.crewCount} crew member{batch.crewCount === 1 ? "" : "s"}
          {batch.fileMeta?.uploadedAt ? ` · Uploaded ${batch.fileMeta.uploadedAt}` : ""}
        </div>
        {isUploading && <span className="crew-uploaded-card__status crew-uploaded-card__status--uploading">Uploading…</span>}
        {!isUploading && isFailed && <span className="crew-uploaded-card__status crew-uploaded-card__status--failed">Upload failed</span>}
        {!isUploading && !isFailed && <span className="crew-uploaded-card__status crew-uploaded-card__status--success">Uploaded successfully</span>}
      </div>
      <span className="crew-uploaded-card__badge">{batch.label}</span>
      <div className="crew-uploaded-card__actions">
        <button type="button" className="crew-uploaded-card__action" onClick={() => onPreview(batch.id)} disabled={isUploading}>
          Preview
        </button>
        <button type="button" className="crew-uploaded-card__action" onClick={() => onReplace(batch.id)} disabled={isUploading}>
          Replace
        </button>
      </div>
    </div>
  );
};

BatchUploadedCard.propTypes = {
  batch: PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    crewCount: PropTypes.number,
    fileMeta: PropTypes.object,
    uploadSteps: PropTypes.object.isRequired,
  }).isRequired,
  onPreview: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
};

// Crew Immigration — batch-based crew document intake for the Operation
// section. Each batch bundles a Crew List + Passport + Iqama + Visa upload;
// a new batch only unlocks once the previous batch's crew list has been
// imported. Crew list import/replace/listing all reuse the existing Crew
// Management APIs (crew/import_crew_ai, crew/replace_crew_file,
// crew/get_crew_list, crew/upload_passport_copies, crew/upload_iqama_copies)
// via useCrewReducer — batches are tagged through the existing
// `movement_type` field (e.g. "Batch 1") since the backend has no separate
// batch concept yet.
const CrewImmigrationDashboard = ({ card, formValues, cardColor }) => {
  const importCrewFile = useCrewReducer((state) => state.importCrewFile);
  const replaceCrewFile = useCrewReducer((state) => state.replaceCrewFile);
  const fetchCallCrewList = useCrewReducer((state) => state.fetchCallCrewList);
  const uploadPassportCopies = useCrewReducer((state) => state.uploadPassportCopies);
  const uploadIqamaCopies = useCrewReducer((state) => state.uploadIqamaCopies);
  const createLaunchHireRequest = useLaunchHireServiceReducer((state) => state.createLaunchHireRequest);

  const [batches, setBatches] = useState(() => [createBatch(1)]);
  const [previewBatchId, setPreviewBatchId] = useState(null);
  const [previewCrewRows, setPreviewCrewRows] = useState([]);
  const [replaceTargetBatchId, setReplaceTargetBatchId] = useState(null);
  const replaceFileInputRef = useRef(null);

  const [listingSearch, setListingSearch] = useState("");
  const [debouncedListingSearch, setDebouncedListingSearch] = useState("");
  const [listingPage, setListingPage] = useState(1);
  const [listingCrewList, setListingCrewList] = useState([]);
  const [listingTotal, setListingTotal] = useState(0);
  const [isListingLoading, setIsListingLoading] = useState(true);
  const [listingRefreshTick, setListingRefreshTick] = useState(0);
  const [listingSelectedIds, setListingSelectedIds] = useState([]);
  // Local-only override so the bulk "Upload Visa" action can flip a crew's
  // visa status icon on — mirrors CrewManagementDashboard's manualDocOverrides,
  // since there's no bulk visa upload endpoint yet.
  const [manualDocOverrides, setManualDocOverrides] = useState({});
  const [isUploadingPassports, setIsUploadingPassports] = useState(false);
  const [isUploadingIqamas, setIsUploadingIqamas] = useState(false);
  const listingPassportInputRef = useRef(null);
  const listingIqamaInputRef = useRef(null);
  const listingVisaInputRef = useRef(null);

  // "Request Launch Hire" inline panel — same pattern as CrewManagementDashboard.
  const [showLaunchHireForm, setShowLaunchHireForm] = useState(false);
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [launchDateTimeError, setLaunchDateTimeError] = useState("");
  const [isSubmittingLaunchHire, setIsSubmittingLaunchHire] = useState(false);
  const [launchHireRequested, setLaunchHireRequested] = useState(false);
  const [launchBatch, setLaunchBatch] = useState("");
  const [launchHireEnabled, setLaunchHireEnabled] = useState(false);

  const resolveCallAndVesselIds = useCallback(async () => {
    let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId ?? card?.call_id ?? card?.callId);
    let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId ?? card?.vessel_id ?? card?.vesselId);

    if ((!resolvedCallId || !resolvedVesselId) && resolvedCallId) {
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] || callDetailResponse?.data || callDetailResponse?.detail || callDetailResponse;
        if (!resolvedCallId) resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        if (!resolvedVesselId) resolvedVesselId = Number(callDetailData?.vessel_id);
      } catch {
        // resolvedCallId/resolvedVesselId stay unset — handled by callers
      }
    }

    return { resolvedCallId, resolvedVesselId };
  }, [formValues?.call_id, formValues?.callId, formValues?.vessel_id, formValues?.vesselId, card?.call_id, card?.callId, card?.vessel_id, card?.vesselId]);

  // Discover any batches already uploaded for this call (e.g. reopening the
  // card in a later session) by probing Batch 1, 2, 3… until one comes back
  // empty, so in-progress batch state survives a remount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId || !resolvedVesselId) return;

      const discovered = [];
      for (let index = 1; index <= 50; index += 1) {
        const label = `Batch ${index}`;
        let uploadedFile = null;
        let total = 0;
        await fetchCallCrewList({
          payload: { call_id: resolvedCallId, page: 1, limit: 1, movement_type: label },
          cb: (_rows, pagination, file) => {
            uploadedFile = file;
            total = Number(pagination?.total ?? 0);
          },
        });
        if (cancelled || !uploadedFile) break;

        const batch = createBatch(index);
        batch.crewCount = total;
        batch.fileMeta = {
          name: uploadedFile.crew_file || label,
          uploadedAt: uploadedFile.uploaded_at,
          fileUrl: uploadedFile.crew_file_url,
        };
        batch.uploadSteps = {
          ...batch.uploadSteps,
          crewList: { status: "completed", files: [{ name: batch.fileMeta.name }], progress: 100 },
        };
        discovered.push(batch);
      }

      if (!cancelled && discovered.length > 0) setBatches(discovered);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetches call detail to check the `launch_hire` flag — the "Request
  // Launch Hire" action only applies to calls the backend has flagged for it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId) return;
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] || callDetailResponse?.data || callDetailResponse?.detail || callDetailResponse;
        if (!cancelled) setLaunchHireEnabled(Number(callDetailData?.launch_hire) === 1);
      } catch {
        // launchHireEnabled stays false — button remains hidden
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveCallAndVesselIds]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedListingSearch(listingSearch.trim()), 350);
    return () => clearTimeout(handle);
  }, [listingSearch]);

  useEffect(() => {
    setListingPage(1);
  }, [debouncedListingSearch]);

  const totalListingPages = Math.max(1, Math.ceil(listingTotal / LISTING_PAGE_SIZE));
  const effectiveListingPage = Math.min(Math.max(listingPage, 1), totalListingPages);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId || !resolvedVesselId) return;
      setIsListingLoading(true);
      const list = await fetchCallCrewList({
        payload: {
          call_id: resolvedCallId,
          page: effectiveListingPage,
          limit: LISTING_PAGE_SIZE,
          search: debouncedListingSearch || undefined,
        },
        cb: (rows, pagination) => {
          if (cancelled) return;
          setListingTotal(Number(pagination?.total ?? (Array.isArray(rows) ? rows.length : 0)));
        },
      });
      if (cancelled) return;
      setListingCrewList(Array.isArray(list) ? list : []);
      setIsListingLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveCallAndVesselIds, fetchCallCrewList, effectiveListingPage, debouncedListingSearch, listingRefreshTick]);

  const handleBatchCrewListFile = useCallback(
    async (batchId, file, mode = "import") => {
      const label = `Batch ${batchId}`;
      const targetBatch = batches.find((b) => b.id === batchId);
      if (!file || targetBatch?.uploadSteps.crewList.status === "uploading") return;

      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, crewList: { ...b.uploadSteps.crewList, status: "uploading" } } } : b))
      );

      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (!resolvedCallId || !resolvedVesselId) {
        setBatches((prev) =>
          prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, crewList: { ...b.uploadSteps.crewList, status: "failed" } } } : b))
        );
        notify("Unable to upload: missing call or vessel information.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("call_id", String(resolvedCallId));
      formData.append("vessel_id", String(resolvedVesselId));
      formData.append("movement_type", label);
      formData.append("file", file);

      try {
        const uploadAction = mode === "replace" ? replaceCrewFile : importCrewFile;
        await uploadAction({ formData });

        let crewCount = 0;
        await fetchCallCrewList({
          payload: { call_id: resolvedCallId, page: 1, limit: 1, movement_type: label },
          cb: (_rows, pagination, uploadedFile) => {
            crewCount = Number(pagination?.total ?? 0);
            setBatches((prev) =>
              prev.map((b) =>
                b.id === batchId
                  ? {
                      ...b,
                      crewCount,
                      fileMeta: {
                        name: uploadedFile?.crew_file || file.name,
                        uploadedAt: uploadedFile?.uploaded_at,
                        fileUrl: uploadedFile?.crew_file_url,
                      },
                      uploadSteps: { ...b.uploadSteps, crewList: { status: "completed", files: [{ name: file.name }], progress: 100 } },
                    }
                  : b
              )
            );
          },
        });

        setListingRefreshTick((tick) => tick + 1);
        notify(`${label} crew list ${mode === "replace" ? "replaced" : "uploaded"} — ${crewCount} crew member(s) loaded.`, "success");
      } catch {
        setBatches((prev) =>
          prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, crewList: { ...b.uploadSteps.crewList, status: "failed" } } } : b))
        );
        notify(`Failed to ${mode === "replace" ? "replace" : "upload"} ${label.toLowerCase()} crew list. Please try again.`, "error");
      }
    },
    [batches, resolveCallAndVesselIds, replaceCrewFile, importCrewFile, fetchCallCrewList]
  );

  const handleAddBatch = () => {
    setBatches((prev) => [...prev, createBatch(prev.length + 1)]);
  };

  const handleBatchDocCopyUpload = (batchId, kind) => async (fileList) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const stepKey = kind === "passport" ? "passport" : "iqama";
    const uploadAction = kind === "passport" ? uploadPassportCopies : uploadIqamaCopies;
    const fileFieldName = kind === "passport" ? "passports[]" : "iqamas[]";
    const label = kind === "passport" ? "Passport" : "Iqama";

    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, [stepKey]: { ...b.uploadSteps[stepKey], status: "uploading" } } } : b))
    );

    const formData = new FormData();
    files.forEach((file) => formData.append(fileFieldName, file));

    try {
      await uploadAction({ formData });
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, [stepKey]: { status: "completed", files, progress: 100 } } } : b))
      );
      setListingRefreshTick((tick) => tick + 1);
      notify(`${label} uploaded — ${files.length} file(s).`, "success");
    } catch {
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, [stepKey]: { ...b.uploadSteps[stepKey], status: "failed" } } } : b))
      );
      notify(`Failed to upload ${label.toLowerCase()} copies. Please try again.`, "error");
    }
  };

  // No bulk backend endpoint exists yet for visa files (same limitation as
  // Crew Management), so this step stays local-only per batch.
  const handleBatchVisaFiles = (batchId) => (fileList) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, uploadSteps: { ...b.uploadSteps, visa: { status: "completed", files, progress: 100 } } } : b))
    );
  };

  const handlePreviewBatch = async (batchId) => {
    setPreviewBatchId(batchId);
    const label = `Batch ${batchId}`;
    const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
    if (!resolvedCallId || !resolvedVesselId) {
      setPreviewCrewRows([]);
      return;
    }
    const list = await fetchCallCrewList({
      payload: { call_id: resolvedCallId, page: 1, limit: 1000, movement_type: label },
    });
    setPreviewCrewRows(
      Array.isArray(list)
        ? list.map((crew, index) => ({
            id: getCrewOptionId(crew, index),
            crewName: crew?.crew_name ?? "",
            nationality: crew?.nationality ?? "N/A",
            rank: crew?.rank ?? "",
            movementType: label,
          }))
        : []
    );
  };

  const handleClosePreview = () => {
    setPreviewBatchId(null);
    setPreviewCrewRows([]);
  };

  const handleReplaceBatchClick = (batchId) => {
    setReplaceTargetBatchId(batchId);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTargetBatchId) return;
    handleBatchCrewListFile(replaceTargetBatchId, file, "replace");
    setReplaceTargetBatchId(null);
  };

  const listingRows = useMemo(
    () =>
      listingCrewList.map((crew, index) => {
        const id = getCrewOptionId(crew, index);
        const docOverrides = manualDocOverrides[id] || {};
        return {
          id,
          crewName: crew?.crew_name ?? "",
          dateOfBirth: crew?.date_of_birth ?? "",
          nationality: crew?.nationality ?? "N/A",
          rank: crew?.rank ?? "",
          passportOrIqama: hasDocumentUrl(crew?.passport_copy_url) || hasDocumentUrl(crew?.iqama_copy_url),
          visa: hasDocumentUrl(crew?.visa_copy_url) || Boolean(docOverrides.visa),
        };
      }),
    [listingCrewList, manualDocOverrides]
  );

  const handleListingRowToggle = (rowId) => {
    setListingSelectedIds((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]));
  };

  const handleListingSelectAll = () => {
    setListingSelectedIds((prev) => (prev.length === listingRows.length ? [] : listingRows.map((row) => row.id)));
  };

  // Passport/Iqama bulk upload — same real endpoints as CrewManagementDashboard
  // (crew/upload_passport_copies + passports[], crew/upload_iqama_copies +
  // iqamas[]); refetches the listing afterwards so the doc icons reflect the
  // real result.
  const handleListingBulkCopyUpload = (kind) => async (event) => {
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
      setListingRefreshTick((tick) => tick + 1);
      notify(`${label} uploaded — ${files.length} file(s).`, "success");
    } catch {
      notify(`Failed to upload ${label.toLowerCase()} copies. Please try again.`, "error");
    } finally {
      setUploading(false);
    }
  };

  // No bulk backend endpoint exists yet for visa files (same limitation as
  // Crew Management), so this just flips the local override on for the
  // currently-checked rows.
  const handleListingBulkVisaUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || listingSelectedIds.length === 0) return;
    setManualDocOverrides((prev) => {
      const next = { ...prev };
      listingSelectedIds.forEach((id) => {
        next[id] = { ...(next[id] || {}), visa: true };
      });
      return next;
    });
  };

  const completedBatches = useMemo(
    () => batches.filter((b) => b.uploadSteps.crewList.status === "completed"),
    [batches]
  );

  const handleCancelLaunchHire = () => {
    if (isSubmittingLaunchHire) return;
    setShowLaunchHireForm(false);
    setLaunchDate("");
    setLaunchTime("");
    setLaunchDateTimeError("");
    setLaunchBatch("");
  };

  const handleLaunchHireButtonClick = () => {
    if (isSubmittingLaunchHire) return;
    if (showLaunchHireForm) {
      handleCancelLaunchHire();
    } else {
      setLaunchBatch(completedBatches[0]?.label ?? "");
      setShowLaunchHireForm(true);
    }
  };

  const handleLaunchDateTimeChange = ({ date, time }) => {
    setLaunchDate(date);
    setLaunchTime(time);
    if (!date) return;
    const selected = new Date(`${date}T${time || "00:00"}`);
    if (!Number.isNaN(selected.getTime()) && selected.getTime() >= Date.now()) {
      setLaunchDateTimeError("");
    }
  };

  const handleSubmitLaunchHire = async () => {
    if (isSubmittingLaunchHire) return;
    if (!launchBatch) {
      notify("Select a batch.", "error");
      return;
    }
    if (!launchDate) {
      setLaunchDateTimeError("Select a launch date and time.");
      return;
    }
    const selected = new Date(`${launchDate}T${launchTime || "00:00"}`);
    if (Number.isNaN(selected.getTime()) || selected.getTime() < Date.now()) {
      setLaunchDateTimeError("Launch date and time cannot be in the past.");
      return;
    }

    setIsSubmittingLaunchHire(true);
    try {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (!resolvedCallId || !resolvedVesselId) {
        notify("Unable to submit: missing call or vessel information.", "error");
        return;
      }

      await createLaunchHireRequest({
        call_id: resolvedCallId,
        vessel_id: resolvedVesselId,
        movement_type: launchBatch,
        launch_datetime: buildApiDateTime(launchDate, launchTime),
      });

      notify("Launch hire request submitted successfully.", "success");
      setShowLaunchHireForm(false);
      setLaunchDate("");
      setLaunchTime("");
      setLaunchDateTimeError("");
      setLaunchBatch("");
      setLaunchHireRequested(true);
    } catch (err) {
      notify(err?.response?.data?.message ?? "Failed to submit launch hire request. Please try again.", "error");
    } finally {
      setIsSubmittingLaunchHire(false);
    }
  };

  const totalListingItems = listingTotal;
  const startListingItem = totalListingItems === 0 ? 0 : (effectiveListingPage - 1) * LISTING_PAGE_SIZE + 1;
  const endListingItem = totalListingItems === 0 ? 0 : Math.min(effectiveListingPage * LISTING_PAGE_SIZE, totalListingItems);

  const listingPaginationPages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, effectiveListingPage - 2);
    const end = Math.min(totalListingPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [effectiveListingPage, totalListingPages]);

  const lastBatch = batches[batches.length - 1];
  const canAddBatch = Boolean(lastBatch) && lastBatch.uploadSteps.crewList.status === "completed";
  const previewBatchLabel = previewBatchId ? `Batch ${previewBatchId}` : "";
  const hasCallInfo = Boolean(formValues?.call_id ?? formValues?.callId ?? card?.call_id ?? card?.callId);

  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <div className="husbandry-service-hero">
          <div className="crew-mgmt-hero-row">
            <div className="crew-mgmt-hero-left">
              <div className="crew-mgmt-hero-text">
                <h2 className="husbandry-service-selection-title">Crew Immigration</h2>
              </div>

              <div className="crew-mgmt-hero-middle crew-immigration-batches">
                {batches.map((batch) => (
                  <div key={batch.id} className="crew-mgmt-crewlist-block">
                    <span className="crew-mgmt-section-label">{batch.label}</span>
                    <CrewListUploadBox
                      movementType={batch.label}
                      movementTypeLabel={batch.label}
                      otherMovementTypeLabel="the next batch"
                      status={batch.uploadSteps.crewList.status}
                      onSelectFile={(file) => handleBatchCrewListFile(batch.id, file)}
                    />
                    <CrewUploadDropzones
                      steps={batch.uploadSteps}
                      onSelectPassportFiles={handleBatchDocCopyUpload(batch.id, "passport")}
                      onSelectIqamaFiles={handleBatchDocCopyUpload(batch.id, "iqama")}
                      onSelectVisaFiles={handleBatchVisaFiles(batch.id)}
                    />
                  </div>
                ))}

                {canAddBatch && (
                  <button type="button" className="crew-immigration-add-batch-btn" onClick={handleAddBatch}>
                    <span aria-hidden="true">+</span> Add Batch
                  </button>
                )}
              </div>
            </div>

            <div className="crew-uploaded-lists-panel" style={{ "--card-color": cardColor }}>
              <span className="crew-mgmt-section-label">Uploaded Crew Lists</span>
              {batches.every((b) => b.uploadSteps.crewList.status !== "completed") ? (
                <div className="crew-uploaded-lists-panel__empty">
                  <span className="crew-uploaded-lists-panel__empty-title">No crew lists uploaded yet</span>
                  <span className="crew-uploaded-lists-panel__empty-subtitle">Upload Batch 1's crew list to get started.</span>
                </div>
              ) : (
                <div className="crew-uploaded-lists-panel__stack">
                  {batches
                    .filter((b) => b.uploadSteps.crewList.status === "completed")
                    .map((batch) => (
                      <BatchUploadedCard key={batch.id} batch={batch} onPreview={handlePreviewBatch} onReplace={handleReplaceBatchClick} />
                    ))}
                </div>
              )}
            </div>
          </div>

          <input
            ref={replaceFileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="crew-doc-input"
            onChange={handleReplaceFileChange}
          />
        </div>

        <div className="crew-mgmt-summary-section">
          <div className="crew-listing-header">
            <div>
              <h2 className="crew-listing-title">Crew Listing</h2>
              <p className="crew-listing-subtitle">Crew documents uploaded across all batches.</p>
            </div>

            <div className="crew-summary-header-actions">
              {launchHireEnabled && (
                <div className="crew-launch-hire-trigger">
                  <button
                    type="button"
                    className="crew-header-btn crew-header-btn--launch-hire crew-header-btn--request-launch-hire"
                    disabled={!hasCallInfo}
                    aria-expanded={showLaunchHireForm}
                    title={!hasCallInfo ? "Call or vessel information is unavailable." : undefined}
                    onClick={handleLaunchHireButtonClick}
                  >
                    <FiNavigation size={14} aria-hidden="true" />
                    <span className="crew-header-btn__label">Request Launch Hire</span>
                  </button>
                  {launchHireRequested && (
                    <span className="crew-launch-hire-status-chip">
                      <FiCheck size={12} aria-hidden="true" />
                      Launch Hire Requested
                    </span>
                  )}
                </div>
              )}

              <div className="crew-summary-search">
                <FiSearch size={14} className="crew-summary-search__icon" />
                <input
                  type="text"
                  className="crew-summary-search__input"
                  placeholder="Search crew name"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                />
              </div>

              {listingSelectedIds.length > 0 && (
                <div className="crew-summary-bulk-actions">
                  <button
                    type="button"
                    className="crew-header-btn"
                    disabled={isUploadingPassports}
                    onClick={() => listingPassportInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">
                      {isUploadingPassports ? "Uploading Passport…" : "Upload Passport"}
                    </span>
                  </button>
                  <input
                    ref={listingPassportInputRef}
                    type="file"
                    multiple
                    className="crew-doc-input"
                    onChange={handleListingBulkCopyUpload("passport")}
                  />
                  <button
                    type="button"
                    className="crew-header-btn"
                    disabled={isUploadingIqamas}
                    onClick={() => listingIqamaInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">
                      {isUploadingIqamas ? "Uploading Iqama…" : "Upload Iqama"}
                    </span>
                  </button>
                  <input
                    ref={listingIqamaInputRef}
                    type="file"
                    multiple
                    className="crew-doc-input"
                    onChange={handleListingBulkCopyUpload("iqama")}
                  />
                  <button
                    type="button"
                    className="crew-header-btn"
                    onClick={() => listingVisaInputRef.current?.click()}
                  >
                    <span className="crew-header-btn__label">Upload Visa</span>
                  </button>
                  <input
                    ref={listingVisaInputRef}
                    type="file"
                    className="crew-doc-input"
                    onChange={handleListingBulkVisaUpload}
                  />
                </div>
              )}
            </div>
          </div>

          <LaunchHireInlineForm
            open={showLaunchHireForm}
            cardColor={cardColor}
            dateValue={launchDate}
            timeValue={launchTime}
            error={launchDateTimeError}
            isSubmitting={isSubmittingLaunchHire}
            onDateTimeChange={handleLaunchDateTimeChange}
            onCancel={handleCancelLaunchHire}
            onSubmit={handleSubmitLaunchHire}
            batchOptions={completedBatches.map((b) => ({ value: b.label, label: b.label }))}
            batchValue={launchBatch}
            onBatchChange={setLaunchBatch}
          />

          {isListingLoading && listingRows.length === 0 ? (
            <p className="crew-summary-empty">Loading crew…</p>
          ) : !isListingLoading && listingTotal === 0 ? (
            <p className="crew-summary-empty">
              {debouncedListingSearch ? "No crew match your search." : "No crew uploaded yet. Upload a batch's crew list to see it here."}
            </p>
          ) : (
            <div className="crew-table-wrapper">
              <div className="table-wrapper table-responsive crew-table-container crew-table-scroll">
                <table className="table table-striped crew-table crew-immigration-listing-table" style={{ "--card-color": cardColor, tableLayout: "fixed", width: "100%" }}>
                  <thead>
                    <tr>
                      <th className="crew-checkbox-cell-header">
                        <input
                          className="crew-list-checkbox crew-list-checkbox--header"
                          type="checkbox"
                          checked={listingSelectedIds.length === listingRows.length && listingRows.length > 0}
                          onChange={handleListingSelectAll}
                        />
                      </th>
                      <th><span className="crew-th">Crew name</span></th>
                      <th><span className="crew-th">Date of birth</span></th>
                      <th><span className="crew-th">Nationality</span></th>
                      <th><span className="crew-th">Rank</span></th>
                      <th><span className="crew-th">Passport / Iqama</span></th>
                      <th><span className="crew-th">Visa</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {listingRows.map((row) => (
                      <tr key={row.id} className={listingSelectedIds.includes(row.id) ? "crew-row-selected" : ""}>
                        <td className="crew-checkbox-cell">
                          <input
                            className="crew-list-checkbox"
                            type="checkbox"
                            checked={listingSelectedIds.includes(row.id)}
                            onChange={() => handleListingRowToggle(row.id)}
                          />
                        </td>
                        <td>
                          <div className="crew-table-cell crew-name-cell" title={row.crewName}>
                            <span className="crew-name-info">
                              <span className="crew-name-text">{row.crewName}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="crew-table-cell" title={row.dateOfBirth}>{row.dateOfBirth || "-"}</div>
                        </td>
                        <td>
                          <div className="crew-table-cell" title={row.nationality}>{row.nationality}</div>
                        </td>
                        <td>
                          <div className="crew-table-cell" title={row.rank}>{row.rank}</div>
                        </td>
                        <td><DocStatusIcon available={row.passportOrIqama} label="Passport / Iqama" /></td>
                        <td><DocStatusIcon available={row.visa} label="Visa" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="crew-pagination">
                <div className="crew-pagination-info">
                  Showing <strong>{startListingItem}–{endListingItem}</strong> of {totalListingItems} crew members
                  {isListingLoading ? " (refreshing…)" : ""}
                </div>
                <div className="crew-pagination-actions">
                  <button
                    type="button"
                    className="crew-pagination-btn crew-pagination-btn--icon"
                    aria-label="Previous page"
                    disabled={effectiveListingPage <= 1}
                    onClick={() => setListingPage((prev) => Math.max(1, prev - 1))}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  {listingPaginationPages.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`crew-pagination-btn${pageNum === effectiveListingPage ? " active" : ""}`}
                      onClick={() => setListingPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="crew-pagination-btn crew-pagination-btn--icon"
                    aria-label="Next page"
                    disabled={effectiveListingPage >= totalListingPages}
                    onClick={() => setListingPage((prev) => Math.min(totalListingPages, prev + 1))}
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
        show={Boolean(previewBatchId)}
        movementTypeLabel={previewBatchLabel}
        crewRows={previewCrewRows}
        cardColor={cardColor}
        onClose={handleClosePreview}
      />
    </div>
  );
};

CrewImmigrationDashboard.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  cardColor: PropTypes.string,
};

export default CrewImmigrationDashboard;
