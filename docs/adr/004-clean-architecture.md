# ADR 004: Clean Architecture for Single Endpoint

**Status**: Accepted

**Date**: 2025-10-05

**Context**:
The constitution mandates Clean Architecture for all projects, requiring clear separation between business rules and infrastructure. This creates tension when implementing a single `/status` health check endpoint:
- Constitutional requirement: "Follow Clean Architecture principles with clear layer separation"
- Current scope: Single endpoint with minimal business logic
- Future scope: Service will expand with additional endpoints and business logic
- Risk: Over-engineering for current requirements vs. under-architecting for future growth

We needed to decide how to apply Clean Architecture principles to a minimal health check endpoint while maintaining constitutional compliance and future scalability.

**Decision**:
We adopted **Clean Architecture with Fastify-adapted layers** even for the single `/status` endpoint.

**Architecture Layers**:
1. **Domain Layer** (`src/domain/`):
   - Value objects: `HealthStatus` (immutable "ok" status)
   - Domain errors: `HealthCheckError`
   - Business rules isolated from framework

2. **Application Layer** (`src/application/`):
   - Use cases: `GetHealthStatus`
   - DTOs: `HealthStatusDTO`
   - Framework-agnostic business logic

3. **Infrastructure Layer** (`src/infrastructure/`):
   - Web: Fastify server, routes, controllers
   - Config: Environment and server configuration
   - Schemas: JSON Schema validation
   - All framework-specific code isolated here

4. **Entry Point** (`src/main.ts`):
   - Application bootstrapping
   - Dependency injection wiring

**Rationale**:

**Constitutional Compliance**:
- Satisfies Clean Architecture mandate with clear layer boundaries
- Implements dependency inversion (domain depends on abstractions)
- Ensures framework independence of business logic
- Supports controller separation (HTTP concerns vs. business logic)

**Future-Proofing**:
- Scalable foundation for future endpoints and features
- Established patterns for adding database repositories, external services
- Clear location for new business logic (domain/application layers)
- Infrastructure changes (switching frameworks) don't affect core logic

**Testability**:
- Domain and application layers unit-testable without Fastify
- Infrastructure layer integration tests use Fastify `.inject()` method
- Clear testing pyramid: Unit (70%), Integration (20%), E2E (10%)
- Mock boundaries align with architectural layers

**Developer Experience**:
- New developers understand separation of concerns immediately
- Consistent structure across all features (current and future)
- Clear ownership: domain experts focus on domain, framework experts on infrastructure
- Refactoring isolated to specific layers

**Alternatives Considered**:
1. **Single-file implementation**:
   - Pros: Simplest for one endpoint, fastest initial development
   - Cons: Violates constitutional requirements, no scalability, coupling issues
   - Rejected: Constitutional non-compliance

2. **MVC structure**:
   - Pros: Familiar pattern, simpler than Clean Architecture
   - Cons: Framework coupling, doesn't enforce Clean Architecture boundaries
   - Rejected: Insufficient separation of concerns for constitutional compliance

3. **Feature-based structure**:
   - Pros: Good for small applications, feature cohesion
   - Cons: Lacks clear architectural boundaries, doesn't enforce layer separation
   - Rejected: Insufficient architectural clarity

**Consequences**:

**Positive**:
- Constitutional compliance with Clean Architecture mandate
- Framework independence: business logic isolated from Fastify
- Future-proof: easy to add endpoints, databases, external services
- Testable: clear boundaries for unit, integration, E2E tests
- Maintainable: separation of concerns reduces coupling
- Scalable: established patterns for feature growth
- Educational: demonstrates Clean Architecture even in simple cases

**Negative**:
- Initial complexity: more files/folders for single endpoint
- Learning curve: developers must understand layer responsibilities
- Boilerplate: interfaces and DTOs for minimal data
- Over-engineering perception: complex structure for simple health check

**Neutral**:
- File count increase: ~10-15 files vs. 1-2 for simple implementation
- Development time: slightly slower initial setup, faster feature additions
- Architectural consistency: same patterns across all features regardless of complexity

**Addressing "Over-Engineering" Concerns**:

While the architecture may appear complex for a single endpoint, this is justified by:

1. **Constitutional Mandate**: Clean Architecture is non-negotiable per project constitution
2. **Future Certainty**: Health check is foundation; additional endpoints guaranteed
3. **Learning Investment**: Team learns Clean Architecture patterns on simple feature
4. **Consistency**: Same architecture for all features reduces cognitive load
5. **Refactoring Avoidance**: Building right structure upfront prevents future rewrites

**Implementation Structure**:
```
src/
├── domain/
│   ├── value-objects/
│   │   └── health-status.value-object.ts  # Business rule: status is "ok"
│   └── errors/
│       └── health-check.error.ts
├── application/
│   ├── use-cases/
│   │   └── get-health-status/
│   │       ├── get-health-status.use-case.ts
│   │       └── get-health-status.dto.ts
│   └── dtos/
│       └── health-status.dto.ts
├── infrastructure/
│   ├── web/
│   │   ├── server.ts                      # Fastify setup
│   │   ├── routes/
│   │   │   └── health.routes.ts
│   │   ├── controllers/
│   │   │   └── health.controller.ts       # HTTP handling
│   │   ├── schemas/
│   │   │   └── health.schema.ts           # JSON Schema
│   │   └── middlewares/
│   │       └── error-handler.middleware.ts
│   └── config/
│       ├── env.config.ts
│       └── server.config.ts
└── main.ts                                # Entry point
```

**Dependency Flow**:
```
main.ts → Infrastructure → Application → Domain
         (Fastify)        (Use Cases)    (Business Rules)
```

**Layer Responsibilities**:

1. **Domain Layer** (Business Rules):
   - What: Core business concepts (HealthStatus value object)
   - Why: Encapsulates business logic independent of delivery mechanism
   - Dependencies: None (pure business logic)

2. **Application Layer** (Use Cases):
   - What: Application-specific business logic (GetHealthStatus use case)
   - Why: Orchestrates domain objects for specific user scenarios
   - Dependencies: Domain layer only

3. **Infrastructure Layer** (External Concerns):
   - What: Fastify routes, controllers, schemas
   - Why: Handles HTTP protocol, serialization, framework details
   - Dependencies: Application and domain layers

**Testing Strategy Alignment**:
- Unit tests: Domain and application layers (70%)
- Integration tests: Infrastructure layer with Fastify inject (20%)
- E2E tests: Full stack via HTTP (10%)

**Migration Path for Future Features**:
When adding new endpoints:
1. Add domain value objects/entities to `domain/`
2. Create use cases in `application/`
3. Add routes and controllers to `infrastructure/web/`
4. No architectural refactoring needed

**References**:
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Constitution: `.specify/memory/constitution.md` (Clean Architecture requirements)
- Research findings: `/Users/abhishek/Documents/Personal/readme-kit/specs/001-create-basic-server/research.md`
- Implementation plan: `/Users/abhishek/Documents/Personal/readme-kit/specs/001-create-basic-server/plan.md`
