---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "src/**/__tests__/**"
---

# Testing Rules

- Every new feature or bug fix should come with a testing checklist even if you don't write automated tests for it (see root CLAUDE.md's "After Every Task" section).
- When automated tests exist for a file you're changing, update them alongside the change — don't leave stale assertions.
- Cover: happy path, empty state, error/loading state, and at least one edge case relevant to the change.
- Don't test implementation details (internal state, private functions) — test observable behavior (rendered output, emitted events, store state after an action).
- Reuse existing test utilities/mocks/factories rather than writing new ones inline.