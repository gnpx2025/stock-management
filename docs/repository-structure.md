# Repository structure

```text
stock-management/
├── frontend/                 # Nx Angular workspace (Shell + shared libs)
│   ├── apps/shell/           # Native Federation host (layout, login, features)
│   └── libs/                 # contracts, shared, core, ui, i18n
├── backend/                  # .NET 10 Clean Architecture solution
│   ├── src/ERP.*             # Api, Application, Domain, Infrastructure
│   └── tests/ERP.*           # Unit, Integration, Architecture
├── docker/                   # Optional Docker notes/assets
├── docker-compose.yml        # PostgreSQL 16 (+ optional full stack)
├── docs/                     # Developer documentation
├── specs/                    # Spec Kit features (001–…)
├── .specify/                 # Spec Kit tooling + constitution
├── .cursor/skills/           # Spec Kit + ERP architecture skills
├── .github/workflows/        # CI
├── .env.example
└── README.md
```

Frontend and backend are intentionally separated so ERP modules can be added without restructuring the monorepo.

Architecture authority for agents:

- `.specify/memory/constitution.md` — governance principles
- `.cursor/skills/erp-architecture/` — monorepo baseline rules
- `.cursor/skills/erp-frontend/` — Angular/Nx/UI implementation rules
- `.cursor/skills/erp-backend/` — .NET Clean Architecture implementation rules
