---
paths:
  - "src/stores/**"
  - "src/**/*.store.ts"
  - "src/**/*.store.js"
---

# Zustand Store Rules

- Reuse existing stores — check whether relevant state already lives somewhere before creating a new store.
- No duplicate state across stores.
- Keep stores clean and focused; business logic that manipulates store state belongs in the store, not scattered across components.
- Avoid unnecessary global state — if it's only used by one component/subtree, prefer local state.
- Don't rename or restructure existing store shape unless the task requires it — components elsewhere depend on it.