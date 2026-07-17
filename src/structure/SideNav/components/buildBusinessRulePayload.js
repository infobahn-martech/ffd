import { ACTION_GROUP_TYPE_TO_SECTION_ID, RELATIONAL_CREATE_ACTION_LABELS } from './businessRulesData';

const findActionTypeId = (triggerActions, sectionId) =>
  triggerActions.find((a) => ACTION_GROUP_TYPE_TO_SECTION_ID[a.group_type] === sectionId)?.action_type_id ?? null;

// A create action's `key` is the DEV-fallback's literal 'child'/'parent'/... string, but a
// live backend response keys it by its own field_key instead — so relation_type has to be
// derived from the label ("Create child" -> "child") the same way hasCustomProperties does
// in BusinessRuleFormModal.jsx, not from action.key.
const getRelationTypeFromLabel = (label) => {
  const normalized = label?.trim().toLowerCase() ?? '';
  return RELATIONAL_CREATE_ACTION_LABELS.includes(normalized) ? normalized.replace(/^create /, '') : null;
};

const getOperatorLabel = (fieldDetailsByKey, fieldType, fieldId, operatorId) => {
  if (!fieldType || fieldId == null) return null;
  const operators = fieldDetailsByKey[`${fieldType}-${fieldId}`]?.operators ?? [];
  return operators.find((op) => String(op.field_operator_id) === String(operatorId))?.operator_label ?? null;
};

// Flat conditions[] list: one entry per condition-box value row, in field-details-derived
// operator-label form (matches the "is"/"is not" convention confirmed by DUMMY_FIELD_OPERATORS
// lining up with the documented example's `operator: "is"`). whenFields and the board/position
// restriction rows are folded in alongside real conditions using the same shape — best-effort,
// since the create_business_rule example only documents plain field conditions and none of
// these three have a confirmed backend contract yet.
const buildConditions = (formState, ctx) => {
  const { conditions, whenFields, boardConditionRows, positionConditionRows } = formState;
  const { fieldDetailsByKey, triggerConfig } = ctx;
  const entries = [];

  conditions.forEach((cond) => {
    cond.values.forEach((row, index) => {
      const entry = {
        operator: getOperatorLabel(fieldDetailsByKey, cond.fieldType, cond.fieldId, cond.operatorId),
        input_value: row.value,
        connector: index === 0 ? 'AND' : row.joinWord,
      };
      if (cond.fieldType === 'custom') entry.custom_field_id = cond.fieldId;
      else if (cond.fieldType === 'regular') entry.regular_field_id = cond.fieldId;
      else entry.time_unit_key = cond.fieldKey; // best-effort: time-unit conditions have no confirmed id field
      entries.push(entry);
    });
  });

  // "When fields" watch list has no operator/value in the UI at all — best-effort only.
  whenFields.forEach((f) => {
    const entry = { operator: null, input_value: null, connector: 'AND' };
    if (f.fieldType === 'custom') entry.custom_field_id = f.fieldId;
    else if (f.fieldType === 'regular') entry.regular_field_id = f.fieldId;
    entries.push(entry);
  });

  // Board/position restriction rows carry no field id of their own — best-effort lookup
  // against this trigger's own default_conditions catalog by field_label.
  const defaultConditionFor = (label) =>
    (triggerConfig?.default_conditions ?? []).find((c) => String(c.field_label ?? '').trim().toLowerCase() === label);

  const boardDefault = defaultConditionFor('board');
  if (boardDefault) {
    boardConditionRows.filter((row) => row.boardId).forEach((row, index) => {
      entries.push({
        regular_field_id: boardDefault.regular_field_id ?? boardDefault.field_id ?? null,
        operator: 'is',
        input_value: row.boardId,
        connector: index === 0 ? 'AND' : row.joinWord,
      });
    });
  }

  const positionDefault = defaultConditionFor('position');
  if (positionDefault) {
    positionConditionRows.filter((row) => row.boardId).forEach((row, index) => {
      entries.push({
        regular_field_id: positionDefault.regular_field_id ?? positionDefault.field_id ?? null,
        operator: 'is',
        input_value: [row.boardId, row.swimlaneId, row.stageId].filter(Boolean).join(':'),
        connector: index === 0 ? 'AND' : row.joinWord,
      });
    });
  }

  return entries;
};

const buildThenActions = (formState, ctx) => {
  const {
    createActions, linkActions, removeOtherLinksByType, moveActions, updateActions,
    copyValuesActions, convertSubtaskActions, notifyActions, invokeActions,
  } = formState;
  const { triggerActions } = ctx;
  const thenActions = [];

  const createActionTypeId = findActionTypeId(triggerActions, 'create');
  createActions.forEach((action) => {
    // Matched by label, not action.key — same reason as hasCustomProperties in
    // BusinessRuleFormModal.jsx: a live backend response keys this field by its own
    // field_key, not the dev-fallback's literal 'subtask' string.
    if (action.label?.trim().toLowerCase() === 'create subtask') {
      // Subtask owner/deadline/description are already saved server-side via
      // saveCreateSubtaskSettings (action.createSubtaskId) — only referenced here.
      // Property name is a best-effort guess, unverified against a real example.
      thenActions.push({
        action_type_id: createActionTypeId,
        properties: [{ property_key: 'create_subtask_id', property_value: action.createSubtaskId, property_value_type: 'number' }],
      });
      return;
    }
    const properties = [
      { property_key: 'target_board_id', property_value: action.boardId, property_value_type: 'number' },
      { property_key: 'target_column_id', property_value: action.stageId, property_value_type: 'number' },
      // No card-title input exists in the UI yet — falls back to the selected board
      // template name as a best-effort placeholder.
      { property_key: 'card_title', property_value: action.templateName ?? '', property_value_type: 'string' },
    ];
    const relationType = getRelationTypeFromLabel(action.label);
    if (relationType) {
      // Cross-card create variants (child/parent/predecessor/relative/successor) aren't
      // covered by the documented example (a plain "create card") — best-effort.
      properties.push({ property_key: 'relation_type', property_value: relationType, property_value_type: 'string' });
    }
    // Fields picked in the "Copy Card Details" step (relational creates only) — no
    // documented shape for this either, sent as comma-separated key lists, best-effort.
    if (action.copyFields?.regularFields?.length > 0) {
      properties.push({ property_key: 'copy_regular_fields', property_value: action.copyFields.regularFields.join(', '), property_value_type: 'string' });
    }
    if (action.copyFields?.customFields?.length > 0) {
      properties.push({ property_key: 'copy_custom_fields', property_value: action.copyFields.customFields.join(', '), property_value_type: 'string' });
    }
    thenActions.push({ action_type_id: createActionTypeId, properties });
  });

  // Update field — each chip is one field+value pair, wrapped in the generic
  // field_key/field_value property pair the documented example uses for action_type_id 4.
  // User-reference fields (Add/Remove co-owners, Add watcher) carry an array of picked
  // users instead of a single text value — best-effort joined into one comma-separated
  // field_value, since the example only documents a single scalar value.
  const updateActionTypeId = findActionTypeId(triggerActions, 'update');
  updateActions.forEach((action) => {
    const fieldValue = Array.isArray(action.values)
      ? action.values.map((v) => v.userId).filter(Boolean).join(', ')
      : (action.value ?? '');
    thenActions.push({
      action_type_id: updateActionTypeId,
      properties: [
        { property_key: 'field_key', property_value: action.field, property_value_type: 'string' },
        { property_key: 'field_value', property_value: fieldValue, property_value_type: 'string' },
      ],
    });
  });

  // Link card — a single then_actions entry for the whole section; link_card is fanned
  // out one entry per value row, across all link action rows (the API's link_card shape
  // only carries a single input_value per entry).
  if (linkActions.length > 0) {
    const linkCard = [];
    linkActions.forEach((action) => {
      action.values.forEach((row) => {
        linkCard.push({
          relation_type: action.key,
          operator_key: action.operatorKey,
          input_value: row.value,
          remove_other: removeOtherLinksByType[action.key] ? 1 : 0,
          connector: 'AND',
        });
      });
    });
    thenActions.push({ action_type_id: findActionTypeId(triggerActions, 'link'), link_card: linkCard });
  }

  const moveActionTypeId = findActionTypeId(triggerActions, 'move');
  moveActions.forEach((action) => {
    thenActions.push({
      action_type_id: moveActionTypeId,
      properties: [
        { property_key: 'target_board_id', property_value: action.boardId, property_value_type: 'number' },
        { property_key: 'target_column_id', property_value: action.stageId, property_value_type: 'number' },
      ],
    });
  });

  // Convert subtasks to — best-effort, reuses the move destination shape since it's the
  // same board/column picker; unverified against a real example.
  const convertActionTypeId = findActionTypeId(triggerActions, 'convert');
  convertSubtaskActions.forEach((action) => {
    thenActions.push({
      action_type_id: convertActionTypeId,
      properties: [
        { property_key: 'target_board_id', property_value: action.boardId, property_value_type: 'number' },
        { property_key: 'target_column_id', property_value: action.stageId, property_value_type: 'number' },
      ],
    });
  });

  // Update related (parent/child) card fields: skipped. Those field chips have no value
  // input yet (the same gap the main "update" section had before this change), so there
  // is nothing valid to send until that input is added.

  // Copy values to parent — best-effort, unverified. No value per field: this action
  // copies whatever the child's current value is, so only the field reference is sent.
  const copyValuesActionTypeId = findActionTypeId(triggerActions, 'copy_values');
  copyValuesActions.filter((action) => action.fields.length > 0).forEach((action) => {
    thenActions.push({
      action_type_id: copyValuesActionTypeId,
      properties: action.fields.map((f) => ({ property_key: 'field_key', property_value: f.fieldLabel, property_value_type: 'string' })),
    });
  });

  // Notify / invoke: settings are already saved server-side via their own nested
  // modals — only the resulting id is referenced here.
  const notifyActionTypeId = findActionTypeId(triggerActions, 'notify');
  notifyActions.forEach((action) => {
    thenActions.push({ action_type_id: notifyActionTypeId, notification_id: action.notification_id });
  });

  const invokeActionTypeId = findActionTypeId(triggerActions, 'invoke');
  invokeActions.forEach((action) => {
    thenActions.push({ action_type_id: invokeActionTypeId, web_service_id: action.webServiceId });
  });

  return thenActions;
};

const buildSharedUsers = (sharePermissions) =>
  Object.entries(sharePermissions)
    .filter(([, perm]) => perm?.viewer || perm?.editor)
    .map(([userId, perm]) => ({ user_id: Number(userId) || userId, permission_type: perm.editor ? 'edit' : 'view' }));

export const buildCreateBusinessRulePayload = (formState, ctx) => {
  const triggerActions = ctx.triggerConfig?.actions ?? [];
  const nextCtx = { ...ctx, triggerActions };

  return {
    rule_name: formState.name,
    description: formState.description,
    trigger_type_id: formState.triggerRuleId,
    owner_user_id: formState.ownerUserId ?? ctx.loggedInUserId,
    tags: formState.tags.join(', '),
    disallow_rule_action_trigger: formState.disallowTriggerChain ? 1 : 0,
    is_enabled: 0,
    conditions: buildConditions(formState, nextCtx),
    then_actions: buildThenActions(formState, nextCtx),
    shared_users: buildSharedUsers(formState.sharePermissions),
  };
};

// Notify/invoke actions, and the "create subtask" create-action, only get a real backend
// id once their nested settings modal has been opened and saved — a row added but never
// configured has nothing to reference in then_actions, so saving must be blocked instead
// of silently dropping it.
export const getUnconfiguredActionLabels = (formState) => {
  const labels = [];
  formState.notifyActions.forEach((a) => { if (!a.notification_id) labels.push(a.label ?? 'Send notification'); });
  formState.invokeActions.forEach((a) => { if (!a.webServiceId) labels.push(a.label ?? 'Invoke web service'); });
  formState.createActions.forEach((a) => { if (a.key === 'subtask' && !a.createSubtaskId) labels.push(a.label ?? 'Create subtask'); });
  return labels;
};
