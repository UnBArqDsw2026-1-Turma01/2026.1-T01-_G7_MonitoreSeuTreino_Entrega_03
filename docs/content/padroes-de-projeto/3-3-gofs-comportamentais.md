# 3.3. GoFs Comportamentais

## Introdução

Os padrões comportamentais tratam de algoritmos e da atribuição de responsabilidades entre objetos, focando em como os objetos interagem e distribuem responsabilidade.

Este documento reúne as contribuições de **todos os módulos do projeto**. Cada seção identifica o módulo, o integrante responsável e o padrão GoF aplicado. As seções sinalizadas como **"a preencher"** aguardam a contribuição dos demais membros — siga a estrutura da seção de Onboarding como referência.

---

## Módulo de Onboarding

> **Responsável:** Lucas Antunes | **Branch:** `feat/modulo-on-boarding`
>
> Contexto: o desafio comportamental central era que **ao refazer o onboarding, o estado anterior do perfil deve ser preservado** antes de ser sobrescrito — tanto para fins de auditoria quanto para eventual reversão. Adicionalmente, o **fluxo de classificação segue uma sequência de etapas imutável** definida pelo Template Method.

### Padrões analisados

| Padrão                  | Possível aplicação                                    | Status                        | Justificativa                                                                                    |
| ----------------------- | ----------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **Memento**             | Preservar estado do perfil antes do redo              | Selecionado                   | Permite snapshot do estado interno da entidade sem expor seus atributos privados                 |
| Command                 | Encapsular a operação de redo como comando reversível | Avaliado                      | O redo não precisa de desfazer interativo (undo em runtime); o histórico persistido é suficiente |
| Observer                | Notificar outros módulos quando o perfil muda         | Avaliado                      | Relevante para evoluções futuras; adiado para não criar acoplamento prematuro                    |
| Chain of Responsibility | Cadeia de validações antes de classificar             | Não selecionado               | As validações estão no Value Object `OnboardingAnswers`, onde pertencem ao domínio               |
| Template Method         | Definir esqueleto do fluxo de classificação           | Implementado como complemento | Presente em `OnboardingFlow` (parte do Bridge); o Memento é ortogonal a ele                      |
| Strategy                | Variar algoritmo de classificação                     | Avaliado                      | Absorvido pelo Bridge, que é mais adequado para duas dimensões de variação                       |

### Padrão implementado — Memento · `TrainingProfile.createMemento()` + `OnboardingMementoVO`

#### Problema arquitetural

O fluxo de "refazer onboarding" (`PUT /v1/onboarding`) precisa:

1. Recuperar o perfil atual do usuário.
2. **Preservar esse estado** antes de modificá-lo (histórico).
3. Atualizar o perfil com as novas respostas e nova classificação.

O problema é que `TrainingProfile` é uma entidade de domínio rica — seus atributos são privados, encapsulados para garantir invariantes. Se o `RedoOnboardingUseCase` tentasse ler os atributos diretamente para montar um snapshot, violaria o encapsulamento da entidade, tornando o domínio frágil.

O Memento resolve isso: a própria entidade é responsável por **criar o snapshot de si mesma** (`createMemento()`), encapsulando o "como salvar" dentro do objeto que sabe o que salvar.

#### Justificativa da escolha

O Memento é o padrão canônico para esse cenário porque:

- **Preserva o encapsulamento**: `TrainingProfile.createMemento()` cria o snapshot usando seus próprios atributos privados. O use case recebe um `OnboardingMementoVO` opaco e o persiste — sem precisar saber quais campos existem.
- **Separação de responsabilidades**: a entidade sabe _o que_ salvar; o repositório sabe _onde_ salvar; o use case orquestra _quando_ salvar.
- **Imutabilidade do snapshot**: `OnboardingMementoVO` é um Value Object — uma vez criado, não pode ser alterado. O histórico é auditável e confiável.
- **Auditoria nativa**: cada vez que o usuário refaz o onboarding, um novo `OnboardingHistory` é inserido no banco com o snapshot anterior. Nenhum dado histórico é perdido.

#### Modelagem

```mermaid
classDiagram
    class TrainingProfile {
        -id: string
        -userId: string
        -sex: Sex
        -age: number
        -experienceMonths: number
        -weeklyFrequency: number
        -mainGoal: TrainingGoal
        -followedStructuredPlan: boolean
        -techniqueLevel: TechniqueLevel
        -usesProgressiveLoad: boolean
        -recentConsistency: ConsistencyLevel
        -hasLimitation: boolean
        -classification: TrainingLevel
        -score: number
        +create()$ TrainingProfile
        +reconstitute()$ TrainingProfile
        +update(answers, result) void
        +createMemento() OnboardingMementoVO
        +toAnswers() OnboardingAnswers
    }

    class OnboardingMementoVO {
        +trainingProfileId: string
        +userId: string
        +answersSnapshot: object
        +classification: TrainingLevel
        +score: number
        +capturedAt: Date
    }

    class RedoOnboardingUseCase {
        +execute(userId, answers) TrainingProfile
    }

    class OnboardingHistoryRepository {
        <<interface>>
        +save(memento: OnboardingMementoVO) Promise~void~
    }

    TrainingProfile ..> OnboardingMementoVO : createMemento()
    RedoOnboardingUseCase --> TrainingProfile : update()
    RedoOnboardingUseCase --> OnboardingMementoVO : persiste
    RedoOnboardingUseCase --> OnboardingHistoryRepository : save()
```

#### Implementação

| Elemento                          | Papel no Memento                                   | Caminho                                                                                   |
| --------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `TrainingProfile`                 | Originador — cria e reconstrói a partir do memento | `backend/src/domain/onboarding/entities/training-profile.entity.ts`                       |
| `OnboardingMementoVO`             | Memento — snapshot imutável do estado              | `backend/src/domain/onboarding/value-objects/onboarding-memento.vo.ts`                    |
| `RedoOnboardingUseCase`           | Caretaker — solicita o memento e o persiste        | `backend/src/application/onboarding/use-cases/redo-onboarding.use-case.ts`                |
| `OnboardingHistoryRepository`     | Persistência do histórico                          | `backend/src/domain/onboarding/repositories/onboarding-history.repository.ts`             |
| `OnboardingHistoryRepositoryImpl` | Implementação TypeORM                              | `backend/src/infrastructure/persistence/onboarding/onboarding-history.repository.impl.ts` |
| `OnboardingHistoryOrmEntity`      | Tabela `onboarding_history`                        | `backend/src/infrastructure/persistence/onboarding/onboarding-history.orm-entity.ts`      |
| Testes                            | Verificação do Memento                             | `backend/src/domain/onboarding/entities/training-profile-memento.spec.ts`                 |

##### Trechos centrais

```typescript
// training-profile.entity.ts — Originador
export class TrainingProfile {
  createMemento(): OnboardingMementoVO {
    return new OnboardingMementoVO({
      trainingProfileId: this.id,
      userId: this.userId,
      answersSnapshot: {
        sex: this.sex,
        age: this.age,
        experienceMonths: this.experienceMonths,
        weeklyFrequency: this.weeklyFrequency,
        mainGoal: this.mainGoal,
        followedStructuredPlan: this.followedStructuredPlan,
        techniqueLevel: this.techniqueLevel,
        usesProgressiveLoad: this.usesProgressiveLoad,
        recentConsistency: this.recentConsistency,
        hasLimitation: this.hasLimitation,
      },
      classification: this.classification,
      score: this.score,
      capturedAt: new Date(),
    });
  }

  update(answers: OnboardingAnswers, result: ClassificationResult): void {
    this.classification = result.classification;
    this.score = result.score;
    // ...
  }
}

// redo-onboarding.use-case.ts — Caretaker
export class RedoOnboardingUseCase {
  async execute(userId: string, answers: OnboardingAnswers): Promise<TrainingProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException("Perfil não encontrado");

    // ① captura o estado atual antes de modificar
    const memento = profile.createMemento();

    // ② persiste o snapshot no histórico
    await this.historyRepository.save(memento);

    // ③ atualiza o perfil com os novos dados
    const classifier =
      answers.sex === Sex.MALE
        ? new MaleProfileClassifier()
        : new FemaleProfileClassifier();
    const flow = new StrengthOnboardingFlow(classifier);
    const result = flow.execute(answers);

    profile.update(answers, result);
    await this.profileRepository.save(profile);
    return profile;
  }
}
```

#### Evidência de execução

Os testes verificam o contrato do Memento:

```
✓ createMemento() captura o estado atual do perfil
✓ o snapshot não é afetado por update() posterior
✓ update() altera classification e score do perfil original
✓ o perfil mantém o mesmo id após update()
✓ o memento contém answersSnapshot com todos os campos do questionário
```

Execute no container:

```bash
sudo docker compose exec api npx jest training-profile-memento --verbose
```

Verifique o histórico no banco após um redo:

```bash
sudo docker compose exec db psql -U monitore -d monitore_seu_treino \
  -c "SELECT id, user_id, classification, score, captured_at FROM onboarding_history ORDER BY captured_at DESC LIMIT 5;"
```

#### Rastreabilidade

| Artefato                      | Relação                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Requisito                     | Preservar histórico anterior ao refazer o onboarding                                 |
| Módulo                        | `domain/onboarding/entities`, `domain/onboarding/value-objects`                      |
| Camada                        | Domínio (originador + memento), Aplicação (caretaker), Infraestrutura (persistência) |
| Padrão criacional relacionado | Singleton (regras usadas no fluxo que produz o novo `ClassificationResult`)          |
| Padrão estrutural relacionado | Bridge (fluxo que recalcula a classificação após o redo)                             |
| Endpoint                      | `PUT /v1/onboarding`                                                                 |
| Tabela no banco               | `onboarding_history`                                                                 |

#### Senso crítico

##### Benefícios

- **Encapsulamento preservado**: o use case não precisa conhecer os atributos internos de `TrainingProfile` para criar o histórico.
- **Histórico completo e imutável**: cada redo gera um registro permanente em `onboarding_history`. O dado nunca é sobrescrito — apenas inserido.
- **Auditabilidade**: é possível reconstruir toda a evolução do perfil de um usuário consultando os snapshots ordenados por `capturedAt`.
- **Extensibilidade**: se futuramente for necessário implementar "reverter para classificação anterior", o dado já está lá.

##### Limitações

- **Sem mecanismo de restauração automática (undo)**: o Memento completo incluiria um `restore(memento)` no originador. No escopo atual, apenas o histórico é salvo; a restauração é manual. Isso é intencional — não há caso de uso de undo automático hoje.
- **Tamanho do histórico**: cada redo insere uma linha em `onboarding_history`. Uma política de retenção pode ser adicionada futuramente.

##### Alternativas consideradas

- **Auditoria via triggers no banco**: acoplamento à infraestrutura de banco; a regra de "preservar antes de modificar" ficaria invisível no domínio. Rejeitado.
- **Event Sourcing**: reconstruir o estado a partir de eventos seria a alternativa mais completa, mas introduz complexidade operacional desproporcional ao escopo. Avaliado e adiado.
- **Soft delete + nova linha**: viola a identidade da entidade (o usuário tem um perfil, não vários). Rejeitado.

#### Referências (Memento)

- GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994. Cap. 5 — Behavioral Patterns, Memento, p. 283–291.
- EVANS, E. _Domain-Driven Design: Tackling Complexity in the Heart of Software_. Addison-Wesley, 2003. Cap. 5 — A Model Expressed in Software (Value Objects).

---

### Padrão complementar — Template Method · `OnboardingFlow.execute()`

#### Contexto

O Template Method é utilizado de forma complementar ao Bridge na camada de domínio do módulo de onboarding. Enquanto o Bridge separa a abstração (`OnboardingFlow`) da implementação (`ProfileClassifier`), o Template Method define o **esqueleto do algoritmo** de classificação dentro da própria abstração — garantindo que a sequência de etapas seja sempre respeitada, independentemente da subclasse concreta.

#### Problema

O fluxo de classificação de onboarding precisa executar etapas em uma ordem fixa: preparar o contexto antes de classificar → classificar → reagir ao resultado. Sem Template Method, cada subclasse teria que reimplementar o método `execute()` inteiro, duplicando a lógica de orquestração e abrindo espaço para inconsistências (ex.: esquecer de chamar `afterClassify`).

#### Justificativa

O Template Method resolve isso ao:

1. Tornar `execute()` um método **final** (não sobrescrito) que define a sequência imutável.
2. Expor dois **hooks** protegidos — `beforeClassify()` e `afterClassify()` — com implementação padrão vazia.
3. Permitir que subclasses sobrescrevam apenas os hooks relevantes para seu contexto.

Isso garante o **Princípio Aberto/Fechado**: o algoritmo está fechado para modificação, mas aberto para extensão via hooks.

#### Diagrama

```mermaid
classDiagram
    class OnboardingFlow {
        <<abstract>>
        #classifier: ProfileClassifier
        +execute(answers) ClassificationResult
        #beforeClassify(answers) void
        #afterClassify(result) void
    }

    class StrengthOnboardingFlow {
        #beforeClassify(answers) void
        #afterClassify(result) void
    }

    class ProfileClassifier {
        <<interface>>
        +classify(answers) ClassificationResult
    }

    OnboardingFlow <|-- StrengthOnboardingFlow
    OnboardingFlow o--> ProfileClassifier : injected (Bridge)
```

#### Implementação

| Papel GoF       | Classe / Arquivo                                                                  |
| --------------- | --------------------------------------------------------------------------------- |
| Abstract Class  | `OnboardingFlow` — `domain/onboarding/bridge/onboarding-flow.abstract.ts`         |
| Template Method | `execute()` — define a sequência fixa de classificação                            |
| Hooks           | `beforeClassify()`, `afterClassify()` — extensíveis por subclasses                |
| Concrete Class  | `StrengthOnboardingFlow` — `domain/onboarding/bridge/strength-onboarding-flow.ts` |

```typescript
// domain/onboarding/bridge/onboarding-flow.abstract.ts
export abstract class OnboardingFlow {
  constructor(protected readonly classifier: ProfileClassifier) {}

  execute(answers: OnboardingAnswers): ClassificationResult {
    this.beforeClassify(answers);
    const result = this.classifier.classify(answers);
    this.afterClassify(result);
    return result;
  }

  protected beforeClassify(_answers: OnboardingAnswers): void {}
  protected afterClassify(_result: ClassificationResult): void {}
}

// domain/onboarding/bridge/strength-onboarding-flow.ts
export class StrengthOnboardingFlow extends OnboardingFlow {
  constructor(classifier: ProfileClassifier) { super(classifier); }
  protected override beforeClassify(_answers: OnboardingAnswers): void {}
  protected override afterClassify(_result: ClassificationResult): void {}
}
```

#### Rastreabilidade

| Artefato                       | Relação                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Requisito                      | Classificar o perfil do usuário de forma extensível e consistente                     |
| Módulo                         | `domain/onboarding/bridge/`                                                           |
| Camada                         | Domínio                                                                               |
| Padrão estrutural relacionado  | Bridge — `ProfileClassifier` é a implementação injetada no `OnboardingFlow`           |
| Padrão criacional relacionado  | Singleton — `OnboardingClassificationRules` é usado pelo `RuleBasedProfileClassifier` |
| Padrão comportamental primário | Memento — o resultado produzido por `execute()` é capturado como snapshot no redo     |
| Endpoint                       | `POST /v1/onboarding`, `PUT /v1/onboarding`                                           |

#### Senso crítico

##### Benefícios

- **Sequência garantida**: nenhuma subclasse pode alterar a ordem `beforeClassify → classify → afterClassify`.
- **Extensibilidade sem duplicação**: adicionar um novo fluxo requer apenas sobrescrever os hooks relevantes.
- **Composição com Bridge**: o Template Method controla _quando_ cada etapa ocorre; o Bridge controla _como_ a classificação é feita.

##### Limitações

- **Hooks vazios na subclasse atual**: o valor do padrão é prospectivo — a estrutura está pronta para extensão, mas ainda não há lógica específica por tipo de treino.
- **Acoplamento por herança**: se a hierarquia crescer muito, pode ser substituído por composição com estratégias. No escopo atual, a hierarquia é rasa.

##### Alternativas consideradas

- **Strategy puro sem Template Method**: a sequência `before/classify/after` deixaria de ser garantida — cada implementação teria que reimplementá-la. Rejeitado.
- **Listener/event hooks**: mais flexível, mas introduz infraestrutura de eventos desnecessária para o escopo. Avaliado e adiado.

#### Referências (Template Method)

- GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994. Cap. 5 — Behavioral Patterns, Template Method, p. 325–330.
- MARTIN, R. C. _Agile Software Development, Principles, Patterns, and Practices_. Prentice Hall, 2002. Cap. 14 — Template Method and Strategy Patterns.

---

## Módulo de Autenticação

> **Responsável:** Samuel Nogueira Caetano | **Branch:** `main (integrada a partir da feat/modulo-autenticacao)`
>
> Contexto: os desafios comportamentais centrais eram que **todos os use cases precisam executar a mesma sequência de ciclo de vida** (executar lógica → publicar eventos de domínio) sem duplicar essa orquestração, e que **os eventos gerados pelas entidades precisam ser propagados para handlers desacoplados** sem que o emissor conheça os consumidores.

### Padrões analisados

| Padrão                  | Possível aplicação                                             | Status                        | Justificativa                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Template Method**     | Definir ciclo de vida comum a todos os use cases               | Selecionado                   | Garante que `execute()` sempre publica eventos após `handle()`, sem que cada use case reimplemente essa orquestração                                                            |
| **Observer**            | Propagar eventos de domínio para handlers desacoplados         | Implementado como complemento | Permite que `DomainEventBus` distribua eventos para N handlers sem que o emissor os conheça                                                                                     |
| Strategy                | Variar algoritmo de autenticação (ex.: OAuth vs. Senha)        | Avaliado                      | Não há variação de algoritmo no escopo atual; um único fluxo de autenticação por credenciais é suficiente                                                                       |
| Chain of Responsibility | Encadear validações antes de autenticar                        | Não selecionado               | As validações são invariantes de Value Objects (`Email`, `PlainPassword`) — pertencem ao domínio, não ao fluxo do use case                                                      |
| Command                 | Encapsular operações de autenticação como comandos reversíveis | Não selecionado               | Os comandos de autenticação não precisam de desfazer; os tipos `AuthenticateUserCommand`, `RevokeSessionCommand` já servem como DTOs de entrada sem precisar do padrão completo |

---

### Padrão implementado — Template Method · `UseCase<TInput, TOutput>.execute()`

#### Problema arquitetural

O sistema possui seis use cases de autenticação. Todos compartilham a mesma responsabilidade pós-execução: **publicar os eventos de domínio acumulados pelas entidades manipuladas**.

Sem Template Method, cada use case precisaria: chamar sua lógica interna, coletar os agregados resultantes, iterar sobre os eventos e publicar cada evento no `DomainEventBus`. Qualquer alteração na política de publicação exigiria modificar os seis use cases, e um use case que esquecesse de publicar os eventos passaria despercebido.

#### Justificativa da escolha

O Template Method define em `UseCase<TInput, TOutput>` um método `execute()` concreto que:

1. Limpa a lista de agregados pendentes.
2. Chama `handle()` — o passo variável, implementado por cada subclasse.
3. Chama `publishDomainEvents()` — o passo invariante, implementado uma única vez na classe base.

O padrão também expõe `registerAggregate()` como hook protegido para use cases que precisam garantir a publicação de eventos de agregados não retornados diretamente pelo `handle()`.

#### Modelagem

```mermaid
classDiagram
    class UseCase~TInput,TOutput~ {
        <<abstract>>
        -_pendingAggregates: AggregateRoot[]
        #eventBus: DomainEventBus
        +execute(input: TInput) Promise~TOutput~
        #handle(input: TInput) Promise~TOutput~*
        #registerAggregate(aggregate: AggregateRoot) void
        -publishDomainEvents(result: TOutput) Promise~void~
        -collectAggregates(result: unknown) AggregateRoot[]
    }

    class RegisterUserUseCase { #handle(cmd) Promise~User~ }
    class AuthenticateUserUseCase { #handle(cmd) Promise~AuthenticationResult~ }
    class RotateRefreshTokenUseCase { #handle(cmd) Promise~RotateTokenResult~ }
    class RevokeSessionUseCase { #handle(cmd) Promise~void~ }
    class DeactivateUserUseCase { #handle(id) Promise~void~ }

    UseCase <|-- RegisterUserUseCase
    UseCase <|-- AuthenticateUserUseCase
    UseCase <|-- RotateRefreshTokenUseCase
    UseCase <|-- RevokeSessionUseCase
    UseCase <|-- DeactivateUserUseCase
```

#### Implementação

| Elemento                    | Papel no Template Method                               | Caminho                                                                   |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `UseCase<TInput, TOutput>`  | Classe abstrata — define o template                    | `backend/src/application/use-cases/base.use-case.ts`                      |
| `execute()`                 | Template method — sequência imutável                   | `base.use-case.ts`                                                        |
| `handle()`                  | Passo variável abstrato — lógica de negócio            | Implementado em cada subclasse                                            |
| `registerAggregate()`       | Hook protegido — registra agregados sem retorno direto | `base.use-case.ts`                                                        |
| `publishDomainEvents()`     | Passo invariante — coleta e publica eventos            | `base.use-case.ts`                                                        |
| `RegisterUserUseCase`       | Subclasse concreta                                     | `backend/src/application/use-cases/auth/register-user.use-case.ts`        |
| `RotateRefreshTokenUseCase` | Subclasse concreta com `registerAggregate()`           | `backend/src/application/use-cases/auth/rotate-refresh-token.use-case.ts` |

##### Trechos centrais

```typescript
// base.use-case.ts — Classe abstrata com o template method
export abstract class UseCase<TInput, TOutput> {
  private _pendingAggregates: AggregateRoot[] = [];

  constructor(protected readonly eventBus: DomainEventBus) {}

  async execute(input: TInput): Promise<TOutput> {
    this._pendingAggregates = [];
    const result = await this.handle(input);
    await this.publishDomainEvents(result);
    return result;
  }

  protected abstract handle(input: TInput): Promise<TOutput>;

  protected registerAggregate(aggregate: AggregateRoot): void {
    this._pendingAggregates.push(aggregate);
  }

  private async publishDomainEvents(result: TOutput): Promise<void> {
    const fromResult = this.collectAggregates(result);
    const allAggregates = [...this._pendingAggregates, ...fromResult];
    for (const aggregate of allAggregates) {
      for (const event of aggregate.pullDomainEvents()) {
        await this.eventBus.publish(event);
      }
    }
  }

  private collectAggregates(result: unknown): AggregateRoot[] {
    if (result instanceof AggregateRoot) return [result];
    if (Array.isArray(result))
      return result.filter((v): v is AggregateRoot => v instanceof AggregateRoot);
    if (result !== null && typeof result === "object") {
      return Object.values(result).flatMap((value) => {
        if (value instanceof AggregateRoot) return [value];
        if (Array.isArray(value))
          return value.filter((v): v is AggregateRoot => v instanceof AggregateRoot);
        return [];
      });
    }
    return [];
  }
}

// rotate-refresh-token.use-case.ts — uso do hook registerAggregate()
export class RotateRefreshTokenUseCase extends UseCase<RotateTokenCommand, RotateTokenResult> {
  protected async handle(cmd: RotateTokenCommand): Promise<RotateTokenResult> {
    const invalidated = existingToken.invalidate();
    this.registerAggregate(invalidated);
    await this.refreshTokenRepository.update(invalidated);

    const newRefreshToken = RefreshToken.create(user.id, newTokenHash, expiresAt);
    this.registerAggregate(newRefreshToken);
    await this.refreshTokenRepository.insert(newRefreshToken);

    return { accessToken, refreshToken: newOpaqueToken };
  }
}
```

#### Rastreabilidade

| Artefato                          | Relação                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Requisito                         | Garantir que eventos de domínio sejam publicados após qualquer operação de autenticação                                                 |
| Módulo                            | `application/use-cases/`                                                                                                                |
| Camada                            | Aplicação                                                                                                                               |
| Padrão comportamental relacionado | Observer — `DomainEventBus` é o mecanismo que recebe os eventos publicados pelo template method                                         |
| Padrão estrutural relacionado     | Facade — `AuthenticationFacade` aciona `execute()` dos use cases; o template é transparente para ela                                    |
| Padrão criacional relacionado     | Factory Method — `User.create()` e `RefreshToken.create()` são chamados dentro de `handle()` e geram os eventos coletados pelo template |

#### Senso crítico

##### Benefícios

- **Publicação garantida estruturalmente**: não é possível implementar um use case que esqueça de publicar eventos.
- **Sem duplicação**: os seis use cases não repetem nenhuma linha de lógica de ciclo de vida.
- **`collectAggregates()` como heurística inteligente**: a inspeção recursiva do resultado permite que `AuthenticationResult` (que contém `user: User`) tenha seus eventos coletados automaticamente.

##### Limitações

- **`handle()` não é final no TypeScript**: tecnicamente uma subclasse poderia sobrescrever `execute()` e contornar o template. A proteção é por convenção.
- **`collectAggregates()` por reflexão de objeto**: se um resultado contiver AggregateRoots em estruturas mais profundas, `registerAggregate()` seria necessário. Trade-off explícito de simplicidade vs. completude.

##### Alternativas consideradas

- **Publicação explícita em cada use case**: duplica a responsabilidade e remove a garantia estrutural. Rejeitado.
- **Decorator de use case**: separaria a publicação sem herança, mas exigiria que cada use case fosse decorado individualmente. Avaliado e rejeitado.

##### Referências (Template Method)

- GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994. Cap. 5 — Behavioral Patterns, Template Method, p. 325–330.

---

### Padrão complementar — Observer · `DomainEventBus`

#### Introdução

Além do Template Method, o módulo de autenticação implementa o padrão **Observer** via `DomainEventBus`. Aqui ele desacopla os emissores de eventos de domínio (entidades) dos handlers que reagem a esses eventos.

#### Problema arquitetural

Quando um usuário é registrado, o sistema pode precisar reagir de múltiplas formas: enviar e-mail de boas-vindas, registrar métricas, notificar outro serviço. Se `RegisterUserUseCase` chamasse cada um desses handlers diretamente, adicionar um novo comportamento pós-registro exigiria modificar o use case — violando o Open/Closed Principle.

#### Justificativa da escolha

O `DomainEventBus` implementa o Observer ao separar completamente o emissor do receptor:

- **Sujeito** (`DomainEventBus`): mantém o registro de handlers por nome de evento e notifica todos quando um evento é publicado.
- **Observadores** (handlers registrados via `subscribe()`): reagem ao evento sem que o emissor os conheça.
- **Emissores** (entidades como `User`, `RefreshToken`): apenas acumulam eventos com `pushEvent()`; não conhecem o bus.

O uso de `Promise.allSettled()` na publicação garante que a falha de um handler não impede a execução dos demais.

#### Modelagem

```mermaid
sequenceDiagram
    participant UC as RegisterUserUseCase
    participant Base as UseCase (Template Method)
    participant User as User (AggregateRoot)
    participant Bus as DomainEventBus
    participant H1 as EmailHandler
    participant H2 as MetricsHandler

    UC->>User: User.create(name, email, password)
    User->>User: pushEvent(UserRegisteredEvent)
    UC-->>Base: retorna User
    Base->>User: pullDomainEvents()
    User-->>Base: [UserRegisteredEvent]
    Base->>Bus: publish(UserRegisteredEvent)
    Bus->>H1: handler(UserRegisteredEvent)
    Bus->>H2: handler(UserRegisteredEvent)
    H1-->>Bus: fulfilled
    H2-->>Bus: fulfilled
    Bus-->>Base: allSettled
```

#### Implementação

| Elemento                                               | Papel no Observer                                            | Caminho                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `DomainEventBus`                                       | Sujeito — mantém handlers e notifica                         | `backend/src/application/events/domain-event-bus.ts`                  |
| `DomainEvent`                                          | Interface do evento                                          | `backend/src/domain/events/domain-event.ts`                           |
| `UserRegisteredEvent`, `SessionInvalidatedEvent`, etc. | Eventos concretos                                            | `backend/src/domain/events/user-events.ts`, `refresh-token-events.ts` |
| `AggregateRoot`                                        | Acumulador de eventos — `pushEvent()` / `pullDomainEvents()` | `backend/src/domain/entities/aggregate-root.ts`                       |
| `UseCase.publishDomainEvents()`                        | Ponte entre Template Method e Observer                       | `backend/src/application/use-cases/base.use-case.ts`                  |

##### Trechos centrais

```typescript
// domain-event-bus.ts — Sujeito
export class DomainEventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) ?? [];
    const results = await Promise.allSettled(handlers.map((h) => h(event)));
    results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .forEach((r) =>
        this.logger.error("Event handler failed", {
          context: "DomainEventBus",
          eventName,
          reason: r.reason instanceof Error ? r.reason.message : r.reason,
        }),
      );
  }
}

// aggregate-root.ts — Acumulador de eventos nas entidades
export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected pushEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  protected mergeEventsFrom(source: AggregateRoot): void {
    for (const event of source.pullDomainEvents()) {
      this.pushEvent(event);
    }
  }
}
```

#### Rastreabilidade

| Artefato                          | Relação                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Requisito                         | Reagir a eventos de domínio (registro, revogação de sessão, desativação) de forma desacoplada                                                 |
| Módulo                            | `application/events/`, `domain/events/`, `domain/entities/`                                                                                   |
| Camada                            | Domínio (eventos + AggregateRoot), Aplicação (DomainEventBus)                                                                                 |
| Padrão comportamental relacionado | Template Method — `publishDomainEvents()` na classe base é o ponto onde o Observer é acionado                                                 |
| Padrão criacional relacionado     | Factory Method — os eventos são criados dentro dos métodos factory das entidades (`User.create()`, `RefreshToken.invalidate()`)               |
| Padrão estrutural relacionado     | Decorator — `LoggingUserRepository` poderia observar eventos via bus em vez de logar diretamente; o bus é o mecanismo alternativo de extensão |

#### Senso crítico

##### Benefícios

- **Desacoplamento total emissor-receptor**: adicionar um novo handler não requer modificar nenhuma entidade nem use case.
- **Resiliência por isolamento**: `Promise.allSettled()` garante que um handler com falha não impede os demais de executar.
- **`mergeEventsFrom()` preserva eventos em cadeias imutáveis**: garante que nenhum evento seja perdido em operações que retornam novas instâncias.

##### Limitações

- **Sem handlers registrados atualmente**: o `DomainEventBus` está implementado, mas nenhum handler é registrado no `AuthModule` atual. O valor do padrão é prospectivo no escopo entregue.
- **Entrega em memória, sem persistência**: se o processo cair após `handle()` mas antes de `publishDomainEvents()`, os eventos são perdidos. Para garantias de entrega seria necessário um Outbox Pattern — fora do escopo atual.
- **Ordem de publicação sequencial**: para alto volume de eventos, uma fila assíncrona seria mais adequada.

##### Alternativas consideradas

- **Chamada direta de handlers nos use cases**: acopla o use case a cada handler e viola o Open/Closed Principle. Rejeitado.
- **`EventEmitter` nativo do Node.js**: síncrono por padrão, sem suporte nativo a `async/await`. Rejeitado.
- **Message broker externo (RabbitMQ, Kafka)**: desproporcional para um monólito modular no escopo atual. Avaliado e adiado.

##### Referências (Observer)

- GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994. Cap. 5 — Behavioral Patterns, Observer, p. 293–303.
- FOWLER, M. _Patterns of Enterprise Application Architecture_. Addison-Wesley, 2002. Domain Event; disponível em: https://martinfowler.com/eaaDev/DomainEvent.html.

---

## Módulo de Exercícios

> **Responsável:** Daniel Teles | **Branch:** `feature/exercise_module`
>
> Contexto: a busca de exercícios aceita múltiplos filtros (nome, grupo muscular) além de impor escopo por `userId` e excluir exercícios inativos. O objetivo era uma forma extensível de aplicar filtros na query sem criar condicionais inchadas no repositório.

### Padrões analisados

| Padrão                  | Possível aplicação                                | Status      | Justificativa                                                                               |
| ----------------------- | ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Chain of Responsibility | Aplicar filtros encadeados na construção da query | Selecionado | Encadeamento limpo e extensível para novos filtros                                          |
| Specification           | Compor predicados reutilizáveis                   | Avaliado    | Útil para regras complexas, mas requer wrapping adicional para QueryBuilder; Chain é mais direto |

### Padrão implementado — Chain of Responsibility · `ExerciseSearchChain`

#### Problema arquitetural

O repositório precisava montar uma query dinâmica com condições que variam conforme os filtros providos. Inserir `if`/`andWhere` repetidos no repositório torna o código difícil de estender; cada novo filtro aumentaria a complexidade ciclomática.

#### Justificativa da escolha

O `ExerciseSearchChain` encapsula cada etapa de filtro em um handler: escopo por `userId` + ativo, filtro por nome, filtro por grupo muscular. Handlers podem ser reordenados ou estendidos sem tocar na lógica base do repositório — alinhado ao princípio Open/Closed.

#### Modelagem

```mermaid
classDiagram
    class IExerciseSearchHandler {
        <<interface>>
        +setNext(handler: IExerciseSearchHandler) IExerciseSearchHandler
        +execute(context: SearchContext) void
    }

    class BaseSearchHandler {
        -nextHandler: IExerciseSearchHandler
        +setNext(handler) IExerciseSearchHandler
        +execute(context) void
    }

    class UserScopeHandler {
        +execute(context) void
    }

    class NameFilterHandler {
        +execute(context) void
    }

    class MuscleGroupFilterHandler {
        +execute(context) void
    }

    IExerciseSearchHandler <|.. BaseSearchHandler
    BaseSearchHandler <|-- UserScopeHandler
    BaseSearchHandler <|-- NameFilterHandler
    BaseSearchHandler <|-- MuscleGroupFilterHandler
```

#### Implementação

| Elemento               | Papel na Chain                            | Caminho                                                                        |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `ExerciseSearchChain`  | Montagem e disparo da cadeia              | `backend/src/infrastructure/database/exercise-search.chain.ts`                 |
| `BaseSearchHandler`    | Handler abstrato com lógica de delegação  | `backend/src/infrastructure/database/exercise-search.chain.ts`                 |
| `UserScopeHandler`     | Aplica filtro de `userId` + `active=true` | `backend/src/infrastructure/database/exercise-search.chain.ts`                 |
| `NameFilterHandler`    | Aplica filtro opcional por nome           | `backend/src/infrastructure/database/exercise-search.chain.ts`                 |
| `MuscleGroupFilterHandler` | Aplica filtro opcional por grupo muscular | `backend/src/infrastructure/database/exercise-search.chain.ts`             |
| Repositório consumidor | Instancia e executa a chain               | `backend/src/infrastructure/database/exercise.postgres-repository.ts`          |
| Use Case               | Aciona o repositório com os critérios     | `backend/src/application/use-cases/exercises/find-exercises.use-case.ts`       |

##### Trecho central

```typescript
const queryBuilder = this.repository
  .createQueryBuilder('exercise')
  .orderBy('exercise.name', 'ASC');

await new ExerciseSearchChain().execute({ criteria, queryBuilder });
const rows = await queryBuilder.getMany();
```

#### Evidência de execução

As buscas filtradas executam com sucesso. Validação via:

```bash
docker compose exec api npx jest search-chain --verbose
```

#### Rastreabilidade

| Artefato                      | Relação                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Requisito                     | RF14 — consulta de exercícios por nome ou grupo muscular com ordenação e exclusão de inativos |
| Módulo                        | `infrastructure/database/` · `application/use-cases/exercises/`                              |
| Camada                        | Infraestrutura                                                                               |
| Padrão estrutural relacionado | Decorator — os handlers da chain operam sobre o mesmo repositório decorado com cache e log   |

#### Senso crítico

##### Benefícios

- **Menor complexidade ciclomática**: cada condição de filtro fica isolada em seu próprio handler, em vez de `if`/`andWhere` aninhados.
- **Extensibilidade dinâmica**: novos filtros são adicionados como novos handlers sem modificar o repositório ou os handlers existentes.

##### Limitações

- **Dificuldade de depuração**: rastrear onde uma query perdeu escopo pode ser trabalhoso quando muitos handlers são encadeados e um deles suprime ou altera o contexto indevidamente.

##### Alternativas consideradas

- **Specification Pattern**: criar query objects. Descartado porque demandaria um acoplamento mais pesado ao TypeORM; a Chain manipula o contexto (`QueryBuilder`) livremente sem essa indireção.

#### Referências (Chain of Responsibility)

- GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994. Cap. 5 — Behavioral Patterns, Chain of Responsibility.

---

## [Módulo: ____________] — A preencher

> **Responsável:** [Nome do membro] | **Branch:** [nome da branch]

!!! warning "Seção pendente"

    Esta seção aguarda a contribuição do responsável pelo módulo.

    Siga a estrutura da seção **Módulo de Onboarding** acima como referência:

    1. **Padrões analisados** — tabela com os padrões GoF avaliados e justificativa da escolha
    2. **Padrão implementado** — nome e identificador central (ex.: classe ou interface principal)
    3. **Problema arquitetural** — o problema concreto que motivou o uso do padrão
    4. **Justificativa da escolha** — por que este padrão e não as alternativas avaliadas
    5. **Modelagem** — diagrama Mermaid (`classDiagram` ou `sequenceDiagram`)
    6. **Implementação** — tabela de arquivos + trechos de código comentados
    7. **Rastreabilidade** — elos com requisitos, camadas e outros padrões GoF do projeto
    8. **Senso crítico** — benefícios, limitações e alternativas consideradas
    9. **Referências** — bibliográficas (ABNT ou formato GoF)

---

## Histórico de versões

| Versão | Data       | Descrição                                                                     | Autor                   |
| ------ | ---------- | ----------------------------------------------------------------------------- | ----------------------- |
| 1.0    | 19/05/2026 | Documentação dos padrões Memento e Template Method do módulo de Onboarding    | Lucas Antunes           |
| 1.1    | 20/05/2026 | Documentação dos padrões Template Method e Observer do módulo de Autenticação | Samuel Nogueira Caetano |
| 1.2    | 20/05/2026 | Documentação do padrão Chain of Responsibility para busca de exercícios       | Daniel Teles            |