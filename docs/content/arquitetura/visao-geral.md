# Visão Geral da Arquitetura

## Objetivo desta seção

Apresentar a arquitetura do MonitoreSeuTreino de forma resumida, contextualizando as camadas e módulos onde os padrões GoF foram aplicados. Para detalhes de cada padrão, consulte as seções [3.1](../padroes-de-projeto/3-1-gofs-criacionais.md), [3.2](../padroes-de-projeto/3-2-gofs-estruturais.md) e [3.3](../padroes-de-projeto/3-3-gofs-comportamentais.md).

## Organização geral

O sistema é composto por quatro serviços orquestrados via Docker Compose:

| Serviço | Tecnologia       | Porta | Responsabilidade                   |
|---------|------------------|-------|------------------------------------|
| `db`    | PostgreSQL 16    | 5433  | Persistência relacional            |
| `api`   | NestJS + TypeORM | 3000  | Lógica de negócio e endpoints REST |
| `web`   | React + Vite     | 5173  | Interface do usuário               |
| `docs`  | MkDocs Material  | 8000  | Documentação do projeto            |

### Backend — Clean Architecture por módulo

O backend segue **Clean Architecture** com separação estrita entre camadas. Nenhuma camada importa de uma camada externa.

```
Domain → Application → Presentation → Infrastructure
```

| Camada             | Responsabilidade                                                       | Exemplos no módulo de Onboarding                            |
|--------------------|------------------------------------------------------------------------|-------------------------------------------------------------|
| **Domain**         | Entidades, value objects, interfaces de repositório, regras de negócio | `TrainingProfile`, `OnboardingAnswers`, `ProfileClassifier` |
| **Application**    | Use cases, orquestração, DTOs de entrada/saída                         | `SubmitOnboardingUseCase`, `RedoOnboardingUseCase`          |
| **Presentation**   | Controllers, facades, view models, guards, filtros                     | `OnboardingController`, `OnboardingFacade`                  |
| **Infrastructure** | ORM entities, repositórios concretos, módulos NestJS                   | `TrainingProfileOrmEntity`, `OnboardingModule`              |

### Frontend — Feature-based Architecture

O frontend organiza o código por funcionalidade, não por tipo de arquivo:

```
app/ (router, providers, layouts)
features/
  auth/     (login, cadastro, guards)
  onboarding/ (formulário, resultado)
  dashboard/  (tela principal)
shared/     (components, hooks, lib, utils)
```

O fluxo de dados segue: `Page → Component → Hook (React Query) → Service → API Client (Axios) → Backend`.

## Diagrama de camadas

```mermaid
graph TD
    subgraph Frontend
        FE_Page[Page]
        FE_Hook[Hook - React Query]
        FE_Client[API Client - Axios]
    end

    subgraph Backend
        BE_Controller[Controller - Presentation]
        BE_Facade[Facade - Presentation]
        BE_UseCase[Use Case - Application]
        BE_Domain[Domain - Entities/VOs/Rules]
        BE_Infra[Repository - Infrastructure]
    end

    DB[(PostgreSQL)]

    FE_Page --> FE_Hook
    FE_Hook --> FE_Client
    FE_Client -->|HTTP REST| BE_Controller
    BE_Controller --> BE_Facade
    BE_Facade --> BE_UseCase
    BE_UseCase --> BE_Domain
    BE_UseCase --> BE_Infra
    BE_Infra --> DB
```

## Módulos implementados

| Módulo       | Backend                                          | Frontend                                       | Status       |
|--------------|--------------------------------------------------|------------------------------------------------|--------------|
| Autenticação | `auth/` (JWT, refresh token, guards)             | `features/auth/` (login, cadastro)             | Implementado |
| Onboarding   | `onboarding/` (perfil, histórico, classificação) | `features/onboarding/` (formulário, resultado) | Implementado |
| Sessões      | `session/` (registro de treino, composite)       | —                                              | Implementado (API) |
| Histórico    | `history/` (RF26, RF27, Multiton, Proxy, Observer) | —                                            | Implementado (API) |
| Dashboard    | —                                                | `features/dashboard/` (tela inicial)           | Parcial      |
| Treinos      | —                                                | —                                              | Planejado    |

## Relação com os padrões GoF

Os padrões GoF estão distribuídos nos módulos de **Onboarding** e **Histórico de Sessões**. A tabela abaixo localiza cada padrão na arquitetura:

| Padrão          | Módulo     | Camada                  | Localização                                               | Problema resolvido                                                    |
|-----------------|------------|-------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------|
| Singleton       | Onboarding | Domain                  | `domain/onboarding/rules/`                                | Fonte única de regras de classificação para múltiplos classificadores |
| Multiton        | Histórico  | Domain                  | `domain/history/history-manager.ts`                       | Uma instância de gerenciador de histórico por usuário autenticado     |
| Bridge          | Onboarding | Domain                  | `domain/onboarding/bridge/`                               | Separar hierarquia de fluxos da hierarquia de classificadores         |
| Facade          | Onboarding | Presentation            | `presentation/facades/`                                   | Isolar o controller do subsistema interno de use cases                |
| Proxy           | Histórico  | Infrastructure          | `infrastructure/services/history-service.proxy.ts`        | Validar acesso, auditar e delegar ao serviço real de histórico        |
| Memento         | Onboarding | Domain + Infrastructure | `domain/onboarding/entities/`, `infrastructure/database/` | Preservar estado anterior do perfil antes de um redo                  |
| Template Method | Onboarding | Domain                  | `domain/onboarding/bridge/` (OnboardingFlow)              | Garantir sequência imutável do algoritmo de classificação             |
| Observer        | Histórico  | Domain + Application    | `domain/history/observers/`, `register-session.use-case`  | Atualizar histórico automaticamente ao concluir sessão de treino      |

## Histórico de versões

| Versão | Data       | Descrição                                                                          | Autor         |
|--------|------------|------------------------------------------------------------------------------------|---------------|
| 1.0    | 19/05/2026 | Visão geral da arquitetura com localização dos padrões GoF do módulo de onboarding | Lucas Antunes |
| 1.1    | 20/05/2026 | Inclusão dos módulos Sessões e Histórico com padrões Multiton, Proxy e Observer   | Giovanni Dornelas Ferreira |
