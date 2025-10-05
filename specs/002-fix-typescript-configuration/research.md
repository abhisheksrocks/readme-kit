# Research: TypeScript Configuration Fix

**Date**: 2025-10-06
**Feature**: Fix TypeScript rootDir Configuration Error

## Problem Statement

The current `tsconfig.json` has a conflicting configuration where `rootDir: "./src"` restricts compilation to the src/ directory, but `include: ["src/**/*", "tests/**/*"]` attempts to include test files from tests/. This causes TypeScript to reject all test files with error TS6059:

```
File 'tests/.../file.test.ts' is not under 'rootDir' 'src/'.
'rootDir' is expected to contain all source files.
```

## Research Questions

1. What is the TypeScript best practice for handling test files outside src/?
2. How should test files be excluded from build output while preserving type-checking?
3. What is the recommended approach for TypeScript 5.5+ projects in 2024-2025?

## Decision: Remove rootDir and Exclude Tests from Build

### Solution

**Configuration Changes**:
```json
{
  "compilerOptions": {
    // Remove this line:
    // "rootDir": "./src",

    "outDir": "./dist",
    // ... other options unchanged
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "tests"]  // Add "tests" here
}
```

### Rationale

1. **TypeScript Automatic Inference**: When `rootDir` is not explicitly set, TypeScript automatically infers it as the common root directory of all included files. This allows type-checking across both src/ and tests/ without conflicts.

2. **Exclude for Build Output**: Adding "tests" to the `exclude` array prevents test files from being compiled to dist/ during `tsc` build, while still allowing type-checking with `tsc --noEmit`.

3. **Industry Standard (2024-2025)**: This is the recommended approach from TypeScript documentation and community best practices for separating test files from production builds.

4. **Vitest Compatibility**: Vitest uses `tsx` runtime to execute TypeScript tests directly - it doesn't need compiled test files. The exclude setting doesn't affect Vitest operation.

5. **Minimal Configuration**: Follows YAGNI principle - removes unnecessary constraint (rootDir) rather than adding complexity.

## Alternatives Considered

### Alternative 1: Dual Configuration (tsconfig.build.json)

**Approach**:
- Keep tsconfig.json for type-checking (includes tests)
- Create tsconfig.build.json that excludes tests for compilation
- Update build script: `tsc --project tsconfig.build.json`

**Rejected Because**:
- Adds unnecessary complexity for a small project
- Requires maintaining two configuration files
- Violates YAGNI (not needed for current scale)
- More complex than the simple exclude approach

### Alternative 2: Change rootDir to "."

**Approach**:
```json
{
  "compilerOptions": {
    "rootDir": ".",  // Changed from "./src"
    "outDir": "./dist"
  }
}
```

**Rejected Because**:
- Creates problematic dist/ structure: `dist/src/main.js` instead of `dist/main.js`
- Breaks `npm start` script which expects `dist/main.js`
- Requires updating multiple npm scripts (start, potentially others)
- More invasive change than necessary

### Alternative 3: TypeScript Project References

**Approach**:
- Use composite: true with separate configurations
- Create project references between src and tests

**Rejected Because**:
- Significant overcomplexity for a small single-project structure
- Designed for monorepos and large multi-project setups
- Steep learning curve for minimal benefit
- Violates KISS principle

### Alternative 4: Remove Tests from Include

**Approach**:
```json
{
  "include": ["src/**/*"],  // Remove tests
  "exclude": ["node_modules", "dist"]
}
```

**Rejected Because**:
- Breaks type-checking for test files
- IDE would no longer provide TypeScript intellisense in tests
- `tsc --noEmit` wouldn't validate test file types
- Defeats the purpose of TypeScript in tests

## Implementation Notes

### Step 1: Modify tsconfig.json

**Before**:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",  // Line 7 - REMOVE THIS
    "strict": true,
    // ... other options
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]  // ADD "tests" here
}
```

**After**:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    // rootDir removed
    "strict": true,
    // ... other options
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "tests"]  // "tests" added
}
```

### Step 2: Verification Commands

```bash
# 1. Type-check all files (should pass without errors)
npm run type-check

# 2. Build production output (should exclude tests)
npm run build

# 3. Verify dist/ structure (should contain only src/ files)
ls -R dist/

# 4. Run tests (should pass unchanged)
npm test
```

### Expected Outcomes

✅ **Type Checking**: `tsc --noEmit` validates both src/ and tests/ files
✅ **Build Output**: `tsc` compiles only src/ files to dist/ (tests excluded)
✅ **IDE Support**: Full TypeScript intellisense in both src/ and tests/
✅ **Test Execution**: Vitest continues to work unchanged (uses tsx, not compiled output)
✅ **Clean Structure**: dist/ contains only production code, no test artifacts

## References

- [TypeScript Handbook: tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [TypeScript Compiler Options: rootDir](https://www.typescriptlang.org/tsconfig#rootDir)
- [TypeScript Compiler Options: exclude](https://www.typescriptlang.org/tsconfig#exclude)
- [Vitest Configuration](https://vitest.dev/config/)

## Constitutional Compliance

This solution aligns with:
- **YAGNI** (Constitution §155-161): Removes unnecessary rootDir constraint
- **KISS** (Constitution §162-168): Simplest possible fix
- **Technology Standards** (Constitution §293-309): Maintains strict TypeScript configuration
- **Quality Gates** (Constitution §357-384): Enables pre-commit type checking

**Status**: ✅ No constitutional violations
