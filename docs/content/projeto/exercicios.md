# Módulo de Exercícios

## Objetivo

O módulo de Exercícios permite que o usuário crie, visualize e gerencie seus próprios exercícios organizadamente, mantendo um catálogo pessoal para utilizar na montagem e registro dos seus treinos. Todo exercício é vinculado ao usuário logado, de forma segura, garantindo que o catálogo fique aderente às suas necessidades (Builder).

---

## Escopo

### Dentro do escopo

- Cadastro de novos exercícios personalizados por usuário
- Atualização (edição) de dados do exercício (nome e grupo muscular)
- Deleção lógica (inativação) de um exercício para evitar exclusão no histórico e quebrar consultas em treinos passados
- Busca por nome ou por grupo muscular com aplicação de regras encadeadas (Chain of Responsibility)
- Utilização de estratégia de cache e registro de logs em operações de dados (Decorator)

### Fora do escopo

- Compartilhamento de exercícios entre usuários diferentes ou em fóruns
- Inserção de mídia integrada (como Gifs ou vídeos para demonstrar execução em alta resolução)
- Geração automática de bibliotecas/catálogo global default para os clientes

---

## Estrutura do Exercício

Ao criar um exercício, o sistema assegura a criação do agregado com os seguintes dados:

| Campo           | Tipo                  | Obrigatoriedade | Descrição |
| --------------- | --------------------- | --------------- | --------- |
| id              | UUID                  | Obrigatório     | Identificador único. |
| userId          | UUID                  | Obrigatório     | Dono do exercício. Apenas este usuário o enxerga. |
| name            | String (Value Object) | Obrigatório     | Nome do exercício (Ex: Supino Reto). |
| muscleGroup     | String (Value Object) | Opcional        | Grupo muscular principal (Ex: Peito, Dorsal). |
| active          | Booleano              | Obrigatório     | Flag controle de status do exercício. |

---

## Endpoints

| Método | Rota                | Função                                          |
| ------ | ------------------- | ----------------------------------------------- |
| GET    | `/v1/exercises`      | Filtrar e listar exercícios do usuário logado   |
| POST   | `/v1/exercises`      | Criar (cadastrar) um novo exercício             |
| PUT    | `/v1/exercises/:id`  | Atualizar/Inativar (soft-delete) um exercício |

Todas as rotas exigem autenticação via Bearer Token.

---

## Fluxo do Usuário

```text
Painel ou Menu Front-end
      ↓
Acesso à página "Exercícios" (/exercises)
      ↓
(A) Consulta e barra de pesquisa 
      → Filtra por nome / grupo
      → Retorna dados (com camada de Cache)

(B) Clicar em "CADASTRAR NOVO EXERCÍCIO" 
      → Abre Modal
      → Preenche ("Nome", "Grupo muscular")
      → Confirma (POST) 
      → Lista recarregada

(C) Operações no Card de Exercício
      → Editar → Abre Modal preenchido → Atualiza (PUT)
      → Excluir → Prompt de Confirmação → Inativado na conta do usuário
```