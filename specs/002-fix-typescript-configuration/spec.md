# Feature Specification: Fix TypeScript Configuration Error

**Feature Branch**: `002-fix-typescript-configuration`
**Created**: 2025-10-06
**Status**: Draft
**Input**: User description: "Fix TypeScript configuration error where rootDir conflicts with test files outside src directory"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## Clarifications

### Session 2025-10-06
- Q: Scope of configuration files - Which configuration files should be modified to fix this issue? → A: Only tsconfig.json (best practice for small projects: remove rootDir setting)
- Q: Verification enforcement - Should local type-checking be enforced or just recommended? → A: Required in docs but not enforced (developers should check, CI catches issues)
- Q: Build output handling - Should test files be explicitly excluded from production build output? → A: Yes, tests must be explicitly excluded to prevent compilation to dist/ after rootDir removal
- Q: Performance impact tolerance - What is the acceptable compilation time impact from this configuration change? → A: No performance constraint
- Q: Rollback strategy - If the configuration change causes unexpected issues, what recovery approach should be used? → A: Revert entire commit (rollback all changes)

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a developer working on the readme-kit project, I need the build system to successfully type-check both source code and test files so that I can develop and test features without type-checking errors blocking my workflow.

Currently, developers encounter 7 type-checking errors when running `npm run type-check` because the build configuration rejects test files located outside the source directory. This prevents developers from running type checks, using IDE features effectively, and maintaining code quality.

### Acceptance Scenarios
1. **Given** a clean project checkout, **When** a developer runs `npm run type-check`, **Then** all source files and test files type-check successfully with zero TypeScript errors and exit code 0
2. **Given** a developer is working in VS Code or similar IDE, **When** they open any test file from tests/ directory, **Then** the IDE Problems panel displays no TS6059 errors and TypeScript IntelliSense works correctly
3. **Given** the project has tests located in tests/ directory (outside src/), **When** the build system runs `npm run type-check`, **Then** it type-checks both source and test files without TS6059 "file is not under rootDir" errors
4. **Given** a successful build via `npm run build`, **When** inspecting the dist/ directory, **Then** it contains only compiled source files (dist/infrastructure/, dist/shared/, dist/main.js) with no tests/ subdirectory or .test.* files present

### Edge Cases
- What happens when new test files are added to tests/ directory? The system must type-check them without requiring tsconfig.json modifications (type-checking ≠ compilation to dist/).
- What happens when the project is cloned fresh and `npm run type-check` is run immediately? It must pass with zero errors without manual intervention.
- How does the system handle the separation of build artifacts from test files? Test files must be explicitly excluded from dist/ build output while remaining type-checked.
- What happens if the configuration change causes unexpected issues? The entire commit (tsconfig.json + CLAUDE.md changes) must be revertable as a single atomic unit to restore previous working state.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Build system MUST type-check all TypeScript files (both source and test files) without rootDir-related configuration errors (TS6059), validated via acceptance scenario AS-001
- **FR-002**: Build system MUST accept test files located outside the main source directory (tests/), and new test files added to tests/ directory after the initial configuration fix must be included in type-checking when `npm run type-check` is executed, without requiring tsconfig.json modifications (validated by creating temporary test file and verifying type-check detection)
- **FR-003**: Build system MUST maintain physical separation between source code (src/) and test code (tests/) while enabling type-checking of both
- **FR-004**: Build system MUST generate build output in dist/ directory that mirrors src/ structure (dist/infrastructure/, dist/shared/, dist/main.js) and excludes all test files from production build artifacts
- **FR-005**: Development tools (IDEs, language servers) MUST display no TypeScript configuration errors (specifically TS6059 "file is not under rootDir") for test files located in tests/ directory
- **FR-006**: All existing tests MUST continue to pass after configuration changes
- **FR-007**: Build configuration changes MUST be limited to tsconfig.json only (no modifications to vitest.config.ts, package.json, or other configuration files)
- **FR-008**: CI/CD pipeline (if configured) MUST validate successful type-checking across all source and test files

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
