/**
 * Board-instance-level access check, backed by the same `workspaces` data
 * (GET /kanban_workspace/list_all_workspace) already used to render the
 * sidebar/Workspaces board links — keeps navigation and route guarding in sync.
 */
export function getAccessibleBoardIds(workspaces) {
  return new Set(
    (workspaces ?? [])
      .flatMap((w) => w.boards ?? [])
      .map((b) => String(b.board_id))
  );
}

export function canAccessKanbanBoard(boardId, workspaces) {
  if (boardId == null || boardId === '') return false;
  return getAccessibleBoardIds(workspaces).has(String(boardId));
}
