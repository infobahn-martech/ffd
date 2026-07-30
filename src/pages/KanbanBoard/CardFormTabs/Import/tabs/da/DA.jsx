import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  X, FileText, UploadCloud, Hash, Tag, Clock, User, Ship,
  Sparkles, IdCard, CalendarCheck, Anchor, FileCheck, Receipt, Package,
  Paperclip, FolderOpen, Link2, GitBranch, Trash2, Plus, ArrowUpRight, ChevronDown, Building2, Search,
} from "lucide-react";
import { notify } from "../../../../../../components/Toaster";
import billingEntityService from "../../../../../../services/billingEntityService";
import daService from "../../../../../../services/daService";
import userService from "../../../../../../services/userService";
import { mapBillingEntitiesToOptions, unwrapListResponse } from "../../../../../../shared/helpers/callFileFormOptions";
import { getInitials } from "../../../../../../shared/utils/utils";
import "../../../../../../design/scss/pages/kanban-board/daCardFields.scss";

const SUB_TABS = [
  { key: "summary", label: "Summary", icon: Sparkles },
  { key: "card", label: "Card", icon: IdCard },
  { key: "appointmentClearance", label: "Appointment & Clearance", icon: CalendarCheck },
  { key: "mwpLaunchHire", label: "MWP & Launch Hire", icon: Anchor },
  { key: "clearanceCopies", label: "Clearance Copies", icon: FileCheck },
  { key: "invoicesFees", label: "Invoices, Fees & Certificates", icon: Receipt },
  { key: "billingCargo", label: "Billing", icon: Package },
  { key: "vesselSalesOrder", label: "Vessel & Sales Order", icon: Ship },
  { key: "more", label: "More", icon: Paperclip },
];

const LIST_SECTIONS = [
  { key: "attachments", label: "Attachments", icon: Paperclip, placeholder: "Add an attachment link or name…" },
  { key: "docs", label: "Docs", icon: FolderOpen, placeholder: "Add a doc link or name…" },
  { key: "linksOverview", label: "Links overview", icon: Link2, placeholder: "Add a link…" },
];

const TYPE_ICON = {
  text: Hash,
  date: CalendarCheck,
  datetime: CalendarCheck,
  "number-unit": Hash,
  chips: Tag,
  "billing-entity": Tag,
  files: UploadCloud,
  readonly: Clock,
  user: User,
};

const FIELD_ICON_OVERRIDES = {
  owner: User,
  coOwners: User,
  vesselName: Ship,
};

const RAW_FIELDS_CONFIG = [
  // Card
  { key: "owner", label: "Owner", type: "user", group: "card", placeholder: "Search a user…" },
  { key: "coOwners", label: "Co-owners", type: "user", group: "card", placeholder: "Search a user…" },
  { key: "deadline", label: "Deadline", type: "date", group: "card" },
  { key: "size", label: "Size", type: "text", group: "card", placeholder: "e.g. M" },
  { key: "customCardId", label: "Custom card ID", type: "text", group: "card", placeholder: "e.g. DA-2026-001" },
  { key: "lastMoved", label: "Last moved", type: "readonly", group: "card" },
  { key: "tags", label: "Tags", type: "chips", group: "card", placeholder: "Add tags" },
  // Appointment & Clearance
  { key: "appointmentEmail", label: "Appointment Email", type: "files", group: "appointmentClearance" },
  { key: "inwardClearanceDate", label: "Inward Clearance date", type: "datetime", group: "appointmentClearance" },
  { key: "outwardClearanceDate", label: "Outward Clearance Date", type: "datetime", group: "appointmentClearance" },
  { key: "operationsCompletionDate", label: "Operations completion date", type: "date", group: "appointmentClearance" },
  // MWP & Launch Hire
  { key: "launchHireSlips", label: "Launch Hire Slips", type: "files", group: "mwpLaunchHire" },
  { key: "thirdPartyLaunchHire", label: "3rd Party Launch hire (If any)", type: "text", group: "mwpLaunchHire", placeholder: "e.g. Al Rashid Transport Co." },
  { key: "roadTransport", label: "Road Transport", type: "number-unit", unit: "DAYS", group: "mwpLaunchHire", placeholder: "e.g. 3" },
  // Clearance Copies
  { key: "sailingClearanceCopy", label: "Sailing Clearance Copy", type: "files", group: "clearanceCopies" },
  { key: "inwardClearanceCopy", label: "Inward Clearance Copyy", type: "files", group: "clearanceCopies" },
  { key: "supportingDocuments", label: "SUPPORTING DOCUMENTS", type: "files", group: "clearanceCopies", showCount: true, showDownloadAll: true },
  { key: "fdaDispatchProof", label: "FDA Dispatch Proof", type: "files", group: "clearanceCopies" },
  // Invoices, Fees & Certificates
  { key: "taxInvoice", label: "Tax Invoice", type: "text", group: "invoicesFees", placeholder: "e.g. INV-88213" },
  { key: "srtPoWbs", label: "SRT|PO|WBS", type: "text", group: "invoicesFees", placeholder: "e.g. SRT-2201/PO-9982" },
  { key: "invoiceAmount", label: "Invoice amount (Including VAT)", type: "text", group: "invoicesFees", placeholder: "e.g. 12,500.00" },
  // Billing
  { key: "billingEntity", label: "Billing Entity- -", type: "billing-entity", group: "billingCargo" },
  { key: "billingOthers", label: "Others", type: "text", group: "billingCargo", placeholder: "e.g. Additional billing note" },
  // Vessel & Sales Order
  { key: "vesselName", label: "VESSEL NAME", type: "text", group: "vesselSalesOrder", placeholder: "e.g. MV Atlantic Star" },
  { key: "serviceRequester", label: "Service requester", type: "text", group: "vesselSalesOrder", placeholder: "e.g. Jeffrey Steve" },
  { key: "sapSalesOrderNo", label: "SAP Sales Order No", type: "text", group: "vesselSalesOrder", placeholder: "e.g. 3035188" },
  { key: "srnNo", label: "SRN No. (L & T)", type: "text", group: "vesselSalesOrder", placeholder: "e.g. 683/ CRPO 78/2026" },
  { key: "copyOfSalesOrder", label: "Copy of Sales order", type: "files", group: "vesselSalesOrder" },
  { key: "salesOrderSupportingDocs", label: "Sales Order Supporting documents", type: "files", group: "vesselSalesOrder", showCount: true },
];

const FIELDS_CONFIG = RAW_FIELDS_CONFIG.map((field) => ({
  ...field,
  icon: FIELD_ICON_OVERRIDES[field.key] ?? TYPE_ICON[field.type],
}));

const FIELDS_BY_GROUP = FIELDS_CONFIG.reduce((acc, field) => {
  if (!acc[field.group]) acc[field.group] = [];
  acc[field.group].push(field);
  return acc;
}, {});

// Groups that mix full-width tiles (files/chips) with half-width ones need a fixed
// column count so the full-width tiles end at the same edge as the row above them,
// instead of stretching across extra auto-fit columns on wide screens.
const FIXED_2COL_GROUPS = new Set(["card", "appointmentClearance", "mwpLaunchHire", "billingCargo", "vesselSalesOrder", "invoicesFees"]);

const makeInitialFieldState = () => {
  const state = {};
  FIELDS_CONFIG.forEach((field) => {
    if (field.type === "readonly" || field.type === "billing-entity") return;
    if (field.type === "files") state[field.key] = [];
    else if (field.type === "datetime") state[field.key] = { date: "", time: "" };
    else if (field.type === "chips") state[field.key] = [];
    else state[field.key] = "";
  });
  return state;
};

const formatTimestamp = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// api/da/summary_tab returns "YYYY-MM-DD HH:mm:ss" — render it the same way the rest of
// the app displays timestamps (en-GB, 12h clock).
const formatApiDateTime = (raw) => {
  if (!raw) return null;
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return raw;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Splits "YYYY-MM-DD HH:mm:ss" into the {date, time} shape DateTimeField's
// <input type="date"> / <input type="time"> pair expects.
const parseApiDateTime = (raw) => {
  if (!raw) return { date: "", time: "" };
  const [datePart = "", timePart = ""] = String(raw).trim().split(" ");
  return { date: datePart, time: timePart ? timePart.slice(0, 5) : "" };
};

// Reverse of parseApiDateTime — builds the "YYYY-MM-DD HH:mm:ss" string
// api/da/save_appointment_clearance_tab expects from a DateTimeField's {date, time}.
const combineApiDateTime = ({ date, time } = {}) => {
  if (!date) return "";
  return `${date} ${time ? `${time}:00` : "00:00:00"}`;
};

const getFileUrl = (filePath) => {
  const base = (import.meta.env.VITE_API_ENDPOINT || "").replace(/\/+$/, "");
  const path = String(filePath || "").replace(/^\/+/, "");
  return path ? `${base}/${path}` : "";
};

// api/da/appointment_clearance_tab returns already-uploaded documents (attachment path +
// uploader/date), not browser File objects — map them into the shape FileDropzone renders.
const mapApiDocument = (doc) => {
  const raw = doc?.attachment || "";
  const name = raw.split("/").pop() || raw || "Document";
  return {
    name,
    url: getFileUrl(raw),
    stage_document_id: doc?.stage_document_id ?? null,
    uploaded_by_name: doc?.uploaded_by_name ?? null,
    created_date: doc?.created_date ?? null,
  };
};

function TileLabel({ icon, children }) {
  const Icon = icon;
  return (
    <span className="da-cf-tile-label">
      <span className="da-cf-tile-icon"><Icon size={13} /></span>
      {children}
    </span>
  );
}

TileLabel.propTypes = { icon: PropTypes.elementType.isRequired, children: PropTypes.node.isRequired };

function TextField({ label, icon, value, placeholder, onChange }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <input
        type="text"
        className="da-cf-input"
        value={value}
        placeholder={placeholder ?? "—"}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

// Owner / Co-owners — avatar-trigger + floating search panel, same interaction pattern as
// the app's other user pickers (UserPickerField in BusinessRuleFormModal.jsx): a chevron
// trigger showing the picked user's initials, opening a panel that searches
// users/get_non_vendor_users instead of accepting arbitrary free text.
function UserSearchField({ label, icon, value, placeholder, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const query = filterText.trim();
    clearTimeout(debounceRef.current);
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      const params = { page: 1, limit: 10, ...(query ? { search: query } : {}) };
      userService.getNonVendorUsers({ params })
        .then(({ data }) => setResults(Array.isArray(data?.data) ? data.data : []))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, query ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [filterText, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDocMouseDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (triggerRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setFilterText("");
  };

  const handlePick = (user) => {
    onChange(user?.name ?? "", user);
    setIsOpen(false);
  };

  return (
    <div className="da-cf-tile da-cf-user-search">
      <TileLabel icon={icon}>{label}</TileLabel>
      <button
        type="button"
        ref={triggerRef}
        className="da-cf-input da-cf-user-search-trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="da-cf-user-search-avatar" aria-hidden>{getInitials(value) || <User size={13} />}</span>
        <span className={`da-cf-user-search-trigger-name${value ? "" : " da-cf-user-search-trigger-name--empty"}`}>
          {value || placeholder || "Select a user"}
        </span>
        <ChevronDown size={15} className="da-cf-user-search-chevron" aria-hidden />
      </button>

      {isOpen && (
        <div className="da-cf-user-search-dropdown" ref={panelRef}>
          <div className="da-cf-user-search-filter">
            <Search size={13} className="da-cf-user-search-filter-icon" aria-hidden />
            <input
              type="text"
              placeholder="Search a user…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
          </div>
          <div className="da-cf-user-search-list">
            <button type="button" className="da-cf-user-search-row" onClick={() => handlePick(null)}>
              <span className="da-cf-user-search-avatar" aria-hidden><User size={13} /></span>
              <span className="da-cf-user-search-name">None</span>
            </button>
            {isSearching ? (
              <div className="da-cf-user-search-empty">Searching…</div>
            ) : results.length === 0 ? (
              <div className="da-cf-user-search-empty">No matches</div>
            ) : (
              results.map((user) => (
                <button
                  type="button"
                  key={user.user_id}
                  className="da-cf-user-search-row"
                  onClick={() => handlePick(user)}
                >
                  <span className="da-cf-user-search-avatar" aria-hidden>{getInitials(user.name)}</span>
                  <span className="da-cf-user-search-name">{user.name}</span>
                  {user.role && <span className="da-cf-user-search-role">{user.role}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

UserSearchField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

function DateField({ label, icon, value, onChange }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <input type="date" className="da-cf-input da-cf-input--numeric" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

DateField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function ReadonlyField({ label, icon, value }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <input type="text" className="da-cf-input da-cf-input--readonly da-cf-input--numeric" value={value} readOnly />
    </div>
  );
}

ReadonlyField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
};

function DateTimeField({ label, icon, date, time, onDateChange, onTimeChange }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <div className="da-cf-datetime-row">
        <input type="date" className="da-cf-input da-cf-input--numeric" value={date} onChange={(e) => onDateChange(e.target.value)} />
        <input type="time" className="da-cf-input da-cf-input--numeric" value={time} onChange={(e) => onTimeChange(e.target.value)} />
      </div>
    </div>
  );
}

DateTimeField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
};

function NumberUnitField({ label, icon, value, unit, placeholder, onChange }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <div className="da-cf-unit-input-wrap">
        <input
          type="number"
          min="0"
          className="da-cf-input da-cf-input--numeric da-cf-input--with-unit"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="da-cf-unit-suffix">{unit}</span>
      </div>
    </div>
  );
}

NumberUnitField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

function ChipsField({ label, icon, chips, placeholder, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onAdd(trimmed);
      setDraft("");
    }
  };

  return (
    <div className="da-cf-tile da-cf-tile--full">
      <TileLabel icon={icon}>{label}</TileLabel>
      {chips.length > 0 && (
        <div className="da-cf-chips-row">
          {chips.map((chip, i) => (
            <span className="da-cf-chip" key={`${chip}-${i}`}>
              {chip}
              <button type="button" className="da-cf-chip-remove" onClick={() => onRemove(i)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        className="da-cf-input"
        placeholder={placeholder ?? "Add and press Enter"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

ChipsField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  chips: PropTypes.arrayOf(PropTypes.string).isRequired,
  placeholder: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

function FileDropzone({ label, icon, files, showCount, showDownloadAll, onAddFiles, onRemoveFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []);
    if (arr.length) onAddFiles(arr);
  }, [onAddFiles]);

  const handleDownloadAll = () => {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="da-cf-tile da-cf-tile--full">
      <TileLabel icon={icon}>
        {label}
        {showCount && files.length > 0 && <span className="da-cf-count-badge">{files.length}</span>}
      </TileLabel>
      <div
        className={`da-cf-dropzone${dragging ? " da-cf-dropzone--dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={18} className="da-cf-dropzone-icon" />
        Drag files here or Click to upload
        <input
          ref={inputRef}
          type="file"
          multiple
          className="da-cf-dropzone-input"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="da-cf-file-list">
          {files.map((file, i) => (
            <div className="da-cf-file-row" key={`${file.name}-${i}`}>
              <span className="da-cf-file-icon"><FileText size={14} /></span>
              <div className="da-cf-file-name-wrap">
                {file.url ? (
                  <a className="da-cf-file-name" href={file.url} target="_blank" rel="noreferrer">{file.name}</a>
                ) : (
                  <span className="da-cf-file-name">{file.name}</span>
                )}
                {file.uploaded_by_name && (
                  <span className="da-cf-file-meta">
                    {file.uploaded_by_name}
                    {file.created_date ? ` · ${formatApiDateTime(file.created_date)}` : ""}
                  </span>
                )}
              </div>
              <button type="button" className="da-cf-file-remove" onClick={() => onRemoveFile(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {showDownloadAll && files.length > 0 && (
        <div className="da-cf-file-actions-row">
          <button type="button" className="da-cf-download-all" onClick={handleDownloadAll}>
            Download all files
          </button>
        </div>
      )}
    </div>
  );
}

FileDropzone.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  files: PropTypes.array.isRequired,
  showCount: PropTypes.bool,
  showDownloadAll: PropTypes.bool,
  onAddFiles: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

function AutoBillingEntityField({ label, icon, value, isLoading }) {
  return (
    <div className="da-cf-tile">
      <TileLabel icon={icon}>{label}</TileLabel>
      <input
        type="text"
        className="da-cf-input da-cf-input--readonly"
        value={isLoading ? "Loading…" : value}
        placeholder="Not set in Appointment Details / Operation yet"
        readOnly
      />
      <span className="da-cf-tile-hint">Auto-filled from Appointment Details / Operation — not editable here.</span>
    </div>
  );
}

AutoBillingEntityField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

function SummaryPanel({ fieldValues, billingEntityLabel, summaryData, isLoadingSummary }) {
  const formatDateTime = (dt) => (dt?.date ? `${dt.date}${dt.time ? ` · ${dt.time}` : ""}` : null);

  // api/da/summary_tab/{call_id} is the source of truth once it loads; until then, or if
  // it comes back without a field, fall back to what's already been typed in other tabs.
  const isSummaryPending = isLoadingSummary && !summaryData;
  const apiValue = (key, fallback) =>
    isSummaryPending ? "Loading…" : (summaryData?.[key] || fallback);
  const apiDateValue = (key, fallback) =>
    isSummaryPending ? "Loading…" : (formatApiDateTime(summaryData?.[key]) || fallback);

  const stats = [
    { label: "Vessel", value: fieldValues.vesselName, icon: Ship },
    { label: "Owner", value: fieldValues.owner, icon: User },
    { label: "Vessel Owner", value: apiValue("vessel_owner", null), icon: Building2 },
    { label: "Inward Clearance", value: apiDateValue("inward_clearance_date", formatDateTime(fieldValues.inwardClearanceDate)), icon: CalendarCheck },
    { label: "Outward Clearance", value: apiDateValue("outward_clearance_date", formatDateTime(fieldValues.outwardClearanceDate)), icon: CalendarCheck },
    { label: "Billing Entity", value: apiValue("billing_entity", billingEntityLabel || null), icon: Package },
    { label: "SAP Sales Order No", value: apiValue("sap_sales_order_no", fieldValues.sapSalesOrderNo), icon: Receipt },
  ];

  return (
    <div className="da-cf-stat-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div className="da-cf-stat-tile" key={stat.label}>
            <span className="da-cf-stat-icon"><Icon size={15} /></span>
            <div className="da-cf-stat-body">
              <span className="da-cf-stat-label">{stat.label}</span>
              <span className={`da-cf-stat-value${stat.value ? "" : " da-cf-stat-value--empty"}`}>
                {stat.value || "Not filled in yet"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

SummaryPanel.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  billingEntityLabel: PropTypes.string,
  summaryData: PropTypes.object,
  isLoadingSummary: PropTypes.bool,
};

function ListRowsSection({ label, icon, rows, collapsed, onToggleCollapse, onAdd, onChangeRow, onRemoveRow, placeholder }) {
  const Icon = icon;
  return (
    <div className="da-cf-more-section">
      <button type="button" className="da-cf-more-section-header" onClick={onToggleCollapse}>
        <span className={`da-cf-more-chevron${collapsed ? " da-cf-more-chevron--collapsed" : ""}`}><ChevronDown size={15} /></span>
        <span className="da-cf-tile-icon"><Icon size={13} /></span>
        <span className="da-cf-more-section-title">{label} ({rows.length})</span>
        <span
          className="da-cf-more-add-btn"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onAdd(); } }}
        >
          <Plus size={14} />
        </span>
      </button>
      {!collapsed && (
        rows.length === 0 ? (
          <p className="da-cf-more-empty">Nothing added yet.</p>
        ) : (
          <div className="da-cf-more-rows">
            {rows.map((row, i) => (
              <div className="da-cf-more-row" key={row.id}>
                <input
                  type="text"
                  className="da-cf-input"
                  value={row.value}
                  placeholder={placeholder}
                  onChange={(e) => onChangeRow(i, e.target.value)}
                />
                <button type="button" className="da-cf-more-row-remove" onClick={() => onRemoveRow(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

ListRowsSection.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, value: PropTypes.string })).isRequired,
  collapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onChangeRow: PropTypes.func.isRequired,
  onRemoveRow: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

function RelativesSection({ rows, collapsed, onToggleCollapse, onAdd, onChangeRow, onRemoveRow }) {
  return (
    <div className="da-cf-more-section">
      <button type="button" className="da-cf-more-section-header" onClick={onToggleCollapse}>
        <span className={`da-cf-more-chevron${collapsed ? " da-cf-more-chevron--collapsed" : ""}`}><ChevronDown size={15} /></span>
        <span className="da-cf-tile-icon"><GitBranch size={13} /></span>
        <span className="da-cf-more-section-title">Relatives &amp; Dependencies ({rows.length})</span>
        <span
          className="da-cf-more-add-btn"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onAdd(); } }}
        >
          <Plus size={14} />
        </span>
      </button>
      {!collapsed && (
        rows.length === 0 ? (
          <p className="da-cf-more-empty">No related cards yet.</p>
        ) : (
          <div className="da-cf-more-rows">
            {rows.map((row, i) => (
              <div className="da-cf-more-row" key={row.id}>
                <span className="da-cf-more-relative-icon"><ArrowUpRight size={14} /></span>
                <input
                  type="text"
                  className="da-cf-input"
                  value={row.value}
                  placeholder="e.g. VESSEL NAME - OUTWARD CLEARANCE ON ..."
                  onChange={(e) => onChangeRow(i, e.target.value)}
                />
                <button type="button" className="da-cf-more-row-remove" onClick={() => onRemoveRow(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

RelativesSection.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, value: PropTypes.string })).isRequired,
  collapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onChangeRow: PropTypes.func.isRequired,
  onRemoveRow: PropTypes.func.isRequired,
};

function DA({ card, formValues }) {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [fieldValues, setFieldValues] = useState(makeInitialFieldState);
  // co_owner_id isn't a visible field — UserSearchField only exposes the picked user's
  // name — but api/da/save_card_tab needs the id, so it's tracked alongside coOwners.
  const [coOwnerId, setCoOwnerId] = useState(null);
  const [lastMovedDisplay] = useState(() => formatTimestamp(new Date()));

  // api/da/summary_tab/{call_id} — feeds the Summary sub-tab with the real,
  // backend-resolved values (clearance dates, billing entity, SAP sales order no,
  // vessel owner) instead of relying only on locally-typed fields from other tabs.
  const callId = card?.call_id ?? card?.callId ?? card?.id ?? null;
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    setIsLoadingSummary(true);
    daService.getSummaryTab(callId)
      .then(({ data }) => {
        if (!cancelled) setSummaryData(data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setSummaryData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSummary(false);
      });
    return () => { cancelled = true; };
  }, [callId]);

  // api/da/card_tab/{call_id} — hydrates the editable "Card" sub-tab fields
  // (owner, co-owner, deadline, size, custom card ID, tags) with the backend's
  // saved values once, when the card first loads.
  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    daService.getCardTab(callId)
      .then(({ data }) => {
        if (cancelled) return;
        const cardData = data?.data;
        if (!cardData) return;
        setFieldValues((prev) => ({
          ...prev,
          owner: cardData.owner_name ?? prev.owner,
          coOwners: cardData.co_owner_name ?? prev.coOwners,
          deadline: cardData.deadline ?? prev.deadline,
          size: cardData.size ?? prev.size,
          customCardId: cardData.custom_card_id ?? prev.customCardId,
          tags: cardData.tags
            ? cardData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : prev.tags,
        }));
        setCoOwnerId(cardData.co_owner_id ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [callId]);

  // api/da/appointment_clearance_tab/{call_id} — hydrates the "Appointment & Clearance"
  // sub-tab (clearance/operations dates + the Appointment Email documents already
  // uploaded against this call) once, when the card first loads.
  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    daService.getAppointmentClearanceTab(callId)
      .then(({ data }) => {
        if (cancelled) return;
        const tabData = data?.data;
        if (!tabData) return;
        const appointmentEmailDocs = tabData.documents?.["Appointment Email"];
        setFieldValues((prev) => ({
          ...prev,
          inwardClearanceDate: tabData.inward_clearance_date
            ? parseApiDateTime(tabData.inward_clearance_date)
            : prev.inwardClearanceDate,
          outwardClearanceDate: tabData.outward_clearance_date
            ? parseApiDateTime(tabData.outward_clearance_date)
            : prev.outwardClearanceDate,
          operationsCompletionDate: tabData.operations_completion_date
            ? String(tabData.operations_completion_date).slice(0, 10)
            : prev.operationsCompletionDate,
          appointmentEmail: Array.isArray(appointmentEmailDocs)
            ? appointmentEmailDocs.map(mapApiDocument)
            : prev.appointmentEmail,
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [callId]);

  // api/da/save_card_tab/{call_id} — persists the Card sub-tab fields. current_sticker_id
  // comes from the card's global sticker picker (formValues.card_sticker_id, set via the
  // "Sticker" button in the card header) rather than a field on this tab.
  const [isSavingCardTab, setIsSavingCardTab] = useState(false);

  const handleSaveCardTab = useCallback(async () => {
    if (callId == null) {
      notify("Call ID is required before saving.", "error", "top-center");
      return;
    }
    const stickerId = formValues?.card_sticker_id ?? formValues?.sticker_id;

    const formData = new FormData();
    if (coOwnerId != null && coOwnerId !== "") formData.append("co_owner_id", coOwnerId);
    if (stickerId != null && stickerId !== "") formData.append("current_sticker_id", stickerId);
    formData.append("deadline", fieldValues.deadline || "");
    formData.append("size", fieldValues.size || "");
    formData.append("custom_card_id", fieldValues.customCardId || "");
    formData.append("tags", fieldValues.tags.join(", "));

    setIsSavingCardTab(true);
    try {
      await daService.saveCardTab(callId, formData);
      notify("Card details saved.", "success", "top-center");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to save card details.", "error", "top-center");
    } finally {
      setIsSavingCardTab(false);
    }
  }, [callId, coOwnerId, formValues, fieldValues]);

  // api/da/save_appointment_clearance_tab/{call_id} — persists the "Appointment &
  // Clearance" sub-tab. Only newly-picked browser File objects in appointmentEmail are
  // uploaded; documents already hydrated from the GET (mapApiDocument) aren't File
  // instances and are skipped so they aren't re-uploaded.
  const [isSavingAppointmentClearanceTab, setIsSavingAppointmentClearanceTab] = useState(false);

  const handleSaveAppointmentClearanceTab = useCallback(async () => {
    if (callId == null) {
      notify("Call ID is required before saving.", "error", "top-center");
      return;
    }
    const formData = new FormData();
    formData.append("inward_clearance_date", combineApiDateTime(fieldValues.inwardClearanceDate));
    formData.append("outward_clearance_date", combineApiDateTime(fieldValues.outwardClearanceDate));
    formData.append("operations_completion_date", fieldValues.operationsCompletionDate || "");
    fieldValues.appointmentEmail
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("appointment_email[]", file));

    setIsSavingAppointmentClearanceTab(true);
    try {
      await daService.saveAppointmentClearanceTab(callId, formData);
      notify("Appointment & Clearance details saved.", "success", "top-center");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to save appointment & clearance details.", "error", "top-center");
    } finally {
      setIsSavingAppointmentClearanceTab(false);
    }
  }, [callId, fieldValues]);

  const updateField = useCallback((key, value) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const rowIdCounter = useRef(0);
  const nextRowId = () => `row-${++rowIdCounter.current}`;

  // Billing Entity isn't entered here — it's already captured in the Appointment
  // Details / Operation tabs (formValues.mainBillingEntity / vesselBillingEntity /
  // tugBillingEntity / otherBillingEntity), so this tab just resolves that id to a
  // display name and mirrors it, read-only.
  const [billingEntityOptions, setBillingEntityOptions] = useState([]);
  const [isBillingEntityLoading, setIsBillingEntityLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadBillingEntities = async () => {
      setIsBillingEntityLoading(true);
      try {
        const { data } = await billingEntityService.getBillingEntities({ params: { page: 1, limit: 1000 } });
        const options = mapBillingEntitiesToOptions(unwrapListResponse(data));
        if (!cancelled) setBillingEntityOptions(options);
      } catch {
        if (!cancelled) setBillingEntityOptions([]);
      } finally {
        if (!cancelled) setIsBillingEntityLoading(false);
      }
    };
    loadBillingEntities();
    return () => { cancelled = true; };
  }, []);

  const billingEntityId =
    formValues?.mainBillingEntity ||
    formValues?.vesselBillingEntity ||
    formValues?.tugBillingEntity ||
    formValues?.otherBillingEntity ||
    "";
  const billingEntityLabel = billingEntityId
    ? billingEntityOptions.find((opt) => opt.value === String(billingEntityId))?.label ?? ""
    : "";

  const [listSections, setListSections] = useState(() => ({
    attachments: { rows: [], collapsed: false },
    docs: { rows: [], collapsed: false },
    linksOverview: { rows: [], collapsed: false },
  }));

  const addListRow = (sectionKey) => {
    setListSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], rows: [...prev[sectionKey].rows, { id: nextRowId(), value: "" }] },
    }));
  };
  const changeListRow = (sectionKey, idx, value) => {
    setListSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        rows: prev[sectionKey].rows.map((row, i) => (i === idx ? { ...row, value } : row)),
      },
    }));
  };
  const removeListRow = (sectionKey, idx) => {
    setListSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], rows: prev[sectionKey].rows.filter((_, i) => i !== idx) },
    }));
  };
  const toggleListCollapse = (sectionKey) => {
    setListSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], collapsed: !prev[sectionKey].collapsed },
    }));
  };

  const [relatives, setRelatives] = useState([]);
  const [relativesCollapsed, setRelativesCollapsed] = useState(false);
  const addRelative = () => setRelatives((prev) => [...prev, { id: nextRowId(), value: "" }]);
  const changeRelative = (idx, value) =>
    setRelatives((prev) => prev.map((row, i) => (i === idx ? { ...row, value } : row)));
  const removeRelative = (idx) => setRelatives((prev) => prev.filter((_, i) => i !== idx));

  const renderField = (field) => {
    const value = fieldValues[field.key];
    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.key}
            label={field.label}
            icon={field.icon}
            value={value}
            placeholder={field.placeholder}
            onChange={(v) => updateField(field.key, v)}
          />
        );
      case "user":
        return (
          <UserSearchField
            key={field.key}
            label={field.label}
            icon={field.icon}
            value={value}
            placeholder={field.placeholder}
            onChange={(v, user) => {
              updateField(field.key, v);
              if (field.key === "coOwners") setCoOwnerId(user?.user_id ?? null);
            }}
          />
        );
      case "date":
        return (
          <DateField
            key={field.key}
            label={field.label}
            icon={field.icon}
            value={value}
            onChange={(v) => updateField(field.key, v)}
          />
        );
      case "readonly":
        return <ReadonlyField key={field.key} label={field.label} icon={field.icon} value={lastMovedDisplay} />;
      case "datetime":
        return (
          <DateTimeField
            key={field.key}
            label={field.label}
            icon={field.icon}
            date={value.date}
            time={value.time}
            onDateChange={(v) => updateField(field.key, { ...value, date: v })}
            onTimeChange={(v) => updateField(field.key, { ...value, time: v })}
          />
        );
      case "number-unit":
        return (
          <NumberUnitField
            key={field.key}
            label={field.label}
            icon={field.icon}
            unit={field.unit}
            value={value}
            placeholder={field.placeholder}
            onChange={(v) => updateField(field.key, v)}
          />
        );
      case "chips":
        return (
          <ChipsField
            key={field.key}
            label={field.label}
            icon={field.icon}
            chips={value}
            placeholder={field.placeholder}
            onAdd={(chip) => updateField(field.key, [...value, chip])}
            onRemove={(i) => updateField(field.key, value.filter((_, idx) => idx !== i))}
          />
        );
      case "files":
        return (
          <FileDropzone
            key={field.key}
            label={field.label}
            icon={field.icon}
            files={value}
            showCount={field.showCount}
            showDownloadAll={field.showDownloadAll}
            onAddFiles={(newFiles) => updateField(field.key, [...value, ...newFiles])}
            onRemoveFile={(i) => updateField(field.key, value.filter((_, idx) => idx !== i))}
          />
        );
      case "billing-entity":
        return (
          <AutoBillingEntityField
            key={field.key}
            label={field.label}
            icon={field.icon}
            value={billingEntityLabel}
            isLoading={isBillingEntityLoading}
          />
        );
      default:
        return null;
    }
  };

  const activeTabMeta = SUB_TABS.find((tab) => tab.key === activeSubTab);
  const activeFields = FIELDS_BY_GROUP[activeSubTab] ?? [];
  const ActiveGroupIcon = activeTabMeta.icon;

  return (
    <div className="cardform-body da-cf-panel">
      <div className="da-cf-save-banner">
        <span className="da-cf-save-dot" />
        Not saved yet — changes save automatically to this browser
      </div>

      <div className="da-cf-subtabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`da-cf-subtab${activeSubTab === tab.key ? " da-cf-subtab--active" : ""}`}
              onClick={() => setActiveSubTab(tab.key)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="da-cf-subtab-body">
        <div className="da-cf-group-header">
          <span className="da-cf-group-icon"><ActiveGroupIcon size={16} /></span>
          <h4 className="da-cf-group-title">{activeTabMeta.label}</h4>
          {activeSubTab !== "summary" && activeSubTab !== "more" && (
            <span className="da-cf-group-count">{activeFields.length} field{activeFields.length === 1 ? "" : "s"}</span>
          )}
          {activeSubTab === "card" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveCardTab}
              disabled={isSavingCardTab || callId == null}
            >
              {isSavingCardTab ? "Saving…" : "Save"}
            </button>
          )}
          {activeSubTab === "appointmentClearance" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAppointmentClearanceTab}
              disabled={isSavingAppointmentClearanceTab || callId == null}
            >
              {isSavingAppointmentClearanceTab ? "Saving…" : "Save"}
            </button>
          )}
        </div>

        {activeSubTab === "summary" ? (
          <SummaryPanel
            fieldValues={fieldValues}
            billingEntityLabel={billingEntityLabel}
            summaryData={summaryData}
            isLoadingSummary={isLoadingSummary}
          />
        ) : activeSubTab === "more" ? (
          <div className="da-cf-more">
            {LIST_SECTIONS.map((section) => (
              <ListRowsSection
                key={section.key}
                label={section.label}
                icon={section.icon}
                rows={listSections[section.key].rows}
                collapsed={listSections[section.key].collapsed}
                onToggleCollapse={() => toggleListCollapse(section.key)}
                onAdd={() => addListRow(section.key)}
                onChangeRow={(i, v) => changeListRow(section.key, i, v)}
                onRemoveRow={(i) => removeListRow(section.key, i)}
                placeholder={section.placeholder}
              />
            ))}
            <RelativesSection
              rows={relatives}
              collapsed={relativesCollapsed}
              onToggleCollapse={() => setRelativesCollapsed((c) => !c)}
              onAdd={addRelative}
              onChangeRow={changeRelative}
              onRemoveRow={removeRelative}
            />
          </div>
        ) : (
          <div className={`da-cf-fields-grid${FIXED_2COL_GROUPS.has(activeSubTab) ? " da-cf-fields-grid--fixed2" : ""}`}>
            {activeFields.map((field) => renderField(field))}
          </div>
        )}
      </div>
    </div>
  );
}

DA.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
};

export default DA;
