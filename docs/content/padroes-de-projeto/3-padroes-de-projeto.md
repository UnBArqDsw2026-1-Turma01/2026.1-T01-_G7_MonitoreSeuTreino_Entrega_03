# 3. Desenho de Software — Padrões de Projeto

A Wiki/GitPages do Projeto deve conter um tópico dedicado ao Módulo Desenho de Software (Padrões de Projeto), com três subtópicos principais: [3.1 GoFs Criacionais](3-1-gofs-criacionais.md), [3.2 GoFs Estruturais](3-2-gofs-estruturais.md) e [3.3 GoFs Comportamentais](3-3-gofs-comportamentais.md). Adicionalmente, deve constar um subtópico sobre as participações, conforme [3.4 Participações](3-4-participacoes-padroes.md). Por fim, pode constar um subtópico chamado [3.5 Iniciativas Extras](3-5-iniciativas-extras.md), no qual podem ser colocadas quaisquer iniciativas extras, caso ocorram (opcional).

**Para cada foco, revelar principalmente: Rastreabilidade & Elos com Outros Artefatos, Senso Crítico, Referências, Versionamentos & Participações e Metodologia.**

## Objetivo

Documentar os padrões de projeto GoF (Gang of Four) aplicados no desenvolvimento do MonitoreSeuTreino, evidenciando as decisões de design, justificativas arquiteturais e rastreabilidade com os requisitos e camadas do sistema. Cada padrão é registrado com problema, justificativa, modelagem, implementação, evidência de execução e senso crítico.

## GoFs implementados até o momento

A tabela abaixo consolida todos os padrões implementados. Cada seção dos documentos filhos está identificada pelo módulo responsável.

| Categoria        | Padrão          | Módulo         | Responsável   | Classe / Artefato central                          | Endpoint relacionado              |
|------------------|-----------------|----------------|---------------|----------------------------------------------------|-----------------------------------|
| **Criacional**   | Singleton       | Onboarding     | Lucas Antunes | `OnboardingClassificationRules`                    | `POST /v1/onboarding`             |
| **Estrutural**   | Bridge          | Onboarding     | Lucas Antunes | `OnboardingFlow` + `ProfileClassifier`             | `POST /v1/onboarding`             |
| **Estrutural**   | Facade          | Onboarding     | Lucas Antunes | `OnboardingFacade`                                 | `GET/POST/PUT /v1/onboarding`     |
| **Comportamental** | Memento       | Onboarding     | Lucas Antunes | `TrainingProfile.createMemento()` + `OnboardingMementoVO` | `PUT /v1/onboarding`       |
| **Comportamental** | Template Method | Onboarding  | Lucas Antunes | `OnboardingFlow.execute()`                         | `POST /v1/onboarding`             |
| **Criacional**   | Multiton        | Histórico    | Giovanni Dornelas Ferreira | `HistoryManager.getInstance(userId)` | `GET /v1/history/sessions`        |
| **Estrutural**   | Proxy           | Histórico    | Giovanni Dornelas Ferreira | `HistoryServiceProxy` → `HistoryService` | `GET /v1/history/sessions`        |
| **Comportamental** | Observer      | Histórico    | Giovanni Dornelas Ferreira | `WorkoutSessionSubject` + `HistoryObserver` | `POST /v1/sessions`               |
| Criacional       | [A definir]     | [Módulo]       | [Nome]        | —                                                  | —                                 |
| Estrutural       | [A definir]     | [Módulo]       | [Nome]        | —                                                  | —                                 |
| Comportamental   | [A definir]     | [Módulo]       | [Nome]        | —                                                  | —                                 |
| **Criacional**   | Builder         | Exercises      | Daniel Teles       | `ExerciseBuilder`                                  | `POST /v1/exercises`              |
| **Estrutural**   | Decorator       | Exercises      | Daniel Teles       | `CachingExerciseRepository` / `Logging...` | `GET/POST/PUT /v1/exercises`      |
| **Comportamental** | Chain of Resp.  | Exercises    | Daniel Teles       | `ExerciseSearchChain`                              | `GET /v1/exercises`               |

## Organização do módulo

| Seção                    | Descrição                                                                                                       |
|--------------------------|-----------------------------------------------------------------------------------------------------------------|
| [3.1 GoFs Criacionais](3-1-gofs-criacionais.md) | Singleton (Onboarding), Builder (Exercícios), Multiton (Histórico) |
| [3.2 GoFs Estruturais](3-2-gofs-estruturais.md) | Bridge e Facade (Onboarding); Decorator (Exercícios); Proxy (Histórico) |
| [3.3 GoFs Comportamentais](3-3-gofs-comportamentais.md) | Memento e Template Method (Onboarding); Chain of Responsibility (Exercícios); Observer (Histórico) |
| [3.4 Participações](3-4-participacoes-padroes.md) | Registro individual das contribuições de cada membro, com significância e comprobatórios por padrão implementado |
| [3.5 Iniciativas Extras](3-5-iniciativas-extras.md) | Iniciativas além do escopo mínimo — testes de integração, documentação de API, organização de arquivos por padrão de módulo |

## Critérios adotados

Os padrões foram selecionados e documentados seguindo os critérios abaixo:

1. **Problema real**: o padrão só foi aplicado quando havia um problema arquitetural concreto que justificasse a indireção — não foi usado por completude ou para demonstração acadêmica isolada.
2. **Análise de alternativas**: cada padrão escolhido tem uma tabela de alternativas avaliadas e rejeitadas com justificativa explícita.
3. **Rastreabilidade completa**: todo padrão mapeia artefatos de código (arquivos, classes, interfaces), camada de arquitetura, endpoint HTTP e elos com outros padrões GoF do projeto.
4. **Senso crítico**: cada seção identifica benefícios e limitações da escolha, incluindo o que *não* foi resolvido e possíveis evoluções futuras.
5. **Evidência de execução**: testes unitários ou de integração verificáveis via `docker compose exec api npx jest` comprovam o comportamento implementado.
6. **Separação por módulo**: cada documento de padrão é organizado por módulo de negócio (ex.: Onboarding, Autenticação), facilitando contribuições independentes por membro da equipe.

## Como contribuir com sua seção

Cada documento de GoF (3-1, 3-2, 3-3) contém uma seção **"[Módulo: ____________] — A preencher"** ao final, com instruções detalhadas. Para adicionar sua contribuição:

1. Identifique o padrão GoF aplicado no seu módulo.
2. Abra o arquivo correspondente ao tipo (criacional/estrutural/comportamental).
3. Preencha a seção de placeholder com o nome do seu módulo e branch.
4. Siga a estrutura de referência do **Módulo de Onboarding** ou do **Módulo de Histórico de Sessões** no mesmo arquivo (ou substitua a seção **"[Módulo: ____________] — A preencher"** ao final do documento).
5. Registre sua participação em [3.4 Participações](3-4-participacoes-padroes.md).
6. Atualize a tabela **"GoFs implementados"** neste arquivo.

## Histórico de versões

| Versão | Data       | Descrição                                                                                           | Autor         |
|--------|------------|-----------------------------------------------------------------------------------------------------|---------------|
| 1.0    | 19/05/2026 | Estruturação do módulo de padrões de projeto com todos os GoFs do módulo de onboarding documentados | Lucas Antunes |
| 1.1    | 21/05/2026 | Atualização do painel de GoFs com o módulo de exercícios                                        | Daniel Teles               |
| 1.2    | 20/05/2026 | Inclusão dos GoFs do módulo de histórico (Multiton, Proxy, Observer) — RF26 e RF27              | Giovanni Dornelas Ferreira |
