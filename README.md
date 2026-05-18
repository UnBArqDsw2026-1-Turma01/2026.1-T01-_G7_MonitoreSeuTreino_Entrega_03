# G7 — MonitoreSeuTreino

Sistema de monitoramento de treino semanal. Projeto acadêmico da disciplina de Arquitetura e Desenho de Software — 2026.1.

- **Documentação:** `http://localhost:8000`
- **API:** `http://localhost:3000/api`
- **Frontend:** `http://localhost:5173`

---

## Pré-requisitos

| Ferramenta                                         | Versão mínima               |
| -------------------------------------------------- | --------------------------- |
| [Docker](https://docs.docker.com/get-docker/)      | 24+                         |
| [Docker Compose](https://docs.docker.com/compose/) | v2.20+                      |
| [Make](https://www.gnu.org/software/make/)         | 4+                          |
| [Node.js](https://nodejs.org/)                     | 20+ (desenvolvimento local) |
| [pnpm](https://pnpm.io/)                           | 10+ (frontend)              |

---

## Setup — do clone ao ambiente saudável

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd <nome-do-repositorio>
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/apps/web/.env.example frontend/apps/web/.env
```

Edite `backend/.env` com os valores reais:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://monitore:monitore@localhost:5432/monitore_seu_treino?schema=public
JWT_SECRET=troque_por_um_segredo_forte
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=troque_por_outro_segredo
JWT_REFRESH_EXPIRES_IN=30d
```

### 3. Subir os containers

```bash
make up
```

Acompanhe os logs até todos os serviços ficarem `healthy`:

```bash
make logs
```

### 4. Rodar as migrations

```bash
make db-migrate
```

### 5. Validar o ambiente

```bash
# Testa o backend (dentro do container)
make api-shell
npm run test

# Testa o frontend (dentro do container)
make web-shell
pnpm test

# Valida o build da documentação
make docs-build
```

Se todos os checks passarem, o ambiente está saudável.

---

## Comandos disponíveis

```bash
make help
```

| Comando           | Descrição                   |
| ----------------- | --------------------------- |
| `make up`         | Sobe todos os serviços      |
| `make down`       | Para todos os serviços      |
| `make logs`       | Logs em tempo real          |
| `make build`      | Reconstrói todas as imagens |
| `make api`        | Sobe apenas a API           |
| `make web`        | Sobe apenas o frontend      |
| `make db`         | Sobe apenas o banco         |
| `make db-migrate` | Executa as migrations       |
| `make db-studio`  | Abre o Prisma Studio        |
| `make db-reset`   | ⚠️ Reseta o banco           |
| `make docs`       | Sobe a documentação         |
| `make test`       | Roda todos os testes        |
| `make lint`       | Roda todos os linters       |
| `make prod-up`    | Sobe em modo produção       |

---

## Estrutura do repositório

```txt
.
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── modules/          # auth, profile, exercise, workout, session, tracking
│   │   └── shared/           # database, config, guards, filters
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .env.example
│
├── frontend/
│   └── apps/web/             # React + Vite
│       ├── src/
│       │   ├── app/          # router, providers, layouts
│       │   ├── features/     # auth, profile, exercise, workout, session, tracking, dashboard
│       │   └── shared/       # components, hooks, lib, utils
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       └── .env.example
│
├── docs/                     # Documentação MkDocs Material
│   └── mkdocs.yml
│
├── docker-compose.yml        # Ambiente de desenvolvimento
├── docker-compose.prod.yml   # Ambiente de produção
├── Makefile                  # Todos os comandos do projeto
└── .env.example              # Variáveis do Compose
```

---

## Arquitetura

O backend segue **Clean Architecture** por módulo de domínio:

```txt
infrastructure → adapters → application → domain
```

```txt
modules/session/
  domain/          # entidades, value objects, serviços de domínio
  application/     # use cases, ports, DTOs
  adapters/        # controllers, presenters, mappers
  infrastructure/  # repositories, persistence
```

O frontend segue organização por features:

```txt
Page → Component → Hook → Service → API Client → Backend
```

---

## CI

O pipeline roda automaticamente em push e PRs para `dev` e `main`. Apenas os jobs relativos ao que foi alterado são executados:

| Job        | Gatilho                   | Checks                                                    |
| ---------- | ------------------------- | --------------------------------------------------------- |
| `backend`  | mudanças em `backend/**`  | type check → lint → migrations → testes (PostgreSQL real) |
| `frontend` | mudanças em `frontend/**` | lint → build → testes                                     |
| `docs`     | mudanças em `docs/**`     | build `--strict`                                          |
| `docker`   | mudanças nos Dockerfiles  | validação dos dois composes                               |

O check obrigatório é **`CI passed`** — ele agrega todos os resultados. PRs para `main` só são aceitos a partir de `dev`.

---

## Documentação

```bash
make docs
# acesse http://localhost:8000
```

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para o fluxo de branches, convenção de commits e como abrir PRs.
