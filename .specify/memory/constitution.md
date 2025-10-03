<!--
SYNC IMPACT REPORT
==================
Version Change: Template (unversioned) → 1.0.0
Change Type: MINOR (Initial constitution creation)
Rationale: First formal constitution with comprehensive principles for Node.js/TypeScript backend

Modified Principles:
- NEW: I. Clean Architecture
- NEW: II. SOLID Principles
- NEW: III. Test-Driven Development (TDD)
- NEW: IV. Code Quality Principles (DRY, YAGNI, KISS)
- NEW: V. Documentation Standards
- NEW: VI. Commit Standards

Added Sections:
- Core Principles (6 principles)
- Technology Standards
- Quality Gates
- Governance

Removed Sections: None (template placeholders)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section will auto-populate from this file
✅ spec-template.md - No changes required (technology-agnostic)
✅ tasks-template.md - Aligned with TDD and quality principles

Follow-up TODOs: None

Propagation Status: COMPLETE
-->

# Node.js Backend TypeScript Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

**Mandatory Requirements:**
- Architecture MUST follow Clean Architecture layers: Entities (Domain) → Use Cases (Application) → Interface Adapters → Frameworks & Drivers
- Dependencies MUST point inward only - inner layers MUST NOT know about outer layers
- Domain layer MUST be framework-independent and contain only business logic
- Use cases MUST depend on abstractions (interfaces), never concrete implementations
- Infrastructure concerns (databases, HTTP, external services) MUST be isolated in outer layers

**Enforcement:**
- Domain entities MUST NOT import framework libraries (Express, Fastify, TypeORM decorators, etc.)
- Controllers MUST NOT contain business logic - only HTTP request/response handling
- Services MUST NOT directly import database drivers or external service clients
- Repository interfaces MUST be defined in domain layer, implementations in infrastructure layer
- Use dependency injection for all cross-layer dependencies

**Rationale:**
Clean Architecture ensures business logic remains independent of frameworks, databases, and external agencies, enabling testability, maintainability, and long-term adaptability. This is essential for enterprise-grade Node.js backends that must evolve over time.

### II. SOLID Principles (NON-NEGOTIABLE)

**Single Responsibility Principle (SRP):**
- Each class MUST have exactly one reason to change
- Maximum 5-7 public methods per class
- Class names containing "And" or requiring multiple verbs to describe violate SRP
- Separate data access, business logic, and presentation into distinct classes

**Open/Closed Principle (OCP):**
- Extend behavior via interfaces and inheritance, not by modifying existing classes
- Avoid switch/case statements for type-based behavior - use polymorphism
- Use strategy pattern for varying behaviors
- New features MUST be added via new classes/modules

**Liskov Substitution Principle (LSP):**
- Subtypes MUST be substitutable for their base types without breaking correctness
- Subclasses MUST honor parent contracts (method signatures, return types, exceptions)
- Use TypeScript strict mode to enforce type compatibility
- Subclasses MUST NOT throw new exceptions not defined in parent

**Interface Segregation Principle (ISP):**
- Interfaces MUST be small and focused (3-5 methods maximum)
- Clients MUST NOT be forced to depend on methods they don't use
- Split large interfaces into multiple role-specific interfaces
- No "Not Implemented" errors - implement only needed interfaces

**Dependency Inversion Principle (DIP):**
- High-level modules MUST depend on abstractions, not concrete implementations
- Use constructor injection for required dependencies
- Never use `new` keyword for dependencies inside classes - inject them
- Domain layer MUST NOT import infrastructure layer modules

**Enforcement:**
- Code reviews MUST verify SOLID compliance
- Linting rules MUST enforce maximum class complexity
- Use dependency injection containers (tsyringe, inversify, awilix)
- Architectural tests MUST validate layer dependencies

**Rationale:**
SOLID principles are foundational to maintainable, scalable object-oriented design. They prevent common anti-patterns and ensure code remains flexible and testable as the system grows.

### III. Test-Driven Development (TDD) (NON-NEGOTIABLE)

**Red-Green-Refactor Cycle:**
- Tests MUST be written before implementation code
- Tests MUST fail initially for the right reason (missing functionality)
- Implementation MUST be the simplest code to make tests pass
- Refactoring MUST occur only after tests are green
- All refactoring MUST maintain passing tests

**Testing Pyramid:**
- 70% Unit Tests: Fast (<10ms), isolated, single-responsibility
- 20% Integration Tests: Component interactions, API endpoints, database
- 10% E2E Tests: Critical user workflows only

**Coverage Requirements:**
- Minimum 80% coverage for lines, branches, functions, and statements
- Critical business logic paths MUST have 100% coverage
- Coverage MUST NOT decrease in pull requests
- CI/CD MUST enforce coverage thresholds

**Test Quality Standards:**
- All tests MUST follow AAA pattern (Arrange-Act-Assert)
- Tests MUST be independent and runnable in any order
- Test names MUST clearly describe expected behavior
- Each test MUST verify exactly one behavior
- No tests testing mocks instead of real logic

**Performance Requirements:**
- Unit test suite MUST complete in < 30 seconds
- Individual unit tests MUST complete in < 10ms
- Integration tests MUST complete in < 5 minutes
- E2E tests MUST complete in < 10 minutes

**Framework:**
- Use Vitest for new TypeScript projects (preferred for speed and DX)
- Jest acceptable for legacy compatibility
- All async code MUST use async/await in tests
- TypeScript strict mode MUST be enabled in test files

**Enforcement:**
- CI/CD MUST run all tests before merge
- Failed tests MUST block deployment
- Coverage reports MUST be generated on every PR
- Flaky tests MUST be fixed or removed within 24 hours

**Rationale:**
TDD ensures code is designed for testability from the start, prevents regression, documents intended behavior through tests, and provides confidence for refactoring. It is essential for maintaining quality in rapidly evolving codebases.

### IV. Code Quality Principles (NON-NEGOTIABLE)

**DRY (Don't Repeat Yourself):**
- Extract code blocks repeated 2+ times into functions
- Use TypeScript generics for type-safe reusable code
- Centralize configuration, constants, and validation rules
- Create utility functions for common operations
- Exception: Don't DRY up coincidentally similar code representing different concepts

**YAGNI (You Aren't Gonna Need It):**
- Implement only what's required for current user stories
- Remove commented-out code - use version control instead
- Avoid "future-proofing" or "what if" scenarios
- Don't add configuration options until concrete need exists
- Refactor when second use case appears, not before

**KISS (Keep It Simple, Stupid):**
- Functions MUST be < 20 lines; split if longer
- Nesting depth MUST be ≤ 3 levels
- Choose simple data structures over complex ones
- Prefer explicit over implicit behavior
- If you can't explain code in one sentence, it's too complex

**Separation of Concerns:**
- Use layered architecture: Controller → Service → Repository
- Controllers: HTTP concerns only (request/response handling)
- Services: Business logic only (no HTTP or database specifics)
- Repositories: Data access only (no business logic)
- Each layer MUST only depend on the layer directly below it

**Principle of Least Surprise:**
- Follow TypeScript/Node.js conventions (camelCase for variables/functions, PascalCase for classes)
- Functions MUST do what their name suggests - nothing more, nothing less
- Methods named `get*` MUST NOT have side effects
- Boolean variables/functions MUST start with is/has/should/can
- Maintain consistent return types - no conditional type returns
- Use standard HTTP status codes correctly

**Enforcement:**
- ESLint MUST enforce code quality rules
- Code reviews MUST verify principle compliance
- Maximum cyclomatic complexity: 10 per function
- Maximum file length: 300 lines
- Prettier MUST enforce consistent formatting

**Rationale:**
These principles prevent technical debt, improve readability, and ensure code remains maintainable. They are battle-tested best practices from decades of software engineering experience.

### V. Documentation Standards (NON-NEGOTIABLE)

**TSDoc for Inline Documentation:**
- All exported functions, classes, and interfaces MUST have TSDoc comments
- All public methods MUST be documented
- Required tags: @param (each parameter), @returns (non-void), @throws (exceptions)
- Public APIs MUST include @example with working code
- Deprecated items MUST use @deprecated with migration path

**API Documentation (OpenAPI/Swagger):**
- All REST APIs MUST have OpenAPI 3.0+ specification
- Use tsoa for type-safe OpenAPI generation from TypeScript
- Every endpoint MUST document: summary, description, parameters, requestBody, all response codes
- API specs MUST be validated in CI/CD pipeline
- Maintain separate OpenAPI documents per major version

**Architecture Decision Records (ADRs):**
- MUST create ADR for: technology choices, architectural patterns, infrastructure decisions, security decisions
- Location: /docs/adr/ with format [NUMBER]-[kebab-case-title].md
- Required sections: Status, Context, Decision, Consequences
- ADRs MUST be reviewed before acceptance
- Status MUST be updated when decisions change

**README and Onboarding:**
- README.md MUST include: project description, prerequisites with versions, installation steps, configuration, usage examples
- Create /docs/ONBOARDING.md with: Day 1 checklist, development setup, first contribution guide
- Test installation instructions quarterly on clean environment
- All code examples in documentation MUST be tested and working

**Code Comments:**
- Comment the WHY, not the WHAT
- Required comments: complex algorithms (with complexity analysis), non-obvious solutions (with rationale), workarounds (with issue links and ETA), security/performance critical sections
- Forbidden comments: redundant (stating the obvious), commented-out code, outdated/incorrect information
- Use TODO:, FIXME:, WARNING:, NOTE: prefixes appropriately

**Documentation Maintenance:**
- Documentation MUST be updated with every API change
- CI/CD MUST validate: markdown linting, spell checking, link validation, code syntax
- Coverage target: ≥90% for public APIs
- Quarterly comprehensive documentation audit required

**Enforcement:**
- eslint-plugin-tsdoc MUST validate TSDoc syntax
- eslint-plugin-jsdoc MUST enforce documentation coverage
- Spectral MUST lint OpenAPI specifications
- CI/CD MUST fail on broken links, spelling errors, or invalid examples

**Rationale:**
Documentation is code's user interface. Poor documentation leads to misuse, bugs, and wasted developer time. Enforcing documentation standards ensures knowledge is captured, maintained, and accessible.

### VI. Conventional Commits (NON-NEGOTIABLE)

**Commit Message Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Required Elements:**
- Type MUST be: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Description MUST be imperative mood (e.g., "add feature" not "added" or "adds")
- Header MUST be ≤72 characters
- Body SHOULD explain WHY, not WHAT (code shows what)
- Footer MUST use BREAKING CHANGE: for breaking changes

**Examples:**
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
and reduce re-authentication frequency.

Refs: #234

fix(api): prevent race condition in order processing

The previous implementation had a race condition when processing
concurrent orders for the same inventory item.

Closes: #456

docs: update API authentication examples

BREAKING CHANGE: remove support for API key authentication
Migration guide available at docs/migration-v2.md
```

**Enforcement:**
- Git hooks MUST validate commit message format
- CI/CD MUST enforce conventional commit standard
- Use commitlint with @commitlint/config-conventional
- Squash commits before merge to maintain clean history

**Rationale:**
Conventional commits enable automated changelog generation, semantic versioning, and clear project history. They make it easier to understand changes, track features, and coordinate releases.

## Technology Standards

**Language and Runtime:**
- Node.js: ≥20.0.0 LTS
- TypeScript: ≥5.0.0
- Package Manager: npm ≥10.0.0 or pnpm ≥8.0.0

**TypeScript Configuration:**
- strict: true (non-negotiable)
- noImplicitAny: true
- strictNullChecks: true
- strictFunctionTypes: true
- noUnusedLocals: true
- noUnusedParameters: true
- esModuleInterop: true
- target: ES2022 or higher

**Forbidden Patterns:**
- Using `any` type (use `unknown` with type guards instead)
- Disabling TypeScript strict checks
- Using `@ts-ignore` or `@ts-expect-error` without detailed justification
- Direct database queries in controllers or use cases
- Business logic in controllers
- Framework decorators in domain entities

**Required Patterns:**
- Dependency injection for all cross-layer dependencies
- Repository pattern for data access
- Use case pattern for business operations
- Factory pattern for complex object creation
- Adapter pattern for external services

**Project Structure:**
```
src/
├── domain/                   # Enterprise business rules
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/        # Interfaces
│   ├── events/
│   └── errors/
├── application/             # Application business rules
│   ├── use-cases/
│   ├── ports/              # Interfaces for external dependencies
│   ├── dtos/
│   └── errors/
├── infrastructure/          # Frameworks & drivers
│   ├── web/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   ├── persistence/
│   │   └── repositories/   # Implementations
│   ├── external-services/
│   ├── config/
│   └── di/                 # Dependency injection
└── main.ts                 # Application entry point

tests/
├── unit/                   # 70% of tests
├── integration/            # 20% of tests
└── e2e/                    # 10% of tests
```

## Quality Gates

**Pre-Commit:**
- Code MUST pass linting (ESLint + Prettier)
- Code MUST pass type checking (tsc --noEmit)
- Affected tests MUST pass locally

**Pre-Merge (CI/CD):**
- All tests MUST pass (unit + integration + e2e)
- Code coverage MUST be ≥80% and not decrease
- No TypeScript errors
- No ESLint errors or warnings
- Documentation MUST be updated for API changes
- Commit messages MUST follow conventional commits

**Pre-Deployment:**
- All quality gates passed
- Security scan completed (npm audit, Snyk, or equivalent)
- Performance benchmarks met
- Database migrations tested
- Environment-specific configuration validated

**Code Review Requirements:**
- Minimum 1 approval required
- Reviewers MUST verify: SOLID compliance, Clean Architecture adherence, test quality, documentation completeness
- Security-sensitive changes require security team review
- Breaking changes require architecture team approval

## Governance

**Constitution Authority:**
This constitution supersedes all other development practices and guidelines. When conflicts arise, constitution principles take precedence.

**Amendment Process:**
1. Amendments MUST be proposed via pull request to this document
2. Major changes (principle additions/removals) require team consensus
3. Minor changes (clarifications, examples) require 1+ approval
4. All amendments MUST include rationale and impact analysis
5. Version MUST be incremented following semantic versioning:
   - MAJOR: Backward-incompatible changes (principle removals/redefinitions)
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording improvements, typo fixes

**Compliance Verification:**
- All pull requests MUST demonstrate constitutional compliance
- Quarterly architecture review to verify adherence
- Constitution violations MUST be justified in code comments and reviewed
- Persistent violations trigger architecture refactoring discussion

**Complexity Justification:**
When constitutional principles must be violated:
- Document in code comments with CONSTITUTION-OVERRIDE: prefix
- Include specific justification in pull request description
- Seek architecture team approval for violations
- Plan remediation path if temporary

**Version History:**
This is version 1.0.0 of the constitution, establishing baseline governance for the Node.js/TypeScript backend project following Clean Architecture, SOLID, TDD, and industry best practices.

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04
