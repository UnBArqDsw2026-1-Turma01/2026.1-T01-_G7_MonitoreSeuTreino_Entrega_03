# Onboarding Pós-Registro

## Objetivo

Ao se registrar no MonitoreSeuTreino, o usuário passa por um questionário inicial que coleta informações sobre sua experiência de treino. Com base nas respostas, o sistema classifica o perfil em **iniciante**, **intermediário** ou **avançado**, diferenciando **homem** e **mulher** no fluxo de classificação.

---

## Escopo

### Dentro do escopo

- Exibir questionário inicial após o registro
- Classificar o usuário em iniciante, intermediário ou avançado
- Diferenciar homem e mulher no fluxo de classificação (Bridge)
- Salvar respostas e classificação no perfil
- Permitir refazer o questionário
- Preservar histórico anterior ao refazer (Memento)

### Fora do escopo

- Recomendação de rotina de treino
- Prescrição de treino
- Plano alimentar
- Acompanhamento evolutivo avançado

---

## Questionário

| Campo                     | Tipo                                                           |
| ------------------------- | -------------------------------------------------------------- |
| Sexo                      | MALE \| FEMALE                                                 |
| Idade                     | Número inteiro (10–120)                                        |
| Meses de experiência      | Número inteiro (≥ 0)                                           |
| Frequência semanal        | Número inteiro (1–7)                                           |
| Objetivo principal        | HYPERTROPHY \| STRENGTH \| ENDURANCE \| WEIGHT_LOSS \| FITNESS |
| Seguiu plano estruturado? | Booleano                                                       |
| Nível de técnica          | LOW \| MEDIUM \| HIGH                                          |
| Usa progressão de carga?  | Booleano                                                       |
| Consistência recente      | LOW \| MEDIUM \| HIGH                                          |
| Possui limitação física?  | Booleano                                                       |

---

## Regras de Classificação

### Pontuação base

| Critério            | Resposta    | Pontos |
| ------------------- | ----------- | -----: |
| Experiência         | < 6 meses   |      0 |
| Experiência         | 6–18 meses  |      1 |
| Experiência         | > 18 meses  |      2 |
| Frequência          | 1–2x/semana |      0 |
| Frequência          | 3–4x/semana |      1 |
| Frequência          | 5x+/semana  |      2 |
| Treino estruturado  | não         |      0 |
| Treino estruturado  | sim         |      1 |
| Técnica             | baixa       |      0 |
| Técnica             | média       |      1 |
| Técnica             | alta        |      2 |
| Progressão de carga | não         |      0 |
| Progressão de carga | sim         |      1 |
| Consistência        | baixa       |      0 |
| Consistência        | média       |      1 |
| Consistência        | alta        |      2 |

### Resultado

| Pontuação | Classificação |
| --------: | ------------- |
|       0–4 | Iniciante     |
|       5–8 | Intermediário |
|      9–10 | Avançado      |

---

## Endpoints

| Método | Rota                | Função                                          |
| ------ | ------------------- | ----------------------------------------------- |
| GET    | `/v1/onboarding/me` | Consultar status do onboarding do usuário       |
| POST   | `/v1/onboarding`    | Enviar questionário inicial                     |
| PUT    | `/v1/onboarding`    | Refazer questionário (salva histórico anterior) |

Todas as rotas exigem autenticação via Bearer Token.

---

## Fluxo do Usuário

```
login / signup
      ↓
GET /v1/onboarding/me
      ↓
completed = false → /onboarding (questionário)
completed = true  → dashboard
```

### Fluxo de refazer

```
/profile/onboarding (botão "Refazer")
      ↓
createMemento() → salva snapshot no histórico
      ↓
PUT /v1/onboarding (novas respostas)
      ↓
classificação recalculada
      ↓
perfil atualizado
```
