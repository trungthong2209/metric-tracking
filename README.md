
## 🛠 Tech Stack

* **Runtime:** Node.js (v18+)
* **Language:** TypeScript 5
* **Framework:** Express.js
* **Database:** PostgreSQL (via **TypeORM**)
* **Caching:** Redis (via **ioredis**)
* **Validation:** class-validator & class-transformer
* **Tooling:** Docker, ts-node, tsconfig-paths

## 📂 Project Structure

```text
src
├── application             # Business Logic Layer
│   ├── dtos                # Input Contracts (e.g., CreateMetricInput.ts)
│   ├── interfaces          # Ports (e.g., ICacheService.ts)
│   └── use-cases           # Application Flows (e.g., CreateMetricUseCase.ts)
├── config
│   └── env.ts              # Fail-Fast Configuration
├── domain                  # Enterprise Core Layer (No external deps)
│   ├── entities            # Rich Models (e.g., Metric.ts)
│   ├── enums               # Shared Constants (e.g., MetricType.ts)
│   ├── repositories        # Repository Interfaces (e.g., IMetricRepository.ts)
│   ├── services            # Pure Domain Services (Logic spanning multiple entities)
│   └── value-objects       # Immutable Objects (e.g., Unit.ts)
├── infrastructure          # External Frameworks Layer
│   ├── cache               # Cache Implementations (Redis)
│   └── persistence         # Database Implementations (TypeORM)
├── interface-adapters      # Adapters Layer
│   ├── controllers         # Request Handlers
│   ├── middleware          # Auth & Validation
│   └── routes              # Route Definitions
├── types                   # Global Type Definitions
│   └── express             # Type Augmentation (req.user)
└── main.ts                 # Composition Root (Entry Point)

⚡️ Getting Started

1. Prerequisites
Node.js v18+

Docker (for Redis/Postgres) or local instances.

2. Environment Setup
  - cp .env.example .env
3. Installation
Bash
# Install dependencies
yarn install
4. Running the App
Bash

# Development Mode (Native Node Watch)
yarn dev

[![Unit Tests](https://github.com/trungthong2209/metric-tracking/actions/workflows/main.yml/badge.svg)](https://github.com/trungthong2209/metric-tracking/actions/workflows/main.yml)