# Implementation Plan: Fix TypeScript Configuration Error

**Branch**: `002-fix-typescript-configuration` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-typescript-configuration/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Fix TypeScript compilation errors caused by `rootDir: "./src"` conflicting with test files located in `tests/` directory. The current configuration prevents type-checking of test files, causing 7 compilation errors. The solution removes the restrictive `rootDir` setting and explicitly excludes test files from production build output, allowing type-checking across all files while maintaining clean build artifacts.

## Technical Context

**Language/Version**: TypeScript 5.5.4, Node.js ≥20.0.0 LTS
**Primary Dependencies**: Fastify 5.6.1 (web framework), Vitest 3.2+ (testing), tsx 4.19.2 (dev runtime)
**Storage**: N/A (configuration fix only)
**Testing**: Vitest with 80% coverage thresholds
**Target Platform**: Node.js server (Linux/macOS)
**Project Type**: Single backend project
**Performance Goals**: No performance impact expected (configuration-only change)
**Constraints**:
- Modify only tsconfig.json (no other config files)
- Tests must be excluded from dist/ build output
- No performance degradation acceptable (no constraint specified)
- CI/CD pipeline must validate type-checking
**Scale/Scope**: Small project (~10 source files, 7 test files)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Applicable Constitutional Principles:**

### Technology Standards (Constitution §293-309)
- ✅ **TypeScript Configuration**: strict: true ✓, noImplicitAny: true ✓, strictNullChecks: true ✓
- ✅ **Project maintains all required compiler options**
- ✅ **Fix aligns with TypeScript best practices for test file handling**

### Project Structure (Constitution §325-355)
- ✅ **Maintains separation**: `src/` for source, `tests/` for tests
- ✅ **Fix supports constitutional structure** without modifications
- ✅ **Tests correctly excluded from production build**

### Quality Gates (Constitution §357-384)
- ✅ **Pre-commit**: type-check enabled via `tsc --noEmit`
- ✅ **CI/CD**: All tests must pass, type-checking enforced
- ✅ **Fix enables proper quality gate execution**

### Code Quality - YAGNI (Constitution §155-161)
- ✅ **Removes unnecessary `rootDir` constraint**
- ✅ **Implements minimal configuration change**
- ✅ **No premature optimization or over-engineering**

### Test-Driven Development (Constitution §98-144)
- ✅ **Fix enables TDD workflow** (type-checking tests before implementation)
- ✅ **Maintains 80% coverage requirement**
- ✅ **No impact on test execution or coverage**

**Status**: ✅ **PASS** - No constitutional violations. This configuration fix supports and enables constitutional compliance.

## Project Structure

### Documentation (this feature)
```
specs/002-fix-typescript-configuration/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── domain/              # Enterprise business rules
├── application/         # Application business rules
├── infrastructure/      # Frameworks & drivers
│   ├── config/
│   ├── web/
│   │   ├── controllers/
│   │   ├── plugins/
│   │   ├── routes/
│   │   └── server.ts
│   └── ...
├── shared/              # Shared utilities
│   ├── constants/
│   ├── types/
│   └── ...
└── main.ts

tests/
├── unit/                # Unit tests (70%)
│   ├── infrastructure/
│   └── shared/
├── integration/         # Integration tests (20%)
│   └── infrastructure/
└── e2e/                 # E2E tests (10%)

tsconfig.json            # PRIMARY CHANGE TARGET
vitest.config.ts
package.json
```

**Structure Decision**: Single backend project following Clean Architecture with domain/application/infrastructure layers. This is a configuration fix affecting only `tsconfig.json` - no source code structure changes required.

## Phase 0: Outline & Research

**Research completed via parallel subagents. Key findings:**

### TypeScript Configuration Best Practice

**Decision**: Remove `rootDir: "./src"` from tsconfig.json and add `"tests"` to the `exclude` array.

**Rationale**:
- TypeScript automatically infers rootDir from included files when not explicitly set
- Explicit rootDir causes conflicts when include patterns span multiple directories
- Adding "tests" to exclude prevents test compilation to dist/ while preserving type-checking
- This is the recommended 2024-2025 approach for TypeScript 5.5+ projects
- Fully compatible with Vitest (uses tsx runtime, not compiled output)

**Alternatives Considered**:
1. **Dual config (tsconfig.build.json)**: Adds complexity, unnecessary for small project
2. **Change rootDir to "."**: Would require updating npm scripts (start script expects dist/main.js not dist/src/main.js)
3. **Use project references**: Overcomplicated for simple single-project structure
4. **Keep rootDir, remove tests from include**: Breaks type-checking for test files

**Implementation Notes**:
- Remove line 7 from tsconfig.json: `"rootDir": "./src"`
- Add "tests" to exclude array: `"exclude": ["node_modules", "dist", "tests"]`
- Verify with: `npm run type-check` (should pass), `npm run build` (dist/ should contain only src/)

### CI/CD Validation Requirements

**Required CI Pipeline Checks**:
1. `npm run type-check` - Validates TypeScript across all files (primary gate for FR-010)
2. `npm run build` - Verifies production build excludes tests (FR-006)
3. `npm test` - Ensures existing tests pass (FR-008)
4. `npm run lint` - Code quality validation

**Success Criteria**:
- Zero TypeScript errors
- Build output contains only source files (no test artifacts)
- 100% existing test pass rate
- All commands exit code 0

**Output**: ✅ research.md with all technical decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### 1. Data Model Analysis

**Determination**: ❌ No data-model.md needed

**Rationale**: This is a pure build configuration fix modifying only tsconfig.json. No data entities, business objects, domain models, or database changes are involved.

### 2. API Contracts Analysis

**Determination**: ❌ No contracts/ directory needed

**Rationale**: No HTTP endpoints, API routes, service interfaces, or external integrations are created or modified. Changes are limited to TypeScript compiler configuration.

### 3. Quickstart Guide

**Purpose**: Provide step-by-step verification procedure for the configuration fix.

**Output**: quickstart.md with:
- Pre-fix state verification (demonstrate errors)
- Configuration changes (exact edits)
- Post-fix validation (verify success)
- Rollback procedure

### 4. Agent Context Update

**Action**: Run `.specify/scripts/bash/update-agent-context.sh claude` to update CLAUDE.md with:
- TypeScript configuration fix details
- Updated build/test commands
- Recent changes log entry

**Output**: ✅ quickstart.md, ✅ CLAUDE.md updated

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `.specify/templates/tasks-template.md` as base
2. Generate configuration change tasks (edit tsconfig.json)
3. Generate verification tasks (type-check, build, test)
4. Generate documentation tasks (update relevant docs)
5. Generate CI validation tasks

**Ordering Strategy**:
1. **Preparation**: Backup current config, verify current error state
2. **Implementation**: Modify tsconfig.json (atomic change)
3. **Verification**: Run type-check → build → test pipeline
4. **Validation**: Verify dist/ structure, IDE error resolution
5. **Documentation**: Update CLAUDE.md, commit changes

**Estimated Output**: 8-12 numbered, ordered tasks in tasks.md

**Implementation Details**: See `tasks.md` for complete task breakdown, execution guidelines, and dependency graph. Tasks follow the ordering strategy above and include comprehensive error handling and verification procedures.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

**Status**: ✅ No violations to track

This configuration fix has zero constitutional violations and requires no complexity justification.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no deviations)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
