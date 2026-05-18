# Guia de Contribuição

## Fluxo de trabalho

O repositório segue um fluxo baseado em branches protegidas:

```txt
feature/xxx  →  dev  →  main
              (PR)    (PR + review)
```

- **`main`** — código estável e revisado. Aceita PRs somente vindos de `dev`, com 1 aprovação obrigatória.
- **`dev`** — integração contínua. Aceita PRs de qualquer branch de feature, sem aprovação obrigatória, mas com CI obrigatório.
- **`feature/*`**, **`fix/*`**, **`docs/*`** — branches de trabalho criadas a partir de `dev`.

Push direto em `main` e `dev` está bloqueado.

---

## Criando uma branch

Sempre crie a partir de `dev` atualizado:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/nome-da-funcionalidade
```

### Convenção de nomes

| Prefixo     | Uso                                      |
|-------------|------------------------------------------|
| `feature/`  | nova funcionalidade                      |
| `fix/`      | correção de bug                          |
| `docs/`     | documentação                             |
| `chore/`    | configuração, dependências, infra        |
| `refactor/` | refatoração sem mudança de comportamento |
| `test/`     | adição ou correção de testes             |

---

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```txt
<tipo>(<escopo opcional>): <descrição curta>

<corpo opcional>
```

**Tipos válidos:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`

**Exemplos:**

```txt
feat(session): adiciona use case de iniciar sessão de treino
fix(auth): corrige validação de refresh token expirado
docs(padroes): documenta GoF Criacional — Factory Method
chore(docker): ajusta porta do postgres no compose dev
```

**Regras:**

- Mensagem em português
- Primeira linha com no máximo 72 caracteres
- Use o corpo para explicar *por que*, não *o que*

---

## Abrindo um Pull Request

### PR de feature → dev

1. Certifique-se que o CI está passando localmente:

   ```bash
   # Backend
   make api-shell
   npm run lint && npm run test

   # Frontend
   make web-shell
   pnpm lint && pnpm test
   ```

2. Abra o PR contra `dev`
3. Preencha o template de PR
4. O CI rodará automaticamente — o merge só é liberado após `CI passed` ✅

### PR de dev → main

1. Abra o PR contra `main` a partir de `dev`
2. Aguarde o CI passar em todos os jobs relevantes
3. É necessária **1 aprovação** de outro membro do time
4. PRs de branches que não sejam `dev` para `main` são bloqueados pelo CI

---

## CI — o que é verificado

O pipeline roda apenas os jobs referentes ao que foi alterado:

| Contexto alterado                     | Jobs executados                         |
|---------------------------------------|-----------------------------------------|
| `backend/**`                          | lint → type check → migrations → testes |
| `frontend/**`                         | lint → build → testes                   |
| `docs/**`                             | mkdocs build `--strict`                 |
| `docker-compose*.yml` / `Dockerfile*` | validação dos composes                  |

O check obrigatório é **`CI passed`** — ele agrega todos os resultados. O merge só é possível quando esse check está verde.

---

## Padrões de código

### Backend (NestJS)

- Código dentro da camada correta: `domain`, `application`, `adapters` ou `infrastructure`
- Sem importações cruzadas entre camadas no sentido errado (`infrastructure` não importa `adapters`, etc.)
- DTOs validados com `class-validator`
- Sem lógica de negócio em controllers

### Frontend (React)

- Componentes dentro da feature correspondente
- Páginas não chamam `axios` diretamente — use services
- Hooks encapsulam chamadas de API via TanStack Query
- Validação de formulários via `zod` + `react-hook-form`

---

## Ambiente local

Consulte o [README](./README.md) para instruções completas de setup.

```bash
make up          # sobe todos os serviços
make db-migrate  # roda migrations
make logs        # acompanha os logs
```
