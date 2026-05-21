# 3.4. Participações — Padrões de Projeto

Breve relato sobre as participações/contribuições de cada membro à entrega. Todos devem participar, mostrando seus pontos de vista e como colaboraram em cada etapa com comprobatórios.

---

## GoFs Criacionais

### Singleton — Módulo de Onboarding

**Contexto:** Implementação de `OnboardingClassificationRules` como Singleton de domínio, centralizando o algoritmo de pontuação de perfil de treino. A instância única garante fonte de verdade única para todos os classificadores.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Modelagem do Singleton, implementação de `calculateScore()` e sub-métodos de pontuação por critério (experiência, frequência, técnica, consistência), testes unitários (5 casos), documentação | Excelente | `backend/src/domain/onboarding/rules/` |
| Giovanni Dornelas Ferreira | Multiton `HistoryManager`, integração com `HistoryService` e `HistoryObserver`, repositório `findCompletedByUserId`, RF26/RF27, documentação | Excelente | `backend/src/domain/history/history-manager.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Builder — Módulo de Exercises

**Contexto:** Implementação de `ExerciseBuilder` para garantir a criação correta do agregado `Exercise` com seus value objects vinculados.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Daniel Teles | Modelagem do Builder para gerenciar construção de exercícios, separando a lógica inline do UseCase e melhorando segurança da criação. | Excelente | `backend/src/domain/exercises/builders/` |

---

## GoFs Estruturais

### Bridge + Facade — Módulo de Onboarding

**Contexto (Bridge):** Separação da hierarquia de fluxos (`OnboardingFlow`) da hierarquia de classificadores (`ProfileClassifier`), permitindo que homens e mulheres sejam classificados por implementações distintas sem acoplar o fluxo ao sexo.

**Contexto (Facade):** `OnboardingFacade` como único ponto de entrada da camada de apresentação para o subsistema de onboarding, encapsulando três use cases e isolando o controller de dependências diretas com o domínio.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Bridge: abstração `OnboardingFlow`, `StrengthOnboardingFlow`, interface `ProfileClassifier`, `MaleProfileClassifier`, `FemaleProfileClassifier`, testes (6 casos). Facade: `OnboardingFacade`, integração com `OnboardingController` | Excelente | `backend/src/domain/onboarding/bridge/`, `backend/src/presentation/facades/` |
| Giovanni Dornelas Ferreira | Proxy `HistoryServiceProxy`, interface `IHistoryService`, serviço real `HistoryService`, wiring em `HistoryModule`, `HistoryController`, documentação | Excelente | `backend/src/infrastructure/services/history-service.proxy.ts`, `backend/src/application/services/history.service.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Decorator — Módulo de Exercises

**Contexto:** Padrões Caching e Logging ao redor do repositório base para ganho em observabilidade e performance.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Daniel Teles | Adição de Decorators `CachingExerciseRepository` e `LoggingExerciseRepository` em volta do Postgres Repository, mantendo OCP e SRP. | Excelente | `backend/src/infrastructure/database/` e `backend/src/infrastructure/modules/` |

---

## GoFs Comportamentais

### Memento + Template Method — Módulo de Onboarding

**Contexto (Memento):** Captura do estado do perfil de treino antes de um redo, preservando o histórico completo de classificações no banco sem violar o encapsulamento da entidade `TrainingProfile`.

**Contexto (Template Method):** Esqueleto imutável do fluxo de classificação em `OnboardingFlow.execute()`, com hooks `beforeClassify()` e `afterClassify()` extensíveis por subclasses, composto com o Bridge para separar *quando* de *como*.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Memento: `OnboardingMementoVO`, `createMemento()` em `TrainingProfile`, `RedoOnboardingUseCase` (caretaker), `onboarding_history` (ORM + repositório), testes (5 casos). Template Method: `execute()` em `OnboardingFlow`, hooks protegidos, `StrengthOnboardingFlow` | Excelente | `backend/src/domain/onboarding/entities/`, `backend/src/domain/onboarding/value-objects/`, `backend/src/domain/onboarding/bridge/`, `backend/src/infrastructure/database/` |
| Giovanni Dornelas Ferreira | Observer: `WorkoutSessionSubject`, `HistoryObserver`, `SessionObserver`, integração em `RegisterSessionUseCase.notify()`, inscrição em `HistoryModule.onModuleInit`, documentação | Excelente | `backend/src/domain/history/observers/`, `backend/src/application/use-cases/session/register-session.use-case.ts` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

---

### Multiton + Proxy + Observer — Módulo de Histórico de Sessões (visão integrada)

**Contexto:** Implementação dos requisitos RF26 (listar histórico de sessões concluídas com detalhes) e RF27 (filtrar por período), com três padrões GoF que se complementam: Multiton mantém cache por usuário; Observer atualiza o cache ao registrar sessão; Proxy controla acesso e auditoria nas leituras.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Giovanni Dornelas Ferreira | Módulo completo de histórico (domain, application, infrastructure, presentation), ativação de `SessionModule`/`HistoryModule` no `AppModule`, correção do `TrainingSessionBuilder`, documentação Wiki | Excelente | Branch `feat/modulo-historico`, `backend/src/domain/history/`, `backend/src/infrastructure/modules/history.module.ts`, [3.1](../padroes-de-projeto/3-1-gofs-criacionais.md#módulo-de-histórico-de-sessões) |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

---

## [Módulo / padrão: ____________] — A preencher

> Use esta seção ou adicione novas subseções para outros módulos da equipe.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

### Chain of Responsibility — Módulo de Exercises

**Contexto:** Construção elástica da query de busca através de uma pipeline de handlers.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Daniel Teles | Encadeamento de restrições de busca `ExerciseSearchChain` para permitir múltiplos testes dinâmicos de filtro. | Excelente | `backend/src/infrastructure/database/exercise-search.chain.ts` |

---

## Histórico de versões

| Versão | Data       | Descrição                                                                                                                    | Autor         |
|--------|------------|------------------------------------------------------------------------------------------------------------------------------|---------------|
| 1.0    | 19/05/2026 | Registro de participações nos padrões GoF do módulo de onboarding (Singleton, Bridge, Facade, Memento, Template Method)      | Lucas Antunes |
| 1.1    | 20/05/2026 | Participações no módulo de histórico (Multiton, Proxy, Observer) — RF26/RF27                                                | Giovanni Dornelas Ferreira |
| Versão | Data       | Descrição | Autor |
|--------|------------|-----------|-------|
| 1.0    | 19/05/2026 | Registro de participações nos padrões GoF do módulo de onboarding | Lucas Antunes |
| 1.1    | 20/05/2026 | Adição de participações de Exercises | Daniel Teles |
