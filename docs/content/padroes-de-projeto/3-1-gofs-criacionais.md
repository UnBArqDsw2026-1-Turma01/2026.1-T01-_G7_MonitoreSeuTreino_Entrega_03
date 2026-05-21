# 3.1. GoFs Criacionais

## Introdução

Os padrões criacionais tratam do processo de criação de objetos, abstraindo a lógica de instanciação e permitindo que o sistema seja independente de como seus objetos são criados, compostos e representados.

Este documento reúne as contribuições de **todos os módulos do projeto**. Cada seção identifica o módulo, o integrante responsável e o padrão GoF aplicado. Ao final do arquivo, a seção **"[Módulo: ____________] — A preencher"** permanece disponível para novas contribuições — siga a estrutura das seções de Onboarding ou Histórico de Sessões como referência.

---

## Módulo de Onboarding

> **Responsável:** Lucas Antunes | **Branch:** `feat/modulo-on-boarding`
>
> Contexto: o desafio criacional era garantir que as **regras de classificação de perfil** tivessem uma única fonte de verdade em toda a aplicação, sem que diferentes partes do código pudessem criar instâncias divergentes com comportamentos distintos.

### Padrões analisados

| Padrão           | Possível aplicação                          | Status          | Justificativa                                                                               |
|------------------|---------------------------------------------|-----------------|---------------------------------------------------------------------------------------------|
| **Singleton**    | Instância única das regras de classificação | Selecionado     | Regras de negócio imutáveis, acesso global necessário em múltiplos classificadores          |
| Factory Method   | Criação de classificadores por sexo         | Avaliado        | Substituído pelo Bridge, que resolve também o problema de variação de comportamento         |
| Abstract Factory | Família de objetos de classificação         | Não selecionado | Complexidade desnecessária; o Bridge cobre a variação sem multiplicar famílias de factories |
| Builder          | Construção de `OnboardingAnswers`           | Avaliado        | Value Object com validação inline é suficiente; Builder adicionaria indireção sem ganho     |
| Prototype        | Clonagem de perfis ao refazer onboarding    | Não selecionado | O Memento cobre a necessidade de preservar estado anterior de forma mais semântica          |

### Padrão implementado — Singleton · `OnboardingClassificationRules`

## Problema arquitetural

O módulo de classificação de perfil possui dois classificadores independentes: `MaleProfileClassifier` e `FemaleProfileClassifier`. Ambos precisam executar **exatamente o mesmo algoritmo de pontuação** — a lógica de atribuição de pontos por experiência, frequência, técnica, consistência etc. é idêntica; o que difere é apenas o fluxo de execução (Bridge).

Se cada classificador instanciasse seu próprio objeto de regras, haveria dois problemas concretos:

1. **Inconsistência silenciosa**: qualquer alteração nas regras de pontuação precisaria ser replicada em múltiplos lugares. Uma divergência geraria classificações diferentes para homens e mulheres com respostas idênticas — um bug difícil de rastrear.
2. **Overhead de memória desnecessário**: as regras são stateless e imutáveis após criação. Criar múltiplas instâncias seria desperdício sem nenhum ganho.

## Justificativa da escolha

O Singleton garante que exista **uma única instância** de `OnboardingClassificationRules` em toda a execução da aplicação. Isso resolve os dois problemas:

- **Fonte única de verdade**: qualquer mudança nas regras de pontuação impacta todos os classificadores automaticamente.
- **Acesso controlado**: a instância é obtida via `getInstance()`, tornando explícito no código que se trata de um recurso compartilhado.
- **Imutabilidade garantida**: a instância não expõe estado mutável; `calculateScore()` é uma função pura que recebe `OnboardingAnswers` e retorna um número.

A alternativa de injeção de dependência via NestJS foi avaliada, mas as regras de classificação pertencem à **camada de domínio** e não devem depender do container IoC da infraestrutura. O Singleton de domínio mantém essa independência.

## Modelagem

```mermaid
classDiagram
    class OnboardingClassificationRules {
        -instance: OnboardingClassificationRules$
        -constructor()
        +getInstance()$ OnboardingClassificationRules
        +calculateScore(answers: OnboardingAnswers) number
        -scoreExperience(months: number) number
        -scoreFrequency(freq: number) number
        -scoreTechnique(level: TechniqueLevel) number
        -scoreConsistency(level: ConsistencyLevel) number
    }

    class MaleProfileClassifier {
        -rules: OnboardingClassificationRules
        +classify(answers) ClassificationResult
    }

    class FemaleProfileClassifier {
        -rules: OnboardingClassificationRules
        +classify(answers) ClassificationResult
    }

    OnboardingClassificationRules <.. MaleProfileClassifier : getInstance()
    OnboardingClassificationRules <.. FemaleProfileClassifier : getInstance()
```

## Implementação

| Elemento                             | Caminho                                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------------------|
| Singleton (regras)                   | `backend/src/domain/onboarding/rules/onboarding-classification-rules.singleton.ts`      |
| Consumidor — classificador masculino | `backend/src/domain/onboarding/bridge/male-profile-classifier.ts`                       |
| Consumidor — classificador feminino  | `backend/src/domain/onboarding/bridge/female-profile-classifier.ts`                     |
| Testes unitários                     | `backend/src/domain/onboarding/rules/onboarding-classification-rules.singleton.spec.ts` |

### Trecho central

```typescript
// onboarding-classification-rules.singleton.ts
export class OnboardingClassificationRules {
  private static instance: OnboardingClassificationRules;

  private constructor() {}

  static getInstance(): OnboardingClassificationRules {
    if (!OnboardingClassificationRules.instance) {
      OnboardingClassificationRules.instance = new OnboardingClassificationRules();
    }
    return OnboardingClassificationRules.instance;
  }

  calculateScore(answers: OnboardingAnswers): number {
    return (
      this.scoreExperience(answers.experienceMonths) +
      this.scoreFrequency(answers.weeklyFrequency) +
      (answers.followedStructuredPlan ? 1 : 0) +
      this.scoreTechnique(answers.techniqueLevel) +
      (answers.usesProgressiveLoad ? 1 : 0) +
      this.scoreConsistency(answers.recentConsistency)
    );
  }
  // ...
}

// male-profile-classifier.ts — consumo do Singleton
export class MaleProfileClassifier implements ProfileClassifier {
  private readonly rules = OnboardingClassificationRules.getInstance();

  classify(answers: OnboardingAnswers): ClassificationResult {
    const score = this.rules.calculateScore(answers);
    return ClassificationResult.create(score);
  }
}
```

## Evidência de execução

Os testes unitários verificam a propriedade fundamental do Singleton:

```
✓ getInstance() retorna sempre a mesma instância
✓ score mínimo (todas as respostas mais baixas) = 0
✓ score máximo (todas as respostas mais altas) = 10
✓ experiência < 6 meses contribui com 0 pontos
✓ experiência 6–18 meses contribui com 1 ponto
✓ perfil intermediário produz score = 6
```

Execute no container:

```bash
sudo docker compose exec api npx jest onboarding-classification-rules --verbose
```

## Rastreabilidade

| Artefato                          | Relação                                                     |
|-----------------------------------|-------------------------------------------------------------|
| Requisito                         | Classificar usuário em BEGINNER / INTERMEDIATE / ADVANCED   |
| Módulo                            | `domain/onboarding/rules`                                   |
| Camada                            | Domínio                                                     |
| Padrão estrutural relacionado     | Bridge (classificadores consomem o Singleton)               |
| Padrão comportamental relacionado | Memento (usa `ClassificationResult` produzido pelas regras) |
| Arquivo de testes                 | `rules/onboarding-classification-rules.singleton.spec.ts`   |

## Senso crítico

### Benefícios

- **Consistência garantida em tempo de compilação**: ambos os classificadores chamam `getInstance()` — é impossível apontar para instâncias diferentes por acidente.
- **Domínio puro**: a classe não tem dependência de framework (zero imports de NestJS ou TypeORM), o que a torna testável de forma isolada com `jest` sem nenhum mock de infraestrutura.
- **Algoritmo centralizado**: quando as regras de negócio mudarem (ex.: reponderar a frequência), há um único lugar para alterar.

### Limitações

- **Testabilidade do Singleton em si**: como a instância persiste entre testes no mesmo processo Jest, é necessário garantir que os testes não dependam de estado mutável — o que é satisfeito aqui pela natureza stateless da classe.
- **Sem injeção de dependência formal**: em cenários onde as regras precisassem variar por configuração de ambiente (ex.: regras A/B), o Singleton seria inflexível. Para o escopo atual, isso não se aplica.

### Alternativas consideradas

- **Service NestJS com `@Injectable({ scope: Scope.DEFAULT })`**: o comportamento seria similar (instância única no container), mas acoplaria o domínio ao framework. Rejeitado.
- **Objeto literal / módulo ES**: funciona, mas perde a semântica de classe e dificulta extensão futura. Rejeitado.

## Referências

- GAMMA, E. et al. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994. Cap. 3 — Creational Patterns, Singleton, p. 127–136.
- MARTIN, R. C. *Clean Architecture*. Prentice Hall, 2017. Cap. 22 — The Clean Architecture.

---

## Módulo de Histórico de Sessões

> **Responsável:** Giovanni Dornelas Ferreira | **Branch:** `feat/modulo-historico`
>
> Contexto: o desafio criacional do histórico (RF26/RF27) é manter **estado de cache por usuário autenticado** sem recriar gerenciadores a cada requisição HTTP, permitindo que o Observer atualize o mesmo objeto após cada sessão concluída.

### Padrões analisados

| Padrão           | Possível aplicação                              | Status          | Justificativa                                                                                    |
|------------------|-------------------------------------------------|-----------------|--------------------------------------------------------------------------------------------------|
| **Multiton**     | Uma instância de `HistoryManager` por `userId`  | Selecionado     | Pool controlado por usuário; evita Singleton global que misturaria dados entre usuários          |
| Singleton        | Instância única global de histórico             | Não selecionado | Violaria isolamento multiusuário — histórico de A poderia vazar para B                         |
| Factory Method   | Criar `HistoryManager` via factory              | Avaliado        | Multiton com `getInstance(userId)` é mais direto para o caso “uma instância por chave”         |
| Builder          | Montar resposta de listagem                     | Não selecionado | View model + mapeamento no serviço são suficientes                                             |
| Prototype        | Clonar sessões em cache                         | Não selecionado | Sessões são imutáveis após conclusão; `Map` por `sessionId` resolve armazenamento               |

### Padrão implementado — Multiton · `HistoryManager.getInstance(userId)`

## Problema arquitetural

O módulo de histórico precisa:

1. **Listar sessões concluídas** (RF26) com ordenação por data decrescente.
2. **Filtrar por período** (RF27) quando o cliente envia `startDate`/`endDate`.
3. **Atualizar o cache** automaticamente quando uma nova sessão é registrada (`POST /v1/sessions`).

Se cada requisição criasse um novo objeto de “gerenciador de histórico”, haveria:

- **Recriação desnecessária** de estruturas (`Map` de sessões) a cada `GET /v1/history/sessions`.
- **Perda de sincronia** com o Observer: o `HistoryObserver` adicionaria sessão em uma instância, mas a listagem poderia ler outra instância vazia na mesma requisição subsequente (sem pool estável por usuário).

O **Multiton** resolve isso mantendo `Map<userId, HistoryManager>` — uma instância reutilizada por usuário, diferente do Singleton (uma instância para toda a aplicação).

## Justificativa da escolha

- **`HistoryManager.getInstance(userId)`** expressa explicitamente o escopo: estado pertence ao usuário autenticado.
- **Reutilização**: `HistoryService` e `HistoryObserver` obtêm a mesma instância para o mesmo `userId`.
- **Domínio puro**: a classe não depende de NestJS; vive em `domain/history/`.
- **Complemento ao Observer**: quando `WorkoutSessionSubject.notify()` dispara, `HistoryObserver.update()` chama `getInstance(session.userId).addSession(session)` na instância já existente ou recém-criada para aquele usuário.

## Modelagem

```mermaid
classDiagram
    class HistoryManager {
        -instances$: Map~string, HistoryManager~$
        -sessions: Map~string, TrainingSession~
        -userId: string
        -constructor(userId)
        +getInstance(userId)$ HistoryManager
        +clearInstance(userId)$ void
        +addSession(session) void
        +getSessions() TrainingSession[]
        +loadSessions(sessions) void
        +filterByDateRange(start, end) TrainingSession[]
    }

    class HistoryService {
        +listCompletedSessions(userId, filter)
        +getSessionDetail(userId, sessionId)
    }

    class HistoryObserver {
        +update(session) void
    }

    HistoryService --> HistoryManager : getInstance(userId)
    HistoryObserver --> HistoryManager : getInstance(userId)
```

## Implementação

| Elemento              | Caminho                                                              |
|-----------------------|----------------------------------------------------------------------|
| Multiton              | `backend/src/domain/history/history-manager.ts`                      |
| Consumidor — serviço  | `backend/src/application/services/history.service.ts`                |
| Consumidor — observer | `backend/src/domain/history/observers/history-observer.ts`           |
| Repositório (fonte)   | `backend/src/infrastructure/database/training-session.repository.impl.ts` |
| Endpoints             | `GET /v1/history/sessions`, `GET /v1/history/sessions/:sessionId`  |

### Trecho central

```typescript
// history-manager.ts — Multiton
export class HistoryManager {
  private static readonly instances = new Map<string, HistoryManager>();
  private readonly sessions = new Map<string, TrainingSession>();

  private constructor(public readonly userId: string) {}

  static getInstance(userId: string): HistoryManager {
    let instance = HistoryManager.instances.get(userId);
    if (!instance) {
      instance = new HistoryManager(userId);
      HistoryManager.instances.set(userId, instance);
    }
    return instance;
  }

  addSession(session: TrainingSession): void {
    this.sessions.set(session.id, session);
  }
}

// history-observer.ts — atualização via Observer
update(session: TrainingSession): void {
  if (!session.isCompleted()) return;
  HistoryManager.getInstance(session.userId).addSession(session);
}
```

## Evidência de execução

Fluxo manual recomendado (Swagger `http://localhost:3000/api/docs` ou REST Client):

1. `POST /v1/auth/login` → obter `accessToken`.
2. `POST /v1/sessions` → registrar sessão com exercícios.
3. `GET /v1/history/sessions` → listar histórico (cache Multiton + banco).
4. `GET /v1/history/sessions?startDate=...&endDate=...` → filtrar período (RF27).

Exemplo de resposta da listagem:

```json
{
  "sessions": [
    {
      "sessionId": "uuid",
      "date": "2026-05-20T10:00:00.000Z",
      "routineId": "uuid-da-rotina",
      "exerciseCount": 2
    }
  ]
}
```

## Rastreabilidade

| Artefato                          | Relação                                                       |
|-----------------------------------|---------------------------------------------------------------|
| Requisitos                        | RF26 (listar histórico), RF27 (filtrar por período)           |
| Módulo                            | `domain/history/`                                             |
| Camada                            | Domínio                                                       |
| Padrão estrutural relacionado     | Proxy (`HistoryServiceProxy` delega ao serviço que usa Multiton) |
| Padrão comportamental relacionado | Observer (`HistoryObserver` alimenta o Multiton após `notify`) |
| Endpoint de escrita               | `POST /v1/sessions` (dispara Observer)                        |
| Endpoint de leitura               | `GET /v1/history/sessions`                                    |

## Senso crítico

### Benefícios

- **Isolamento por usuário**: impossível misturar sessões de dois usuários na mesma instância.
- **Performance em leituras repetidas**: após warm-up, listagens sem filtro de data podem usar cache em memória.
- **Integração natural com Observer**: mesma instância recebe sessões novas sem acoplamento ao use case de registro.

### Limitações

- **Estado em memória**: reinício do processo Node limpa o pool; primeira listagem recarrega do PostgreSQL via repositório.
- **Não distribuído**: em múltiplas réplicas da API, cada instância teria seu próprio Multiton — aceitável no escopo atual (cache otimista, fonte de verdade no banco).

### Alternativas consideradas

- **Singleton global**: rejeitado por não separar usuários.
- **Cache Redis**: mais robusto em cluster, mas adiciona infraestrutura além do escopo da entrega.
- **Apenas consulta ao banco**: funcional, mas perderia atualização imediata pós-registro sem o Observer + Multiton.

## Referências

- GAMMA, E. et al. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994. Cap. 3 — Creational Patterns (variação Multiton, padrão de instância por chave).
- NOBLE, J.; WEIR, C. *Small Memory Software*. Prentice Hall, 2000. Cap. 4 — Object Reuse (pools de instâncias).

---

## [Módulo: ____________] — A preencher

> **Responsável:** [Nome do membro] | **Branch:** [nome da branch]

!!! warning "Seção pendente"
    Esta seção aguarda a contribuição do responsável pelo módulo.
    Siga a estrutura da seção **Módulo de Onboarding** ou **Módulo de Histórico de Sessões** acima como referência:

    1. **Padrões analisados** — tabela com os padrões GoF avaliados e justificativa da escolha
    2. **Padrão implementado** — nome e identificador central (ex.: classe ou interface principal)
    3. **Problema arquitetural** — o problema concreto que motivou o uso do padrão
    4. **Justificativa da escolha** — por que este padrão e não as alternativas avaliadas
    5. **Modelagem** — diagrama Mermaid (`classDiagram` ou `sequenceDiagram`)
    6. **Implementação** — tabela de arquivos + trechos de código comentados
    7. **Evidência de execução** — resultados de testes ou saída de comandos no container
    8. **Rastreabilidade** — elos com requisitos, camadas e outros padrões GoF do projeto
    9. **Senso crítico** — benefícios, limitações e alternativas consideradas
    10. **Referências** — bibliográficas (ABNT ou formato GoF)

---

## Histórico de versões

| Versão | Data       | Descrição                                                                          | Autor                      |
|--------|------------|------------------------------------------------------------------------------------|----------------------------|
| 1.0    | 19/05/2026 | Documentação do padrão Singleton do módulo de onboarding (regras de classificação) | Lucas Antunes              |
| 1.1    | 20/05/2026 | Documentação do padrão Multiton do módulo de histórico de sessões (RF26/RF27)      | Giovanni Dornelas Ferreira |
