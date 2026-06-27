## Claude Working Rules

### Development Principles

* Always analyze the requirement before writing code.
* Explain the implementation plan before making changes.
* Modify only the files required for the requested feature.
* Preserve existing architecture and coding patterns.
* Reuse existing components, hooks, utilities, and SCSS whenever possible.
* Do not introduce duplicate logic or duplicate components.
* Avoid unnecessary refactoring unless explicitly requested.

### API Rules

* Do not modify API endpoints or payload structures unless requested.
* Reuse existing service functions where possible.
* Follow the existing Gateway → Service → Zustand Store → Component flow.

### UI Rules

* Match the existing UI and design language.
* Prefer existing reusable components over creating new ones.
* Keep responsive behavior unchanged unless requested.

### Code Quality

* Keep changes minimal and focused.
* Avoid unrelated file modifications.
* Follow existing naming conventions.
* Do not leave commented-out code.

### Before Finishing

Always provide:

1. Files changed.
2. Summary of changes.
3. Testing steps.
4. Potential edge cases.
5. Any assumptions made.
