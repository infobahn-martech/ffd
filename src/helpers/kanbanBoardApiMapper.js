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
  const cid = beCard?.card_id ?? beCard?.id;
  return {
    id: feCardId,
    laneId: laneKey,
    columnId: columnKey,
    boardId: boardId ?? undefined,
    workflowId,
    title: beCard?.title ?? '',
    name: beCard?.name ?? beCard?.billing_entity ?? '',
    user: beCard?.assigned_to ?? '',
    vesselName: beCard?.vessel_name ?? '',
    port:
      beCard?.port != null
        ? String(beCard.port)
        : beCard?.port_id != null
          ? String(beCard.port_id)
          : '',
    callId: beCard?.call_id,
    vesselId: beCard?.vessel_id,
    billingEntity: beCard?.billing_entity,
    entityLogo: beCard?.entity_logo,
    createdDate: beCard?.created_date,
    color: '#607d8b',
    iconType: 'document',
    progress: 0,
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

  /** Discover swimlane metadata (title, order) from every column before placing cards. */
  /** @type {Map<string|number, { title: string, order: number }>} */
  const laneMeta = new Map();

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
        columns[colKey] = {
          id: colKey,
          title: col?.column_name ?? 'Column',
          color: stageColor,
          wipLimit: wip != null ? wip : null,
          cardsPerRow:
            typeof cpr === 'number' && cpr > 0 ? cpr : DEFAULT_CARDS_PER_ROW,
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

  for (const stage of stages) {
    for (const col of safeArray(stage?.columns)) {
      const colId = col?.column_id;
      if (colId == null) continue;
      const colKey = buildColumnKey(wfIdStr, colId);
      if (!columns[colKey]) continue;

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
          if (!swimlanes[laneKey].cardMap[colKey]) {
            swimlanes[laneKey].cardMap[colKey] = [];
          }
          swimlanes[laneKey].cardMap[colKey].push(feCardId);

          cards[feCardId] = mapCardFields(
            beCard,
            feCardId,
            laneKey,
            colKey,
            wfIdStr,
            boardId
          );
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
