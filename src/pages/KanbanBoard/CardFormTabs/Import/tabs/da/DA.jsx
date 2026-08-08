import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  X, FileText, UploadCloud, Hash, Tag, Clock, User, Ship,
  Sparkles, IdCard, CalendarCheck, Anchor, FileCheck, Receipt, Package,
  Paperclip, FolderOpen, Link2, GitBranch, Trash2, Plus, ArrowUpRight, ChevronDown, Building2, Search,
  CheckCircle2, CircleDashed, Banknote, FileArchive, ShieldCheck, UserCog, Loader2, AlertCircle, Eye,
  Download, Printer,
} from "lucide-react";
import { debounce } from "lodash";
import { notify } from "../../../../../../components/Toaster";
import CustomModal from "../../../../../../components/CustomModal";
import billingEntityService from "../../../../../../services/billingEntityService";
import daService from "../../../../../../services/daService";
import userService from "../../../../../../services/userService";
import { mapBillingEntitiesToOptions, unwrapListResponse } from "../../../../../../shared/helpers/callFileFormOptions";
import { getInitials } from "../../../../../../shared/utils/utils";
import { useDaLocalReachedDates, useDaLocalLaunchHire } from "../../../../../../shared/store/daStore";
import "../../../../../../design/scss/pages/kanban-board/daCardFields.scss";

// Card / Appointment & Clearance / MWP / Launch Hire / Clearance Copies / Invoices,
// Fees & Certificates / Vessel & Sales Order tabs were folded into DA Operations and
// DA Documents (see those branches below) and are no longer shown as their own tabs —
// their FIELDS_CONFIG groups and render branches stay since Operation Details, DA
// Documents etc. still read the same underlying fieldValues keys.
const SUB_TABS = [
  { key: "summary", label: "Summary", icon: Sparkles },
  { key: "daOperator", label: "DA Operations", icon: UserCog },
  { key: "daDocuments", label: "DA Documents", icon: FolderOpen },
  { key: "more", label: "Link", icon: Paperclip },
];

// Tabs long enough that the "More below" scroll hint (see daOperationsRef in the DA
// component) is worth showing.
const SCROLL_HINT_TABS = ["summary", "daOperator", "daDocuments"];

// Nested sub-tabs shown inside the "DA Operations" tab.
const DA_OPERATOR_SUB_TABS = [
  { key: "operationDetails", label: "Operation Details", icon: Anchor },
  { key: "clearanceDetails", label: "Clearance Details", icon: CalendarCheck },
  { key: "launchHire", label: "Launch Hire", icon: Ship },
  { key: "invoice", label: "Invoice", icon: Receipt },
  { key: "salesOrder", label: "Sales Order", icon: FileText },
];

// Matches the debounce delay used for the Export Approval tab's autosave (Approval.jsx).
const AUTO_SAVE_DEBOUNCE_MS = 1200;

const LIST_SECTIONS = [
  { key: "attachments", label: "Attachments", icon: Paperclip, placeholder: "Add an attachment link or name…", accent: "#2563eb" },
  { key: "docs", label: "Docs", icon: FolderOpen, placeholder: "Add a doc link or name…", accent: "#7c3aed" },
  { key: "linksOverview", label: "Links overview", icon: Link2, placeholder: "Add a link…", accent: "#059669" },
];

// api/da/required_documents/{call_id} — read-only reference documents. The full list
// (see RequiredDocumentsSection below) is shown at the bottom of the "Clearance Copies"
// sub-tab; the MWP-tagged subset is also surfaced separately inside the "MWP" sub-tab.
const REQUIRED_DOCUMENTS_CONFIG = [
  { key: "immigration_doc", label: "Crew Immigration", icon: User },
  { key: "mwp_doc", label: "MWP", icon: ShieldCheck, section: "mwp", accent: "#0891b2" },
  { key: "mwp_subscription_sadad", label: "MWP Subscription (SADAD)", icon: Banknote, section: "mwp", accent: "#d97706" },
  { key: "final_bayan_doc", label: "Final Bayan", icon: FileText },
  { key: "mawani_invoice", label: "Mawani Invoice", icon: Receipt },
  { key: "ibtikar_invoice", label: "Ibtikar Invoice", icon: Receipt },
  { key: "cargo_final_bayan", label: "Cargo Final Bayan", icon: Package },
];

const MWP_REQUIRED_DOCUMENTS_CONFIG = REQUIRED_DOCUMENTS_CONFIG.filter((doc) => doc.section === "mwp");
const FINAL_BAYAN_REQUIRED_DOCUMENTS_CONFIG = REQUIRED_DOCUMENTS_CONFIG.filter(
  (doc) => doc.key === "final_bayan_doc" || doc.key === "cargo_final_bayan"
);
const OTHER_REQUIRED_DOCUMENTS_CONFIG = REQUIRED_DOCUMENTS_CONFIG.filter(
  (doc) => doc.section !== "mwp" && doc.key !== "final_bayan_doc" && doc.key !== "cargo_final_bayan"
);

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
  attachmentFiles: Paperclip,
  docFiles: FolderOpen,
};

const RAW_FIELDS_CONFIG = [
  // Card
  { key: "coOwners", label: "Co-owners", type: "user", group: "card", placeholder: "Search a user…" },
  { key: "customCardId", label: "Custom card ID", type: "text", group: "card", placeholder: "e.g. DA-2026-001" },
  { key: "lastMoved", label: "Last moved", type: "readonly", group: "card" },
  { key: "tags", label: "Tags", type: "chips", group: "card", placeholder: "Add tags" },
  { key: "billingOthers", label: "Billing Note", type: "text", group: "card", placeholder: "e.g. Additional billing note" },
  // Appointment & Clearance
  { key: "appointmentEmail", label: "Appointment Email", type: "files", group: "appointmentClearance" },
  { key: "inwardClearanceDate", label: "Inward Clearance date", type: "datetime", group: "appointmentClearance" },
  { key: "outwardClearanceDate", label: "Outward Clearance Date", type: "datetime", group: "appointmentClearance" },
  { key: "operationsCompletionDate", label: "Operations completion date", type: "date", group: "appointmentClearance" },
  // Launch Hire
  { key: "launchHireSlips", label: "Launch Hire Slips", type: "files", group: "launchHire" },
  { key: "thirdPartyLaunchHire", label: "3rd Party Launch hire (If any)", type: "text", group: "launchHire", placeholder: "e.g. Al Rashid Transport Co." },
  { key: "roadTransport", label: "Road Transport", type: "number-unit", unit: "DAYS", group: "launchHire", placeholder: "e.g. 3" },
  // Clearance Copies
  { key: "sailingClearanceCopy", label: "Sailing Clearance Copy", type: "files", group: "clearanceCopies", reserveSpace: true },
  { key: "inwardClearanceCopy", label: "Inward Clearance Copy", type: "files", group: "clearanceCopies", reserveSpace: true },
  { key: "supportingDocuments", label: "SUPPORTING DOCUMENTS", type: "files", group: "clearanceCopies", showCount: true, showDownloadAll: true, reserveSpace: true, documentName: "Supporting Documents" },
  { key: "fdaDispatchProof", label: "FDA Dispatch Proof", type: "files", group: "clearanceCopies", reserveSpace: true },
  // Invoices, Fees & Certificates
  { key: "taxInvoice", label: "Tax Invoice", type: "text", group: "invoicesFees", placeholder: "e.g. INV-88213" },
  { key: "srtPoWbs", label: "SRT / PO / WBS", type: "text", group: "invoicesFees", placeholder: "e.g. SRT-2201/PO-9982" },
  { key: "invoiceAmount", label: "Invoice amount (Including VAT)", type: "text", group: "invoicesFees", placeholder: "e.g. 12,500.00" },
  // Vessel & Sales Order
  { key: "vesselName", label: "VESSEL NAME", type: "text", group: "vesselSalesOrder", placeholder: "e.g. MV Atlantic Star" },
  { key: "serviceRequester", label: "Service requester", type: "text", group: "vesselSalesOrder", placeholder: "e.g. Jeffrey Steve" },
  { key: "sapSalesOrderNo", label: "SAP Sales Order No", type: "text", group: "vesselSalesOrder", placeholder: "e.g. 3035188" },
  { key: "srnNo", label: "SRN No. (L & T)", type: "text", group: "vesselSalesOrder", placeholder: "e.g. 683/ CRPO 78/2026" },
  { key: "copyOfSalesOrder", label: "Copy of Sales order", type: "files", group: "vesselSalesOrder" },
  { key: "salesOrderSupportingDocs", label: "Sales Order Supporting documents", type: "files", group: "vesselSalesOrder", showCount: true },
  // DA Operations > Operation Details — mirrors fields already captured in Card / Vessel
  // & Sales Order above, kept in sync since they share the same fieldValues keys.
  { key: "vesselName", label: "Vessel", type: "text", group: "operationDetails", placeholder: "e.g. MV Atlantic Star" },
  { key: "coOwners", label: "Co-owner", type: "user", group: "operationDetails", placeholder: "Search a user…" },
  { key: "serviceRequester", label: "Service requester", type: "text", group: "operationDetails", placeholder: "e.g. Jeffrey Steve" },
  { key: "billingOthers", label: "Billing Note", type: "text", group: "operationDetails", placeholder: "e.g. Additional billing note" },
  { key: "lastMoved", label: "Last moved", type: "readonly", group: "operationDetails" },
  // DA Documents — file fields already captured in Launch Hire / Clearance Copies /
  // Vessel & Sales Order above, gathered onto one page. sailingClearanceCopy is
  // relabeled "Outward Clearance Copy" here to pair with Inward Clearance Copy.
  { key: "launchHireSlips", label: "Launch Hire Slips", type: "files", group: "daDocuments", reserveSpace: true },
  { key: "inwardClearanceCopy", label: "Inward Clearance Copy", type: "files", group: "daDocuments", reserveSpace: true },
  { key: "sailingClearanceCopy", label: "Outward Clearance Copy", type: "files", group: "daDocuments", reserveSpace: true },
  { key: "copyOfSalesOrder", label: "Sales Order Copy", type: "files", group: "daDocuments", reserveSpace: true },
  // documentName values below must be the exact document group label from
  // documents_tab's response (Title Case, spaces) — download_section_zip matches
  // on this literal string, not the save_documents_tab snake_case formData keys.
  { key: "salesOrderSupportingDocs", label: "Sales Order supporting docs", type: "files", group: "daDocuments", showCount: true, showDownloadAll: true, documentName: "Sales Order Supporting Documents", reserveSpace: true },
  { key: "fdaDispatchProof", label: "FDA Dispatch Proof", type: "files", group: "daDocuments", reserveSpace: true },
  { key: "supportingDocuments", label: "Supporting Docs", type: "files", group: "daDocuments", showCount: true, showDownloadAll: true, documentName: "Supporting Documents", reserveSpace: true },
  // Attachments / Docs — were free-form text/link rows (LIST_SECTIONS below); the
  // documents_tab GET already returns these as real uploaded documents (same shape as
  // FDA Dispatch Proof etc.), so they get the same drag-and-drop/view/delete FileDropzone
  // treatment here instead. The "Link" tab's own free-form "Links overview" list is
  // unrelated and untouched.
  { key: "attachmentFiles", label: "Attachments", type: "files", group: "daDocuments", showCount: true, showDownloadAll: true, documentName: "Attachments", reserveSpace: true },
  { key: "docFiles", label: "Docs", type: "files", group: "daDocuments", showCount: true, showDownloadAll: true, documentName: "Docs", reserveSpace: true },
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

// Owner, Vessel Owner and Billing Entity aren't editable anywhere in the app (they're
// resolved from summary_tab / the billing entity lookup), so Operation Details shows
// them as ReadonlyField tiles rather than routing them through renderField.
const OPERATION_DETAILS_FIELDS_BY_KEY = (FIELDS_BY_GROUP.operationDetails ?? [])
  .reduce((acc, f) => ({ ...acc, [f.key]: f }), {});

const DA_DOCUMENTS_FIELDS_BY_KEY = (FIELDS_BY_GROUP.daDocuments ?? [])
  .reduce((acc, f) => ({ ...acc, [f.key]: f }), {});

// "Link" tab shows the free-form "Links overview" text/link list (separate from DA
// Documents' docFiles upload field above).
const MORE_TAB_LIST_SECTIONS = LIST_SECTIONS.filter((s) => s.key === "linksOverview");

// DA Operations > Launch Hire — same card-hero treatment as the other DA Operations
// sections (Clearance Details, Invoice, Sales Order): 3rd Party Launch hire and Road
// Transport, minus the Launch Hire Slips upload, so it isn't the odd one out styled
// as plain field tiles.
const LAUNCH_HIRE_CARDS = [
  { key: "thirdPartyLaunchHire", type: "text", icon: Ship, label: "3rd Party Launch hire (If any)", hint: "Name of the third-party company handling launch hire, if any.", accent: "#2563eb", placeholder: "e.g. Al Rashid Transport Co." },
  { key: "roadTransport", type: "number-unit", icon: Hash, label: "Road Transport", hint: "Number of days required for road transport.", accent: "#d97706", unit: "DAYS", placeholder: "e.g. 3" },
];

// Synced from api/da/operation_tab/{call_id} (third_party_launch_hire, road_transport_days)
// when the backend has a value, but always editable regardless — save_operation_tab has no
// field for either, so typed values are saved via the local-only useDaLocalLaunchHire
// fallback (see updateField in DA below) since there's no real backend field to persist to.
function LaunchHireCardsSection({ fieldValues, updateField }) {
  return (
    <div className="da-cf-ac-grid">
      {LAUNCH_HIRE_CARDS.map((card) => {
        const Icon = card.icon;
        const value = fieldValues[card.key];
        return (
          <div
            className={`da-cf-ac-card${value ? " da-cf-ac-card--done" : ""}`}
            style={{ "--step-accent": card.accent }}
            key={card.key}
          >
            <div className="da-cf-ac-card-head">
              <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
              <h5 className="da-cf-ac-card-title">{card.label}</h5>
            </div>
            <div className="da-cf-ac-card-field">
              {card.type === "number-unit" ? (
                <NumberUnitField
                  label={card.label}
                  icon={Icon}
                  unit={card.unit}
                  value={value}
                  placeholder={card.placeholder}
                  onChange={(v) => updateField(card.key, v)}
                />
              ) : (
                <TextField
                  label={card.label}
                  icon={Icon}
                  value={value}
                  placeholder={card.placeholder}
                  onChange={(v) => updateField(card.key, v)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

LaunchHireCardsSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
};

// Groups that mix full-width tiles (files/chips) with half-width ones need a fixed
// column count so the full-width tiles end at the same edge as the row above them,
// instead of stretching across extra auto-fit columns on wide screens.
const FIXED_2COL_GROUPS = new Set(["launchHire"]);

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

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
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

function TextField({ label, icon, value, placeholder, onChange, accent }) {
  return (
    <div className="da-cf-tile" style={{ "--tile-accent": accent }}>
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
  accent: PropTypes.string,
};

// Co-owners is DA-specific, so its picker is scoped to DA users (role_id 22 — see
// isDaRole in Approval.jsx) via users/get_users_by_role, same function/payload used by
// the other role-scoped user pickers in the app (e.g. GROCardView's assignee select).
const CO_OWNER_ROLE_ID = 22;

// Owner / Co-owners — avatar-trigger + floating search panel, same interaction pattern as
// the app's other user pickers (UserPickerField in BusinessRuleFormModal.jsx): a chevron
// trigger showing the picked user's initials, opening a panel to pick from the fetched
// role-scoped user list (filtered client-side as you type, not a per-keystroke search call).
function UserSearchField({ label, icon, value, placeholder, onChange, accent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [roleUsers, setRoleUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    setIsSearching(true);
    userService.getUsersByRole({ role_id: CO_OWNER_ROLE_ID })
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setRoleUsers(
          list.map((u) => ({
            user_id: u.user_id ?? u.id,
            name: u.name ?? u.user_name ?? u.full_name ?? `User ${u.user_id ?? u.id}`,
            role: u.role,
          }))
        );
      })
      .catch(() => { if (!cancelled) setRoleUsers([]); })
      .finally(() => { if (!cancelled) setIsSearching(false); });
    return () => { cancelled = true; };
  }, [isOpen]);

  const results = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return roleUsers;
    return roleUsers.filter((u) => (u.name || "").toLowerCase().includes(query));
  }, [roleUsers, filterText]);

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
    <div className="da-cf-tile da-cf-user-search" style={{ "--tile-accent": accent }}>
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
  accent: PropTypes.string,
};

function DateField({ label, icon, value, onChange, accent }) {
  return (
    <div className="da-cf-tile" style={{ "--tile-accent": accent }}>
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
  accent: PropTypes.string,
};

function ReadonlyField({ label, icon, value, accent }) {
  return (
    <div className="da-cf-tile" style={{ "--tile-accent": accent }}>
      <TileLabel icon={icon}>{label}</TileLabel>
      <input type="text" className="da-cf-input da-cf-input--readonly da-cf-input--numeric" value={value} readOnly />
    </div>
  );
}

ReadonlyField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  accent: PropTypes.string,
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

function ChipsField({ label, icon, chips, placeholder, onAdd, onRemove, accent }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onAdd(trimmed);
      setDraft("");
    }
  };

  return (
    <div className="da-cf-tile da-cf-tile--full" style={{ "--tile-accent": accent }}>
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
  accent: PropTypes.string,
};

// Image and PDF files get their own lightbox (view) with explicit Download/Print
// actions instead of a bare new tab; other file types still just open in a new tab.
const IMAGE_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]);
const isImageFile = (file) => {
  const name = file?.name || file?.url || "";
  const ext = name.split(".").pop()?.toLowerCase();
  return IMAGE_FILE_EXTENSIONS.has(ext);
};
const isPdfFile = (file) => {
  const name = file?.name || file?.url || "";
  return name.split(".").pop()?.toLowerCase() === "pdf";
};
const isPreviewableFile = (file) => isImageFile(file) || isPdfFile(file);

function FileDropzone({ label, icon, files, showCount, showDownloadAll, documentName, callId, reserveSpace, readOnly, isLoading, id, highlighted, onAddFiles, onRemoveFile }) {
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    // Freshly picked File objects have no .url until the backend roundtrip finishes,
    // so the eye icon (isPreviewableFile below) would stay hidden until then — give
    // previewable types a local blob URL right away so preview works immediately.
    arr.forEach((file) => {
      if (isPreviewableFile(file)) file.url = URL.createObjectURL(file);
    });
    onAddFiles(arr);
  }, [onAddFiles]);

  // api/da/download_section_zip/{call_id}?document_name= — comes back as a real zip
  // file, but a failed lookup returns a JSON error body with the same 200/blob
  // response type, so the content-type is checked before treating it as a download
  // (same pattern as exportExecutionLogsFile in BusinessRuleReducer).
  const handleDownloadAll = async () => {
    if (callId == null || isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      const response = await daService.downloadSectionZip(callId, documentName);
      const contentType = response.headers?.["content-type"] ?? "";
      if (contentType.includes("json")) {
        const text = await response.data.text();
        let message = "Failed to download zip.";
        try { message = JSON.parse(text)?.message ?? message; } catch { /* not JSON */ }
        notify(message, "error", "top-center");
        return;
      }
      const blob = new Blob([response.data], { type: contentType || "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${label || documentName}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      let message = "Failed to download zip.";
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text)?.message ?? message;
        } catch { /* not JSON */ }
      } else {
        message = err?.response?.data?.message || message;
      }
      notify(message, "error", "top-center");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handlePrintPreview = () => {
    if (!previewFile) return;
    const win = window.open(previewFile.url, "_blank");
    if (win) win.onload = () => win.print();
  };

  // A plain <a href download> doesn't reliably force a save (some browsers just
  // navigate/open the file instead, e.g. for blob: URLs) — fetching the bytes and
  // clicking a detached link is the same proven approach handleDownloadAll uses above.
  const handleDownloadPreview = async () => {
    if (!previewFile) return;
    try {
      const response = await fetch(previewFile.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = previewFile.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify("Failed to download file.", "error", "top-center");
    }
  };

  return (
    <>
    <div id={id} className={`da-cf-tile da-cf-tile--full${highlighted ? " da-cf-tile--highlighted" : ""}`}>
      <TileLabel icon={icon}>
        {label}
        {showCount && files.length > 0 && <span className="da-cf-count-badge">{files.length}</span>}
      </TileLabel>
      {!readOnly && (
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
      )}
      {files.length > 0 ? (
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
              {file.url && (
                isPreviewableFile(file) ? (
                  <button
                    type="button"
                    className="da-cf-file-view"
                    onClick={() => setPreviewFile(file)}
                    title="View document"
                  >
                    <Eye size={14} />
                  </button>
                ) : (
                  <a
                    className="da-cf-file-view"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    title="View document"
                  >
                    <Eye size={14} />
                  </a>
                )
              )}
              {!readOnly && (
                <button type="button" className="da-cf-file-remove" onClick={() => onRemoveFile(i)}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : reserveSpace ? (
        // Some of these fields get their file synced in from the backend rather than
        // uploaded here, so this reserves the same row height up front — the card
        // doesn't grow/shift once that data arrives.
        <div className="da-cf-file-list">
          <div className="da-cf-file-row da-cf-file-row--placeholder">
            <span className="da-cf-file-icon"><FileText size={14} /></span>
            <div className="da-cf-file-name-wrap">
              <span className="da-cf-file-name da-cf-file-name--placeholder">
                {isLoading ? "Loading…" : "No file synced yet"}
              </span>
            </div>
          </div>
        </div>
      ) : null}
      {showDownloadAll && files.length > 0 && (
        <div className="da-cf-file-actions-row">
          <button type="button" className="da-cf-download-all" onClick={handleDownloadAll} disabled={isDownloadingZip}>
            {isDownloadingZip ? <Loader2 size={13} className="da-cf-autosave-status-spin" /> : <FileArchive size={13} />}
            {isDownloadingZip ? "Downloading…" : "Download all as ZIP"}
          </button>
        </div>
      )}
    </div>
    {previewFile && (
      <CustomModal
        show
        closeModal={() => setPreviewFile(null)}
        createModal
        dialgName="da-cf-image-preview-dialog"
        bodyClassname="da-cf-image-preview-body"
        header={
          <div className="da-cf-image-preview-header">
            <span className="da-cf-image-preview-title">{previewFile.name}</span>
            <div className="da-cf-image-preview-actions">
              <button type="button" className="da-cf-file-view" onClick={handleDownloadPreview} title="Download">
                <Download size={16} />
              </button>
              <button type="button" className="da-cf-file-view" onClick={handlePrintPreview} title="Print">
                <Printer size={16} />
              </button>
              <button type="button" className="da-cf-file-view" onClick={() => setPreviewFile(null)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>
        }
        body={
          isPdfFile(previewFile) ? (
            <iframe className="da-cf-pdf-preview-frame" src={previewFile.url} title={previewFile.name} />
          ) : (
            <img className="da-cf-image-preview-img" src={previewFile.url} alt={previewFile.name} />
          )
        }
      />
    )}
    </>
  );
}

FileDropzone.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  files: PropTypes.array.isRequired,
  showCount: PropTypes.bool,
  showDownloadAll: PropTypes.bool,
  documentName: PropTypes.string,
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reserveSpace: PropTypes.bool,
  readOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
  id: PropTypes.string,
  highlighted: PropTypes.bool,
  onAddFiles: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

// Read-only tile for an api/da/required_documents/{call_id} entry — synced-only, no upload.
function RequiredDocTile({ doc, requiredDocuments, isLoading }) {
  const entry = requiredDocuments?.[doc.key];
  const files = entry?.file_url ? [{ name: entry.file_name || doc.label, url: entry.file_url }] : [];
  return (
    <FileDropzone
      label={doc.label}
      icon={doc.icon}
      files={files}
      reserveSpace
      readOnly
      isLoading={isLoading}
      onAddFiles={() => {}}
      onRemoveFile={() => {}}
    />
  );
}

RequiredDocTile.propTypes = {
  doc: PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, icon: PropTypes.elementType }).isRequired,
  requiredDocuments: PropTypes.object,
  isLoading: PropTypes.bool,
};

// api/da/status_timeline/{call_id} rows: { status_name, sequence_order, state, reached_date }.
// state comes back as "done" | "current" | "not_reached" — mapped to this section's
// "done" | "current" | "pending" below.
const STATUS_TIMELINE_STATE_MAP = { done: "done", current: "current", not_reached: "pending" };

const mapStatusTimelineResponse = (rows) => {
  const mapped = [...(Array.isArray(rows) ? rows : [])]
    .sort((a, b) => Number(a?.sequence_order ?? 0) - Number(b?.sequence_order ?? 0))
    .map((row) => {
      const { date, time } = parseApiDateTime(row?.reached_date);
      return {
        key: String(row?.sequence_order ?? row?.status_name ?? ""),
        label: row?.status_name ?? "",
        date: date || null,
        time: time || null,
        state: STATUS_TIMELINE_STATE_MAP[row?.state] ?? "pending",
      };
    });

  // api/da/status_timeline doesn't reliably send back a "current" row — a brand-new
  // card returns every row "not_reached", and advancing past a step (see
  // handleDaTimelineStepClick, CardForm.jsx) only flips the completed row to "done"
  // without promoting the next one to "current". Derive it client-side so the
  // click-to-advance logic below (isForwardClickable) always has a "current" step to
  // act on: the first non-done row after the last "done" one is the one in progress.
  if (!mapped.some((step) => step.state === "current")) {
    const nextPending = mapped.find((step) => step.state !== "done");
    if (nextPending) nextPending.state = "current";
  }

  return mapped;
};

function StatusTimelineSection({ steps, onStepClick, isLoading, isAdvancing }) {
  return (
    <div className="da-cf-timeline-card">
      <div className="da-cf-timeline-header">
        <h3 className="da-cf-summary-section-heading da-cf-timeline-heading">
          <Clock size={14} className="da-cf-timeline-heading-icon" />
          DA Status Timeline
        </h3>
        {isLoading && steps.length === 0 && <span className="da-cf-summary-card-value--empty">Loading…</span>}
      </div>
      <div className="da-cf-timeline">
        {steps.map((step, index) => {
          const displayState = step.state;
          const Icon = displayState === "done" ? CheckCircle2 : displayState === "current" ? Clock : CircleDashed;
          // Three click targets:
          // - "current" step's round moves the DA forward one stage. Sending
          //   api/da/update_status the CURRENT step's own status_name is a no-op (it's
          //   already that status), so this sends the *next* step's label instead.
          // - the "up next" pending step (right after the current one) does the same
          //   forward move — clicking the step you're moving TO also completes the
          //   current one, since both name the same destination status.
          // - a "done" step's round moves the DA back one stage, but only the step right
          //   before the current one — reverting is one-by-one too, not a jump straight
          //   back to an arbitrary earlier stage.
          const prevStep = steps[index - 1];
          const nextStep = steps[index + 1];
          const isForwardClickable = step.state === "current" && Boolean(nextStep);
          const isUpNextClickable = step.state === "pending" && prevStep?.state === "current";
          const isBackClickable = step.state === "done" && nextStep?.state === "current";
          const isClickable = Boolean(onStepClick) && !isAdvancing && (isForwardClickable || isUpNextClickable || isBackClickable);
          const targetLabel = isForwardClickable ? nextStep.label : step.label;
          return (
            <div className={`da-cf-timeline-step da-cf-timeline-step--${displayState}`} key={step.key}>
              <div className="da-cf-timeline-step-marker">
                {isClickable ? (
                  <button
                    type="button"
                    className="da-cf-timeline-step-icon da-cf-timeline-step-icon--clickable"
                    title={isBackClickable ? `Revert to "${targetLabel}"` : `Move to "${targetLabel}"`}
                    onClick={() => onStepClick(targetLabel)}
                  >
                    <Icon size={16} />
                  </button>
                ) : (
                  <span className="da-cf-timeline-step-icon">
                    <Icon size={16} />
                  </span>
                )}
                {index < steps.length - 1 && (
                  <span className="da-cf-timeline-step-connector" title={steps[index + 1].label} />
                )}
              </div>
              <div className="da-cf-timeline-step-body">
                <span className="da-cf-timeline-step-label">{step.label}</span>
                <span className={`da-cf-timeline-status-badge da-cf-timeline-status-badge--${displayState}`}>
                  {displayState === "done" ? "Completed" : displayState === "current" ? "In progress" : "Not reached"}
                </span>
                {step.state === "done" && step.date && (
                  <span className="da-cf-timeline-step-date">
                    <CalendarCheck size={10} className="da-cf-timeline-step-date-icon" aria-hidden />
                    {formatDisplayDateOnly(step.date)}{step.time ? ` · ${step.time}` : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StatusTimelineSection.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      date: PropTypes.string,
      time: PropTypes.string,
      state: PropTypes.oneOf(["done", "current", "pending"]),
    })
  ).isRequired,
  onStepClick: PropTypes.func,
  isLoading: PropTypes.bool,
  isAdvancing: PropTypes.bool,
};

function SummaryPanel({ callId, fieldValues, billingEntityLabel, summaryData, isLoadingSummary, statusTimeline, isLoadingStatusTimeline, onAdvanceDaStage, isAdvancingDaStage, onNavigateToDocTile }) {
  const formatDateTime = (dt) => (dt?.date ? `${dt.date}${dt.time ? ` · ${dt.time}` : ""}` : null);

  const getLocalReachedDate = useDaLocalReachedDates((s) => s.getReachedDate);

  // api/da/update_status doesn't persist reached_date yet (backend gap) — for a step that's
  // done but has no reached_date from the API, fall back to the client's own timestamp from
  // when it was clicked (see setDaLocalReachedDate in CardForm.jsx). The API value always
  // wins once the backend actually returns one.
  const timelineSteps = useMemo(() => {
    const mapped = mapStatusTimelineResponse(statusTimeline);
    if (callId == null) return mapped;
    return mapped.map((step) => {
      if (step.state !== "done" || step.date) return step;
      const fallback = getLocalReachedDate(String(callId).trim(), step.label);
      if (!fallback) return step;
      const { date, time } = parseApiDateTime(fallback);
      return date ? { ...step, date, time: time || null } : step;
    });
  }, [statusTimeline, callId, getLocalReachedDate]);

  // api/da/summary_tab/{call_id} is the source of truth once it loads; until then, or if
  // it comes back without a field, fall back to what's already been typed in other tabs.
  const isSummaryPending = isLoadingSummary && !summaryData;
  const apiValue = (key, fallback) =>
    isSummaryPending ? "Loading…" : (summaryData?.[key] || fallback);
  const apiDateValue = (key, fallback) =>
    isSummaryPending ? "Loading…" : (formatApiDateTime(summaryData?.[key]) || fallback);

  const stats = [
    { label: "Vessel", value: apiValue("vessel_name", fieldValues.vesselName), icon: Ship, accent: "#2563eb" },
    { label: "Owner", value: apiValue("call_owner_name", fieldValues.owner), icon: User, accent: "#0d9488" },
    { label: "Vessel Owner", value: apiValue("vessel_owner", null), icon: Building2, accent: "#d97706" },
    { label: "Inward Clearance", value: apiDateValue("inward_clearance_date", formatDateTime(fieldValues.inwardClearanceDate)), icon: CalendarCheck, accent: "#0891b2", docTileKey: "inwardClearanceCopy" },
    { label: "Outward Clearance", value: apiDateValue("outward_clearance_date", formatDateTime(fieldValues.outwardClearanceDate)), icon: CalendarCheck, accent: "#7c3aed", docTileKey: "sailingClearanceCopy" },
    { label: "Billing Entity", value: apiValue("billing_entity", billingEntityLabel || null), icon: Package, accent: "#e11d48" },
    { label: "SAP Sales Order No", value: apiValue("sap_sales_order_no", fieldValues.sapSalesOrderNo), icon: Receipt, accent: "#059669" },
  ];

  return (
    <div className="da-cf-summary">
      <StatusTimelineSection
        steps={timelineSteps}
        isLoading={isLoadingStatusTimeline}
        onStepClick={onAdvanceDaStage}
        isAdvancing={isAdvancingDaStage}
      />

      <h3 className="da-cf-summary-section-heading">Overview</h3>

      <div className="da-cf-summary-cards">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = Boolean(stat.docTileKey && onNavigateToDocTile);
          const goToDocTile = () => onNavigateToDocTile(stat.docTileKey);
          return (
            <div
              className={`da-cf-summary-card${isClickable ? " da-cf-summary-card--clickable" : ""}`}
              key={stat.label}
              style={{ "--stagger-index": index, "--summary-accent": stat.accent }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? goToDocTile : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToDocTile(); } } : undefined}
              title={isClickable ? "View in DA Documents" : undefined}
            >
              <span className="da-cf-summary-card-icon"><Icon size={22} /></span>
              <div className="da-cf-summary-card-content">
                <span className="da-cf-summary-card-label">{stat.label}</span>
                <p className={`da-cf-summary-card-value${stat.value ? "" : " da-cf-summary-card-value--empty"}`}>
                  {stat.value || "Not filled in yet"}
                </p>
              </div>
              {isClickable && <ArrowUpRight size={14} className="da-cf-summary-card-arrow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

SummaryPanel.propTypes = {
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fieldValues: PropTypes.object.isRequired,
  billingEntityLabel: PropTypes.string,
  summaryData: PropTypes.object,
  isLoadingSummary: PropTypes.bool,
  statusTimeline: PropTypes.array,
  isLoadingStatusTimeline: PropTypes.bool,
  onAdvanceDaStage: PropTypes.func,
  isAdvancingDaStage: PropTypes.bool,
  onNavigateToDocTile: PropTypes.func,
};

function ListRowsSection({ label, icon, rows, collapsed, onToggleCollapse, onAdd, onChangeRow, onRemoveRow, placeholder, accent }) {
  const Icon = icon;
  return (
    <div className="da-cf-more-card" style={{ "--step-accent": accent }}>
      <button type="button" className="da-cf-more-card-header" onClick={onToggleCollapse}>
        <span className="da-cf-more-card-icon"><Icon size={20} /></span>
        <div className="da-cf-more-card-heading">
          <h5 className="da-cf-more-card-title">{label}</h5>
          <span className="da-cf-more-card-count">{rows.length} item{rows.length === 1 ? "" : "s"}</span>
        </div>
        <span
          className="da-cf-more-add-btn"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onAdd(); } }}
          title={`Add ${label.toLowerCase()}`}
        >
          <Plus size={15} />
        </span>
        <span className={`da-cf-more-chevron${collapsed ? " da-cf-more-chevron--collapsed" : ""}`}><ChevronDown size={16} /></span>
      </button>
      {!collapsed && (
        rows.length === 0 ? (
          <p className="da-cf-more-empty">Nothing added yet.</p>
        ) : (
          <div className="da-cf-more-rows">
            {rows.map((row, i) => (
              <div className="da-cf-more-row" key={row.id}>
                <Icon size={13} className="da-cf-more-row-icon" />
                <input
                  type="text"
                  className="da-cf-input"
                  value={row.value}
                  placeholder={placeholder}
                  onChange={(e) => onChangeRow(i, e.target.value)}
                />
                <button type="button" className="da-cf-more-row-remove" onClick={() => onRemoveRow(i)} title="Remove">
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
  accent: PropTypes.string,
};

function RelativesSection({ rows, collapsed, onToggleCollapse, onAdd, onChangeRow, onRemoveRow, accent }) {
  return (
    <div className="da-cf-more-card" style={{ "--step-accent": accent }}>
      <button type="button" className="da-cf-more-card-header" onClick={onToggleCollapse}>
        <span className="da-cf-more-card-icon"><GitBranch size={20} /></span>
        <div className="da-cf-more-card-heading">
          <h5 className="da-cf-more-card-title">Relatives &amp; Dependencies</h5>
          <span className="da-cf-more-card-count">{rows.length} item{rows.length === 1 ? "" : "s"}</span>
        </div>
        <span
          className="da-cf-more-add-btn"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onAdd(); } }}
          title="Add related card"
        >
          <Plus size={15} />
        </span>
        <span className={`da-cf-more-chevron${collapsed ? " da-cf-more-chevron--collapsed" : ""}`}><ChevronDown size={16} /></span>
      </button>
      {!collapsed && (
        rows.length === 0 ? (
          <p className="da-cf-more-empty">No related cards yet.</p>
        ) : (
          <div className="da-cf-more-rows">
            {rows.map((row, i) => (
              <div className="da-cf-more-row" key={row.id}>
                <ArrowUpRight size={14} className="da-cf-more-row-icon" />
                <input
                  type="text"
                  className="da-cf-input"
                  value={row.value}
                  placeholder="e.g. VESSEL NAME - OUTWARD CLEARANCE ON ..."
                  onChange={(e) => onChangeRow(i, e.target.value)}
                />
                <button type="button" className="da-cf-more-row-remove" onClick={() => onRemoveRow(i)} title="Remove">
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
  accent: PropTypes.string,
};

// Read-only list fed by api/da/required_documents/{call_id} — each entry is
// either already uploaded elsewhere in the system (file_name/file_url set)
// or still pending, unlike the editable FileDropzone fields above it.
function RequiredDocumentsSection({ documents, isLoading, configs = REQUIRED_DOCUMENTS_CONFIG, title = "Required Documents", standalone = false, large = false }) {
  const uploadedCount = configs.filter((doc) => documents?.[doc.key]?.file_url).length;
  const totalCount = configs.length;
  const progressPct = totalCount ? Math.round((uploadedCount / totalCount) * 100) : 0;

  return (
    <div className={`da-cf-required-docs${standalone ? " da-cf-required-docs--standalone" : ""}${large ? " da-cf-required-docs--large" : ""}`}>
      <div className="da-cf-required-docs-header">
        <h5 className="da-cf-required-docs-title">{title}</h5>
        {!isLoading && (
          <span className="da-cf-required-docs-progress-label">{uploadedCount} of {totalCount} uploaded</span>
        )}
      </div>
      <div className="da-cf-required-docs-progress-track" style={{ "--da-progress": `${progressPct}%` }}>
        <div className="da-cf-required-docs-progress-fill" />
      </div>
      <div className="da-cf-required-docs-grid">
        {configs.map((doc) => {
          const Icon = doc.icon;
          const entry = documents?.[doc.key];
          const fileName = entry?.file_name || null;
          const fileUrl = entry?.file_url || null;
          const isUploaded = Boolean(fileUrl);
          return (
            <div
              className={`da-cf-required-doc-card${isUploaded ? " da-cf-required-doc-card--done" : ""}`}
              style={{ "--doc-accent": doc.accent }}
              key={doc.key}
            >
              <span className="da-cf-required-doc-icon"><Icon size={15} /></span>
              <div className="da-cf-required-doc-body">
                <span className="da-cf-required-doc-label">{doc.label}</span>
                {isLoading ? (
                  <span className="da-cf-required-doc-status">Loading…</span>
                ) : isUploaded ? (
                  <a className="da-cf-required-doc-link" href={fileUrl} target="_blank" rel="noreferrer">{fileName || "View file"}</a>
                ) : (
                  <span className="da-cf-required-doc-status da-cf-required-doc-status--pending">Not uploaded yet</span>
                )}
              </div>
              <span className={`da-cf-required-doc-badge${isUploaded ? " da-cf-required-doc-badge--done" : ""}`}>
                {isUploaded ? <CheckCircle2 size={13} /> : <CircleDashed size={13} />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

RequiredDocumentsSection.propTypes = {
  documents: PropTypes.object,
  isLoading: PropTypes.bool,
  configs: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, icon: PropTypes.elementType, accent: PropTypes.string })),
  title: PropTypes.string,
  standalone: PropTypes.bool,
  large: PropTypes.bool,
};

// Operations completion is a plain date (no time) — a lighter formatter than
// formatApiDateTime so the read-only card doesn't show a spurious "00:00".
const formatDisplayDateOnly = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// api/da/time_objects/{call_id} rows (ETA/ATA/ETD/ATD…), rendered as label/value pairs
// inside the Inward Clearance / Outward Clearance cards below. Falls back to whatever's
// passed in when this call has no matching time objects yet.
function TimeObjectRows({ items, fallback, isLoading }) {
  if (isLoading && !items.length) return <p className="da-cf-ac-readonly-value">Loading…</p>;
  if (!items.length) return fallback;
  return (
    <div className="da-cf-ac-timeobject-rows">
      {items.map((item) => (
        <div className="da-cf-ac-timeobject-row" key={item.time_object_id}>
          <span className="da-cf-ac-timeobject-label">{item.time_object}</span>
          <span className="da-cf-ac-timeobject-value">{formatApiDateTime(item.time_object_value) || "—"}</span>
        </div>
      ))}
    </div>
  );
}

TimeObjectRows.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      time_object_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      time_object: PropTypes.string,
      time_object_value: PropTypes.string,
    })
  ).isRequired,
  fallback: PropTypes.node,
  isLoading: PropTypes.bool,
};

// Appointment & Clearance sub-tab: only the Appointment Email is something the user
// actually fills in here — the 3 clearance dates are populated from elsewhere in the
// backend, so they're shown read-only (no inputs, no save) instead of editable fields,
// and laid out as a 2x2 card grid rather than a step-by-step flow.
function AppointmentClearanceSection({ fieldValues, updateField, onRemoveDocument, arrivalTimeObjects, departureTimeObjects, isLoadingTimeObjects }) {
  const cards = [
    {
      key: "appointmentEmail",
      icon: Paperclip,
      label: "Appointment Email",
      hint: "Upload the appointment confirmation email.",
      accent: "#2563eb",
      editable: true,
      isDone: fieldValues.appointmentEmail.length > 0,
      content: (
        <FileDropzone
          label="Appointment Email"
          icon={Paperclip}
          files={fieldValues.appointmentEmail}
          onAddFiles={(newFiles) => updateField("appointmentEmail", [...fieldValues.appointmentEmail, ...newFiles])}
          onRemoveFile={(i) => onRemoveDocument("appointmentEmail", i)}
        />
      ),
    },
    {
      key: "inwardClearanceDate",
      icon: CalendarCheck,
      label: "Inward Clearance",
      hint: "Estimated / actual arrival times synced from the backend for this call.",
      accent: "#0891b2",
      editable: false,
      isDone: arrivalTimeObjects.length > 0 || Boolean(fieldValues.inwardClearanceDate.date),
      content: (
        <TimeObjectRows
          items={arrivalTimeObjects}
          isLoading={isLoadingTimeObjects}
          fallback={
            <p className="da-cf-ac-readonly-value">
              {fieldValues.inwardClearanceDate.date
                ? formatApiDateTime(combineApiDateTime(fieldValues.inwardClearanceDate))
                : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
            </p>
          }
        />
      ),
    },
    {
      key: "operationsCompletionDate",
      icon: Anchor,
      label: "Operations Completion",
      hint: "Synced from the backend once operations are marked complete.",
      accent: "#d97706",
      editable: false,
      isDone: Boolean(fieldValues.operationsCompletionDate),
      content: (
        <p className="da-cf-ac-readonly-value">
          {fieldValues.operationsCompletionDate
            ? formatDisplayDateOnly(fieldValues.operationsCompletionDate)
            : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
        </p>
      ),
    },
    {
      key: "outwardClearanceDate",
      icon: CalendarCheck,
      label: "Outward Clearance",
      hint: "Estimated / actual departure times synced from the backend for this call.",
      accent: "#7c3aed",
      editable: false,
      isDone: departureTimeObjects.length > 0 || Boolean(fieldValues.outwardClearanceDate.date),
      content: (
        <TimeObjectRows
          items={departureTimeObjects}
          isLoading={isLoadingTimeObjects}
          fallback={
            <p className="da-cf-ac-readonly-value">
              {fieldValues.outwardClearanceDate.date
                ? formatApiDateTime(combineApiDateTime(fieldValues.outwardClearanceDate))
                : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
            </p>
          }
        />
      ),
    },
  ];

  return (
    <>
      <div className="da-cf-summary-hero">
        <div className="da-cf-summary-hero-main">
          <p className="da-cf-summary-hero-eyebrow">Appointment &amp; Clearance</p>
          <h2 className="da-cf-summary-title">Clearance Overview</h2>
          <p className="da-cf-summary-hero-subtitle">
            Upload the appointment email and track the clearance dates synced from the backend for this call.
          </p>
        </div>
      </div>

      <div className="da-cf-ac-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              className={`da-cf-ac-card${card.isDone ? " da-cf-ac-card--done" : ""}`}
              style={{ "--step-accent": card.accent }}
              key={card.key}
            >
              <div className="da-cf-ac-card-head">
                <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
                <h5 className="da-cf-ac-card-title">{card.label}</h5>
              </div>
              <p className="da-cf-ac-card-hint">{card.hint}</p>
              <div className="da-cf-ac-card-field">{card.content}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

AppointmentClearanceSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
  onRemoveDocument: PropTypes.func.isRequired,
  arrivalTimeObjects: PropTypes.array.isRequired,
  departureTimeObjects: PropTypes.array.isRequired,
  isLoadingTimeObjects: PropTypes.bool,
};

// DA Operations > Clearance Details — the same 3 date cards from AppointmentClearanceSection
// above (Inward Clearance, Outward Clearance, Operations Completion), minus the editable
// Appointment Email upload, reused here so the dates stay in sync wherever they're shown.
// All 3 are always read-only (synced from time_objects / appointment_clearance_tab) — this
// data only ever comes from the backend, there's no manual-entry fallback.
function ClearanceDetailsSection({ fieldValues, arrivalTimeObjects, departureTimeObjects, isLoadingTimeObjects }) {
  const cards = [
    {
      key: "inwardClearanceDate",
      icon: CalendarCheck,
      label: "Inward Clearance Date",
      accent: "#0891b2",
      isDone: arrivalTimeObjects.length > 0 || Boolean(fieldValues.inwardClearanceDate.date),
      content: (
        <TimeObjectRows
          items={arrivalTimeObjects}
          isLoading={isLoadingTimeObjects}
          fallback={
            <p className="da-cf-ac-readonly-value">
              {fieldValues.inwardClearanceDate.date
                ? formatApiDateTime(combineApiDateTime(fieldValues.inwardClearanceDate))
                : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
            </p>
          }
        />
      ),
    },
    {
      key: "outwardClearanceDate",
      icon: CalendarCheck,
      label: "Outward Clearance Date",
      accent: "#7c3aed",
      isDone: departureTimeObjects.length > 0 || Boolean(fieldValues.outwardClearanceDate.date),
      content: (
        <TimeObjectRows
          items={departureTimeObjects}
          isLoading={isLoadingTimeObjects}
          fallback={
            <p className="da-cf-ac-readonly-value">
              {fieldValues.outwardClearanceDate.date
                ? formatApiDateTime(combineApiDateTime(fieldValues.outwardClearanceDate))
                : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
            </p>
          }
        />
      ),
    },
    {
      key: "operationsCompletionDate",
      icon: Anchor,
      label: "Operation Completed Date",
      accent: "#d97706",
      isDone: Boolean(fieldValues.operationsCompletionDate),
      content: (
        <p className="da-cf-ac-readonly-value">
          {fieldValues.operationsCompletionDate
            ? formatDisplayDateOnly(fieldValues.operationsCompletionDate)
            : <span className="da-cf-ac-readonly-empty">Not set yet</span>}
        </p>
      ),
    },
  ];

  return (
    <div className="da-cf-ac-grid da-cf-ac-grid--3col">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            className={`da-cf-ac-card${card.isDone ? " da-cf-ac-card--done" : ""}`}
            style={{ "--step-accent": card.accent }}
            key={card.key}
          >
            <div className="da-cf-ac-card-head">
              <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
              <h5 className="da-cf-ac-card-title">{card.label}</h5>
            </div>
            <div className="da-cf-ac-card-field">{card.content}</div>
          </div>
        );
      })}
    </div>
  );
}

ClearanceDetailsSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  arrivalTimeObjects: PropTypes.array.isRequired,
  departureTimeObjects: PropTypes.array.isRequired,
  isLoadingTimeObjects: PropTypes.bool,
};

// Invoices, Fees & Certificates sub-tab — same 3 fields as before (taxInvoice, srtPoWbs,
// invoiceAmount), just re-laid-out as a card-hero grid in the same visual language as
// AppointmentClearanceSection (.da-cf-ac-*) instead of the plain field grid other tabs use.
const INVOICES_FEES_CARDS = [
  {
    key: "taxInvoice",
    icon: Receipt,
    label: "Tax Invoice",
    hint: "Reference number of the tax invoice issued for this call.",
    accent: "#2563eb",
    placeholder: "e.g. INV-88213",
  },
  {
    key: "srtPoWbs",
    icon: Hash,
    label: "SRT / PO / WBS",
    hint: "Cross-reference codes for SRT, PO and WBS tracking.",
    accent: "#0891b2",
    placeholder: "e.g. SRT-2201/PO-9982",
  },
  {
    key: "invoiceAmount",
    icon: Banknote,
    label: "Invoice amount (Including VAT)",
    hint: "Total invoice amount including VAT, in the billing currency.",
    accent: "#059669",
    placeholder: "e.g. 12,500.00",
  },
];

function InvoicesFeesSection({ fieldValues, updateField }) {
  return (
    <>
      <div className="da-cf-summary-hero">
        <div className="da-cf-summary-hero-main">
          <p className="da-cf-summary-hero-eyebrow">Invoices, Fees &amp; Certificates</p>
          <h2 className="da-cf-summary-title">Invoice Overview</h2>
          <p className="da-cf-summary-hero-subtitle">
            Track the tax invoice, cross-reference codes and total invoice amount for this call.
          </p>
        </div>
      </div>

      <div className="da-cf-ac-grid da-cf-ac-grid--3col">
        {INVOICES_FEES_CARDS.map((card) => {
          const Icon = card.icon;
          const value = fieldValues[card.key];
          return (
            <div
              className={`da-cf-ac-card${value ? " da-cf-ac-card--done" : ""}`}
              style={{ "--step-accent": card.accent }}
              key={card.key}
            >
              <div className="da-cf-ac-card-head">
                <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
                <h5 className="da-cf-ac-card-title">{card.label}</h5>
              </div>
              <p className="da-cf-ac-card-hint">{card.hint}</p>
              <div className="da-cf-ac-card-field">
                <TextField
                  label={card.label}
                  icon={Icon}
                  value={value}
                  placeholder={card.placeholder}
                  onChange={(v) => updateField(card.key, v)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

InvoicesFeesSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
};

// DA Operations > Invoice — the same 3 cards from InvoicesFeesSection above (Tax
// Invoice, SRT / PO / WBS, Invoice amount), minus its own hero header since the ops-card
// wrapper already has a "Invoice" title. All 3 are editable; Tax Invoice / Invoice amount
// persist via api/da/save_operation_tab/{call_id}, while SRT / PO / WBS has no field in
// that payload, so typed values are saved via the local-only useDaLocalLaunchHire
// fallback (see updateField in DA below) since there's no real backend field to persist to.
const INVOICE_CARDS_EDITABLE_KEYS = ["taxInvoice", "invoiceAmount", "srtPoWbs"];

function InvoiceCardsSection({ fieldValues, updateField }) {
  return (
    <div className="da-cf-ac-grid da-cf-ac-grid--3col">
      {INVOICES_FEES_CARDS.map((card) => {
        const Icon = card.icon;
        const value = fieldValues[card.key];
        const isEditable = INVOICE_CARDS_EDITABLE_KEYS.includes(card.key);
        return (
          <div
            className={`da-cf-ac-card${value ? " da-cf-ac-card--done" : ""}`}
            style={{ "--step-accent": card.accent }}
            key={card.key}
          >
            <div className="da-cf-ac-card-head">
              <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
              <h5 className="da-cf-ac-card-title">{card.label}</h5>
            </div>
            <div className="da-cf-ac-card-field">
              {isEditable ? (
                <TextField
                  label={card.label}
                  icon={Icon}
                  value={value}
                  placeholder={card.placeholder}
                  onChange={(v) => updateField(card.key, v)}
                />
              ) : (
                <ReadonlyField label={card.label} icon={Icon} value={value || "Not set yet"} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

InvoiceCardsSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
};

// Vessel & Sales Order sub-tab — same card-hero treatment as AppointmentClearanceSection
// and InvoicesFeesSection: each field (including the two file uploads) becomes its own
// card in a .da-cf-ac-grid instead of the plain field grid other tabs still use.
const VESSEL_SALES_ORDER_CARDS = [
  { key: "vesselName", type: "text", icon: Ship, label: "Vessel Name", hint: "Name of the vessel handled under this call.", accent: "#2563eb", placeholder: "e.g. MV Atlantic Star" },
  { key: "serviceRequester", type: "text", icon: User, label: "Service Requester", hint: "Person who requested this service.", accent: "#0d9488", placeholder: "e.g. Jeffrey Steve" },
  { key: "sapSalesOrderNo", type: "text", icon: Receipt, label: "SAP Sales Order No", hint: "SAP-generated sales order reference.", accent: "#d97706", placeholder: "e.g. 3035188" },
  { key: "srnNo", type: "text", icon: Tag, label: "SRN No. (L & T)", hint: "Service request number from L & T.", accent: "#7c3aed", placeholder: "e.g. 683/ CRPO 78/2026" },
  { key: "copyOfSalesOrder", type: "files", icon: FileText, label: "Copy of Sales Order", hint: "Upload the signed copy of the sales order.", accent: "#059669" },
  // documentName must match documents_tab's Title Case document group label — see the
  // matching daDocuments field above (download_section_zip matches on this literal string).
  { key: "salesOrderSupportingDocs", type: "files", icon: Paperclip, label: "Sales Order Supporting Documents", hint: "Any additional documents supporting the sales order.", accent: "#e11d48", showCount: true, showDownloadAll: true, documentName: "Sales Order Supporting Documents" },
];

function VesselSalesOrderSection({ fieldValues, updateField, onRemoveDocument }) {
  return (
    <>
      <div className="da-cf-summary-hero">
        <div className="da-cf-summary-hero-main">
          <p className="da-cf-summary-hero-eyebrow">Vessel &amp; Sales Order</p>
          <h2 className="da-cf-summary-title">{fieldValues.vesselName || "Vessel not set yet"}</h2>
          <p className="da-cf-summary-hero-subtitle">
            Vessel identity and sales order references for this call.
          </p>
        </div>
      </div>

      <div className="da-cf-ac-grid">
        {VESSEL_SALES_ORDER_CARDS.map((card) => {
          const Icon = card.icon;
          const value = fieldValues[card.key];
          const isDone = card.type === "files" ? value.length > 0 : Boolean(value);
          return (
            <div
              className={`da-cf-ac-card${isDone ? " da-cf-ac-card--done" : ""}`}
              style={{ "--step-accent": card.accent }}
              key={card.key}
            >
              <div className="da-cf-ac-card-head">
                <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
                <h5 className="da-cf-ac-card-title">{card.label}</h5>
              </div>
              <p className="da-cf-ac-card-hint">{card.hint}</p>
              <div className="da-cf-ac-card-field">
                {card.type === "files" ? (
                  <FileDropzone
                    label={card.label}
                    icon={Icon}
                    files={value}
                    showCount={card.showCount}
                    onAddFiles={(newFiles) => updateField(card.key, [...value, ...newFiles])}
                    onRemoveFile={(i) => onRemoveDocument(card.key, i)}
                  />
                ) : (
                  <TextField
                    label={card.label}
                    icon={Icon}
                    value={value}
                    placeholder={card.placeholder}
                    onChange={(v) => updateField(card.key, v)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

VesselSalesOrderSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
  onRemoveDocument: PropTypes.func.isRequired,
};

// DA Operations > Sales Order — the SAP Sales Order No / SRN No. (L & T) cards from
// VesselSalesOrderSection above, minus its own hero header and the vessel/file fields
// not asked for here.
// SAP Sales Order No is editable and persisted via api/da/save_operation_tab/{call_id};
// SRN No. has no field in that payload, so typed values are saved via the local-only
// useDaLocalLaunchHire fallback (see updateField in DA below) since there's no real
// backend field to persist it to.
const SALES_ORDER_CARDS = VESSEL_SALES_ORDER_CARDS.filter(
  (card) => card.key === "sapSalesOrderNo" || card.key === "srnNo"
);

function SalesOrderCardsSection({ fieldValues, updateField, onRemoveDocument, callId }) {
  return (
    <div className="da-cf-ac-grid">
      {SALES_ORDER_CARDS.map((card) => {
        const Icon = card.icon;
        const value = fieldValues[card.key];
        const isDone = card.type === "files" ? value.length > 0 : Boolean(value);
        return (
          <div
            className={`da-cf-ac-card${isDone ? " da-cf-ac-card--done" : ""}`}
            style={{ "--step-accent": card.accent }}
            key={card.key}
          >
            <div className="da-cf-ac-card-head">
              <span className="da-cf-ac-card-icon"><Icon size={26} /></span>
              <h5 className="da-cf-ac-card-title">{card.label}</h5>
            </div>
            <div className="da-cf-ac-card-field">
              {card.type === "files" ? (
                <FileDropzone
                  label={card.label}
                  icon={Icon}
                  files={value}
                  showCount={card.showCount}
                  showDownloadAll={card.showDownloadAll}
                  documentName={card.documentName}
                  callId={callId}
                  onAddFiles={(newFiles) => updateField(card.key, [...value, ...newFiles])}
                  onRemoveFile={(i) => onRemoveDocument(card.key, i)}
                />
              ) : (
                <TextField
                  label={card.label}
                  icon={Icon}
                  value={value}
                  placeholder={card.placeholder}
                  onChange={(v) => updateField(card.key, v)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

SalesOrderCardsSection.propTypes = {
  fieldValues: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired,
  onRemoveDocument: PropTypes.func.isRequired,
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Inline status pill shown next to the "DA Operations" Save button, reflecting the
// debounced autosave (see runSaveOperationTab / debouncedAutoSaveOperationTab in DA
// below) — same idle/saving/saved/error states as the Export Approval tab's AutoSaveStatus.
function OperationAutoSaveStatus({ status }) {
  if (status === "saving") {
    return (
      <span className="da-cf-autosave-status da-cf-autosave-status--saving">
        <Loader2 size={13} className="da-cf-autosave-status-spin" /> Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="da-cf-autosave-status da-cf-autosave-status--saved">
        <CheckCircle2 size={13} /> All changes saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="da-cf-autosave-status da-cf-autosave-status--error">
        <AlertCircle size={13} /> Couldn&rsquo;t save changes
      </span>
    );
  }
  return null;
}

OperationAutoSaveStatus.propTypes = {
  status: PropTypes.oneOf(["idle", "saving", "saved", "error"]),
};

// Card sub-tab — framed, animated panel instead of bare tiles on the page
// background (see .da-cf-card-panel* in daCardFields.scss): a pulsing icon
// header and staggered fade-up entrance for the 3 fields it holds.
function CardPanel({ fields, renderField, onSave, isSaving }) {
  return (
    <div className="da-cf-card-panel">
      <div className="da-cf-card-panel-header">
        <span className="da-cf-card-panel-icon"><IdCard size={18} /></span>
        <div className="da-cf-card-panel-heading">
          <h4 className="da-cf-card-panel-title">Card</h4>
          <p className="da-cf-card-panel-subtitle">Identity, tags and movement info for this card.</p>
        </div>
      </div>
      <div className="da-cf-card-panel-grid">
        {fields.map((field, index) => (
          <div key={field.key} className="da-cf-card-panel-tile" style={{ "--stagger-index": index }}>
            {renderField(field)}
          </div>
        ))}
      </div>
      <div className="da-cf-card-panel-footer">
        <button
          type="button"
          className="da-cf-card-panel-save-btn"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

CardPanel.propTypes = {
  fields: PropTypes.array.isRequired,
  renderField: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};

function DA({ card, formValues, handleChange, daStatusRefreshToken, onAdvanceDaStage, isAdvancingDaStage }) {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  // Set when a Summary stat card (Inward/Outward Clearance) is clicked — switches to the
  // DA Documents sub-tab and briefly highlights + scrolls to the matching Clearance Copy
  // tile, then clears itself (see the scroll/highlight effect further down).
  const [highlightedDocTile, setHighlightedDocTile] = useState(null);
  const navigateToDocTile = useCallback((tileKey) => {
    setActiveSubTab("daDocuments");
    setHighlightedDocTile(tileKey);
  }, []);
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

  // Shared by the mount effect below and the Summary hero's manual Refresh button.
  const fetchSummaryTab = useCallback(() => {
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

  useEffect(() => {
    fetchSummaryTab();
  }, [fetchSummaryTab, daStatusRefreshToken]);

  // api/da/status_timeline/{call_id} — real per-call status progression shown in the
  // Summary sub-tab's Status Timeline, replacing the old hardcoded/click-driven placeholder.
  // Also refetches when daStatusRefreshToken bumps (CardForm's footer stepper / header
  // sticker picker just advanced this call's DA stage), so this section updates immediately
  // instead of only on the next time the card is opened.
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [isLoadingStatusTimeline, setIsLoadingStatusTimeline] = useState(false);

  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    setIsLoadingStatusTimeline(true);
    daService.getStatusTimeline(callId)
      .then(({ data }) => {
        if (!cancelled) setStatusTimeline(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) setStatusTimeline([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStatusTimeline(false);
      });
    return () => { cancelled = true; };
  }, [callId, daStatusRefreshToken]);

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
        // co_owner_id is watched by the DA Operations autosave effect further down —
        // guard it so hydrating from the backend doesn't immediately re-save it.
        skipNextOperationAutoSaveRef.current = true;
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

  // api/da/operation_tab/{call_id} — hydrates the "DA Operations" sub-tabs (Operation
  // Details, Launch Hire, Invoice, Sales Order) with the backend's saved values once,
  // when the card first loads. operationTabData itself is also kept for the read-only
  // Vessel Owner / Owner / Billing Entity / Last moved tiles in Operation Details.
  const [operationTabData, setOperationTabData] = useState(null);
  const [isLoadingOperationTab, setIsLoadingOperationTab] = useState(false);
  const getLaunchHireOverride = useDaLocalLaunchHire((s) => s.getLaunchHireOverride);
  const setLaunchHireOverride = useDaLocalLaunchHire((s) => s.setLaunchHireOverride);

  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    setIsLoadingOperationTab(true);
    daService.getOperationTab(callId)
      .then(({ data }) => {
        if (cancelled) return;
        const opData = data?.data ?? null;
        setOperationTabData(opData);
        if (!opData) return;
        // billing_note / tax_invoice_no / invoice_amount / sap_sales_order_no are
        // watched by the DA Operations autosave effect further down — guard it so
        // hydrating from the backend doesn't immediately re-save what it just fetched.
        skipNextOperationAutoSaveRef.current = true;
        setFieldValues((prev) => ({
          ...prev,
          vesselName: opData.vessel_name ?? prev.vesselName,
          serviceRequester: opData.service_requester ?? prev.serviceRequester,
          billingOthers: opData.billing_note ?? prev.billingOthers,
          // save_operation_tab has no field for either of these (see LaunchHireCardsSection),
          // so an empty API value falls back to the local-only override (see
          // useDaLocalLaunchHire) before finally falling back to whatever's already typed.
          thirdPartyLaunchHire: opData.third_party_launch_hire
            || getLaunchHireOverride(callId, "thirdPartyLaunchHire")
            || prev.thirdPartyLaunchHire,
          roadTransport: (opData.road_transport_days != null ? String(opData.road_transport_days) : "")
            || getLaunchHireOverride(callId, "roadTransport")
            || prev.roadTransport,
          taxInvoice: opData.tax_invoice_no ?? prev.taxInvoice,
          // save_operation_tab has no field for this (see INVOICE_CARDS_EDITABLE_KEYS
          // comment), so an empty API value falls back to the local-only override before
          // finally falling back to whatever's already typed.
          srtPoWbs: opData.srt_po_wbs_ref
            || getLaunchHireOverride(callId, "srtPoWbs")
            || prev.srtPoWbs,
          invoiceAmount: opData.invoice_amount ?? prev.invoiceAmount,
          sapSalesOrderNo: opData.sap_sales_order_no ?? prev.sapSalesOrderNo,
          // save_operation_tab has no field for this (see SALES_ORDER_CARDS comment), so
          // an empty API value falls back to the local-only override before finally
          // falling back to whatever's already typed.
          srnNo: opData.srn_no
            || getLaunchHireOverride(callId, "srnNo")
            || prev.srnNo,
        }));
      })
      .catch(() => {
        if (!cancelled) setOperationTabData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOperationTab(false);
      });
    return () => { cancelled = true; };
  }, [callId, getLaunchHireOverride]);

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

  // api/da/required_documents/{call_id} — read-only reference documents already
  // uploaded elsewhere in the system, shown at the bottom of the Clearance Copies
  // sub-tab. Unlike appointmentEmail above, these aren't editable here.
  const [requiredDocuments, setRequiredDocuments] = useState(null);
  const [isLoadingRequiredDocuments, setIsLoadingRequiredDocuments] = useState(false);

  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    setIsLoadingRequiredDocuments(true);
    daService.getRequiredDocuments(callId)
      .then(({ data }) => {
        if (!cancelled) setRequiredDocuments(data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setRequiredDocuments(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRequiredDocuments(false);
      });
    return () => { cancelled = true; };
  }, [callId]);

  // api/da/time_objects/{call_id} — arrival/departure timestamps (ETA/ATA/ETD/ATD etc.)
  // recorded against this call's stages. Grouped by keyword below and surfaced inside the
  // Inward Clearance / Outward Clearance cards of AppointmentClearanceSection.
  const [timeObjects, setTimeObjects] = useState([]);
  const [isLoadingTimeObjects, setIsLoadingTimeObjects] = useState(false);

  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    setIsLoadingTimeObjects(true);
    daService.getTimeObjects(callId)
      .then(({ data }) => {
        if (!cancelled) setTimeObjects(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) setTimeObjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTimeObjects(false);
      });
    return () => { cancelled = true; };
  }, [callId]);

  const arrivalTimeObjects = timeObjects.filter((t) => /arrival/i.test(t.field_key || t.time_object || ""));
  const departureTimeObjects = timeObjects.filter((t) => /departure/i.test(t.field_key || t.time_object || ""));

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

  // api/da/save_operation_tab/{call_id} — persists the editable fields spread across
  // the "DA Operations" sub-tab cards (Operation Details' Co-owner/Billing Note,
  // Invoice's Tax Invoice/Invoice amount, Sales Order's SAP Sales Order No). Everything
  // else in that tab (Vessel, Service requester, Launch Hire, SRT|PO|WBS, SRN No.) has
  // no field in this payload and stays read-only, synced only from the GET above.
  //
  // Autosaves AUTO_SAVE_DEBOUNCE_MS after the last edit to any of those 5 fields, same
  // debounce pattern as the Export Approval tab (Approval.jsx). latestOperationFormRef
  // keeps the debounced closure reading fresh values instead of a stale snapshot.
  // skipNextOperationAutoSaveRef is set right before the operation_tab/card_tab GETs
  // hydrate these fields, so loading a card doesn't immediately re-save what it just
  // fetched. There's no manual Save button — this is the only way these fields get
  // persisted, and it runs silently, only updating the status pill (no toast).
  const [operationSaveStatus, setOperationSaveStatus] = useState("idle");
  const latestOperationFormRef = useRef(null);
  latestOperationFormRef.current = {
    coOwnerId,
    billingNote: fieldValues.billingOthers,
    taxInvoiceNo: fieldValues.taxInvoice,
    invoiceAmount: fieldValues.invoiceAmount,
    sapSalesOrderNo: fieldValues.sapSalesOrderNo,
  };
  const skipNextOperationAutoSaveRef = useRef(true);

  const runSaveOperationTab = useCallback(async () => {
    if (callId == null) return;
    const { coOwnerId: co, billingNote, taxInvoiceNo, invoiceAmount, sapSalesOrderNo } = latestOperationFormRef.current;
    const formData = new FormData();
    if (co != null && co !== "") formData.append("co_owner_id", co);
    formData.append("billing_note", billingNote || "");
    formData.append("tax_invoice_no", taxInvoiceNo || "");
    formData.append("invoice_amount", invoiceAmount || "");
    formData.append("sap_sales_order_no", sapSalesOrderNo || "");

    setOperationSaveStatus("saving");
    try {
      await daService.saveOperationTab(callId, formData);
      setOperationSaveStatus("saved");
    } catch {
      setOperationSaveStatus("error");
    }
  }, [callId]);

  const debouncedAutoSaveOperationTab = useMemo(
    () => debounce(runSaveOperationTab, AUTO_SAVE_DEBOUNCE_MS),
    [runSaveOperationTab],
  );

  useEffect(() => () => debouncedAutoSaveOperationTab.flush(), [debouncedAutoSaveOperationTab]);

  useEffect(() => {
    if (skipNextOperationAutoSaveRef.current) {
      skipNextOperationAutoSaveRef.current = false;
      return;
    }
    debouncedAutoSaveOperationTab();
  }, [
    coOwnerId,
    fieldValues.billingOthers,
    fieldValues.taxInvoice,
    fieldValues.invoiceAmount,
    fieldValues.sapSalesOrderNo,
    debouncedAutoSaveOperationTab,
  ]);

  // api/da/save_documents_tab/{call_id} — persists the 5 "DA Documents" file fields that
  // have no other backend source (see the documents_tab GET above): FDA Dispatch Proof,
  // Supporting Documents, Sales Order Supporting Documents, Attachments, Docs. Only
  // newly-picked browser File objects are uploaded; documents already hydrated from the
  // GET (mapApiDocument) aren't File instances and are skipped so they aren't re-uploaded.
  //
  // attachments[] / docs[] follow the same snake_case-of-the-GET-key convention as the
  // other 3 fields (fda_dispatch_proof[] etc.) — unverified against the backend since
  // Attachments/Docs didn't have a file picker before this; confirm once testable.
  //
  // Same debounced-autosave pattern as DA Operations (runSaveOperationTab above) — no
  // manual Save button here either, it runs silently AUTO_SAVE_DEBOUNCE_MS after the last
  // file is added/removed, only updating the status pill (no toast).
  // skipNextDocumentsAutoSaveRef is set right before the documents_tab GET hydrates these
  // fields, so loading a card doesn't immediately re-save what it just fetched.
  const [documentsSaveStatus, setDocumentsSaveStatus] = useState("idle");
  const latestDocumentsFormRef = useRef(null);
  latestDocumentsFormRef.current = {
    fdaDispatchProof: fieldValues.fdaDispatchProof,
    supportingDocuments: fieldValues.supportingDocuments,
    salesOrderSupportingDocs: fieldValues.salesOrderSupportingDocs,
    attachmentFiles: fieldValues.attachmentFiles,
    docFiles: fieldValues.docFiles,
  };
  const skipNextDocumentsAutoSaveRef = useRef(true);

  const runSaveDocumentsTab = useCallback(async () => {
    if (callId == null) return;
    const { fdaDispatchProof, supportingDocuments, salesOrderSupportingDocs, attachmentFiles, docFiles } = latestDocumentsFormRef.current;
    const formData = new FormData();
    (fdaDispatchProof || [])
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("fda_dispatch_proof[]", file));
    (supportingDocuments || [])
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("supporting_documents[]", file));
    (salesOrderSupportingDocs || [])
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("sales_order_supporting_documents[]", file));
    (attachmentFiles || [])
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("attachments[]", file));
    (docFiles || [])
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("docs[]", file));

    setDocumentsSaveStatus("saving");
    try {
      await daService.saveDocumentsTab(callId, formData);
      setDocumentsSaveStatus("saved");
    } catch {
      setDocumentsSaveStatus("error");
    }
  }, [callId]);

  const debouncedAutoSaveDocumentsTab = useMemo(
    () => debounce(runSaveDocumentsTab, AUTO_SAVE_DEBOUNCE_MS),
    [runSaveDocumentsTab],
  );

  useEffect(() => () => debouncedAutoSaveDocumentsTab.flush(), [debouncedAutoSaveDocumentsTab]);

  useEffect(() => {
    if (skipNextDocumentsAutoSaveRef.current) {
      skipNextDocumentsAutoSaveRef.current = false;
      return;
    }
    debouncedAutoSaveDocumentsTab();
  }, [
    fieldValues.fdaDispatchProof,
    fieldValues.supportingDocuments,
    fieldValues.salesOrderSupportingDocs,
    fieldValues.attachmentFiles,
    fieldValues.docFiles,
    debouncedAutoSaveDocumentsTab,
  ]);

  // thirdPartyLaunchHire/roadTransport/srtPoWbs/srnNo have no save_operation_tab field (see
  // LaunchHireCardsSection / INVOICE_CARDS_EDITABLE_KEYS / SALES_ORDER_CARDS), so typed
  // values also get mirrored into useDaLocalLaunchHire — the only place they're
  // remembered across reopening the card, since there's no backend to persist them to.
  const LOCAL_ONLY_FIELD_KEYS = useMemo(() => new Set(["thirdPartyLaunchHire", "roadTransport", "srtPoWbs", "srnNo"]), []);

  const updateField = useCallback((key, value) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    if (LOCAL_ONLY_FIELD_KEYS.has(key) && callId != null) setLaunchHireOverride(callId, key, value);
  }, [callId, setLaunchHireOverride, LOCAL_ONLY_FIELD_KEYS]);

  // Removing a file field entry: already-uploaded documents (mapApiDocument shape, not a
  // browser File) carry a stage_document_id — those are persisted on the backend, so removal
  // must call api/da/delete_document, unlike a freshly-picked File that's only ever local
  // state until the next autosave. Optimistically removes, then rolls back + toasts on failure
  // so a failed delete doesn't silently leave the user thinking the document is gone.
  const handleRemoveDocument = useCallback((key, index) => {
    const files = fieldValues[key] || [];
    const file = files[index];
    const documentId = file && !(file instanceof File) ? file.stage_document_id : null;

    setFieldValues((prev) => ({ ...prev, [key]: (prev[key] || []).filter((_, idx) => idx !== index) }));

    if (documentId == null) return;
    daService.deleteDocument(documentId).catch((err) => {
      setFieldValues((prev) => {
        const next = [...(prev[key] || [])];
        next.splice(index, 0, file);
        return { ...prev, [key]: next };
      });
      notify(err?.response?.data?.message || "Failed to delete document.", "error", "top-center");
    });
  }, [fieldValues]);

  const rowIdCounter = useRef(0);
  const nextRowId = () => `row-${++rowIdCounter.current}`;

  // Billing Entity defaults to whatever's already captured in the Appointment Details /
  // Operation tabs (formValues.mainBillingEntity / vesselBillingEntity / tugBillingEntity /
  // otherBillingEntity), resolved to a display name below — but same as
  // thirdPartyLaunchHire/roadTransport/srtPoWbs, save_operation_tab has no field for it,
  // so it's editable here via the same local-only useDaLocalLaunchHire fallback.
  const [billingEntityOptions, setBillingEntityOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadBillingEntities = async () => {
      try {
        const { data } = await billingEntityService.getBillingEntities({ params: { page: 1, limit: 1000 } });
        const options = mapBillingEntitiesToOptions(unwrapListResponse(data));
        if (!cancelled) setBillingEntityOptions(options);
      } catch {
        if (!cancelled) setBillingEntityOptions([]);
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

  // Manual edits to Billing Entity (see comment above billingEntityOptions) are kept
  // client-side only, the same as thirdPartyLaunchHire/roadTransport/srtPoWbs — seeded
  // from useDaLocalLaunchHire so a typed value survives reopening the card.
  const [billingEntityOverride, setBillingEntityOverride] = useState("");
  useEffect(() => {
    if (callId == null) return;
    setBillingEntityOverride(getLaunchHireOverride(callId, "billingEntity") || "");
  }, [callId, getLaunchHireOverride]);
  const billingEntityDisplayValue = billingEntityOverride || operationTabData?.billing_entity || billingEntityLabel || "";
  const updateBillingEntity = (value) => {
    setBillingEntityOverride(value);
    if (callId != null) setLaunchHireOverride(callId, "billingEntity", value);
  };

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

  // api/da/documents_tab/{call_id} — hydrates the "DA Documents" sub-tab once, when the
  // card first loads: FDA Dispatch Proof / Supporting Documents / Sales Order Supporting
  // Documents / Attachments / Docs (files fields with no other backend source, unlike the
  // rest of daDocuments' fields which mirror values already fetched by operation_tab /
  // appointment_clearance_tab above), plus the "More" tab's separate Docs text list.
  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    daService.getDocumentsTab(callId)
      .then(({ data }) => {
        if (cancelled) return;
        const documents = data?.data?.documents;
        if (!documents) return;

        const fdaDispatchProofDocs = documents["FDA Dispatch Proof"];
        const supportingDocumentsDocs = documents["Supporting Documents"];
        const salesOrderSupportingDocsDocs = documents["Sales Order Supporting Documents"];
        const attachmentsDocs = documents["Attachments"];
        const docsDocs = documents["Docs"];
        // Watched by the DA Documents autosave effect further down — guard it so
        // hydrating from the backend doesn't immediately re-save what it just fetched.
        skipNextDocumentsAutoSaveRef.current = true;
        setFieldValues((prev) => ({
          ...prev,
          fdaDispatchProof: Array.isArray(fdaDispatchProofDocs)
            ? fdaDispatchProofDocs.map(mapApiDocument)
            : prev.fdaDispatchProof,
          supportingDocuments: Array.isArray(supportingDocumentsDocs)
            ? supportingDocumentsDocs.map(mapApiDocument)
            : prev.supportingDocuments,
          salesOrderSupportingDocs: Array.isArray(salesOrderSupportingDocsDocs)
            ? salesOrderSupportingDocsDocs.map(mapApiDocument)
            : prev.salesOrderSupportingDocs,
          attachmentFiles: Array.isArray(attachmentsDocs)
            ? attachmentsDocs.map(mapApiDocument)
            : prev.attachmentFiles,
          docFiles: Array.isArray(docsDocs)
            ? docsDocs.map(mapApiDocument)
            : prev.docFiles,
        }));

        // "More" tab's own free-form "Docs" text list — separate from docFiles above,
        // pre-filled with the same document names.
        setListSections((prev) => ({
          ...prev,
          docs: Array.isArray(docsDocs) && docsDocs.length
            ? { ...prev.docs, rows: docsDocs.map((doc) => ({ id: nextRowId(), value: mapApiDocument(doc).name })) }
            : prev.docs,
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [callId]);

  const [relatives, setRelatives] = useState([]);
  const [relativesCollapsed, setRelativesCollapsed] = useState(false);
  const addRelative = () => setRelatives((prev) => [...prev, { id: nextRowId(), value: "" }]);
  const changeRelative = (idx, value) =>
    setRelatives((prev) => prev.map((row, i) => (i === idx ? { ...row, value } : row)));
  const removeRelative = (idx) => setRelatives((prev) => prev.filter((_, i) => i !== idx));

  // api/da/links_tab/{call_id} — pre-fills the "Link" tab's free-form "Links overview"
  // and "Relatives & Dependencies" lists from the backend's structured links/relations,
  // once when the card first loads. Both lists stay plain text rows (see
  // ListRowsSection/RelativesSection) rather than becoming structured editable fields,
  // since there's no save endpoint for this tab — this is read-only seed data the user
  // can still edit/remove locally like any other row here.
  useEffect(() => {
    if (callId == null) return undefined;
    let cancelled = false;
    daService.getLinksTab(callId)
      .then(({ data }) => {
        if (cancelled) return;
        const tabData = data?.data;
        if (!tabData) return;
        const links = Array.isArray(tabData.links) ? tabData.links : [];
        const relations = Array.isArray(tabData.relations) ? tabData.relations : [];
        if (links.length) {
          setListSections((prev) => ({
            ...prev,
            linksOverview: {
              ...prev.linksOverview,
              rows: links.map((link) => ({
                id: nextRowId(),
                value: link.label ? `${link.label} - ${link.url}` : link.url,
              })),
            },
          }));
        }
        if (relations.length) {
          setRelatives(relations.map((relation) => ({
            id: nextRowId(),
            value: `${relation.billing_entity || "Related call"} #${relation.related_call_id} (${relation.relation_type})`,
          })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [callId]);

  const renderField = (field, extraProps) => {
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
            accent={field.accent}
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
            accent={field.accent}
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
            accent={field.accent}
          />
        );
      case "readonly":
        return <ReadonlyField key={field.key} label={field.label} icon={field.icon} value={lastMovedDisplay} accent={field.accent} />;
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
            accent={field.accent}
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
            documentName={field.documentName}
            callId={callId}
            reserveSpace={field.reserveSpace}
            onAddFiles={(newFiles) => updateField(field.key, [...value, ...newFiles])}
            onRemoveFile={(i) => handleRemoveDocument(field.key, i)}
            {...extraProps}
          />
        );
      default:
        return null;
    }
  };

  const activeTabMeta = SUB_TABS.find((tab) => tab.key === activeSubTab);
  const activeFields = FIELDS_BY_GROUP[activeSubTab] ?? [];
  const ActiveGroupIcon = activeTabMeta.icon;

  // Summary, DA Operations and DA Documents each pack several sections onto one page
  // (see their branches below), so it's easy to miss that there's more below the fold.
  // Rather than making the user notice and click a hint, we nudge the scroll parent
  // down automatically once when a tab with overflowing content is opened. Only one
  // of the three tabs is ever mounted at a time, so all three wrapper divs share this
  // same ref.
  const daOperationsRef = useRef(null);

  useEffect(() => {
    if (!SCROLL_HINT_TABS.includes(activeSubTab)) return undefined;
    const node = daOperationsRef.current;
    if (!node) return undefined;

    const getScrollParent = (el) => {
      let current = el?.parentElement;
      while (current) {
        const { overflowY } = window.getComputedStyle(current);
        if ((overflowY === "auto" || overflowY === "scroll") && current.scrollHeight > current.clientHeight) {
          return current;
        }
        current = current.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    };

    const scrollParent = getScrollParent(node);
    const distanceFromBottom = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
    if (distanceFromBottom > 32) {
      scrollParent.scrollBy({ top: 320, behavior: "smooth" });
    }
  }, [activeSubTab]);

  // Summary's Inward/Outward Clearance stat cards jump here via navigateToDocTile —
  // scrolls to and briefly highlights the matching Clearance Copy tile in DA Documents,
  // then clears itself.
  useEffect(() => {
    if (activeSubTab !== "daDocuments" || !highlightedDocTile) return undefined;
    const node = document.getElementById(`da-doc-tile-${highlightedDocTile}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlightedDocTile(null), 2200);
    return () => clearTimeout(timer);
  }, [activeSubTab, highlightedDocTile]);

  return (
    <div className="cardform-body da-cf-panel">
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
        {activeSubTab !== "summary" && activeSubTab !== "card" && activeSubTab !== "mwp" && activeSubTab !== "launchHire" && activeSubTab !== "daOperator" && activeSubTab !== "daDocuments" && (
          <div className="da-cf-group-header">
            <span className="da-cf-group-icon"><ActiveGroupIcon size={16} /></span>
            <h4 className="da-cf-group-title">{activeTabMeta.label}</h4>
            {activeSubTab !== "more" && activeSubTab !== "appointmentClearance" && activeSubTab !== "invoicesFees" && activeSubTab !== "vesselSalesOrder" && (
              <span className="da-cf-group-count">{activeFields.length} field{activeFields.length === 1 ? "" : "s"}</span>
            )}
          </div>
        )}

        {activeSubTab === "summary" ? (
          <div className="da-cf-mwp-launch-hire" ref={daOperationsRef}>
            <SummaryPanel
              callId={callId}
              fieldValues={fieldValues}
              billingEntityLabel={billingEntityLabel}
              summaryData={summaryData}
              isLoadingSummary={isLoadingSummary}
              statusTimeline={statusTimeline}
              isLoadingStatusTimeline={isLoadingStatusTimeline}
              onAdvanceDaStage={onAdvanceDaStage}
              isAdvancingDaStage={isAdvancingDaStage}
              onNavigateToDocTile={navigateToDocTile}
            />
          </div>
        ) : activeSubTab === "card" ? (
          <CardPanel
            fields={activeFields}
            renderField={renderField}
            onSave={handleSaveCardTab}
            isSaving={isSavingCardTab}
          />
        ) : activeSubTab === "appointmentClearance" ? (
          <AppointmentClearanceSection
            fieldValues={fieldValues}
            updateField={updateField}
            onRemoveDocument={handleRemoveDocument}
            arrivalTimeObjects={arrivalTimeObjects}
            departureTimeObjects={departureTimeObjects}
            isLoadingTimeObjects={isLoadingTimeObjects}
          />
        ) : activeSubTab === "invoicesFees" ? (
          <InvoicesFeesSection fieldValues={fieldValues} updateField={updateField} />
        ) : activeSubTab === "vesselSalesOrder" ? (
          <VesselSalesOrderSection fieldValues={fieldValues} updateField={updateField} onRemoveDocument={handleRemoveDocument} />
        ) : activeSubTab === "more" ? (
          <div className="da-cf-more">
            <div className="da-cf-summary-hero">
              <div className="da-cf-summary-hero-main">
                <p className="da-cf-summary-hero-eyebrow">Link</p>
                <h2 className="da-cf-summary-title">Additional Details</h2>
                <p className="da-cf-summary-hero-subtitle">
                  Links and related cards that don&rsquo;t fit anywhere else on this call.
                </p>
              </div>
            </div>
            <div className="da-cf-more-grid">
              {MORE_TAB_LIST_SECTIONS.map((section) => (
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
                  accent={section.accent}
                />
              ))}
              <RelativesSection
                rows={relatives}
                collapsed={relativesCollapsed}
                onToggleCollapse={() => setRelativesCollapsed((c) => !c)}
                onAdd={addRelative}
                onChangeRow={changeRelative}
                onRemoveRow={removeRelative}
                accent="#d97706"
              />
            </div>
          </div>
        ) : activeSubTab === "mwp" ? (
          <div className="da-cf-mwp-launch-hire">
            <div className="da-cf-summary-hero">
              <div className="da-cf-summary-hero-main">
                <p className="da-cf-summary-hero-eyebrow">MWP</p>
                <h2 className="da-cf-summary-title">MWP Documents</h2>
                <p className="da-cf-summary-hero-subtitle">
                  Track the MWP-related documents required for this call.
                </p>
              </div>
            </div>
            <div className="da-cf-mwp-launch-hire-panel" key={activeSubTab}>
              <RequiredDocumentsSection
                documents={requiredDocuments}
                isLoading={isLoadingRequiredDocuments}
                configs={MWP_REQUIRED_DOCUMENTS_CONFIG}
                title="MWP Documents"
                standalone
              />
            </div>
          </div>
        ) : activeSubTab === "launchHire" ? (
          <div className="da-cf-mwp-launch-hire">
            <div className="da-cf-summary-hero">
              <div className="da-cf-summary-hero-main">
                <p className="da-cf-summary-hero-eyebrow">Launch Hire</p>
                <h2 className="da-cf-summary-title">Launch Hire Details</h2>
                <p className="da-cf-summary-hero-subtitle">
                  Manage launch hire slips, 3rd party hire and road transport days for this call.
                </p>
              </div>
            </div>
            <div className="da-cf-mwp-launch-hire-panel" key={activeSubTab}>
              <div className="da-cf-fields-grid da-cf-fields-grid--launch-hire">
                {activeFields.map((field) => renderField(field))}
              </div>
            </div>
          </div>
        ) : activeSubTab === "daOperator" ? (
          <div className="da-cf-mwp-launch-hire" ref={daOperationsRef}>
            <div className="da-cf-summary-hero">
              <div className="da-cf-summary-hero-main">
                <p className="da-cf-summary-hero-eyebrow">DA Operations</p>
                <h2 className="da-cf-summary-title">Operations Overview</h2>
                <p className="da-cf-summary-hero-subtitle">
                  Everything for this call in one place — no need to switch tabs.
                </p>
              </div>
              <div className="da-cf-summary-hero-actions">
                <OperationAutoSaveStatus status={operationSaveStatus} />
              </div>
            </div>

            <div className="da-cf-ops-grid">
              {DA_OPERATOR_SUB_TABS.map((tab) => {
                const Icon = tab.icon;
                const isOperationDetails = tab.key === "operationDetails";
                const isClearanceDetails = tab.key === "clearanceDetails";
                const isLaunchHire = tab.key === "launchHire";
                const isInvoice = tab.key === "invoice";
                const isSalesOrder = tab.key === "salesOrder";
                return (
                  <section
                    className={`da-cf-ops-card${isOperationDetails || isClearanceDetails || isLaunchHire || isInvoice || isSalesOrder ? " da-cf-ops-card--wide" : ""}`}
                    key={tab.key}
                  >
                    <header className="da-cf-ops-card-header">
                      <span className="da-cf-ops-card-icon"><Icon size={16} /></span>
                      <h4 className="da-cf-ops-card-title">{tab.label}</h4>
                    </header>
                    <div className="da-cf-ops-card-body">
                      {isOperationDetails ? (
                        <>
                          <div className="da-cf-fields-grid da-cf-fields-grid--fixed4">
                            <ReadonlyField
                              label="Vessel"
                              icon={OPERATION_DETAILS_FIELDS_BY_KEY.vesselName.icon}
                              value={isLoadingOperationTab && !operationTabData ? "Loading…" : (fieldValues.vesselName || "Not set yet")}
                              accent={OPERATION_DETAILS_FIELDS_BY_KEY.vesselName.accent}
                            />
                            <ReadonlyField
                              label="Vessel Owner"
                              icon={Building2}
                              value={isLoadingOperationTab && !operationTabData ? "Loading…" : (operationTabData?.vessel_owner || summaryData?.vessel_owner || "Not set yet")}
                              accent="#d97706"
                            />
                            <ReadonlyField
                              label="Owner"
                              icon={User}
                              value={isLoadingOperationTab && !operationTabData ? "Loading…" : (operationTabData?.call_owner_name || summaryData?.call_owner_name || "Not set yet")}
                              accent="#0d9488"
                            />
                            {renderField(OPERATION_DETAILS_FIELDS_BY_KEY.coOwners)}
                          </div>
                          <div className="da-cf-fields-grid">
                            <ReadonlyField
                              label="Service requester"
                              icon={OPERATION_DETAILS_FIELDS_BY_KEY.serviceRequester.icon}
                              value={isLoadingOperationTab && !operationTabData ? "Loading…" : (fieldValues.serviceRequester || "Not set yet")}
                              accent={OPERATION_DETAILS_FIELDS_BY_KEY.serviceRequester.accent}
                            />
                            <TextField
                              label="Billing Entity"
                              icon={Package}
                              value={billingEntityDisplayValue}
                              placeholder="e.g. Al Rashid Shipping Agency"
                              onChange={updateBillingEntity}
                              accent="#e11d48"
                            />
                            {renderField(OPERATION_DETAILS_FIELDS_BY_KEY.billingOthers)}
                            <ReadonlyField
                              label="Last moved"
                              icon={Clock}
                              value={isLoadingOperationTab && !operationTabData ? "Loading…" : (formatApiDateTime(operationTabData?.stage_entered_date) || lastMovedDisplay)}
                              accent={OPERATION_DETAILS_FIELDS_BY_KEY.lastMoved.accent}
                            />
                          </div>
                        </>
                      ) : isClearanceDetails ? (
                        <ClearanceDetailsSection
                          fieldValues={fieldValues}
                          arrivalTimeObjects={arrivalTimeObjects}
                          departureTimeObjects={departureTimeObjects}
                          isLoadingTimeObjects={isLoadingTimeObjects}
                        />
                      ) : isLaunchHire ? (
                        <LaunchHireCardsSection fieldValues={fieldValues} updateField={updateField} />
                      ) : isInvoice ? (
                        <InvoiceCardsSection fieldValues={fieldValues} updateField={updateField} />
                      ) : isSalesOrder ? (
                        <SalesOrderCardsSection fieldValues={fieldValues} updateField={updateField} onRemoveDocument={handleRemoveDocument} callId={callId} />
                      ) : (
                        <p className="da-cf-ac-readonly-value">
                          <span className="da-cf-ac-readonly-empty">Coming soon.</span>
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : activeSubTab === "daDocuments" ? (
          <div className="da-cf-mwp-launch-hire" ref={daOperationsRef}>
            <div className="da-cf-summary-hero">
              <div className="da-cf-summary-hero-main">
                <p className="da-cf-summary-hero-eyebrow">DA Documents</p>
                <h2 className="da-cf-summary-title">Documents Overview</h2>
                <p className="da-cf-summary-hero-subtitle">
                  Every document for this call in one place — no need to switch tabs.
                </p>
              </div>
              <div className="da-cf-summary-hero-actions">
                <OperationAutoSaveStatus status={documentsSaveStatus} />
              </div>
            </div>

            <div className="da-cf-fields-grid da-cf-fields-grid--files2">
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.inwardClearanceCopy, {
                id: "da-doc-tile-inwardClearanceCopy",
                highlighted: highlightedDocTile === "inwardClearanceCopy",
                readOnly: true,
              })}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.sailingClearanceCopy, {
                id: "da-doc-tile-sailingClearanceCopy",
                highlighted: highlightedDocTile === "sailingClearanceCopy",
                readOnly: true,
              })}
              {FINAL_BAYAN_REQUIRED_DOCUMENTS_CONFIG.map((doc) => (
                <RequiredDocTile
                  key={doc.key}
                  doc={doc}
                  requiredDocuments={requiredDocuments}
                  isLoading={isLoadingRequiredDocuments}
                />
              ))}
              {MWP_REQUIRED_DOCUMENTS_CONFIG.map((doc) => (
                <RequiredDocTile
                  key={doc.key}
                  doc={doc}
                  requiredDocuments={requiredDocuments}
                  isLoading={isLoadingRequiredDocuments}
                />
              ))}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.copyOfSalesOrder, { readOnly: true })}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.launchHireSlips, { readOnly: true })}
              {OTHER_REQUIRED_DOCUMENTS_CONFIG.map((doc) => (
                <RequiredDocTile
                  key={doc.key}
                  doc={doc}
                  requiredDocuments={requiredDocuments}
                  isLoading={isLoadingRequiredDocuments}
                />
              ))}
              {/* Drag-and-drop upload tiles grouped last, after the read-only/synced-only tiles above. */}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.salesOrderSupportingDocs)}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.fdaDispatchProof)}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.supportingDocuments)}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.attachmentFiles)}
              {renderField(DA_DOCUMENTS_FIELDS_BY_KEY.docFiles)}
            </div>
          </div>
        ) : activeSubTab === "clearanceCopies" ? (
          <>
            <div className="da-cf-fields-grid da-cf-fields-grid--files2">
              {activeFields.map((field) => renderField(field))}
            </div>
            <RequiredDocumentsSection
              documents={requiredDocuments}
              isLoading={isLoadingRequiredDocuments}
            />
          </>
        ) : (
          <div
            className={`da-cf-fields-grid${FIXED_2COL_GROUPS.has(activeSubTab) ? " da-cf-fields-grid--fixed2" : ""}`}
          >
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
  handleChange: PropTypes.func,
  daStatusRefreshToken: PropTypes.number,
  onAdvanceDaStage: PropTypes.func,
  isAdvancingDaStage: PropTypes.bool,
};

export default DA;
