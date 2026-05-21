# 3.4. Participações — Padrões de Projeto

Breve relato sobre as participações/contribuições de cada membro à entrega. Todos devem participar, mostrando seus pontos de vista e como colaboraram em cada etapa com comprobatórios.

## GoFs Criacionais

### Singleton — Módulo de Onboarding

**Contexto:** Implementação de `OnboardingClassificationRules` como Singleton de domínio, centralizando o algoritmo de pontuação de perfil de treino. A instância única garante fonte de verdade única para todos os classificadores.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Lucas Antunes | Modelagem do Singleton, implementação de `calculateScore()` e sub-métodos de pontuação por critério (experiência, frequência, técnica, consistência), testes unitários (5 casos), documentação. | Excelente | `backend/src/domain/onboarding/rules/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Factory Method — Módulo de Autenticação

**Contexto:** Encapsulamento dos construtores de `User` e `RefreshToken` em métodos estáticos semânticos. O `create()` é usado para criações genuínas, gerando UUIDs e emitindo eventos de domínio como `UserRegisteredEvent`, enquanto o `reconstitute()` é usado pela persistência para restaurar os objetos sem disparar eventos ou gerar novos IDs.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Samuel Nogueira Caetano | Modelagem do padrão Factory Method nas entidades, blindagem de construtores, implementação de regras e barramentos via Value Objects (`UserId`, `Email`), documentação e desenvolvimento da suíte de testes unitários para asserção da lógica de emissão. | Excelente | `backend/src/domain/entities/user.entity.ts`<br>`backend/src/domain/entities/refresh-token.entity.ts`<br>Arquivos `.spec.ts` equivalentes. |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Builder — Módulo de Exercises

**Contexto:** Implementação de `ExerciseBuilder` para garantir a criação correta do agregado `Exercise` com seus Value Objects vinculados.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Daniel Teles | Modelagem do Builder para gerenciar construção de exercícios, separando a lógica inline do Use Case e melhorando a segurança da criação. | Excelente | `backend/src/domain/exercises/builders/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Multiton — Módulo de Histórico de Sessões

**Contexto:** Implementação de `HistoryManager` como Multiton, mantendo um pool de gerenciadores por usuário para evitar recriação desnecessária de sessões concluídas a cada requisição.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Giovanni Dornelas Ferreira | Implementação do Multiton `HistoryManager`, integração com `HistoryService` e `HistoryObserver`, repositório `findCompletedByUserId`, suporte aos requisitos RF26/RF27 e documentação. | Excelente | `backend/src/domain/history/history-manager.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

## GoFs Estruturais

### Bridge + Facade — Módulo de Onboarding

**Contexto (Bridge):** Separação da hierarquia de fluxos (`OnboardingFlow`) da hierarquia de classificadores (`ProfileClassifier`), permitindo que homens e mulheres sejam classificados por implementações distintas sem acoplar o fluxo ao sexo.

**Contexto (Facade):** `OnboardingFacade` como único ponto de entrada da camada de apresentação para o subsistema de onboarding, encapsulando três use cases e isolando o controller de dependências diretas com o domínio.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Lucas Antunes | Bridge: abstração `OnboardingFlow`, `StrengthOnboardingFlow`, interface `ProfileClassifier`, `MaleProfileClassifier`, `FemaleProfileClassifier`, testes (6 casos). Facade: `OnboardingFacade`, integração com `OnboardingController`. | Excelente | `backend/src/domain/onboarding/bridge/`<br>`backend/src/presentation/facades/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Decorator + Facade — Módulo de Autenticação

**Contexto (Decorator):** Empilhamento independente de comportamentos transversais (`CachingUserRepository` para memória em runtime e `LoggingUserRepository` para rastreamento de operações com _correlationId_) sobre o `UserPostgresRepository`, sem ferir a responsabilidade única da persistência em base de dados.

**Contexto (Facade):** `AuthenticationFacade` servindo como roteador e interface simplificada para as requisições que chegam pelo `AuthController`, impedindo que os controladores lidem com contratos extensos e montagem de DTOs dos casos de uso.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Samuel Nogueira Caetano | Decorator: criação dos wrappers `CachingUserRepository` e `LoggingUserRepository`, configuração da montagem de injeção de dependência em `AuthModule` e testes. Facade: refatoração do `AuthController` e roteamento de sessões no facade. | Excelente | `backend/src/infrastructure/database/`<br>`backend/src/infrastructure/modules/auth.module.ts`<br>`backend/src/presentation/facades/`<br>`backend/src/presentation/controllers/auth.controller.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Decorator — Módulo de Exercises

**Contexto:** Padrões Caching e Logging ao redor do repositório base para ganho em observabilidade e performance.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Daniel Teles | Adição de decorators `CachingExerciseRepository` e `LoggingExerciseRepository` em volta do Postgres Repository, mantendo OCP e SRP. | Excelente | `backend/src/infrastructure/database/`<br>`backend/src/infrastructure/modules/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Proxy — Módulo de Histórico de Sessões

**Contexto:** Implementação de `HistoryServiceProxy` para controlar acesso, validar período e registrar logs antes de delegar ao serviço real de histórico.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Giovanni Dornelas Ferreira | Implementação do `HistoryServiceProxy`, interface `IHistoryService`, serviço real `HistoryService`, wiring em `HistoryModule`, `HistoryController` e documentação. | Excelente | `backend/src/infrastructure/services/history-service.proxy.ts`<br>`backend/src/application/services/history.service.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

## GoFs Comportamentais

### Memento + Template Method — Módulo de Onboarding

**Contexto (Memento):** Captura do estado do perfil de treino antes de um redo, preservando o histórico completo de classificações no banco sem violar o encapsulamento da entidade `TrainingProfile`.

**Contexto (Template Method):** Esqueleto imutável do fluxo de classificação em `OnboardingFlow.execute()`, com hooks `beforeClassify()` e `afterClassify()` extensíveis por subclasses, composto com o Bridge para separar _quando_ de _como_.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Lucas Antunes | Memento: `OnboardingMementoVO`, `createMemento()` em `TrainingProfile`, `RedoOnboardingUseCase` (caretaker), `onboarding_history` (ORM + repositório), testes (5 casos). Template Method: `execute()` em `OnboardingFlow`, hooks protegidos, `StrengthOnboardingFlow`. | Excelente | `backend/src/domain/onboarding/entities/`<br>`backend/src/domain/onboarding/value-objects/`<br>`backend/src/domain/onboarding/bridge/`<br>`backend/src/infrastructure/database/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Template Method + Observer — Módulo de Autenticação

**Contexto (Template Method):** Esqueleto de execução na classe base `UseCase<TInput, TOutput>`, contendo três fases invariantes: limpeza, lógica via passo variável abstrato `handle` e extração/publicação automatizada de eventos. Evita duplicidade nas políticas transversais.

**Contexto (Observer):** Implementação de um Subject desacoplado (`DomainEventBus`) para assinar e despachar eventos, como `UserRegisteredEvent`, permitindo que múltiplos módulos reajam a alterações sem que o módulo emissor os conheça.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Samuel Nogueira Caetano | Template Method: modelagem do `UseCase` genérico abstrato, hook `registerAggregate`, rotina recursiva `collectAggregates`. Observer: infraestrutura de acúmulo no `AggregateRoot`, criação do `DomainEventBus` isolando falhas com `allSettled` e testes em todos os fluxos. | Excelente | `backend/src/application/use-cases/base.use-case.ts`<br>`backend/src/application/events/domain-event-bus.ts`<br>`backend/src/domain/entities/aggregate-root.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Observer — Módulo de Histórico de Sessões

**Contexto:** Implementação de notificação automática após o registro de uma sessão de treino. O `WorkoutSessionSubject` notifica o `HistoryObserver`, permitindo atualizar o histórico sem acoplar diretamente o caso de uso de sessão ao módulo de histórico.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Giovanni Dornelas Ferreira | Observer: `WorkoutSessionSubject`, `HistoryObserver`, `SessionObserver`, integração em `RegisterSessionUseCase.notify()`, inscrição em `HistoryModule.onModuleInit` e documentação. | Excelente | `backend/src/domain/history/observers/`<br>`backend/src/application/use-cases/session/register-session.use-case.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Chain of Responsibility — Módulo de Exercises

**Contexto:** Construção elástica da query de busca através de uma pipeline de handlers, permitindo encadear filtros de busca de exercícios sem concentrar condicionais no repositório.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|---|---|---|---|
| Daniel Teles | Encadeamento de restrições de busca em `ExerciseSearchChain` para permitir múltiplos testes dinâmicos de filtro. | Excelente | `backend/src/infrastructure/database/exercise-search.chain.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

## Módulo de Usuário — RF04 e RF07

**Responsável:** André Ricardo Meyer de Melo | **Branch:** `feat/modulo-usuario-4-7`

| Padrão | Nome do Membro | Contribuição | Significância |
|--------|----------------|--------------|---------------|
| Builder | André Ricardo Meyer de Melo | `PasswordResetRequestBuilder` e `AccountDeletionRequestBuilder` — constroem comandos validados para RF04 e RF07 | Excelente |
| Facade | André Ricardo Meyer de Melo | `PasswordResetFacade` e `AccountDeletionFacade` — orquestram cadeia, repositórios, e-mail e eventos | Excelente |
| Chain of Responsibility | André Ricardo Meyer de Melo | Cadeia RF04 (4 handlers) e cadeia RF07 (4 handlers) com decisões de segurança embutidas | Excelente |

---

## Histórico de versões

| Versão | Data | Descrição | Autor |
|---|---|---|---|
| 1.0 | 19/05/2026 | Registro de participações nos padrões GoF do módulo de onboarding (Singleton, Bridge, Facade, Memento, Template Method). | Lucas Antunes |
| 1.1 | 20/05/2026 | Registro de participações nos padrões GoF do módulo de autenticação (Factory Method, Decorator, Facade, Template Method, Observer). | Samuel Nogueira Caetano |
| 1.2 | 20/05/2026 | Registro de participações nos padrões GoF do módulo de histórico de sessões (Multiton, Proxy, Observer). | Giovanni Dornelas Ferreira |
| 1.3 | 21/05/2026 | Registro de participações nos padrões GoF do módulo de exercises (Builder, Decorator, Chain of Responsibility). | Daniel Teles |
| 1.4    | 21/05/2026 | Registro de participações nos padrões GoF do módulo de Usuário (Builder, Facade, Chain of Responsibility — RF04 e RF07).              | André Ricardo Meyer de Melo |
