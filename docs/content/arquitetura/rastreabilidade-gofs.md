# Rastreabilidade dos Padrões GoF

## Objetivo

Mapear cada padrão GoF implementado ao seu artefato de código, camada de arquitetura, problema de negócio resolvido e documentação detalhada. Esta página serve como índice de rastreabilidade — para a análise completa de cada padrão, acesse o documento vinculado.

## Matriz de rastreabilidade

| Categoria          | Padrão          | Módulo     | Camada                  | Artefato principal                                                      | Problema resolvido                                                                                                  | Documento                                                                     | Endpoint(s)                   |
|--------------------|-----------------|------------|-------------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|-------------------------------|
| **Criacional**     | Singleton       | Onboarding | Domain                  | `OnboardingClassificationRules`                                         | Garantir fonte única de regras de pontuação para `MaleProfileClassifier` e `FemaleProfileClassifier`                | [3.1 GoFs Criacionais](../padroes-de-projeto/3-1-gofs-criacionais.md)         | `POST /v1/onboarding`         |
| **Estrutural**     | Bridge          | Onboarding | Domain                  | `OnboardingFlow` (abstração) + `ProfileClassifier` (impl.)              | Separar a hierarquia de fluxos de treino da hierarquia de classificadores por sexo, evitando explosão de subclasses | [3.2 GoFs Estruturais](../padroes-de-projeto/3-2-gofs-estruturais.md)         | `POST /v1/onboarding`         |
| **Estrutural**     | Facade          | Onboarding | Presentation            | `OnboardingFacade`                                                      | Oferecer ponto único de acesso do controller aos três use cases de onboarding, isolando a camada de apresentação    | [3.2 GoFs Estruturais](../padroes-de-projeto/3-2-gofs-estruturais.md)         | `GET/POST/PUT /v1/onboarding` |
| **Comportamental** | Memento         | Onboarding | Domain + Infrastructure | `TrainingProfile.createMemento()` + `OnboardingMementoVO`               | Preservar o estado completo do perfil antes de um redo sem violar o encapsulamento da entidade                      | [3.3 GoFs Comportamentais](../padroes-de-projeto/3-3-gofs-comportamentais.md) | `PUT /v1/onboarding`          |
| **Comportamental** | Template Method | Onboarding | Domain                  | `OnboardingFlow.execute()` com hooks `beforeClassify` / `afterClassify` | Garantir sequência imutável do algoritmo de classificação (pre → classificar → pos), extensível via hooks           | [3.3 GoFs Comportamentais](../padroes-de-projeto/3-3-gofs-comportamentais.md) | `POST /v1/onboarding`         |
| **Criacional**     | Multiton        | Histórico  | Domain                  | `HistoryManager.getInstance(userId)`                                    | Pool de gerenciadores por usuário; cache de sessões concluídas sem recriação a cada request                          | [3.1 GoFs Criacionais](../padroes-de-projeto/3-1-gofs-criacionais.md#módulo-de-histórico-de-sessões) | `GET /v1/history/sessions`    |
| **Estrutural**     | Proxy           | Histórico  | Infrastructure          | `HistoryServiceProxy` → `HistoryService`                                | Controle de acesso, validação de período e logs antes de delegar ao serviço real                                     | [3.2 GoFs Estruturais](../padroes-de-projeto/3-2-gofs-estruturais.md#módulo-de-histórico-de-sessões) | `GET /v1/history/sessions`    |
| **Comportamental** | Observer        | Histórico  | Domain + Application    | `WorkoutSessionSubject.notify()` + `HistoryObserver.update()`           | Atualizar histórico automaticamente após `POST /v1/sessions` sem acoplar use case ao módulo de histórico             | [3.3 GoFs Comportamentais](../padroes-de-projeto/3-3-gofs-comportamentais.md#módulo-de-histórico-de-sessões) | `POST /v1/sessions`           |
| **Criacional**     | Builder         | Exercises  | Domain                  | `ExerciseBuilder`                                       | Centralizar regras de montagem e validações obrigacionas vs opcionais do agregado `Exercise` | [3.1 GoFs Criacionais](../padroes-de-projeto/3-1-gofs-criacionais.md)             | `POST /v1/exercises`            |
| **Estrutural**     | Decorator       | Exercises  | Domain + Infrastructure | `LoggingExerciseRepository` + `CachingExerciseRepository` | OCP para cacheamento e logging de respostas das rotas de leitura   | [3.2 GoFs Estruturais](../padroes-de-projeto/3-2-gofs-estruturais.md)             | `GET/POST/PUT /v1/exercises` |
| **Comportamental** | Chain of Resp.  | Exercises  | Infrastructure          | `ExerciseSearchChain`                                   | Encadeamento de restrições de busca `where` (ativos, name, muscleGroup) | [3.3 GoFs Comportamentais](../padroes-de-projeto/3-3-gofs-comportamentais.md)       | `GET /v1/exercises`             |

## Elos entre padrões

Os padrões formam duas redes complementares — **Onboarding** e **Histórico**:

```mermaid
graph LR
    subgraph Onboarding
        Singleton["Singleton"] --> Bridge
        Bridge --> TemplateMethod["Template Method"]
        TemplateMethod --> Facade
        Facade --> Memento
    end

    subgraph Histórico
        Observer["Observer\nWorkoutSessionSubject"] --> Multiton["Multiton\nHistoryManager"]
        Multiton --> Proxy["Proxy\nHistoryServiceProxy"]
    end

    Observer -.->|disparado por| POST["POST /v1/sessions"]
    Proxy -.->|lê via| GET["GET /v1/history/sessions"]
    Singleton["Singleton\nOnboardingClassificationRules"] -->|usado por| Bridge
    Bridge["Bridge\nOnboardingFlow + ProfileClassifier"] -->|compõe| TemplateMethod
    TemplateMethod["Template Method\nOnboardingFlow.execute()"] -->|acionado via| Facade
    Facade["Facade\nOnboardingFacade"] -->|orquestra| Memento
    Memento["Memento\nTrainingProfile.createMemento()"] -->|snapshot de| Bridge
    Builder["Builder\nExerciseBuilder"] -->|usado por| CreateExerciseUseCase[CreateExerciseUseCase]
    Decorator["Decorator\nCaching & Logging Repository"] -->|envolve| PostgresRepository[ExercisePostgresRepository]
    ChainResp["ChainOfResponsibility\nExerciseSearchChain"] -->|usado por| PostgresRepository
```

| Relação                  | Descrição                                                                                                        |
|--------------------------|------------------------------------------------------------------------------------------------------------------|
| Singleton → Bridge       | `MaleProfileClassifier` e `FemaleProfileClassifier` consomem `getInstance()` para obter as regras                |
| Bridge ↔ Template Method | O Template Method vive dentro da abstração do Bridge (`OnboardingFlow`) — os padrões co-habitam o mesmo artefato |
| Facade → Template Method | O Facade aciona `SubmitOnboardingUseCase`, que instancia o flow e chama `execute()` (template method)            |
| Facade → Memento         | O Facade aciona `RedoOnboardingUseCase`, que chama `createMemento()` antes de sobrescrever o perfil              |
| Memento ← Bridge         | O snapshot capturado pelo Memento é o `ClassificationResult` produzido pelo classificador (Bridge)               |
| Observer → Multiton      | `HistoryObserver.update()` chama `HistoryManager.getInstance(userId).addSession()`                               |
| Multiton → Proxy         | `HistoryService` (real) usa o Multiton; use cases acessam via `HistoryServiceProxy`                              |
| POST sessions → Observer | `RegisterSessionUseCase` chama `notify()` após `save()` — RF26 atualização automática                            |
| Builder → Use Case       | O `CreateExerciseUseCase` aciona o Builder para compilar todas as validações obrigatórias antes da persistência |
| Decorator → Infra        | O módulo do NestJS interliga e resolve a inversão de dependências injetando os decorators no wrapper do REPOSITORY |
| C.O.R → Infra            | O método de busca (`search`) constrói a base query e delega as filtragens dinâmicas à Chain of Responsibility |

## Cobertura de testes por padrão

| Padrão          | Arquivo de teste                                                                     | Casos cobertos |
|-----------------|--------------------------------------------------------------------------------------|----------------|
| Singleton       | `domain/onboarding/rules/onboarding-classification-rules.singleton.spec.ts`          | 5              |
| Bridge          | `domain/onboarding/bridge/classifiers.spec.ts`                                       | 6              |
| Facade          | `presentation/controllers/onboarding.controller.spec.ts` (integração via controller) | 7              |
| Memento         | `domain/onboarding/entities/training-profile.spec.ts`                                | 5              |
| Template Method | coberto pelos testes de Bridge (`classifiers.spec.ts`)                               | 6              |
| Multiton        | evidência manual — fluxo POST session + GET history (Swagger / REST Client)          | —              |
| Proxy           | evidência manual — logs `[HistoryProxy]` e validação de intervalo de datas         | —              |
| Observer        | evidência manual — sessão aparece em GET history imediatamente após POST           | —              |
| Builder         | `domain/exercises/builders/exercise.builder.spec.ts` (ou testes e2e de exercise)        | 3 |
| Decorator       | `infrastructure/database/exercise.repository.spec.ts` (ou validação manual via stdout)   | 0 |
| Chain of Resp.  | `infrastructure/database/exercise-search.chain.spec.ts`                                  | 2 |

Execute todos os testes do módulo de onboarding no container:

```bash
sudo docker compose exec api npx jest onboarding --verbose
```

Validação manual do módulo de histórico (API em execução):

```bash
# 1. Login e registrar sessão (ver Swagger tag sessions)
# 2. Listar histórico
curl -H "Authorization: Bearer <token>" http://localhost:3000/v1/history/sessions
```

## Observações

- Padrões de **Onboarding**: branch `feat/modulo-on-boarding` (Lucas Antunes).
- Padrões de **Histórico**: branch `feat/modulo-historico` (Giovanni Dornelas Ferreira) — RF26 e RF27.
- Novos módulos devem ser documentados nas seções **"[Módulo: ____________] — A preencher"** dos arquivos [3.1](../padroes-de-projeto/3-1-gofs-criacionais.md), [3.2](../padroes-de-projeto/3-2-gofs-estruturais.md) e [3.3](../padroes-de-projeto/3-3-gofs-comportamentais.md), e adicionados a esta matriz.
- A coluna **Endpoint(s)** lista os endpoints HTTP que exercitam o padrão em produção — útil para validação manual via Postman ou similar.

## Histórico de versões

| Versão | Data       | Descrição                                                                                | Autor         |
|--------|------------|------------------------------------------------------------------------------------------|---------------|
| 1.0    | 19/05/2026 | Matriz de rastreabilidade com os 5 padrões GoF do módulo de onboarding e elos entre eles | Lucas Antunes |
| 1.1    | 20/05/2026 | Inclusão de Multiton, Proxy e Observer do módulo de histórico (RF26/RF27)               | Giovanni Dornelas Ferreira |
| 1.1    | 20/05/2026 | Matriz de rastreabilidade expandida com os 3 padrões GoF do módulo de Exercises | Daniel Teles|
