# 3. Desenho de Software — Padrões de Projeto

A Wiki/GitPages do Projeto deve conter um tópico dedicado ao Módulo Desenho de Software (Padrões de Projeto), com três subtópicos principais: [3.1 GoFs Criacionais](3-1-gofs-criacionais.md), [3.2 GoFs Estruturais](3-2-gofs-estruturais.md) e [3.3 GoFs Comportamentais](3-3-gofs-comportamentais.md). Adicionalmente, deve constar um subtópico sobre as participações, conforme [3.4 Participações](3-4-participacoes-padroes.md). Por fim, pode constar um subtópico chamado [3.5 Iniciativas Extras](3-5-iniciativas-extras.md), no qual podem ser colocadas quaisquer iniciativas extras, caso ocorram.

**Para cada foco, revelar principalmente: Rastreabilidade & Elos com Outros Artefatos, Senso Crítico, Referências, Versionamentos & Participações e Metodologia.**

## Objetivo

Documentar os padrões de projeto GoF (Gang of Four) aplicados no desenvolvimento do MonitoreSeuTreino, evidenciando as decisões de design, justificativas arquiteturais e rastreabilidade com os requisitos e camadas do sistema. Cada padrão é registrado com problema, justificativa, modelagem, implementação, evidência de execução e senso crítico.

## GoFs implementados até o momento

A tabela abaixo consolida todos os padrões implementados. Cada seção dos documentos filhos está identificada pelo módulo responsável.

| Categoria | Padrão | Módulo | Responsável | Classe / Artefato central | Endpoint relacionado |
|---|---|---|---|---|---|
| **Criacional** | Singleton | Onboarding | Lucas Antunes | `OnboardingClassificationRules` | `POST /v1/onboarding` |
| **Criacional** | Factory Method | Autenticação | Samuel Nogueira Caetano | `User.create()`, `RefreshToken.create()` | `POST /v1/auth/signup`, `POST /v1/auth/login` |
| **Criacional** | Builder | Exercises | Daniel Teles | `ExerciseBuilder` | `POST /v1/exercises` |
| **Criacional** | Multiton | Histórico | Giovanni Dornelas Ferreira | `HistoryManager.getInstance(userId)` | `GET /v1/history/sessions` |
| **Criacional** | Builder | Usuário | André Ricardo Meyer de Melo | `PasswordResetRequestBuilder`, `AccountDeletionRequestBuilder` | `POST /v1/auth/password-reset/request`, `DELETE /v1/users/me` |
| **Criacional** | Builder | Sessão de Treino | Eduardo Waski | `TrainingSessionBuilder` | `POST /v1/sessions` |
| **Criacional** | Prototype | Rotinas | José Victor Gabriel Menezes da Costa | `Routine.clone()` | `POST /v1/routines/:id/clone` |
| **Criacional** | Factory Method | Monitoramento Semanal | João Maurício Pilla Nascimento | `WeeklyPeriodFactory.create()` | `GET /v1/tracking/weekly-summary` |
| **Estrutural** | Bridge | Onboarding | Lucas Antunes | `OnboardingFlow` + `ProfileClassifier` | `POST /v1/onboarding` |
| **Estrutural** | Facade | Onboarding | Lucas Antunes | `OnboardingFacade` | `GET/POST/PUT /v1/onboarding` |
| **Estrutural** | Facade | Autenticação | Samuel Nogueira Caetano | `AuthenticationFacade` | `POST /v1/auth/login`, `POST /v1/auth/logout` |
| **Estrutural** | Decorator | Autenticação | Samuel Nogueira Caetano | `CachingUserRepository`, `LoggingUserRepository` | Diversos via infraestrutura |
| **Estrutural** | Decorator | Exercises | Daniel Teles | `CachingExerciseRepository`, `LoggingExerciseRepository` | `GET/POST/PUT /v1/exercises` |
| **Estrutural** | Proxy | Histórico | Giovanni Dornelas Ferreira | `HistoryServiceProxy` → `HistoryService` | `GET /v1/history/sessions` |
| **Estrutural** | Facade | Usuário | André Ricardo Meyer de Melo | `PasswordResetFacade`, `AccountDeletionFacade` | `POST /v1/auth/password-reset/request`, `DELETE /v1/users/me` |
| **Estrutural** | Composite | Sessão de Treino | Eduardo Waski | `WorkoutComponent` (Interface), `ExerciseNode` (Composite), `TrainingSet` (Leaf) | `POST /v1/sessions` |
| **Estrutural** | Proxy | Rotinas | José Victor Gabriel Menezes da Costa | `RoutineRepositoryProxy` | Diversos repositórios |
| **Estrutural** | Facade | Monitoramento Semanal | João Maurício Pilla Nascimento | `TrackingFacade` | `GET /v1/tracking/weekly-summary` |
| **Comportamental** | Memento | Onboarding | Lucas Antunes | `TrainingProfile.createMemento()` + `OnboardingMementoVO` | `PUT /v1/onboarding` |
| **Comportamental** | Template Method | Onboarding | Lucas Antunes | `OnboardingFlow.execute()` | `POST /v1/onboarding` |
| **Comportamental** | Template Method | Autenticação | Samuel Nogueira Caetano | `UseCase<TInput, TOutput>.execute()` | Diversos |
| **Comportamental** | Observer | Autenticação | Samuel Nogueira Caetano | `DomainEventBus`, `AggregateRoot.pullDomainEvents()` | Diversos |
| **Comportamental** | Observer | Histórico | Giovanni Dornelas Ferreira | `WorkoutSessionSubject` + `HistoryObserver` | `POST /v1/sessions` |
| **Comportamental** | Chain of Responsibility | Exercises | Daniel Teles | `ExerciseSearchChain` | `GET /v1/exercises` |
| **Comportamental** | Chain of Responsibility | Usuário | André Ricardo Meyer de Melo | `Handler` (RF04 / RF07) | `POST /v1/auth/password-reset/request`, `DELETE /v1/users/me` |
| **Comportamental** | Iterator | Sessão de Treino | Eduardo Waski | `TrainingSetIterator` | `POST /v1/sessions` |
| **Comportamental** | Mediator | Rotinas | José Victor Gabriel Menezes da Costa | `DomainEventBus` + `DeactivateOtherRoutinesHandler` | `PATCH /v1/routines/:id/activate` |
| **Comportamental** | Strategy | Monitoramento Semanal | João Maurício Pilla Nascimento | `DefaultWeeklySummaryCalculator` + estratégias de cálculo | `GET /v1/tracking/weekly-summary` |

## Organização do módulo

| Seção | Descrição |
|---|---|
| [3.1 GoFs Criacionais](3-1-gofs-criacionais.md) | Padrões que tratam da criação de objetos — **Singleton** (Onboarding), **Factory Method** (Autenticação), **Builder** (Exercises, Usuário, Sessão de Treino), **Multiton** (Histórico) e **Factory Method** (Monitoramento Semanal). |
| [3.2 GoFs Estruturais](3-2-gofs-estruturais.md) | Padrões de composição de classes e objetos — **Bridge** e **Facade** (Onboarding), **Facade** e **Decorator** (Autenticação), **Decorator** (Exercises), **Proxy** (Histórico), **Facade** (Usuário), **Composite** (Sessão de Treino) e **Facade** (Monitoramento Semanal). |
| [3.3 GoFs Comportamentais](3-3-gofs-comportamentais.md) | Padrões de interação e distribuição de responsabilidade — **Memento** e **Template Method** (Onboarding), **Template Method** e **Observer** (Autenticação), **Observer** (Histórico), **Chain of Responsibility** (Exercises, Usuário), **Iterator** (Sessão de Treino) e **Strategy** (Monitoramento Semanal). |
| [3.4 Participações](3-4-participacoes-padroes.md) | Registro individual das contribuições de cada membro, com significância e comprobatórios por padrão implementado. |
| [3.5 Iniciativas Extras](3-5-iniciativas-extras.md) | Iniciativas além do escopo mínimo — testes de integração, documentação de API, organização de arquivos por padrão de módulo. |

## Critérios adotados

Os padrões foram selecionados e documentados seguindo os critérios abaixo:

1. **Problema real**: o padrão só foi aplicado quando havia um problema arquitetural concreto que justificasse a indireção — não foi usado por completude ou para demonstração acadêmica isolada.
2. **Análise de alternativas**: cada padrão escolhido tem uma tabela de alternativas avaliadas e rejeitadas com justificativa explícita.
3. **Rastreabilidade completa**: todo padrão mapeia artefatos de código, camada de arquitetura, endpoint HTTP e elos com outros padrões GoF do projeto.
4. **Senso crítico**: cada seção identifica benefícios e limitações da escolha, incluindo o que _não_ foi resolvido e possíveis evoluções futuras.
5. **Evidência de execução**: testes unitários ou de integração verificáveis via `docker compose exec api npx jest` comprovam o comportamento implementado.
6. **Separação por módulo**: cada documento de padrão é organizado por módulo de negócio, facilitando contribuições independentes por membro da equipe.

## Como contribuir com sua seção

Caso mais padrões precisem ser adicionados nos documentos filhos (3-1, 3-2, 3-3), busque a seção **"[Módulo: ____________] — A preencher"** ao final, se disponível, ou adicione um novo bloco com as marcações Markdown. Para adicionar sua contribuição:

1. Identifique o padrão GoF aplicado no seu módulo.
2. Abra o arquivo correspondente ao tipo: criacional, estrutural ou comportamental.
3. Preencha a seção de placeholder com o nome do seu módulo e branch, ou crie uma nova seção seguindo a estrutura existente.
4. Siga a estrutura de referência dos módulos já documentados no mesmo arquivo.
5. Registre sua participação em [3.4 Participações](3-4-participacoes-padroes.md).
6. Atualize a tabela **"GoFs implementados até o momento"** neste arquivo.

## Histórico de versões

| Versão | Data | Descrição | Autor |
|---|---|---|---|
| 1.0 | 19/05/2026 | Estruturação do módulo de padrões de projeto com todos os GoFs do módulo de Onboarding documentados. | Lucas Antunes |
| 1.1 | 20/05/2026 | Inclusão dos padrões estruturais, criacionais e comportamentais do módulo de Autenticação na tabela de documentação base. | Samuel Nogueira Caetano |
| 1.2 | 20/05/2026 | Inclusão dos GoFs do módulo de Histórico: Multiton, Proxy e Observer. | Giovanni Dornelas Ferreira |
| 1.3 | 21/05/2026 | Atualização do painel de GoFs com os padrões do módulo de Exercises. | Daniel Teles |
| 1.4 | 21/05/2026 | Inclusão dos GoFs do módulo de Usuário (Builder, Facade, Chain of Responsibility) — RF04 e RF07. | André Ricardo Meyer de Melo |
| 1.5 | 21/05/2026 | Inclusão dos GoFs do módulo de Sessão de Treino (Builder, Composite, Iterator) e atualização consolidada. | Eduardo Waski |
| 1.6 | 21/05/2026 | Inclusão dos Gofs do módulo de Rotinas (Prototype, Mediator e Proxy) | José Victor Gabriel Menezes da Costa |
| 1.7 | 21/05/2026 | Inclusão dos GoFs do módulo de Monitoramento Semanal (Factory Method, Facade e Strategy) |  João Maurício Pilla Nascimento |