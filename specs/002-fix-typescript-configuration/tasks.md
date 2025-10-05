# Tasks: Fix TypeScript Configuration Error

**Input**: Design documents from `/specs/002-fix-typescript-configuration/`
**Prerequisites**: plan.md, research.md, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript 5.5.4, Node.js ≥20.0.0, Fastify 5.6.1, Vitest 3.2+
   → Target: Single tsconfig.json modification
2. No data-model.md (configuration fix only)
3. No contracts/ (no API changes)
4. Task categories:
   → Setup: Verify current state
   → Implementation: Modify tsconfig.json
   → Verification: Type-check, build, test, IDE integration, new file detection
   → Documentation: Update CLAUDE.md
5. Task ordering: Preparation → Implementation → Verification (5 parallel) → Forward compatibility → Documentation
6. Total tasks: 12 tasks (T001-T011 + T007.5)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup & Preparation
- [X] T001 Document current error state by running `npm run type-check` and capturing the 7 TypeScript errors for verification

## Phase 3.2: Implementation
- [X] T002 Modify `tsconfig.json`: (1) Remove the line containing `"rootDir": "./src"` from compilerOptions object, (2) Create `tsconfig.build.json` extending base config with tests excluded, (3) Update package.json build script to use `tsconfig.build.json`

## Phase 3.3: Verification
- [X] T003 Run `npm run type-check` and verify zero TypeScript errors (should pass without TS6059 errors, exit code 0)
- [X] T004 Run `npm run build` and verify successful compilation (exit code 0)
- [X] T005 Verify build output excludes test files: (1) run `ls -R dist/` and confirm no tests/ directory, (2) run `find dist/ -name "*.test.*" -o -name "*.spec.*"` and verify zero matches
- [X] T006 Run `npm test` and verify all existing tests pass unchanged with coverage ≥80% maintained
- [X] T007 Verify IDE integration: Run `npx tsc --noEmit 2>&1 | grep -c "TS6059"` and verify it returns 0 (this is a targeted IDE-specific check that validates TS6059 errors are eliminated for IDE language servers - complements T003's broader npm script validation and addresses acceptance scenario AS-002 for IDE Problems panel)
- [X] T007.5 Verify new test files are auto-detected: (1) Create temporary test file `tests/unit/temp-verification.test.ts` with intentional type error: `const x: number = "bad";`, (2) Run `npm run type-check` and verify it detects the error in the new file, (3) Fix the error to `const x: number = 42;` and verify type-check passes, (4) Delete temporary file with `rm tests/unit/temp-verification.test.ts`, (5) Confirms FR-002 edge case: new test files automatically included without config changes

## Phase 3.4: Documentation & Commit
- [X] T008 Update `CLAUDE.md` via `.specify/scripts/bash/update-agent-context.sh claude`, then verify the update: (1) Check Active Technologies section includes TypeScript config fix, (2) Verify commands are accurate, (3) Confirm Recent Changes log entry exists for 002-fix-typescript-configuration
- [X] T009 Validate CI/CD configuration (if exists): Check if `.github/workflows` contains CI config with `npm run type-check` step, skip if no CI configured (FR-008 conditional validation)
- [X] T010 Verify atomic commit readiness: Run `git status` and confirm tsconfig.json, tsconfig.build.json, package.json, and CLAUDE.md are modified (spec docs may also be staged). Fail if unexpected files present.
- [X] T011 Create git commit following conventional commits format (see execution guidelines for complete commit message template)

## Dependencies
```
T001 (verify errors) → T002 (apply fix)
T002 → [T003, T004, T005, T006, T007] (parallel verification tasks)
T003, T004, T005, T006, T007 → T008 (update docs + verify)
T003, T004, T005, T006, T007 → T007.5 (optional: new test file auto-detection, can run in parallel with T008)
T008 → T009 (validate CI/CD if exists)
T009 → T010 (verify atomic commit readiness)
T010 → T011 (commit)
```

## Parallel Execution
**Parallel Tasks**:
- **Phase 1**: After T002 (config modification), tasks T003, T004, T005, T006, and T007 can execute in parallel as they are independent verification steps checking different aspects (type-check, build, dist/ structure, tests, IDE errors)
- **Phase 2**: After Phase 1 completes, T007.5 (new test file verification) and T008 (documentation update) can run in parallel as they are independent
- **Phase 3**: T009-T011 run sequentially for commit preparation and execution

## Validation Checklist
*GATE: Checked before marking feature complete*

- [X] `npm run type-check` exits with code 0
- [X] `npm run build` completes successfully
- [X] `dist/` contains only src/ files (no test artifacts)
- [X] `npm test` shows all tests passing
- [X] CLAUDE.md updated with configuration change
- [X] Git commit follows conventional commits format

## Notes
- This is a configuration-only fix with zero source code changes
- Tasks T003-T007 can run in parallel after T002 completes (see Dependencies and Parallel Execution sections)
- Verification tasks (T003-T007) confirm the fix works correctly
- Rollback procedure available in quickstart.md if issues arise
- Expected total time: ~5-10 minutes for complete execution

## Task Execution Guidelines

### T001: Document Current Error State
```bash
# Run type-check and capture errors
npm run type-check 2>&1 | tee /tmp/typescript-errors-before.txt

# Verify expected error count and type
ERROR_COUNT=$(grep -c "error TS" /tmp/typescript-errors-before.txt || echo 0)
TS6059_COUNT=$(grep -c "TS6059" /tmp/typescript-errors-before.txt || echo 0)

echo "===== ERROR VERIFICATION ====="
echo "Total TypeScript errors found: $ERROR_COUNT"
echo "TS6059 errors (rootDir related): $TS6059_COUNT"

if [ "$ERROR_COUNT" -ne 7 ]; then
  echo "⚠️  WARNING: Expected 7 errors, found $ERROR_COUNT"
  echo "This is acceptable if the codebase changed since spec was written."
  echo "Documenting actual error count: $ERROR_COUNT"
fi

if [ "$TS6059_COUNT" -eq 0 ]; then
  echo "❌ ERROR: No TS6059 errors found. The rootDir issue may already be fixed."
  echo "Review /tmp/typescript-errors-before.txt to confirm error types."
  exit 1
fi

echo "✓ Baseline error state documented: $ERROR_COUNT total errors, $TS6059_COUNT TS6059 errors"
```

### T002: Modify tsconfig.json
**File**: `tsconfig.json`

**IMPORTANT**: Use content-based matching, NOT line numbers (line numbers may drift if file is edited)

**Edit 1** - Remove rootDir line:
Find the line containing `"rootDir": "./src",` within the `compilerOptions` object and delete it entirely:
```diff
  "compilerOptions": {
    "outDir": "./dist",
-   "rootDir": "./src",
    "strict": true,
```

**Edit 2** - Update exclude array:
Find the `"exclude"` array (currently near end of file) and add "tests" to it:
```diff
- "exclude": ["node_modules", "dist"]
+ "exclude": ["node_modules", "dist", "tests"]
```

**Verification**: After edits, run `npm run type-check` immediately. If it fails, revert changes and investigate.

### T003: Verify Type-Checking
```bash
# Should pass with zero errors
npm run type-check
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE"

# ERROR HANDLING: If type-check fails after fix
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: type-check failed after config change!"
  echo "Rolling back changes..."
  git checkout tsconfig.json
  npm run type-check  # Verify rollback works
  exit 1
fi
```

### T004: Verify Build
```bash
# Should complete without errors
npm run build
echo $?  # Should print 0
```

### T005: Verify Build Output Structure
```bash
# Inspect dist/ directory structure
ls -R dist/

# Verify NO tests/ directory exists
! ls dist/tests 2>/dev/null && echo "✓ No tests/ directory in dist/"

# Verify NO individual test files compiled anywhere in dist/
TEST_FILES=$(find dist/ -name "*.test.*" -o -name "*.spec.*" | wc -l)
if [ $TEST_FILES -eq 0 ]; then
  echo "✓ No test files in dist/ (verified via find)"
else
  echo "ERROR: Found $TEST_FILES test files in dist/"
  find dist/ -name "*.test.*" -o -name "*.spec.*"
  exit 1
fi
```

### T006: Verify Tests Pass
```bash
# All existing tests should still pass with coverage maintained
npm test

# ERROR HANDLING: If tests fail after config change
if [ $? -ne 0 ]; then
  echo "ERROR: Tests failed after configuration change!"
  echo "This indicates a config issue, not a test issue."
  echo "Recommended action: Revert tsconfig.json and investigate"
  exit 1
fi

# Verify coverage hasn't decreased (Vitest shows coverage summary)
echo "✓ Verify coverage report shows ≥80% for lines, branches, functions, statements"
```

### T007: Verify No TS6059 Errors (IDE Integration Check)
```bash
# CLARIFICATION: This task is NOT redundant with T003 or T007.5
# - T003 verifies: npm run type-check passes (may use custom tsconfig or flags)
# - T007 verifies: npx tsc --noEmit with DEFAULT config has zero TS6059 errors on EXISTING test files
# - T007.5 verifies: NEW test files created after fix are auto-detected (forward compatibility)
#
# Purpose: Explicitly confirm IDE language servers (which use default tsc behavior)
# will not show TS6059 "file is not under rootDir" errors when opening test files.
# This addresses acceptance scenario AS-002 (spec.md:L75-76) which specifically
# requires "IDE Problems panel displays no TS6059 errors"

ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "TS6059")
if [ $ERRORS -eq 0 ]; then
  echo "✓ No TS6059 errors found (validates IDE integration)"
  echo "  IDE language servers will display no 'file is not under rootDir' errors"
else
  echo "❌ ERROR: Still found $ERRORS TS6059 errors after fix"
  npx tsc --noEmit 2>&1 | grep "TS6059"
  echo "This indicates the rootDir fix did not fully resolve IDE integration"
  exit 1
fi

echo ""
echo "📝 ACCEPTANCE SCENARIO AS-002 VALIDATION:"
echo "   Open VS Code → tests/unit/infrastructure/web/server.test.ts"
echo "   Expected: Problems panel shows no TS6059 errors"
echo "   Expected: TypeScript IntelliSense works correctly"
```

### T007.5: Verify New Test File Auto-Detection
```bash
# Verify FR-002 edge case: new test files added after fix are automatically type-checked
# without requiring tsconfig.json modifications

echo "Creating temporary test file to verify auto-detection..."
mkdir -p tests/unit
cat > tests/unit/temp-verification.test.ts <<'EOF'
// Temporary test file to verify new files are auto-detected
const x: number = "bad"; // Intentional type error
EOF

echo "Step 1: Verify type-check detects error in new file"
if npm run type-check 2>&1 | grep -q "temp-verification.test.ts"; then
  echo "✓ New test file detected by type-checker"
else
  echo "❌ ERROR: New test file NOT detected by type-checker"
  echo "This indicates tsconfig.json configuration is incomplete"
  rm tests/unit/temp-verification.test.ts
  exit 1
fi

echo "Step 2: Fix the error and verify type-check passes"
cat > tests/unit/temp-verification.test.ts <<'EOF'
// Temporary test file to verify new files are auto-detected
const x: number = 42; // Fixed type error
EOF

if npm run type-check; then
  echo "✓ Type-check passes after fixing new file"
else
  echo "❌ ERROR: Type-check failed unexpectedly"
  rm tests/unit/temp-verification.test.ts
  exit 1
fi

echo "Step 3: Cleanup"
rm tests/unit/temp-verification.test.ts
echo "✓ FR-002 edge case verified: new test files automatically included"
```

### T008: Update Documentation
```bash
# Update CLAUDE.md with configuration changes
.specify/scripts/bash/update-agent-context.sh claude

# VERIFY DOCUMENTATION COMPLETENESS (Constitution §232 requirement)
echo "📋 Documentation Verification Checklist:"
echo "1. Check CLAUDE.md Active Technologies section includes TypeScript config fix"
echo "2. Verify commands (type-check, build, test) are accurate"
echo "3. Confirm Recent Changes log has entry for 002-fix-typescript-configuration"
echo ""
echo "Review CLAUDE.md diff:"
git diff CLAUDE.md

# Non-interactive verification for CI/CD compatibility
if ! git diff CLAUDE.md | grep -q "002-fix-typescript-configuration"; then
  echo "❌ ERROR: CLAUDE.md does not contain entry for 002-fix-typescript-configuration"
  echo "Manual update required. Please review and update CLAUDE.md, then re-run this task."
  exit 1
fi

echo "✓ Documentation verification passed (automated check)"
echo "NOTE: For manual verification, review the diff above and ensure accuracy"
```

### T009: Validate CI/CD Configuration (Conditional)
```bash
# FR-008 requires CI/CD validation if configured
# This task checks if CI exists and validates it includes type-check

if [ -d ".github/workflows" ]; then
  echo "CI/CD detected: Validating configuration..."

  # Check if any workflow includes type-check
  if grep -r "npm run type-check" .github/workflows/; then
    echo "✓ CI/CD includes type-check validation (FR-008 satisfied)"
  else
    echo "⚠️  WARNING: CI/CD exists but doesn't include 'npm run type-check'"
    echo "   Consider adding type-check step to CI workflow for FR-008 compliance"
    echo "   Example: run: npm run type-check"
  fi
else
  echo "ℹ️  No CI/CD configuration found (.github/workflows not present)"
  echo "   FR-008 is conditional - skipped"
fi

# Note: This task always succeeds - it provides warnings but doesn't block
exit 0
```

### T010: Verify Atomic Commit Readiness
```bash
# IMPORTANT: Spec documentation files (spec.md, plan.md, tasks.md, research.md, quickstart.md)
# should be committed BEFORE running implementation tasks. If they are still staged, commit them
# separately first with: git commit -m "docs: complete specification for 002-fix-typescript-configuration"
#
# This task verifies ONLY implementation files (tsconfig.json, CLAUDE.md) are ready for the
# implementation commit. Spec docs are acceptable as already-committed or staged for separate commit.

# Verify ONLY tsconfig.json and CLAUDE.md are modified (atomic commit requirement)
echo "Checking git status for atomic commit..."
git status --short

MODIFIED_FILES=$(git status --short | wc -l)
EXPECTED_FILES=$(git status --short | grep -E "(tsconfig.json|CLAUDE.md)" | wc -l)

# Check if only implementation files are modified (tsconfig.json, CLAUDE.md)
# Note: spec.md, tasks.md, plan.md may be staged from planning phase - exclude from count
IMPL_FILES=$(git status --short | grep -E "(tsconfig.json|CLAUDE.md)" | wc -l)
OTHER_FILES=$(git status --short | grep -v -E "(tsconfig.json|CLAUDE.md|spec.md|tasks.md|plan.md|research.md|quickstart.md)" | wc -l)

if [ $OTHER_FILES -gt 0 ]; then
  echo "⚠️  ERROR: Unexpected files modified (not part of this feature)"
  echo "Expected: tsconfig.json, CLAUDE.md (+ optionally spec docs)"
  echo "Found additional files:"
  git status --short | grep -v -E "(tsconfig.json|CLAUDE.md|spec.md|tasks.md|plan.md|research.md|quickstart.md)"
  echo ""
  echo "ACTION REQUIRED: Manually stash unrelated changes with:"
  echo "  git add tsconfig.json CLAUDE.md"
  echo "  git stash push --keep-index -m 'Stashed unrelated changes'"
  exit 1
elif [ $IMPL_FILES -eq 2 ]; then
  echo "✓ Atomic commit ready: tsconfig.json and CLAUDE.md modified"
  echo "  (spec docs also staged but will be committed separately if needed)"
else
  echo "❌ ERROR: Missing required files (tsconfig.json or CLAUDE.md)"
  git status --short
  exit 1
fi
```

### T011: Create Commit
```bash
# Stage changes (should already be staged from T009)
git add tsconfig.json CLAUDE.md

# Commit with conventional commits format
git commit -m "fix(config): resolve TypeScript rootDir conflict with test files

TypeScript's restrictive rootDir setting prevented type-checking test files
located outside src/, blocking IDE features and quality gates required by
constitution §361 (pre-commit type-check gate) and §366 (CI/CD enforcement).

This fix removes the unnecessary rootDir constraint and excludes tests from
production build output, enabling the TDD workflow and constitutional quality
gates while maintaining clean dist/ artifacts.

Technical changes:
- Remove \"rootDir\": \"./src\" from tsconfig.json compilerOptions
- Add \"tests\" to exclude array to prevent test compilation to dist/

Resolves 7 TypeScript TS6059 errors.

Closes #3
Spec: specs/002-fix-typescript-configuration/spec.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Success Criteria

**All criteria must pass before marking feature complete:**

1. ✅ Zero TypeScript compilation errors (`npm run type-check`)
2. ✅ Clean production build (`npm run build`)
3. ✅ No test files in dist/ directory
4. ✅ All tests passing (`npm test`)
5. ✅ IDE shows no TypeScript errors in test files
6. ✅ New test files automatically detected without config changes (T007.5)
7. ✅ Documentation updated in CLAUDE.md
8. ✅ Commit created following conventional commits
9. ✅ All changes align with constitution (YAGNI, KISS principles)

## References
- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Documentation](./research.md)
- [Quickstart Guide](./quickstart.md)
- [Constitution v1.0.0](./.specify/memory/constitution.md)
