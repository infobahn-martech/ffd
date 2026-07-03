---
paths:
  - "src/services/**"
  - "src/api/**"
  - "src/**/*.service.ts"
  - "src/**/*.service.js"
---

# API Rules

- Never modify endpoints, payloads, or response mapping unless explicitly requested.
- Reuse existing services — don't create a new service for something an existing one already covers.
- Always handle loading, error, and empty states; never leave a silent failure path.
- Keep API-layer code free of UI/business logic — that belongs in the Service/Store layer above it.
- Match existing error-handling and response-shape conventions already used in the codebase; don't introduce a new pattern for one endpoint.