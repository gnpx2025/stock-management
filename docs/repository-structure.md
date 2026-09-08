# Repository structure

```text
stock-management/
├── frontend/                 # Nx Angular workspace (Shell + shared libs)
│   ├── apps/shell/           # Native Federation host
│   └── libs/                 # core, ui, shared, contracts
├── backend/                  # .NET 10 Clean Architecture solution
│   ├── src/ERP.*             # Api, Application, Domain, Infrastructure
│   └── tests/ERP.*           # Unit, Integration, Architecture
├── docker/                   # Optional Docker notes/assets
├── docker-compose.yml        # PostgreSQL 16
├── docs/                     # Developer documentation
├── specs/                    # Spec Kit features
├── .specify/                 # Spec Kit tooling
├── .github/workflows/        # CI
├── .env.example
└── README.md
```

Frontend and backend are intentionally separated so ERP modules can be added without restructuring the monorepo.
