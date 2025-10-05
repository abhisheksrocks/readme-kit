# Quickstart: TypeScript Configuration Fix

**Feature**: Fix TypeScript rootDir Configuration Error
**Branch**: 002-fix-typescript-configuration
**Estimated Time**: 5 minutes

## Prerequisites

- Node.js ≥20.0.0 installed
- Repository cloned and on branch `002-fix-typescript-configuration`
- Dependencies installed (`npm install`)

## Verification Procedure

### Step 1: Verify Current Error State

**Purpose**: Confirm the TypeScript configuration error exists before applying the fix.

```bash
# Run type-check to see current errors
npm run type-check
```

**Expected Output** (BEFORE FIX):
```
src/infrastructure/config/environment.ts:1:1 - error TS6059: File 'tests/unit/infrastructure/config/environment.test.ts' is not under 'rootDir' '/Users/.../src'. 'rootDir' is expected to contain all source files.

... (7 total errors)
```

### Step 2: Apply Configuration Fix

**File**: `tsconfig.json`

**Change 1 - Remove rootDir** (line 7):
```diff
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
-   "rootDir": "./src",
    "strict": true,
```

**Change 2 - Add tests to exclude** (line 23):
```diff
  "include": ["src/**/*", "tests/**/*"],
- "exclude": ["node_modules", "dist"]
+ "exclude": ["node_modules", "dist", "tests"]
```

**Complete Updated tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Step 3: Verify Type-Checking Passes

```bash
# Type-check should now pass without errors
npm run type-check
```

**Expected Output** (AFTER FIX):
```
✓ No TypeScript errors found
```

### Step 4: Verify Build Output Excludes Tests

```bash
# Build the project
npm run build

# Inspect dist/ structure
ls -R dist/
```

**Expected Output**:
```
dist/:
application  domain  infrastructure  main.d.ts  main.js  main.js.map  shared

dist/infrastructure:
config  web

... (only src/ files, NO test files)
```

**Verification**: Confirm `dist/` does NOT contain `tests/` directory or any `.test.ts` files.

### Step 5: Verify All Tests Pass

```bash
# Run the test suite
npm test
```

**Expected Output**:
```
✓ tests/unit/... (all tests pass)
✓ tests/integration/... (all tests pass)

Test Files  7 passed (7)
Tests  XX passed (XX)
```

### Step 6: Verify IDE Integration

**Manual Check**:
1. Open a test file in your IDE (e.g., `tests/unit/infrastructure/config/environment.test.ts`)
2. Verify no TypeScript errors are shown
3. Verify intellisense/autocomplete works correctly
4. Verify "Go to Definition" works for imports

**Expected Result**: Full TypeScript support in both src/ and tests/ files with no errors.

## Success Criteria Checklist

- [ ] `npm run type-check` exits with code 0 (no errors)
- [ ] `npm run build` completes successfully
- [ ] `dist/` contains only src/ files (no test artifacts)
- [ ] `npm test` passes all tests
- [ ] IDE shows no TypeScript errors in test files
- [ ] IDE intellisense works in both src/ and tests/

## Rollback Procedure

If the configuration change causes unexpected issues:

### Option 1: Git Revert (Recommended)

```bash
# Revert the commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1
```

### Option 2: Manual Restoration

**Restore tsconfig.json** to original state:
```json
{
  "compilerOptions": {
    // ... other options
    "rootDir": "./src",  // Add back
    // ... other options
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]  // Remove "tests"
}
```

Then run:
```bash
npm run type-check  # Will show original 7 errors
npm run build       # Will build successfully (but tests were being compiled)
```

## Troubleshooting

### Issue: Type-check still shows errors after fix

**Solution**:
1. Clear TypeScript cache: `rm -rf node_modules/.cache`
2. Restart IDE/editor
3. Run `npm run type-check` again

### Issue: Build output contains test files

**Solution**:
1. Verify "tests" is in exclude array: `"exclude": ["node_modules", "dist", "tests"]`
2. Clear dist/: `rm -rf dist && npm run build`

### Issue: Tests fail after configuration change

**Solution**:
1. Tests should not be affected by tsconfig changes
2. Check if test imports are correct
3. Verify Vitest configuration is unchanged
4. Run: `npm run test:watch` to debug

## Next Steps

After successful verification:

1. **Update CLAUDE.md** with configuration change details
2. **Commit changes** following conventional commits:
   ```bash
   git add tsconfig.json
   git commit -m "fix(config): resolve TypeScript rootDir conflict with test files

   Remove restrictive rootDir setting and exclude tests from build output.
   This allows type-checking across all files while maintaining clean
   production builds.

   Fixes: #3"
   ```
3. **Push to remote** and create PR if required
4. **Verify CI pipeline** passes all checks

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Documentation](./research.md)
