export const DEFAULT_PICKER_COLOR = '#6366f1';

export const PRIMARY_PRESET_COLORS = [
  '#6366f1',
  '#2563eb',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
];

export const SECONDARY_PRESET_COLORS = [
  '#1e293b',
  '#334155',
  '#64748b',
  '#94a3b8',
  '#e2e8f0',
  '#f8fafc',
  '#7c3aed',
  '#8b5cf6',
  '#a855f7',
  '#3b82f6',
  '#06b6d4',
  '#14b8a6',
  '#22c55e',
  '#84cc16',
  '#eab308',
  '#f97316',
  '#f43f5e',
  '#be123c',
];

export function normalizeHexColor(value) {
  if (!value) return DEFAULT_PICKER_COLOR;
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const threeHexMatch = /^#[0-9a-fA-F]{3}$/.test(withHash);
  const sixHexMatch = /^#[0-9a-fA-F]{6}$/.test(withHash);
  if (sixHexMatch) return withHash.toLowerCase();
  if (threeHexMatch) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return DEFAULT_PICKER_COLOR;
}
