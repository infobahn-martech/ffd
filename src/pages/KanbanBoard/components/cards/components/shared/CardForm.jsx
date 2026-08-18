import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import kanbanBoardService from "../../../../../../services/kanbanBoardService";
import PropTypes from "prop-types";
import { Tag, Layers3, AlertTriangle, Sticker, Pencil, Check, X } from "lucide-react";
import { notify } from "../../../../../../components/Toaster";
import "../../../../../../design/scss/pages/kanban-board/cardForm.scss";
import "../../../../../../design/scss/general.scss";
import ColorPickerIcon from "../../../../../../assets/images/ColorPicker.png";
import SedresColorPicker from "../../../../../../components/SedresColorPicker/SedresColorPicker";
import { normalizeHexColor } from "../../../../../../components/SedresColorPicker/sedresColorPickerConstants";
import DynamicIcon from "../../../../../../structure/SideNav/components/DynamicIcon";
import { mapBackendIconNameToIconKey } from "../../../../../../store/KanbanManagementReducer";
import { TaskCardDetailView } from "../../../../../../pages/TaskCard";

const DEFAULT_ACCENT_COLOR = "#2A00FF";
const ADD_CARD_TOPBAR_DEFAULT_HEX = "#2e7d32";

/** Map header CSS color (hex or rgb/rgba) to normalized hex for SedresColorPicker. */
const appearanceColorToPickerHex = (value, fallbackHex = ADD_CARD_TOPBAR_DEFAULT_HEX) => {
  if (value === undefined || value === null) return fallbackHex;
  const s = String(value).trim();
  if (!s) return fallbackHex;
  if (s.startsWith("#")) {
    return normalizeHexColor(s);
  }
  const rgbMatch = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!rgbMatch) return fallbackHex;
  const clampByte = (n) => Math.min(255, Math.max(0, parseInt(String(n), 10) || 0));
  const hexByte = (n) => clampByte(n).toString(16).padStart(2, "0");
  const hex = `#${hexByte(rgbMatch[1])}${hexByte(rgbMatch[2])}${hexByte(rgbMatch[3])}`;
  return normalizeHexColor(hex);
};

// Trimmed + case-insensitive compare — sticker names and column titles are entered
// independently by admins, so "Ops completed" vs "Ops Completed " shouldn't fail to match.
const normalizeLabelForMatch = (value) => String(value ?? "").trim().toLowerCase();

/** Step labels come entirely from the board's own columns — no fabricated default stage names. */
const getStepLabelsFromColumns = (columns, columnOrder) => {
  if (!columnOrder || !columns || !Array.isArray(columnOrder)) return null;
  const labels = columnOrder.map((colId) => columns[colId]?.title).filter(Boolean);
  return labels.length > 0 ? labels : null;
};

// Helper function to map step label to column ID (column.id for moveCardToColumn)
const getColumnIdFromStepLabel = (stepLabel, columns, columnOrder) => {
  if (!columns || !columnOrder || !Array.isArray(columnOrder)) return null;
  const normalizedLabel = normalizeLabelForMatch(stepLabel);
  const colId = columnOrder.find((id) => normalizeLabelForMatch(columns[id]?.title) === normalizedLabel);
  return colId ? columns[colId]?.id ?? colId : null;
};

// Helper function to get step number from column title
const getStepNumberFromColumnTitle = (columnTitle, columns, columnOrder) => {
  if (!columnOrder || !columns || !Array.isArray(columnOrder)) return null;
  const idx = columnOrder.findIndex((colId) => columns[colId]?.title === columnTitle);
  return idx >= 0 ? idx + 1 : null;
};

// Helper function to get step number from column (resolves parent for sub-columns)
const getStepNumberFromColumnId = (columnId, columns, columnOrder) => {
  if (!columns || !columnId) return null;
  const colKey = Object.keys(columns).find((k) => columns[k]?.id === columnId);
  if (!colKey) return null;
  const col = columns[colKey];
  const keyForOrder = col.parentColumnId
    ? Object.keys(columns).find((k) => columns[k]?.id === col.parentColumnId) || colKey
    : colKey;
  if (columnOrder && Array.isArray(columnOrder)) {
    const idx = columnOrder.indexOf(keyForOrder);
    return idx >= 0 ? idx + 1 : null;
  }
  const colForTitle = keyForOrder !== colKey ? columns[keyForOrder] : col;
  return getStepNumberFromColumnTitle(colForTitle?.title, columns, columnOrder);
};

const TYPE_PICKER_WIDTH = 272;

const contrastIconFg = (bg) => {
  if (!bg || typeof bg !== "string") return "#1a1a1a";
  let r;
  let g;
  let b;
  const trimmed = bg.trim();
  if (trimmed.startsWith("#")) {
    const h = trimmed.slice(1);
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    if (full.length < 6) return "#1a1a1a";
    r = parseInt(full.slice(0, 2), 16);
    g = parseInt(full.slice(2, 4), 16);
    b = parseInt(full.slice(4, 6), 16);
  } else {
    const m = trimmed.match(/\d+/g);
    if (!m || m.length < 3) return "#1a1a1a";
    r = Number(m[0]);
    g = Number(m[1]);
    b = Number(m[2]);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1a1a1a" : "#ffffff";
};

const resolveCardTypeIdFromCard = (card) => {
  const raw =
    card?.card_type_id ?? card?.cardTypeId ?? card?.raw?.card_type_id ?? card?.raw?.cardTypeId;
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
};

const resolveCardTagIdFromCard = (card) => {
  const raw =
    card?.card_tag_id ??
    card?.cardTagId ??
    card?.tag_id ??
    card?.tagId ??
    card?.raw?.card_tag_id ??
    card?.raw?.tag_id;
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
};

const resolveCardBlockerIdFromCard = (card) => {
  const raw =
    card?.card_blocker_id ??
    card?.cardBlockerId ??
    card?.blocker_id ??
    card?.raw?.card_blocker_id ??
    card?.raw?.cardBlockerId ??
    card?.raw?.blocker_id;
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
};

const resolveCardStickerIdFromCard = (card) => {
  const raw =
    card?.card_sticker_id ??
    card?.cardStickerId ??
    card?.sticker_id ??
    card?.raw?.card_sticker_id ??
    card?.raw?.cardStickerId ??
    card?.raw?.sticker_id;
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
};

const unwrapListFromApi = (data, arrayKeys) => {
  if (Array.isArray(data)) return data;
  for (const key of arrayKeys) {
    if (data?.status === "success" && Array.isArray(data[key])) return data[key];
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// Foreign keys that must never be mistaken for a picker row's own id.
const META_ROW_ID_EXCLUDE = new Set([
  "board_id",
  "card_id",
  "kanban_card_id",
  "created_by",
  "updated_by",
  "user_id",
  "owner_id",
  "workflow_id",
]);

const normalizeMetaPickerRow = (row, { idFields, nameField, defaultName }) => {
  const fields = Array.isArray(idFields) ? idFields : [idFields];
  let idRaw = fields.map((f) => row?.[f]).find((v) => v != null && String(v).trim() !== "");
  // Fallback: some board endpoints return the row id under an unexpected key
  // (e.g. `kanban_card_blocker_id`). Pick the first *_id field that isn't a
  // known foreign key so selecting the row still resolves an id.
  if ((idRaw == null || String(idRaw).trim() === "") && row && typeof row === "object") {
    const fallbackKey = Object.keys(row).find(
      (k) =>
        /_id$/i.test(k) &&
        !META_ROW_ID_EXCLUDE.has(k.toLowerCase()) &&
        row[k] != null &&
        String(row[k]).trim() !== ""
    );
    if (fallbackKey) idRaw = row[fallbackKey];
  }
  const hex = normalizeHexColor(row?.color_code || "#64748b");
  const rawIcon = row?.icon_name ?? row?.icon;
  const iconTrimmed = rawIcon != null ? String(rawIcon).trim() : "";
  return {
    id: idRaw != null ? String(idRaw).trim() : "",
    name: String(row?.[nameField] ?? row?.label ?? "").trim() || defaultName,
    color_code: hex,
    iconKey: iconTrimmed ? mapBackendIconNameToIconKey(iconTrimmed) : null,
  };
};

const normalizeBoardCardTypeRow = (row) =>
  normalizeMetaPickerRow(row, {
    idFields: ["card_type_id", "type_id"],
    nameField: "type_name",
    defaultName: "Unnamed type",
  });

const normalizeBoardCardTagRow = (row) =>
  normalizeMetaPickerRow(row, {
    idFields: ["tag_id", "card_tag_id"],
    nameField: "tag_name",
    defaultName: "Unnamed tag",
  });

const normalizeBoardCardBlockerRow = (row) =>
  normalizeMetaPickerRow(row, {
    idFields: ["card_blocker_id", "blocker_id", "id"],
    nameField: "blocker_name",
    defaultName: "Unnamed blocker",
  });

const normalizeBoardCardStickerRow = (row) =>
  normalizeMetaPickerRow(row, {
    idFields: ["card_sticker_id", "sticker_id", "id"],
    nameField: "sticker_name",
    defaultName: "Unnamed sticker",
  });

const mergeSelectionMeta = (prev, fromCard) => {
  if (!fromCard && !prev) return {};
  if (!fromCard) return prev || {};
  if (!prev) return fromCard;
  return {
    name: fromCard.name ?? prev.name,
    color_code: fromCard.color_code ?? prev.color_code,
    iconKey: fromCard.iconKey ?? prev.iconKey,
  };
};

const toDynamicIconKey = (raw) => {
  if (raw == null || String(raw).trim() === "") return null;
  return mapBackendIconNameToIconKey(String(raw).trim());
};

const resolveTopbarMetaFromCard = (card) => {
  const raw = card?.raw;
  return {
    type: {
      iconKey: toDynamicIconKey(
        card?.type_icon_name ?? raw?.type_icon_name ?? raw?.icon_name
      ),
      color_code:
        card?.type_color_code != null && String(card.type_color_code).trim() !== ""
          ? normalizeHexColor(card.type_color_code)
          : raw?.type_color_code != null && String(raw.type_color_code).trim() !== ""
            ? normalizeHexColor(raw.type_color_code)
            : raw?.color_code != null && String(raw.color_code).trim() !== ""
              ? normalizeHexColor(raw.color_code)
              : null,
      name: card?.type_name ?? raw?.type_name,
    },
    tag: {
      name: card?.tag_name ?? raw?.tag_name,
    },
    blocker: {
      iconKey: toDynamicIconKey(
        card?.blocker_icon_name ?? raw?.blocker_icon_name ?? raw?.icon_name
      ),
      color_code:
        card?.blocker_color_code != null && String(card.blocker_color_code).trim() !== ""
          ? normalizeHexColor(card.blocker_color_code)
          : raw?.blocker_color_code != null && String(raw.blocker_color_code).trim() !== ""
            ? normalizeHexColor(raw.blocker_color_code)
            : raw?.color_code != null && String(raw.color_code).trim() !== ""
              ? normalizeHexColor(raw.color_code)
              : null,
      name: card?.blocker_name ?? raw?.blocker_name,
    },
    sticker: {
      iconKey: toDynamicIconKey(
        card?.sticker_icon_name ?? raw?.sticker_icon_name ?? raw?.icon_name
      ),
      color_code:
        card?.sticker_color_code != null && String(card.sticker_color_code).trim() !== ""
          ? normalizeHexColor(card.sticker_color_code)
          : raw?.sticker_color_code != null && String(raw.sticker_color_code).trim() !== ""
            ? normalizeHexColor(raw.sticker_color_code)
            : raw?.color_code != null && String(raw.color_code).trim() !== ""
              ? normalizeHexColor(raw.color_code)
              : null,
      name: card?.sticker_name ?? raw?.sticker_name,
    },
  };
};

const selectionMetaFromPickerRow = (pickerKey, row) => {
  if (pickerKey === "tag") {
    return { name: row.name };
  }
  return {
    iconKey: row.iconKey,
    color_code: row.color_code,
    name: row.name,
  };
};

const BOARD_META_PICKERS = {
  type: {
    header: "Card type",
    emptyLabel: "types",
    showRowIcon: true,
    showTopbarDynamicIcon: true,
    resolveSelectedId: resolveCardTypeIdFromCard,
    listKeys: ["card_types"],
    normalizeRow: normalizeBoardCardTypeRow,
    fetchByBoard: (boardId) => kanbanBoardService.getCardTypesByBoard(boardId),
    updateCard: (cardId, itemId) =>
      kanbanBoardService.updateCardType({ card_id: cardId, card_type_id: itemId }),
    buildMeta: (row) => ({
      type_name: row.name,
      color_code: row.color_code,
      icon_name: row.iconKey,
    }),
    manageType: "card_type",
    loadError: "Could not load card types.",
    updateError: "Could not update card type.",
    successMsg: "Card type updated.",
    removeError: "Could not remove card type.",
    removeSuccessMsg: "Card type removed.",
  },
  tag: {
    header: "Card tag",
    emptyLabel: "tags",
    showRowIcon: false,
    showTopbarDynamicIcon: false,
    resolveSelectedId: resolveCardTagIdFromCard,
    listKeys: ["card_tags", "tags"],
    normalizeRow: normalizeBoardCardTagRow,
    fetchByBoard: (boardId) => kanbanBoardService.getCardTagsByBoard(boardId),
    updateCard: (cardId, itemId) =>
      kanbanBoardService.updateCardTag({ card_id: cardId, card_tag_id: itemId }),
    manageType: "card_tag",
    buildMeta: (row) => ({
      name: row.name,
      color_code: row.color_code,
      icon_name: row.iconKey,
    }),
    loadError: "Could not load card tags.",
    updateError: "Could not update card tag.",
    successMsg: "Card tag updated.",
    removeError: "Could not remove card tag.",
    removeSuccessMsg: "Card tag removed.",
  },
  blocker: {
    header: "Card blocker",
    emptyLabel: "blockers",
    showRowIcon: true,
    showTopbarDynamicIcon: true,
    resolveSelectedId: resolveCardBlockerIdFromCard,
    listKeys: ["card_blockers", "blockers", "kanban_card_blockers"],
    normalizeRow: normalizeBoardCardBlockerRow,
    fetchByBoard: (boardId) => kanbanBoardService.getCardBlockersByBoard(boardId),
    updateCard: (cardId, itemId) =>
      kanbanBoardService.updateCardBlocker({ card_id: cardId, card_blocker_id: itemId }),
    buildMeta: (row) => ({
      name: row.name,
      color_code: row.color_code,
      icon_name: row.iconKey,
    }),
    manageType: "card_blocker",
    loadError: "Could not load card blockers.",
    updateError: "Could not update card blocker.",
    successMsg: "Card blocker updated.",
    removeError: "Could not remove card blocker.",
    removeSuccessMsg: "Card blocker removed.",
  },
  sticker: {
    header: "Card sticker",
    emptyLabel: "stickers",
    showRowIcon: true,
    showTopbarDynamicIcon: true,
    resolveSelectedId: resolveCardStickerIdFromCard,
    listKeys: ["card_stickers", "stickers"],
    normalizeRow: normalizeBoardCardStickerRow,
    fetchByBoard: (boardId) => kanbanBoardService.getCardStickersByBoard(boardId),
    updateCard: (cardId, itemId) =>
      kanbanBoardService.updateCardSticker({ card_id: cardId, card_sticker_id: itemId }),
    buildMeta: (row) => ({
      name: row.name,
      color_code: row.color_code,
      icon_name: row.iconKey,
    }),
    manageType: "card_sticker",
    loadError: "Could not load card stickers.",
    updateError: "Could not update card sticker.",
    successMsg: "Card sticker updated.",
    removeError: "Could not remove card sticker.",
    removeSuccessMsg: "Card sticker removed.",
  },
};

const CardMetaPickerSwatch = ({ colorCode, iconKey }) => {
  const fg = contrastIconFg(colorCode);
  return (
    <span className="cardform-type-picker-row-icon" style={{ backgroundColor: colorCode }} aria-hidden>
      <DynamicIcon iconKey={iconKey} size={14} color={fg} />
    </span>
  );
};

CardMetaPickerSwatch.propTypes = {
  colorCode: PropTypes.string.isRequired,
  iconKey: PropTypes.string,
};

const CardMetaPickerPopover = ({
  header,
  floaterStyle,
  wrapRef,
  loading,
  items,
  selectedId,
  saving,
  emptyLabel,
  hasBoardId,
  showRowIcon = true,
  onSelect,
  hasSelection = false,
  removeLabel,
  onRemove,
}) => (
  <div
    ref={wrapRef}
    className="cardform-type-picker-popover"
    style={floaterStyle}
    role="listbox"
    aria-label={header}
  >
    <div className="cardform-type-picker-header">{header}</div>
    {hasSelection && (
      <button
        type="button"
        className="cardform-type-picker-remove-btn"
        onClick={onRemove}
        disabled={saving}
      >
        <X size={14} aria-hidden />
        <span>{removeLabel}</span>
      </button>
    )}
    {loading ? (
      <div className="cardform-type-picker-status">Loading…</div>
    ) : items.length === 0 ? (
      <div className="cardform-type-picker-status">
        {hasBoardId ? `No ${emptyLabel} available for this board.` : "Board id is missing."}
      </div>
    ) : (
      <ul className="cardform-type-picker-list">
        {items.map((row) => {
          const isSelected = selectedId === row.id;
          return (
            <li key={row.id || row.name}>
              <button
                type="button"
                className={`cardform-type-picker-row${isSelected ? " cardform-type-picker-row--selected" : ""}${!showRowIcon ? " cardform-type-picker-row--text-only" : ""}`}
                onClick={() => onSelect(row)}
                disabled={saving}
                role="option"
                aria-selected={isSelected}
              >
                {showRowIcon ? (
                  <CardMetaPickerSwatch colorCode={row.color_code} iconKey={row.iconKey} />
                ) : null}
                <span className="cardform-type-picker-row-label">{row.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

CardMetaPickerPopover.propTypes = {
  header: PropTypes.string.isRequired,
  floaterStyle: PropTypes.object.isRequired,
  wrapRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  loading: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedId: PropTypes.string,
  saving: PropTypes.bool,
  emptyLabel: PropTypes.string.isRequired,
  hasBoardId: PropTypes.bool,
  showRowIcon: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  hasSelection: PropTypes.bool,
  removeLabel: PropTypes.string,
  onRemove: PropTypes.func,
};

// Sub-components
const TopBar = ({
  card,
  topbarColor,
  onClose,
  closeLoading = false,
  isAddMode = false,
  onColorChange,
  onTitleCommit,
  titleSaving = false,
  formValues,
  handleChange,
  boardId,
  onCardTypeChange,
  onCardTagChange,
  onCardBlockerChange,
  onCardStickerChange,
}) => {
  const effectiveCard = useMemo(
    () => (isAddMode ? { ...card, ...formValues } : card),
    [isAddMode, card, formValues]
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [pickerFloaterStyle, setPickerFloaterStyle] = useState({});
  const [openPicker, setOpenPicker] = useState(null);
  const [metaPickerFloaterStyle, setMetaPickerFloaterStyle] = useState({});
  const [pickerLists, setPickerLists] = useState({ type: [], tag: [], blocker: [], sticker: [] });
  const [pickerLoading, setPickerLoading] = useState({
    type: false,
    tag: false,
    blocker: false,
    sticker: false,
  });
  const [metaSaving, setMetaSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => ({
    type: resolveCardTypeIdFromCard(effectiveCard),
    tag: resolveCardTagIdFromCard(effectiveCard),
    blocker: resolveCardBlockerIdFromCard(effectiveCard),
    sticker: resolveCardStickerIdFromCard(effectiveCard),
  }));
  const [selectedMeta, setSelectedMeta] = useState(() => resolveTopbarMetaFromCard(effectiveCard));
  const colorPickerTriggerRef = useRef(null);
  const pickerFloaterWrapRef = useRef(null);
  const metaPickerTriggerRefs = useRef({ type: null, tag: null, blocker: null, sticker: null });
  const metaPickerFloaterWrapRef = useRef(null);
  const metaPickerFetchRef = useRef({ type: 0, tag: 0, blocker: 0, sticker: 0 });
  const skipTitleCommitRef = useRef(false);
  const titleInputRef = useRef(null);

  const cardId = card?.code || card?.id || "";
  const cardTitle = card?.title || "";

  const metaPickerOnChange = useMemo(
    () => ({
      type: onCardTypeChange,
      tag: onCardTagChange,
      blocker: onCardBlockerChange,
      sticker: onCardStickerChange,
    }),
    [onCardTypeChange, onCardTagChange, onCardBlockerChange, onCardStickerChange]
  );

  const resolvedBoardId = useMemo(() => {
    if (boardId != null && String(boardId).trim() !== "") {
      return String(boardId).trim();
    }
    const fromCard =
      card?.board_id ?? card?.boardId ?? card?.raw?.board_id ?? card?.raw?.boardId;
    return fromCard != null && String(fromCard).trim() !== "" ? String(fromCard).trim() : null;
  }, [boardId, card]);

  useEffect(() => {
    const source = effectiveCard;
    setSelectedIds({
      type: resolveCardTypeIdFromCard(source),
      tag: resolveCardTagIdFromCard(source),
      blocker: resolveCardBlockerIdFromCard(source),
      sticker: resolveCardStickerIdFromCard(source),
    });
    setSelectedMeta((prev) => {
      const fromCard = resolveTopbarMetaFromCard(source);
      return {
        type: mergeSelectionMeta(prev?.type, fromCard.type),
        tag: { name: fromCard.tag?.name ?? prev?.tag?.name },
        blocker: mergeSelectionMeta(prev?.blocker, fromCard.blocker),
        sticker: mergeSelectionMeta(prev?.sticker, fromCard.sticker),
      };
    });
  }, [
    effectiveCard,
    isAddMode,
    formValues?.card_type_id,
    formValues?.type_name,
    formValues?.type_color_code,
    formValues?.type_icon_name,
    formValues?.card_tag_id,
    formValues?.tag_name,
    formValues?.card_blocker_id,
    formValues?.blocker_name,
    formValues?.blocker_color_code,
    formValues?.blocker_icon_name,
    formValues?.card_sticker_id,
    formValues?.sticker_name,
    formValues?.sticker_color_code,
    formValues?.sticker_icon_name,
  ]);

  useEffect(() => {
    setSelectedMeta((prev) => {
      let next = prev;
      let changed = false;
      for (const pickerKey of ["type", "blocker", "sticker"]) {
        const id = selectedIds[pickerKey];
        if (!id) continue;
        const row = pickerLists[pickerKey]?.find((r) => r.id === id);
        if (!row) continue;
        const rowMeta = selectionMetaFromPickerRow(pickerKey, row);
        if (
          rowMeta.iconKey !== prev[pickerKey]?.iconKey ||
          rowMeta.color_code !== prev[pickerKey]?.color_code ||
          rowMeta.name !== prev[pickerKey]?.name
        ) {
          next = { ...next, [pickerKey]: rowMeta };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pickerLists, selectedIds]);

  const fetchPickerList = useCallback(
    async (pickerKey) => {
      const config = BOARD_META_PICKERS[pickerKey];
      if (!config) return;
      if (!resolvedBoardId) {
        setPickerLists((prev) => ({ ...prev, [pickerKey]: [] }));
        return;
      }
      const fetchId = ++metaPickerFetchRef.current[pickerKey];
      setPickerLoading((prev) => ({ ...prev, [pickerKey]: true }));
      try {
        const res = await config.fetchByBoard(resolvedBoardId);
        if (fetchId !== metaPickerFetchRef.current[pickerKey]) return;
        const body = res?.data;
        if (body && typeof body === "object" && body.status === "error") {
          const msg =
            typeof body.message === "string" && body.message.trim()
              ? body.message
              : config.loadError;
          throw new Error(msg);
        }
        const list = unwrapListFromApi(body, config.listKeys).map(config.normalizeRow);
        setPickerLists((prev) => ({ ...prev, [pickerKey]: list }));
      } catch (err) {
        if (fetchId !== metaPickerFetchRef.current[pickerKey]) return;
        setPickerLists((prev) => ({ ...prev, [pickerKey]: [] }));
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          config.loadError;
        notify(typeof msg === "string" ? msg : config.loadError, "error");
      } finally {
        if (fetchId === metaPickerFetchRef.current[pickerKey]) {
          setPickerLoading((prev) => ({ ...prev, [pickerKey]: false }));
        }
      }
    },
    [resolvedBoardId]
  );

  useLayoutEffect(() => {
    if (!isEditingTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditingTitle]);

  useLayoutEffect(() => {
    if (!isColorPickerOpen) return;
    const anchor = colorPickerTriggerRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const width = 308;
    const left = Math.max(16, Math.min(r.right - width, window.innerWidth - width - 16));
    const top = Math.min(r.bottom + 8, window.innerHeight - 16);
    setPickerFloaterStyle({
      position: "fixed",
      top,
      left,
      zIndex: 13040,
    });
  }, [isColorPickerOpen]);

  useLayoutEffect(() => {
    if (!openPicker) return;
    const anchor = metaPickerTriggerRefs.current[openPicker];
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const width = TYPE_PICKER_WIDTH;
    const left = Math.max(16, Math.min(r.right - width, window.innerWidth - width - 16));
    const top = Math.min(r.bottom + 8, window.innerHeight - 16);
    setMetaPickerFloaterStyle({
      position: "fixed",
      top,
      left,
      zIndex: 13040,
    });
  }, [openPicker]);

  useEffect(() => {
    if (!isColorPickerOpen && !openPicker) return;
    const onMouseDown = (event) => {
      if (colorPickerTriggerRef.current?.contains(event.target)) return;
      if (pickerFloaterWrapRef.current?.contains(event.target)) return;
      if (metaPickerFloaterWrapRef.current?.contains(event.target)) return;
      for (const key of Object.keys(metaPickerTriggerRefs.current)) {
        if (metaPickerTriggerRefs.current[key]?.contains(event.target)) return;
      }
      setIsColorPickerOpen(false);
      setOpenPicker(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isColorPickerOpen, openPicker]);

  const handleToggleColorPicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenPicker(null);
    setIsColorPickerOpen((open) => !open);
  };

  const handleToggleMetaPicker = (pickerKey) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsColorPickerOpen(false);
    setOpenPicker((current) => {
      const next = current === pickerKey ? null : pickerKey;
      if (next) {
        fetchPickerList(next);
      }
      return next;
    });
  };

  const handleSelectMetaItem = async (pickerKey, row) => {
    if (metaSaving) return;
    const config = BOARD_META_PICKERS[pickerKey];
    if (!config || !row?.id) return;

    const itemIdStr = String(row.id).trim();
    if (selectedIds[pickerKey] === itemIdStr) {
      setOpenPicker(null);
      return;
    }

    const meta = config.buildMeta(row);
    const rowMeta = selectionMetaFromPickerRow(pickerKey, row);

    if (isAddMode) {
      setSelectedIds((prev) => ({ ...prev, [pickerKey]: itemIdStr }));
      setSelectedMeta((prev) => ({ ...prev, [pickerKey]: rowMeta }));
      metaPickerOnChange[pickerKey]?.(itemIdStr, meta);
      setOpenPicker(null);
      return;
    }

    const cardIdRaw = card?.id ?? card?.card_id;
    if (cardIdRaw == null || String(cardIdRaw).trim() === "") {
      notify(`Cannot update card ${config.emptyLabel.slice(0, -1)}: missing card id.`, "error");
      return;
    }

    const cardIdStr = String(cardIdRaw).trim();
    setMetaSaving(true);
    try {
      const res = await config.updateCard(cardIdStr, itemIdStr);
      const body = res?.data;
      if (body && typeof body === "object" && body.status === "error") {
        const msg =
          typeof body.message === "string" && body.message.trim()
            ? body.message
            : config.updateError;
        throw new Error(msg);
      }

      setSelectedIds((prev) => ({ ...prev, [pickerKey]: itemIdStr }));
      setSelectedMeta((prev) => ({
        ...prev,
        [pickerKey]: rowMeta,
      }));
      metaPickerOnChange[pickerKey]?.(itemIdStr, meta);
      notify(config.successMsg, "success");
      setOpenPicker(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        config.updateError;
      notify(typeof msg === "string" ? msg : config.updateError, "error");
    } finally {
      setMetaSaving(false);
    }
  };

  const handleRemoveMetaItem = async (pickerKey) => {
    if (metaSaving) return;
    const config = BOARD_META_PICKERS[pickerKey];
    if (!config || !selectedIds[pickerKey]) return;

    if (isAddMode) {
      setSelectedIds((prev) => ({ ...prev, [pickerKey]: null }));
      setSelectedMeta((prev) => ({ ...prev, [pickerKey]: {} }));
      metaPickerOnChange[pickerKey]?.(null, {});
      setOpenPicker(null);
      return;
    }

    const cardIdRaw = card?.id ?? card?.card_id;
    if (cardIdRaw == null || String(cardIdRaw).trim() === "") {
      notify(`Cannot remove card ${config.emptyLabel.slice(0, -1)}: missing card id.`, "error");
      return;
    }

    const cardIdStr = String(cardIdRaw).trim();
    setMetaSaving(true);
    try {
      const res = await kanbanBoardService.removeCardManagementItem({
        card_id: cardIdStr,
        manage_type: config.manageType,
      });
      const body = res?.data;
      if (body && typeof body === "object" && body.status === "error") {
        const msg =
          typeof body.message === "string" && body.message.trim()
            ? body.message
            : config.removeError;
        throw new Error(msg);
      }

      setSelectedIds((prev) => ({ ...prev, [pickerKey]: null }));
      setSelectedMeta((prev) => ({ ...prev, [pickerKey]: {} }));
      metaPickerOnChange[pickerKey]?.(null, {});
      notify(config.removeSuccessMsg, "success");
      setOpenPicker(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        config.removeError;
      notify(typeof msg === "string" ? msg : config.removeError, "error");
    } finally {
      setMetaSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    if (handleChange) {
      handleChange("cardTitle")(e);
    }
  };

  const handleStartEditTitle = () => {
    setIsEditingTitle(true);
  };

  const commitTitleEdit = (rawValue) => {
    setIsEditingTitle(false);
    onTitleCommit?.(rawValue ?? formValues?.cardTitle ?? cardTitle);
  };

  const handleTitleBlur = (e) => {
    if (skipTitleCommitRef.current) {
      skipTitleCommitRef.current = false;
      setIsEditingTitle(false);
      return;
    }
    commitTitleEdit(e.target.value);
  };

  const handleTitleSaveClick = (e) => {
    e.preventDefault();
    commitTitleEdit();
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    } else if (e.key === "Escape") {
      skipTitleCommitRef.current = true;
      if (handleChange) {
        handleChange("cardTitle")(cardTitle);
      }
      e.target.blur();
    }
  };

  const handleApplyColor = (hex) => {
    const next = normalizeHexColor(hex);
    if (onColorChange) {
      onColorChange(next);
    }
    setIsColorPickerOpen(false);
  };

  const handleCancelColor = () => {
    setIsColorPickerOpen(false);
  };

  const TOPBAR_ICON_SIZE = 20;
  const openPickerConfig = openPicker ? BOARD_META_PICKERS[openPicker] : null;

  const renderMetaPickerButton = (pickerKey, DefaultIcon, title) => {
    const config = BOARD_META_PICKERS[pickerKey];
    const meta = selectedMeta[pickerKey];
    const hasSelection = Boolean(selectedIds[pickerKey]);
    const useDynamicTopbarIcon =
      config?.showTopbarDynamicIcon && hasSelection && meta?.iconKey;
    const dynamicSwatchColor = meta?.color_code || "#64748b";

    const buttonLabel = hasSelection && meta?.name ? `${title}: ${meta.name}` : title;

    return (
      <button
        key={pickerKey}
        ref={(el) => {
          metaPickerTriggerRefs.current[pickerKey] = el;
        }}
        type="button"
        className={`topbar-icon-btn${useDynamicTopbarIcon ? " topbar-icon-btn--dynamic" : ""}`}
        onClick={handleToggleMetaPicker(pickerKey)}
        title={buttonLabel}
        aria-label={buttonLabel}
        aria-expanded={openPicker === pickerKey}
        aria-haspopup="listbox"
      >
        {useDynamicTopbarIcon ? (
          <span
            className="topbar-icon-btn-dynamic-swatch"
            style={{ backgroundColor: dynamicSwatchColor }}
            aria-hidden
          >
            <DynamicIcon
              iconKey={meta.iconKey}
              size={18}
              color={contrastIconFg(dynamicSwatchColor)}
            />
          </span>
        ) : (
          <DefaultIcon size={TOPBAR_ICON_SIZE} aria-hidden />
        )}
      </button>
    );
  };

  return (
    <div className="cardform-topbar" style={{ backgroundColor: topbarColor }}>
      <div>
        {!isAddMode && <span className="cardform-id">ID : {cardId}</span>}
        {isAddMode ? (
          <input
            type="text"
            className="cardform-title-input"
            placeholder="Enter card title"
            value={formValues?.cardTitle || ""}
            onChange={handleTitleChange}
            autoFocus
          />
        ) : isEditingTitle ? (
          <div className="cardform-title-edit-wrap">
            <input
              ref={titleInputRef}
              type="text"
              className="cardform-title-input cardform-title-input--view"
              placeholder="Enter card title"
              value={formValues?.cardTitle ?? cardTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              disabled={titleSaving}
              aria-label="Card title"
            />
            <button
              type="button"
              className="cardform-title-save-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleTitleSaveClick}
              disabled={titleSaving}
              aria-label="Save title"
              title="Save title"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="cardform-title-display">
            <span className="cardform-title">{cardTitle || "Untitled"}</span>
            <button
              type="button"
              className="cardform-title-edit-btn"
              onClick={handleStartEditTitle}
              aria-label="Edit title"
              title="Edit title"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="cardform-topbar-right">
        {/* Deep-link entry points have no board context, so these board-scoped
            pickers would only ever show "Board id is missing" — hide them
            entirely rather than display broken controls the viewer isn't
            there to use anyway. */}
        {resolvedBoardId ? renderMetaPickerButton("tag", Tag, "Tag") : null}
        {resolvedBoardId ? renderMetaPickerButton("type", Layers3, "Type") : null}
        {openPicker &&
          openPickerConfig &&
          typeof document !== "undefined" &&
          createPortal(
            <CardMetaPickerPopover
              header={openPickerConfig.header}
              floaterStyle={metaPickerFloaterStyle}
              wrapRef={metaPickerFloaterWrapRef}
              loading={pickerLoading[openPicker]}
              items={pickerLists[openPicker] ?? []}
              selectedId={selectedIds[openPicker]}
              saving={metaSaving}
              emptyLabel={openPickerConfig.emptyLabel}
              hasBoardId={Boolean(resolvedBoardId)}
              showRowIcon={openPickerConfig.showRowIcon !== false}
              onSelect={(row) => handleSelectMetaItem(openPicker, row)}
              hasSelection={Boolean(selectedIds[openPicker])}
              removeLabel={`Remove ${openPickerConfig.emptyLabel.slice(0, -1)}`}
              onRemove={() => handleRemoveMetaItem(openPicker)}
            />,
            document.body
          )}
        {resolvedBoardId ? renderMetaPickerButton("blocker", AlertTriangle, "Blocker") : null}
        {resolvedBoardId ? renderMetaPickerButton("sticker", Sticker, "Sticker") : null}
        <div className="topbar-color-picker-wrapper">
          <button
            ref={colorPickerTriggerRef}
            type="button"
            className="topbar-color-picker-label"
            onClick={handleToggleColorPicker}
            title="Change header color"
            aria-label="Color Picker"
            aria-expanded={isColorPickerOpen}
          >
            <img src={ColorPickerIcon} alt="Color Picker" className="topbar-color-picker-icon" />
          </button>
          {isColorPickerOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <div ref={pickerFloaterWrapRef} style={pickerFloaterStyle}>
                <SedresColorPicker
                  ariaLabel="Pick card header color"
                  initialHex={appearanceColorToPickerHex(topbarColor)}
                  className="kanban-dashboard-color-picker-popover--floating"
                  onApply={handleApplyColor}
                  onCancel={handleCancelColor}
                />
              </div>,
              document.body
            )}
        </div>
        <button
          className={`cardform-close-btn${closeLoading ? " cardform-close-btn--loading" : ""}`}
          onClick={onClose}
          type="button"
          aria-label="Close"
          disabled={closeLoading}
          aria-busy={closeLoading}
        >
          {closeLoading ? (
            <span
              className="spinner-border spinner-border-sm cardform-close-btn__spinner"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "✕"
          )}
        </button>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  card: PropTypes.object,
  topbarColor: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  closeLoading: PropTypes.bool,
  isAddMode: PropTypes.bool,
  onColorChange: PropTypes.func,
  onTitleCommit: PropTypes.func,
  titleSaving: PropTypes.bool,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  boardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCardTypeChange: PropTypes.func,
  onCardTagChange: PropTypes.func,
  onCardBlockerChange: PropTypes.func,
  onCardStickerChange: PropTypes.func,
};

const StepsProgress = ({ totalSteps = 0, activeStep = 1, completedSteps = 0, stepLabels = [], onStepClick, currentStep }) => {
  const GREEN_COMPLETED = "#2e7d32";
  const GREEN_INACTIVE = "#8bc48a";

  const actualCurrentStep = currentStep !== null && currentStep !== undefined ? currentStep : activeStep;

  return (
    <div className="cardform-steps-wrapper">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= completedSteps;
        const isCurrentStep = stepNumber === actualCurrentStep;
        const isStepCompletedOrCurrent = isCompleted || isCurrentStep;
        const stepClass = isStepCompletedOrCurrent ? "completed" : "";

        const nextStepNumber = stepNumber + 1;
        const isNextStepCompleted = nextStepNumber <= completedSteps;
        const isNextStepCurrent = nextStepNumber === actualCurrentStep;
        const isNextStepCompletedOrCurrent = isNextStepCompleted || isNextStepCurrent;
        const lineClass = isStepCompletedOrCurrent && isNextStepCompletedOrCurrent ? "completed-line" : "";

        const isClickable = onStepClick && currentStep !== null && stepNumber !== currentStep;

        const circleStyle = isStepCompletedOrCurrent
          ? { background: GREEN_COMPLETED, color: "#ffffff", borderColor: GREEN_COMPLETED }
          : { borderColor: GREEN_INACTIVE, color: GREEN_INACTIVE };

        const lineStyle = isStepCompletedOrCurrent && isNextStepCompletedOrCurrent
          ? { background: GREEN_COMPLETED }
          : { background: GREEN_INACTIVE };

        const labelStyle = isStepCompletedOrCurrent
          ? { color: GREEN_COMPLETED }
          : { color: GREEN_INACTIVE };

        const stepLabel = stepLabels[index] || `Step ${stepNumber}`;
        const handleStepClick = () => {
          if (onStepClick && isClickable) {
            onStepClick(stepLabel, stepNumber);
          }
        };

        return (
          <div
            key={stepNumber}
            className={`step-item ${stepClass} ${isClickable ? 'clickable' : ''}`}
            onClick={handleStepClick}
            style={isClickable ? { cursor: 'pointer' } : {}}
          >
            <div className="step-content">
              <div className="step-circle" style={circleStyle}>
                {stepNumber}
              </div>
              {index < totalSteps - 1 && (
                <span className={`step-line ${lineClass}`} style={lineStyle}></span>
              )}
            </div>
            <div className="step-label" style={labelStyle}>
              {stepLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
};

StepsProgress.propTypes = {
  totalSteps: PropTypes.number,
  activeStep: PropTypes.number,
  completedSteps: PropTypes.number,
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  onStepClick: PropTypes.func,
  currentStep: PropTypes.number,
};

/** Only rendered when the board's own columns give us real stage labels to show —
 * never a fabricated default set of stage names. */
const CardFormFooter = ({ onStepClick, currentStep, stepLabels = [], totalSteps = 0 }) => {
  if (!stepLabels.length) return null;
  return (
    <div className="cardform-footer">
      <StepsProgress
        totalSteps={totalSteps}
        activeStep={currentStep || 1}
        completedSteps={currentStep && currentStep > 1 ? currentStep - 1 : 0}
        stepLabels={stepLabels}
        onStepClick={onStepClick}
        currentStep={currentStep}
      />
    </div>
  );
};

CardFormFooter.propTypes = {
  onStepClick: PropTypes.func,
  currentStep: PropTypes.number,
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  totalSteps: PropTypes.number,
};

/**
 * Generic card-detail modal: header (title, color, type/tag/blocker/sticker — see
 * TopBar) plus a column-driven stage stepper (see CardFormFooter). The body below
 * the header is a single placeholder "Details" section — FFD's real card-detail
 * fields/tabs aren't defined yet, so nothing has been invented here. Wire the real
 * fields into <CardDetailsBody> once that schema exists; a tab-bar dispatch is the
 * natural next step if/when there's more than one tab.
 */
function CardDetailsBody({ card }) {
  return (
    <div className="cardform-body cardform-body--placeholder">
      {card?.user && <p className="cardform-body-field">Assignee: {card.user}</p>}
      {card?.timeLeft && <p className="cardform-body-field">Time left: {card.timeLeft}</p>}
      <p className="cardform-body-placeholder-note">
        No additional card fields are configured yet.
      </p>
    </div>
  );
}

CardDetailsBody.propTypes = {
  card: PropTypes.object,
};

function CardForm({
  show,
  close,
  card,
  moveCardToColumn,
  columns,
  columnOrder,
  currentColumn,
  isAddMode = false,
  boardId,
  onBoardRefresh,
  patchCardColor,
  patchCardTitle,
  patchCardType,
  patchCardBlocker,
  patchCardSticker,
  patchCardTag,
}) {
  const isSubTaskCard = card?.isSubTask === true;

  const { stepLabels, totalSteps } = useMemo(() => {
    const fromColumns = getStepLabelsFromColumns(columns, columnOrder);
    if (fromColumns) {
      return { stepLabels: fromColumns, totalSteps: fromColumns.length };
    }
    return { stepLabels: [], totalSteps: 0 };
  }, [columns, columnOrder]);

  const [topbarColor, setTopbarColor] = useState(() =>
    isAddMode ? ADD_CARD_TOPBAR_DEFAULT_HEX : card?.color || DEFAULT_ACCENT_COLOR
  );

  const initialFormValues = useMemo(
    () => ({
      cardTitle: card?.title || "",
      cardColor: isAddMode ? ADD_CARD_TOPBAR_DEFAULT_HEX : card?.color || DEFAULT_ACCENT_COLOR,
    }),
    [card, isAddMode]
  );

  const cardFormSyncKey = useMemo(
    () => `${isAddMode ? "add" : "view"}:${card?.id ?? card?.card_id ?? ""}`,
    [isAddMode, card?.id, card?.card_id]
  );

  const [formValues, setFormValues] = useState(initialFormValues);
  const initialFormValuesRef = useRef(initialFormValues);
  initialFormValuesRef.current = initialFormValues;

  useEffect(() => {
    setFormValues(initialFormValuesRef.current);
  }, [cardFormSyncKey]);

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e?.target?.value !== undefined ? e.target.value : e;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const [isClosing, setIsClosing] = useState(false);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const isClosingRef = useRef(false);

  // Lock background scroll while the modal is open so the board behind it can't
  // be scrolled out from under the fixed overlay.
  useEffect(() => {
    if (!show) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  const handleClose = useCallback(async () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    try {
      if (onBoardRefresh) {
        await onBoardRefresh();
      } else {
        await kanbanBoardService.getFullBoard(boardId ?? 1);
      }
    } catch {
      // Keep whatever board state is already displayed rather than surfacing a
      // transient refetch error on close.
    } finally {
      close();
      isClosingRef.current = false;
      setIsClosing(false);
    }
  }, [close, onBoardRefresh, boardId]);

  // Calculate current step from current column (supports sub-columns).
  const currentStep = useMemo(() => {
    if (!currentColumn) return null;
    return getStepNumberFromColumnId(currentColumn.id, columns, columnOrder);
  }, [currentColumn, columns, columnOrder]);

  const handleStepClick = useCallback(
    (stepLabel, stepNumber) => {
      if (!card?.id) return;
      if (currentStep !== null && stepNumber === currentStep) return;

      const targetColumnId = getColumnIdFromStepLabel(stepLabel, columns, columnOrder);
      if (!targetColumnId) return;

      if (moveCardToColumn) moveCardToColumn(card.id, targetColumnId);
    },
    [moveCardToColumn, card?.id, columns, columnOrder, currentStep]
  );

  useEffect(() => {
    if (!show || isAddMode) return;
    if (card?.color) {
      setTopbarColor(card.color);
    }
  }, [show, card?.id, card?.color, isAddMode]);

  const handleTopbarCardTypeChange = useCallback(
    (cardTypeId, meta) => {
      if (isAddMode) {
        setFormValues((prev) => ({
          ...prev,
          card_type_id: cardTypeId,
          type_name: meta.type_name,
          type_color_code: meta.color_code,
          type_icon_name: meta.icon_name,
        }));
        return;
      }
      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") return;
      patchCardType?.(String(cardIdRaw).trim(), cardTypeId, meta);
    },
    [isAddMode, card?.id, card?.card_id, patchCardType]
  );

  const handleTopbarCardTagChange = useCallback(
    (tagId, meta) => {
      if (isAddMode) {
        setFormValues((prev) => ({
          ...prev,
          card_tag_id: tagId,
          tag_id: tagId,
          tag_name: meta.name,
        }));
        return;
      }
      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") return;
      patchCardTag?.(String(cardIdRaw).trim(), tagId, meta);
    },
    [isAddMode, card?.id, card?.card_id, patchCardTag]
  );

  const handleTopbarCardBlockerChange = useCallback(
    (blockerId, meta) => {
      if (isAddMode) {
        setFormValues((prev) => ({
          ...prev,
          card_blocker_id: blockerId,
          blocker_id: blockerId,
          blocker_name: meta.name,
          blocker_color_code: meta.color_code,
          blocker_icon_name: meta.icon_name,
        }));
        return;
      }
      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") return;
      patchCardBlocker?.(String(cardIdRaw).trim(), blockerId, meta);
    },
    [isAddMode, card?.id, card?.card_id, patchCardBlocker]
  );

  const handleTopbarCardStickerChange = useCallback(
    (stickerId, meta) => {
      if (isAddMode) {
        setFormValues((prev) => ({
          ...prev,
          card_sticker_id: stickerId,
          sticker_id: stickerId,
          sticker_name: meta.name,
          sticker_color_code: meta.color_code,
          sticker_icon_name: meta.icon_name,
        }));
        return;
      }
      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") return;
      patchCardSticker?.(String(cardIdRaw).trim(), stickerId, meta);
    },
    [isAddMode, card?.id, card?.card_id, patchCardSticker]
  );

  const handleTopbarColorChange = useCallback(
    (newColor) => {
      const normalized = normalizeHexColor(newColor, DEFAULT_ACCENT_COLOR);

      setTopbarColor(normalized);
      if (isAddMode) {
        setFormValues((prev) => ({ ...prev, cardColor: normalized }));
        return;
      }

      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") {
        notify("Cannot save card color: missing card id.", "error");
        setTopbarColor(card?.color || DEFAULT_ACCENT_COLOR);
        return;
      }

      const id = String(cardIdRaw).trim();
      const applyLocal = () => patchCardColor?.(id, normalized);

      if (!onBoardRefresh) {
        applyLocal();
        return;
      }

      kanbanBoardService
        .updateCardColor({ card_id: id, card_color: normalized })
        .then((res) => {
          const body = res?.data;
          if (body && typeof body === "object" && body.status === "error") {
            const msg =
              typeof body.message === "string" && body.message.trim()
                ? body.message
                : "Could not update card color.";
            throw new Error(msg);
          }
          applyLocal();
        })
        .catch((err) => {
          setTopbarColor(card?.color || DEFAULT_ACCENT_COLOR);
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Could not update card color.";
          notify(typeof msg === "string" ? msg : "Could not update card color.", "error");
        });
    },
    [isAddMode, card?.id, card?.card_id, card?.color, onBoardRefresh, patchCardColor]
  );

  const handleTopbarTitleCommit = useCallback(
    (newTitle) => {
      if (isAddMode) return;

      const trimmed = String(newTitle ?? "").trim();
      const previousTitle = card?.title || "";

      if (!trimmed) {
        notify("Card title cannot be empty.", "error");
        setFormValues((prev) => ({ ...prev, cardTitle: previousTitle }));
        return;
      }
      if (trimmed === previousTitle.trim()) {
        setFormValues((prev) => ({ ...prev, cardTitle: trimmed }));
        return;
      }

      const cardIdRaw = card?.id ?? card?.card_id;
      if (cardIdRaw == null || String(cardIdRaw).trim() === "") {
        notify("Cannot save card title: missing card id.", "error");
        setFormValues((prev) => ({ ...prev, cardTitle: previousTitle }));
        return;
      }

      const id = String(cardIdRaw).trim();
      setIsTitleSaving(true);
      kanbanBoardService
        .updateCardTitle({ card_id: id, title: trimmed })
        .then((res) => {
          const body = res?.data;
          if (body && typeof body === "object" && body.status === "error") {
            const msg =
              typeof body.message === "string" && body.message.trim()
                ? body.message
                : "Could not update card title.";
            throw new Error(msg);
          }
          patchCardTitle?.(id, trimmed);
          setFormValues((prev) => ({ ...prev, cardTitle: trimmed }));
          notify("Card title updated.", "success");
        })
        .catch((err) => {
          setFormValues((prev) => ({ ...prev, cardTitle: previousTitle }));
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Could not update card title.";
          notify(typeof msg === "string" ? msg : "Could not update card title.", "error");
        })
        .finally(() => setIsTitleSaving(false));
    },
    [isAddMode, card?.id, card?.card_id, card?.title, patchCardTitle]
  );

  if (!show) return null;

  return (
    <div className="cardform-overlay">
      <div className={`cardform-panel ${isAddMode ? 'add-mode' : ''}`}>
        <TopBar
          card={card}
          topbarColor={topbarColor}
          onClose={handleClose}
          closeLoading={isClosing}
          isAddMode={isAddMode}
          onColorChange={handleTopbarColorChange}
          onTitleCommit={handleTopbarTitleCommit}
          titleSaving={isTitleSaving}
          formValues={formValues}
          handleChange={handleChange}
          boardId={boardId}
          onCardTypeChange={handleTopbarCardTypeChange}
          onCardTagChange={handleTopbarCardTagChange}
          onCardBlockerChange={handleTopbarCardBlockerChange}
          onCardStickerChange={handleTopbarCardStickerChange}
        />
        {isSubTaskCard ? (
          <TaskCardDetailView card={card} onClose={handleClose} />
        ) : (
          <CardDetailsBody card={card} />
        )}
        {!isAddMode && !isSubTaskCard && (
          <CardFormFooter
            onStepClick={handleStepClick}
            currentStep={currentStep}
            stepLabels={stepLabels}
            totalSteps={totalSteps}
          />
        )}
      </div>
    </div>
  );
}

CardForm.propTypes = {
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  card: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    user: PropTypes.string,
    color: PropTypes.string,
  }),
  moveCardToColumn: PropTypes.func,
  columns: PropTypes.object,
  columnOrder: PropTypes.arrayOf(PropTypes.string),
  currentColumn: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    color: PropTypes.string,
    cardIds: PropTypes.array,
  }),
  isAddMode: PropTypes.bool,
  boardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBoardRefresh: PropTypes.func,
  patchCardColor: PropTypes.func,
  patchCardTitle: PropTypes.func,
  patchCardType: PropTypes.func,
  patchCardBlocker: PropTypes.func,
  patchCardSticker: PropTypes.func,
  patchCardTag: PropTypes.func,
};

export default CardForm;
