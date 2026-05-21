# 3.4. Participações — Padrões de Projeto

Breve relato sobre as participações/contribuições de cada membro à entrega. Todos devem participar, mostrando seus pontos de vista e como colaboraram em cada etapa com comprobatórios.

## GoFs Criacionais

### Singleton — Módulo de Onboarding

**Contexto:** Implementação de `OnboardingClassificationRules` como Singleton de domínio, centralizando o algoritmo de pontuação de perfil de treino. A instância única garante fonte de verdade única para todos os classificadores.

| **Nome do Membro** | **Contribuição**                                                                                                                                                                                | **Significância** | **Comprobatórios**                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------- |
| Lucas Antunes      | Modelagem do Singleton, implementação de `calculateScore()` e sub-métodos de pontuação por critério (experiência, frequência, técnica, consistência), testes unitários (5 casos), documentação. | Excelente         | `backend/src/domain/onboarding/rules/` |

### Factory Method — Módulo de Autenticação

**Contexto:** Encapsulamento dos construtores de `User` e `RefreshToken` em métodos estáticos semânticos. O `create()` é usado para criações genuínas (gerando UUIDs e emitindo eventos de domínio como `UserRegisteredEvent`), enquanto o `reconstitute()` é usado pela persistência para restaurar os objetos sem disparar eventos ou gerar novos IDs.

| **Nome do Membro**      | **Contribuição**                                                                                                                                                                                                                                          | **Significância** | **Comprobatórios**                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Samuel Nogueira Caetano | Modelagem do padrão Factory Method nas entidades, blindagem de construtores, implementação de regras e barramentos via Value Objects (`UserId`, `Email`), documentação e desenvolvimento da suíte de testes unitários para asserção da lógica de emissão. | Excelente         | `backend/src/domain/entities/user.entity.ts`<br><br>`backend/src/domain/entities/refresh-token.entity.ts`<br><br>E arquivos `.spec.ts` equivalentes. |

### Builder — Módulo de Exercises

**Contexto:** Implementação de `ExerciseBuilder` para garantir a criação correta do agregado `Exercise` com seus value objects vinculados.

| **Nome do Membro** | **Contribuição**                                                                                                                      | **Significância** | **Comprobatórios**                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------- |
| Daniel Teles       | Modelagem do Builder para gerenciar construção de exercícios, separando a lógica inline do UseCase e melhorando segurança da criação. | Excelente         | `backend/src/domain/exercises/builders/` |

## GoFs Estruturais

### Bridge + Facade — Módulo de Onboarding

**Contexto (Bridge):** Separação da hierarquia de fluxos (`OnboardingFlow`) da hierarquia de classificadores (`ProfileClassifier`), permitindo que homens e mulheres sejam classificados por implementações distintas sem acoplar o fluxo ao sexo.

**Contexto (Facade):** `OnboardingFacade` como único ponto de entrada da camada de apresentação para o subsistema de onboarding, encapsulando três use cases e isolando o controller de dependências diretas com o domínio.

| **Nome do Membro** | **Contribuição**                                                                                                                                                                                                                      | **Significância** | **Comprobatórios**                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| Lucas Antunes      | Bridge: abstração `OnboardingFlow`, `StrengthOnboardingFlow`, interface `ProfileClassifier`, `MaleProfileClassifier`, `FemaleProfileClassifier`, testes (6 casos). Facade: `OnboardingFacade`, integração com `OnboardingController`. | Excelente         | `backend/src/domain/onboarding/bridge/`<br><br>`backend/src/presentation/facades/` |

### Decorator + Facade — Módulo de Autenticação

**Contexto (Decorator):** Empilhamento independente de comportamentos transversais (`CachingUserRepository` para memória em runtime e `LoggingUserRepository` para rastreamento de operações com _correlationId_) sobre o `UserPostgresRepository` sem ferir a responsabilidade única da persistência em base de dados.

**Contexto (Facade):** `AuthenticationFacade` servindo como roteador e interface simplificada para as requisições que chegam pelo `AuthController`, impedindo que os controladores lidem com contratos extensos e montagem de DTOs dos Casos de Uso.

| **Nome do Membro**      | **Contribuição**                                                                                                                                                                                                                                  | **Significância** | **Comprobatórios**                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Samuel Nogueira Caetano | Decorator: criação dos wrappers `CachingUserRepository` e `LoggingUserRepository`, configuração da montagem de injeção de dependência em `AuthModule` e testes.<br><br>Facade: refatoração do `AuthController` e roteamento de sessões no facade. | Excelente         | `backend/src/infrastructure/database/`<br><br>`backend/src/infrastructure/modules/auth.module.ts`<br><br>`backend/src/presentation/facades/`<br><br>`backend/src/presentation/controllers/auth.controller.ts` |

### Decorator — Módulo de Exercises

**Contexto:** Padrões Caching e Logging ao redor do repositório base para ganho em observabilidade e performance.

| **Nome do Membro** | **Contribuição**                                                                                                                    | **Significância** | **Comprobatórios**                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Daniel Teles       | Adição de Decorators `CachingExerciseRepository` e `LoggingExerciseRepository` em volta do Postgres Repository, mantendo OCP e SRP. | Excelente         | `backend/src/infrastructure/database/` e `backend/src/infrastructure/modules/` |

## GoFs Comportamentais

### Memento + Template Method — Módulo de Onboarding

**Contexto (Memento):** Captura do estado do perfil de treino antes de um redo, preservando o histórico completo de classificações no banco sem violar o encapsulamento da entidade `TrainingProfile`.

**Contexto (Template Method):** Esqueleto imutável do fluxo de classificação em `OnboardingFlow.execute()`, com hooks `beforeClassify()` e `afterClassify()` extensíveis por subclasses, composto com o Bridge para separar _quando_ de _como_.

| **Nome do Membro** | **Contribuição**                                                                                                                                                                                                                                                       | **Significância** | **Comprobatórios**                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lucas Antunes      | Memento: `OnboardingMementoVO`, `createMemento()` em `TrainingProfile`, `RedoOnboardingUseCase` (caretaker), `onboarding_history` (ORM + repositório), testes (5 casos). Template Method: `execute()` em `OnboardingFlow`, hooks protegidos, `StrengthOnboardingFlow`. | Excelente         | `backend/src/domain/onboarding/entities/`<br><br>`backend/src/domain/onboarding/value-objects/`<br><br>`backend/src/domain/onboarding/bridge/`<br><br>`backend/src/infrastructure/database/` |

### Template Method + Observer — Módulo de Autenticação

**Contexto (Template Method):** Esqueleto de execução na classe base `UseCase<TInput, TOutput>` contendo três fases invariantes: limpeza, lógica (via passo variável abstrato `handle`) e extração/publicação automatizada de eventos. Evita duplicidade nas políticas transversais.

**Contexto (Observer):** Implementação de um Subject desacoplado (`DomainEventBus`) para assinar e despachar eventos (ex: `UserRegisteredEvent`) permitindo que múltiplos módulos (Handlers) reajam a alterações sem que o módulo Emissor os conheça.

| **Nome do Membro**      | **Contribuição**                                                                                                                                                                                                                                                                  | **Significância** | **Comprobatórios**                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Samuel Nogueira Caetano | Template Method: Modelagem do `UseCase` genérico abstrato, hook `registerAggregate`, rotina recursiva `collectAggregates`.<br><br>Observer: infraestrutura de acúmulo no `AggregateRoot`, criação do `DomainEventBus` isolando falhas (`allSettled`) e testes em todos os fluxos. | Excelente         | `backend/src/application/use-cases/base.use-case.ts`<br><br>`backend/src/application/events/domain-event-bus.ts`<br><br>`backend/src/domain/entities/aggregate-root.ts` |

### Chain of Responsibility — Módulo de Exercises

**Contexto:** Construção elástica da query de busca através de uma pipeline de handlers.

| **Nome do Membro** | **Contribuição**                                                                                              | **Significância** | **Comprobatórios**                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------- |
| Daniel Teles       | Encadeamento de restrições de busca `ExerciseSearchChain` para permitir múltiplos testes dinâmicos de filtro. | Excelente         | `backend/src/infrastructure/database/exercise-search.chain.ts` |

## Histórico de versões

| **Versão** | **Data**   | **Descrição**                                                                                                                       | **Autor**               |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1.0        | 19/05/2026 | Registro de participações nos padrões GoF do módulo de onboarding (Singleton, Bridge, Facade, Memento, Template Method).            | Lucas Antunes           |
| 1.1        | 20/05/2026 | Registro de participações nos padrões GoF do módulo de autenticação (Factory Method, Decorator, Facade, Template Method, Observer). | Samuel Nogueira Caetano |
| 1.2        | 20/05/2026 | Adição de participações nos padrões GoF do módulo de exercises (Builder, Decorator, Chain of Responsibility).                       | Daniel Teles            |
