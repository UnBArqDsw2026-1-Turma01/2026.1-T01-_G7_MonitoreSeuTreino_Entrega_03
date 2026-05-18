.PHONY: help up down restart logs build \
        api api-logs api-build api-shell \
        web web-logs web-build web-shell web-install web-test web-lint \
        db db-migrate db-migrate-prod db-generate db-studio db-reset db-seed \
        docs docs-build docs-logs \
        install lint test test-cov \
        prod-up prod-down prod-build

# ── Configuração ──────────────────────────────────────────────────────────────

COMPOSE      = docker compose
COMPOSE_PROD = docker compose -f docker-compose.prod.yml
API          = $(COMPOSE) exec api
WEB          = $(COMPOSE) exec web

# ── Default ───────────────────────────────────────────────────────────────────

help: ## Exibe esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ── Ambiente ──────────────────────────────────────────────────────────────────

up: ## Sobe todos os serviços (dev)
	$(COMPOSE) up -d

down: ## Para e remove os containers
	$(COMPOSE) down

restart: ## Reinicia todos os serviços
	$(COMPOSE) restart

logs: ## Exibe logs de todos os serviços
	$(COMPOSE) logs -f

build: ## Reconstrói todas as imagens
	$(COMPOSE) build --no-cache

# ── API ───────────────────────────────────────────────────────────────────────

api: ## Sobe apenas a API
	$(COMPOSE) up -d api

api-logs: ## Exibe logs da API
	$(COMPOSE) logs -f api

api-build: ## Reconstrói a imagem da API
	$(COMPOSE) build --no-cache api

api-shell: ## Abre um shell no container da API
	$(API) sh

# ── Frontend ──────────────────────────────────────────────────────────────────

web: ## Sobe apenas o frontend
	$(COMPOSE) up -d web

web-logs: ## Exibe logs do frontend
	$(COMPOSE) logs -f web

web-build: ## Reconstrói a imagem do frontend
	$(COMPOSE) build --no-cache web

web-shell: ## Abre um shell no container do frontend
	$(WEB) sh

web-install: ## Instala dependências do frontend
	cd frontend/apps/web && pnpm install

web-test: ## Executa os testes do frontend
	$(WEB) pnpm test

web-lint: ## Executa o linter no frontend
	$(WEB) pnpm lint

# ── Banco de dados ────────────────────────────────────────────────────────────

db: ## Sobe apenas o banco de dados
	$(COMPOSE) up -d db

db-migrate: ## Executa as migrations (dev)
	$(API) npx prisma migrate dev

db-migrate-prod: ## Executa as migrations (prod)
	$(API) npx prisma migrate deploy

db-generate: ## Gera o Prisma Client
	$(API) npx prisma generate

db-studio: ## Abre o Prisma Studio
	$(API) npx prisma studio

db-reset: ## Reseta o banco de dados (⚠️ apaga todos os dados)
	$(API) npx prisma migrate reset --force

db-seed: ## Executa o seed do banco
	$(API) npx prisma db seed

# ── Documentação ──────────────────────────────────────────────────────────────

docs: ## Sobe o servidor de documentação
	$(COMPOSE) up -d docs

docs-logs: ## Exibe logs da documentação
	$(COMPOSE) logs -f docs

docs-build: ## Gera o build estático da documentação
	$(COMPOSE) run --rm docs build

# ── Qualidade ────────────────────────────────────────────────────────────────

install: ## Instala dependências (backend + frontend)
	cd backend && npm ci
	cd frontend/apps/web && pnpm install

lint: ## Executa linter em todos os projetos
	$(API) npm run lint
	$(WEB) pnpm lint

test: ## Executa testes em todos os projetos
	$(API) npm run test
	$(WEB) pnpm test

test-cov: ## Executa testes com cobertura (backend)
	$(API) npm run test:cov

# ── Produção ──────────────────────────────────────────────────────────────────

prod-up: ## Sobe os serviços em modo produção
	$(COMPOSE_PROD) up -d

prod-down: ## Para os serviços de produção
	$(COMPOSE_PROD) down

prod-build: ## Reconstrói as imagens de produção
	$(COMPOSE_PROD) build --no-cache
