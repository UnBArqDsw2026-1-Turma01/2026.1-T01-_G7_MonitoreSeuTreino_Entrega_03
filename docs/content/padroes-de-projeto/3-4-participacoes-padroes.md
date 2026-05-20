# 3.4. Participações — Padrões de Projeto

Breve relato sobre as participações/contribuições de cada membro à entrega. Todos devem participar, mostrando seus pontos de vista e como colaboraram em cada etapa com comprobatórios.

---

## GoFs Criacionais

### Singleton — Módulo de Onboarding

**Contexto:** Implementação de `OnboardingClassificationRules` como Singleton de domínio, centralizando o algoritmo de pontuação de perfil de treino. A instância única garante fonte de verdade única para todos os classificadores.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Modelagem do Singleton, implementação de `calculateScore()` e sub-métodos de pontuação por critério (experiência, frequência, técnica, consistência), testes unitários (5 casos), documentação | Excelente | `backend/src/domain/onboarding/rules/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

---

## GoFs Estruturais

### Bridge + Facade — Módulo de Onboarding

**Contexto (Bridge):** Separação da hierarquia de fluxos (`OnboardingFlow`) da hierarquia de classificadores (`ProfileClassifier`), permitindo que homens e mulheres sejam classificados por implementações distintas sem acoplar o fluxo ao sexo.

**Contexto (Facade):** `OnboardingFacade` como único ponto de entrada da camada de apresentação para o subsistema de onboarding, encapsulando três use cases e isolando o controller de dependências diretas com o domínio.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Bridge: abstração `OnboardingFlow`, `StrengthOnboardingFlow`, interface `ProfileClassifier`, `MaleProfileClassifier`, `FemaleProfileClassifier`, testes (6 casos). Facade: `OnboardingFacade`, integração com `OnboardingController` | Excelente | `backend/src/domain/onboarding/bridge/`, `backend/src/presentation/facades/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

---

## GoFs Comportamentais

### Memento + Template Method — Módulo de Onboarding

**Contexto (Memento):** Captura do estado do perfil de treino antes de um redo, preservando o histórico completo de classificações no banco sem violar o encapsulamento da entidade `TrainingProfile`.

**Contexto (Template Method):** Esqueleto imutável do fluxo de classificação em `OnboardingFlow.execute()`, com hooks `beforeClassify()` e `afterClassify()` extensíveis por subclasses, composto com o Bridge para separar *quando* de *como*.

| Nome do Membro | Contribuição | Significância | Comprobatórios |
|----------------|--------------|---------------|----------------|
| Lucas Antunes | Memento: `OnboardingMementoVO`, `createMemento()` em `TrainingProfile`, `RedoOnboardingUseCase` (caretaker), `onboarding_history` (ORM + repositório), testes (5 casos). Template Method: `execute()` em `OnboardingFlow`, hooks protegidos, `StrengthOnboardingFlow` | Excelente | `backend/src/domain/onboarding/entities/`, `backend/src/domain/onboarding/value-objects/`, `backend/src/domain/onboarding/bridge/`, `backend/src/infrastructure/database/` |
| [Nome] | [Contribuição] | [Mínima/Boa/Excelente] | [Comprobatório] |

---

## Histórico de versões

| Versão | Data       | Descrição                                                                                                                    | Autor         |
|--------|------------|------------------------------------------------------------------------------------------------------------------------------|---------------|
| 1.0    | 19/05/2026 | Registro de participações nos padrões GoF do módulo de onboarding (Singleton, Bridge, Facade, Memento, Template Method)      | Lucas Antunes |
