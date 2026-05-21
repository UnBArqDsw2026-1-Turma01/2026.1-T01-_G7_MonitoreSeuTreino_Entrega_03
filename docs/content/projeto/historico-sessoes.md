# Histórico de Sessões de Treino

## Objetivo

Permitir que o usuário autenticado consulte o **histórico de sessões de treino concluídas** (RF26), visualize os **detalhes completos** de cada sessão e **filtre por intervalo de datas** (RF27). O módulo integra-se ao registro de sessões (`POST /v1/sessions`) via padrão Observer, atualizando o cache automaticamente.

> **Responsável:** Giovanni Dornelas Ferreira | **Branch:** `feat/modulo-historico`

---

## Escopo

### Dentro do escopo

- Listar sessões com estado `COMPLETED`, ordenadas por data decrescente
- Exibir por sessão: data, rotina vinculada (quando existir), quantidade de exercícios
- Detalhar sessão selecionada: exercícios, séries, volume total
- Filtrar listagem por `startDate` e/ou `endDate` (ISO 8601)
- Atualização automática do histórico ao registrar nova sessão (Observer)

### Fora do escopo

- Entidade `Routine` completa (apenas `routineId` opcional na sessão)
- Catálogo de exercícios (apenas `exerciseId` referenciado)
- Sessões em rascunho (`DRAFT`) na listagem
- Frontend dedicado nesta entrega (API REST documentada no Swagger)

---

## Requisitos funcionais

| RF   | Descrição                                                                 |
|------|---------------------------------------------------------------------------|
| RF26 | Listar histórico de sessões concluídas; ordenação DESC por data; detalhes |
| RF27 | Filtrar histórico por intervalo de datas                                  |

---

## Padrões GoF aplicados

| Categoria      | Padrão   | Artefato central                         | Documentação                                                                 |
|----------------|----------|------------------------------------------|------------------------------------------------------------------------------|
| Criacional     | Multiton | `HistoryManager.getInstance(userId)`     | [3.1 GoFs Criacionais](../padroes-de-projeto/3-1-gofs-criacionais.md#módulo-de-histórico-de-sessões) |
| Estrutural     | Proxy    | `HistoryServiceProxy` → `HistoryService` | [3.2 GoFs Estruturais](../padroes-de-projeto/3-2-gofs-estruturais.md#módulo-de-histórico-de-sessões) |
| Comportamental | Observer | `WorkoutSessionSubject` + `HistoryObserver` | [3.3 GoFs Comportamentais](../padroes-de-projeto/3-3-gofs-comportamentais.md#módulo-de-histórico-de-sessões) |

---

## Endpoints

| Método | Rota                              | Função                                      |
|--------|-----------------------------------|---------------------------------------------|
| POST   | `/v1/sessions`                    | Registrar sessão concluída (dispara Observer) |
| GET    | `/v1/history/sessions`            | Listar histórico (RF26; query opcional RF27) |
| GET    | `/v1/history/sessions/:sessionId` | Detalhes completos da sessão (RF26)         |

Todas as rotas exigem autenticação via Bearer Token.

### Query params — RF27

| Parâmetro   | Tipo        | Descrição                          |
|-------------|-------------|------------------------------------|
| `startDate` | ISO 8601    | Data inicial do período (inclusive) |
| `endDate`   | ISO 8601    | Data final do período (inclusive)   |

Exemplo: `GET /v1/history/sessions?startDate=2026-05-01T00:00:00.000Z&endDate=2026-05-31T23:59:59.999Z`

---

## Fluxo do usuário

```
login
  ↓
POST /v1/sessions (registra treino)
  ↓
WorkoutSessionSubject.notify()
  ↓
HistoryObserver → HistoryManager (Multiton)
  ↓
GET /v1/history/sessions (lista atualizada)
  ↓
GET /v1/history/sessions/:id (detalhe opcional)
```

### Fluxo com filtro (RF27)

```
GET /v1/history/sessions?startDate=...&endDate=...
  ↓
HistoryServiceProxy (valida intervalo + log)
  ↓
HistoryService → repositório (sessões COMPLETED no período)
```

---

## Payload — Registrar sessão (resumo)

```json
{
  "date": "2026-05-20T10:00:00.000Z",
  "routineId": "uuid-opcional",
  "exercises": [
    {
      "exerciseId": "uuid-do-exercicio",
      "expectedSets": 3,
      "sets": [
        { "targetReps": 12, "actualReps": 10, "weight": 40 }
      ]
    }
  ]
}
```

---

## Histórico de versões

| Versão | Data       | Descrição                              | Autor                      |
|--------|------------|----------------------------------------|----------------------------|
| 1.0    | 20/05/2026 | Documentação do módulo de histórico RF26/RF27 | Giovanni Dornelas Ferreira |
