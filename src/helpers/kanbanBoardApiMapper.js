/**
 * Maps GET kanban_board/get_full_board/{board_id} payloads into the normalized
 * workflow shape used by the board (`normalizeWorkflowFromApi` in data.js).
 *
 * Raw BE objects are never passed to UI components — only this layer’s output is.
 */

import { normalizeWorkflowFromApi } from './data';

/** Default FE column width grid when BE omits cardsPerRow (matches boardGridHelpers). */
const DEFAULT_CARDS_PER_ROW = 2;

/**
 * Same semantics as `getCardsPerRow` in board column sizing — kept here so helpers do not import pages.
 * @param {object | null | undefined} column
 * @returns {number}
 */
export function getCardsPerRow(column) {
  if (column == null) return DEFAULT_CARDS_PER_ROW;
  const n = column.cardsPerRow;
  return typeof n === 'number' && n > 0 ? n : DEFAULT_CARDS_PER_ROW;
}

/**
 * Stable FE card id — do not use BE card_id alone (may repeat across columns/lanes).
 * @param {string|number} workflowId
 * @param {string|number} columnId
 * @param {string|number} swimlaneId
 * @param {string|number} cardId
 */
export function getSafeCardKey(workflowId, columnId, swimlaneId, cardId) {
  return `${workflowId}-${columnId}-${swimlaneId}-${cardId}`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildLaneKey(workflowId, swimlaneId) {
  return `${workflowId}-sl-${swimlaneId}`;
}

function buildColumnKey(workflowId, columnId) {
  return `${workflowId}-c-${columnId}`;
}

/**
 * Flattens one BE card into the card object stored in workflow.cards[feCardId].
 * Optional mock-only fields are omitted; Card UI tolerates missing values.
 */
function mapCardFields(beCard, feCardId, laneKey, columnKey, workflowId, boardId) {
  const kpi = Number(beCard?.kpi_percentage);
  const safeKpi = Number.isFinite(kpi) ? kpi : 0;
  const cardName = beCard?.card_name ?? beCard?.title ?? '';
  const vesselName = beCard?.vessel_name ?? '';
  const timeline = beCard?.timeline ?? '';
  return {
    id: feCardId,
    backendCardId: beCard?.card_id ?? beCard?.id,
    laneId: laneKey,
    columnId: columnKey,
    boardId: boardId ?? undefined,
    workflowId,
    title: cardName,
    cardName,
    callId: beCard?.call_id,
    vesselId: beCard?.vessel_id,
    vesselName,
    portId: beCard?.port_id,
    billingEntity: beCard?.billing_entity ?? '',
    entityLogo: beCard?.entity_logo ?? '',
    user: beCard?.username ?? '',
    userId: beCard?.user_id ?? '',
    createdDate: beCard?.created_date ?? '',
    progress: safeKpi,
    kpiPercentage: safeKpi,
    timeLeft: timeline,
    timeline,
    /** Compatibility aliases used by current card UI components. */
    name: vesselName || cardName || '',
    port:
      beCard?.port != null
        ? String(beCard.port)
        : beCard?.port_id != null
          ? String(beCard.port_id)
          : '',
    color: '#607d8b',
    iconType: 'document',
    priority: false,
    footerShowIcons: [],
    extraDetailsShowIcons: [],
  };
}

/**
 * Converts a single BE workflow record into the normalized FE workflow object.
 * @param {object} beWorkflow - one element of response.data
 * @returns {object|null}
 */
export function mapFullBoardApiToWorkflow(beWorkflow) {
  if (!beWorkflow || typeof beWorkflow !== 'object') return null;

  const workflowId = beWorkflow.workflow_id ?? beWorkflow.id;
  if (workflowId == null) return null;

  const wfIdStr = String(workflowId);
  const boardId = beWorkflow.board_id ?? null;

  const stages = safeArray(beWorkflow.stages);

  /** @type {string[]} */
  const columnOrder = [];
  /** @type {Record<string, object>} */
  const columns = {};

  /** Discover swimlane metadata (title, order) from workflow + columns before placing cards. */
  /** @type {Map<string|number, { title: string, order: number }>} */
  const laneMeta = new Map();
  for (const sl of safeArray(beWorkflow?.swimlanes)) {
    const sid = sl?.swimlane_id ?? sl?.id;
    if (sid == null) continue;
    const ordRaw = Number(sl?.swimlane_order ?? sl?.order);
    laneMeta.set(sid, {
      title: sl?.swimlane_name ?? sl?.name ?? `Swimlane ${sid}`,
      order: Number.isFinite(ordRaw) ? ordRaw : Number.MAX_SAFE_INTEGER,
    });
  }

  for (const stage of stages) {
    const stageColor = stage?.color_code ?? '#cccccc';
    for (const col of safeArray(stage?.columns)) {
      const colId = col?.column_id;
      if (colId == null) continue;

      const colKey = buildColumnKey(wfIdStr, colId);
      if (!columns[colKey]) {
        columnOrder.push(colKey);
        const cpr =
          col?.cards_per_row ?? col?.cardsPerRow;
        const wip = col?.wip_limit ?? col?.wipLimit;
        const cprNum = Number(cpr);
        columns[colKey] = {
          id: String(colId),
          title: col?.column_name ?? 'Column',
          color: stageColor,
          wipLimit: wip != null ? wip : null,
          /**
           * cards_per_row comes as string/number from BE. Keep FE layout stable:
           * parse safely, fallback to 2 when missing/invalid/<=0.
           */
          cardsPerRow:
            Number.isFinite(cprNum) && cprNum > 0 ? cprNum : DEFAULT_CARDS_PER_ROW,
        };
      }

      for (const sl of safeArray(col?.swimlanes)) {
        const sid = sl?.swimlane_id;
        if (sid == null) continue;
        if (!laneMeta.has(sid)) {
          const ord =
            typeof sl.swimlane_order === 'number' && !Number.isNaN(sl.swimlane_order)
              ? sl.swimlane_order
              : Number.MAX_SAFE_INTEGER;
          laneMeta.set(sid, {
            title: sl.swimlane_name ?? `Swimlane ${sid}`,
            order: ord,
          });
        }
      }
    }
  }

  /** If BE sent columns but no swimlane rows, synthesize one so headers + grid still render. */
  if (laneMeta.size === 0 && columnOrder.length > 0) {
    laneMeta.set('__default__', { title: 'Default', order: 0 });
  }

  /** Sort lanes: swimlane_order ascending, then id for stability. */
  const sortedLaneEntries = [...laneMeta.entries()].sort((a, b) => {
    const oa = a[1].order;
    const ob = b[1].order;
    if (oa !== ob) return oa - ob;
    return String(a[0]).localeCompare(String(b[0]));
  });

  const swimlaneOrder = sortedLaneEntries.map(([sid]) =>
    sid === '__default__' ? buildLaneKey(wfIdStr, 'default') : buildLaneKey(wfIdStr, sid)
  );

  /** @type {Record<string, { id, title, cardMap }>} */
  const swimlanes = {};

  for (const [sid, meta] of sortedLaneEntries) {
    const laneKey =
      sid === '__default__' ? buildLaneKey(wfIdStr, 'default') : buildLaneKey(wfIdStr, sid);
    const emptyMap = Object.fromEntries(columnOrder.map((k) => [k, []]));
    swimlanes[laneKey] = {
      id: laneKey,
      title: meta.title,
      cardMap: emptyMap,
    };
  }

  /** @type {Record<string, object>} */
  const cards = {};
  const seenCardIds = new Set();

  for (const stage of stages) {
    const stageColor = stage?.color_code ?? '#cccccc';
    for (const col of safeArray(stage?.columns)) {
      const colId = col?.column_id;
      if (colId == null) continue;
      const colKey = buildColumnKey(wfIdStr, colId);
      if (!columns[colKey]) continue;

      /**
       * New BE shape may provide cards at column level. We normalize into lane cardMap
       * using card.swimlane_id when present, otherwise first lane/default.
       */
      for (const beCard of safeArray(col?.cards)) {
        const rawCardId = beCard?.card_id ?? beCard?.id;
        if (rawCardId == null) continue;
        const cardSwimlaneId = beCard?.swimlane_id;
        const laneKey = cardSwimlaneId != null
          ? buildLaneKey(wfIdStr, cardSwimlaneId)
          : swimlaneOrder[0] ?? buildLaneKey(wfIdStr, 'default');
        if (!swimlanes[laneKey]) continue;
        const feCardId = getSafeCardKey(
          wfIdStr,
          colId,
          cardSwimlaneId ?? 'default',
          rawCardId
        );
        if (seenCardIds.has(feCardId)) continue;
        seenCardIds.add(feCardId);
        if (!swimlanes[laneKey].cardMap[colKey]) {
          swimlanes[laneKey].cardMap[colKey] = [];
        }
        swimlanes[laneKey].cardMap[colKey].push(feCardId);
        cards[feCardId] = {
          ...mapCardFields(beCard, feCardId, laneKey, colKey, wfIdStr, boardId),
          color: stageColor,
        };
      }

      for (const sl of safeArray(col?.swimlanes)) {
        const sid = sl?.swimlane_id;
        const laneKey =
          sid == null && laneMeta.has('__default__')
            ? buildLaneKey(wfIdStr, 'default')
            : sid != null
              ? buildLaneKey(wfIdStr, sid)
              : null;
        if (!laneKey || !swimlanes[laneKey]) continue;

        for (const beCard of safeArray(sl?.cards)) {
          const rawCardId = beCard?.card_id ?? beCard?.id;
          if (rawCardId == null) continue;

          const feCardId = getSafeCardKey(wfIdStr, colId, sid ?? 'default', rawCardId);
          if (seenCardIds.has(feCardId)) continue;
          seenCardIds.add(feCardId);
          if (!swimlanes[laneKey].cardMap[colKey]) {
            swimlanes[laneKey].cardMap[colKey] = [];
          }
          swimlanes[laneKey].cardMap[colKey].push(feCardId);

          cards[feCardId] = {
            ...mapCardFields(
              beCard,
              feCardId,
              laneKey,
              colKey,
              wfIdStr,
              boardId
            ),
            /** Keep card color synced with parent stage for current FE card rendering. */
            color: stageColor,
          };
        }
      }
    }
  }

  const raw = {
    id: wfIdStr,
    boardId: boardId != null ? boardId : undefined,
    title: beWorkflow.workflow_name ?? beWorkflow.title ?? 'Workflow',
    columnOrder,
    columns,
    swimlaneOrder,
    swimlanes,
    cards,
  };

  return normalizeWorkflowFromApi(raw);
}

/**
 * Maps the full API body (workflows) to normalized FE workflows.
 * Accepts either a bare array or a common wrapper `{ data: Workflow[] }`.
 * @param {unknown} responseData - axios `response.data`
 * @returns {object[]}
 */
export function mapFullBoardApiResponse(responseData) {
  const list = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : [];
  return list.map(mapFullBoardApiToWorkflow).filter(Boolean);
}
