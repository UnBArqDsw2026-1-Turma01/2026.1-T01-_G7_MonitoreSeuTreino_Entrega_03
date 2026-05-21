# Autenticação e Gerenciamento de Sessão

## Objetivo

Ao se registrar no MonitoreSeuTreino, o usuário cria uma conta com nome, e-mail e senha. O sistema autentica credenciais, emite tokens de acesso e gerencia sessões por meio de refresh tokens rotativos, garantindo que apenas usuários válidos e ativos possam acessar os recursos protegidos.

---

## Escopo

### Dentro do escopo

- Registrar novo usuário com validação de e-mail único e senha forte
- Autenticar usuário via e-mail e senha, emitindo access token JWT e refresh token opaco
- Rotacionar refresh token a cada uso (token rotation)
- Revogar sessão individual ou todas as sessões do usuário
- Desativar conta (soft delete) com revogação automática de todas as sessões
- Atualizar nome, e-mail ou senha do usuário autenticado
- Rastrear operações de repositório via correlationId (Decorator de logging)
- Emitir eventos de domínio para mutações relevantes (Observer)

### Fora do escopo

- Autenticação via OAuth / provedores externos (Google, Apple etc.)
- Recuperação de senha por e-mail
- Verificação de e-mail por link
- Autenticação de dois fatores (2FA)
- Gerenciamento de permissões e papéis (RBAC)

---

## Modelo de Usuário

| Campo           | Tipo / Restrição                                                            |
| --------------- | --------------------------------------------------------------------------- |
| Nome            | String (2–100 caracteres)                                                   |
| E-mail          | String (formato válido, único, canonicalizado)                              |
| Senha           | String (8–64 caracteres, maiúscula, minúscula, número e caractere especial) |
| Data de criação | Timestamp                                                                   |
| Data de update  | Timestamp                                                                   |
| Deletado em     | Timestamp \| null (soft delete)                                             |

## Modelo de Refresh Token

| Campo       | Tipo / Restrição                                                     |
| ----------- | -------------------------------------------------------------------- |
| ID          | UUID v4                                                              |
| Usuário     | UUID (FK → users)                                                    |
| Token hash  | SHA-256 do token opaco (armazenado com bcrypt)                       |
| Expira em   | Timestamp (configurável via `REFRESH_TOKEN_TTL_DAYS`, padrão 7 dias) |
| Criado em   | Timestamp                                                            |
| Revogado em | Timestamp \| null                                                    |

---

## Regras de Negócio

### Registro

| Regra          | Detalhe                                                       |
| -------------- | ------------------------------------------------------------- |
| E-mail único   | Retorna `CONFLICT` se já existir                              |
| Senha forte    | Deve conter maiúscula, minúscula, número e caractere especial |
| Hash de senha  | Bcrypt com fator de custo 10 antes de persistir               |
| Evento emitido | `UserRegisteredEvent` via `AggregateRoot`                     |

### Login

| Regra                           | Detalhe                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Usuário inexistente ou deletado | Retorna `UNAUTHORIZED` com mensagem genérica                                       |
| Senha incorreta                 | Retorna `UNAUTHORIZED` com mensagem genérica                                       |
| Access token                    | JWT assinado com `JWT_ACCESS_SECRET`, expiração de 15 minutos                      |
| Refresh token                   | Token opaco de 64 bytes (hex), armazenado como hash, enviado via cookie `HttpOnly` |

### Rotação de Token

| Regra                     | Detalhe                                                     |
| ------------------------- | ----------------------------------------------------------- |
| Token inativo ou expirado | Retorna `UNAUTHORIZED`                                      |
| Usuário deletado          | Retorna `UNAUTHORIZED`                                      |
| Token anterior            | Invalidado imediatamente, gerando `SessionInvalidatedEvent` |
| Novo token                | Emitido e persistido antes de retornar a resposta           |

### Revogação de Sessão

| Regra                            | Detalhe                                    |
| -------------------------------- | ------------------------------------------ |
| Com token                        | Invalida somente o refresh token informado |
| Sem token                        | Revoga todos os tokens ativos do usuário   |
| Token de outro usuário           | Retorna `UNAUTHORIZED`                     |
| Token já revogado                | Operação silenciosa (sem erro)             |
| Evento emitido (revogação total) | `AllSessionsRevokedEvent`                  |

### Atualização de Perfil

| Regra                 | Detalhe                                           |
| --------------------- | ------------------------------------------------- |
| E-mail já em uso      | Retorna `CONFLICT`                                |
| Troca de senha        | Exige `currentPassword` para confirmar identidade |
| Senha atual incorreta | Retorna `VALIDATION`                              |
| Eventos emitidos      | `UserUpdatedEvent`, `UserPasswordChangedEvent`    |

### Desativação de Conta

| Regra          | Detalhe                                                 |
| -------------- | ------------------------------------------------------- |
| Soft delete    | `deletedAt` preenchido, usuário não é removido do banco |
| Sessões        | Todos os refresh tokens são revogados imediatamente     |
| Evento emitido | `UserDeactivatedEvent`                                  |

---

## Eventos de Domínio

| Evento                     | Disparado por               | Dados                             |
| -------------------------- | --------------------------- | --------------------------------- |
| `UserRegisteredEvent`      | `User.create()`             | `userId`, `email`, `occurredAt`   |
| `UserUpdatedEvent`         | `User.changeProfile()`      | `userId`, `occurredAt`            |
| `UserPasswordChangedEvent` | `User.changePassword()`     | `userId`, `occurredAt`            |
| `UserDeactivatedEvent`     | `User.markAsDeleted()`      | `userId`, `occurredAt`            |
| `SessionInvalidatedEvent`  | `RefreshToken.invalidate()` | `tokenId`, `userId`, `occurredAt` |
| `AllSessionsRevokedEvent`  | `RevokeSessionUseCase`      | `userId`, `occurredAt`            |

Todos os eventos são publicados pelo `DomainEventBus` ao final de cada caso de uso, via `UseCase.execute()`. Falhas em handlers individuais são isoladas com `Promise.allSettled`, evitando que um handler com erro interrompa os demais.

---

## Endpoints

| Método | Rota                  | Autenticação | Função                     |
| ------ | --------------------- | ------------ | -------------------------- |
| POST   | `/v1/auth/signup`     | Pública      | Registrar novo usuário     |
| POST   | `/v1/auth/login`      | Pública      | Autenticar e emitir tokens |
| POST   | `/v1/auth/refresh`    | Cookie       | Rotacionar refresh token   |
| POST   | `/v1/auth/logout`     | Bearer JWT   | Revogar sessão atual       |
| POST   | `/v1/auth/logout-all` | Bearer JWT   | Revogar todas as sessões   |

Rate limiting aplicado via Throttler: signup limitado a 3 requisições/minuto; login a 5 requisições/minuto.

---

## Fluxo do Usuário

### Registro e primeiro acesso

```
POST /v1/auth/signup
      ↓
validação de VO (Email, PersonName, PlainPassword)
      ↓
hash de senha (bcrypt)
      ↓
User.create() → UserRegisteredEvent
      ↓
persiste usuário
      ↓
publica eventos → DomainEventBus
      ↓
retorna dados do usuário criado (201)
```

### Login

```
POST /v1/auth/login
      ↓
busca usuário por e-mail
      ↓
compara senha com bcrypt
      ↓
gera JWT (15min) + token opaco (64 bytes)
      ↓
hash do token opaco → persiste RefreshToken
      ↓
cookie HttpOnly: refresh_token (path=/v1/auth/refresh)
      ↓
retorna { accessToken, user } (200)
```

### Renovação de sessão

```
POST /v1/auth/refresh  (cookie refresh_token)
      ↓
hash do token recebido → busca no banco
      ↓
token inativo? → 401
      ↓
RefreshToken.invalidate() → SessionInvalidatedEvent
      ↓
RefreshToken.create() → novo token persistido
      ↓
novo JWT emitido
      ↓
retorna { accessToken, refreshToken } (200)
```

### Logout

```
POST /v1/auth/logout  (Bearer + cookie opcional)
      ↓
com cookie → invalida somente o token atual
sem cookie → revoga todos os tokens do usuário
      ↓
limpa cookie refresh_token
      ↓
retorna 204
```

---

## Stack de Repositório (Decorator)

O `UserRepository` é montado em três camadas no `AuthModule`, compondo os Decorators de dentro para fora:

```
LoggingUserRepository       ← mais externo (rastreamento com correlationId)
  └─ CachingUserRepository  ← cache em memória por id e e-mail
       └─ UserPostgresRepository  ← persistência real (TypeORM)
```

Toda operação de leitura passa primeiro pelo cache; em caso de miss, delega ao Postgres e armazena o resultado. Escritas e deleções invalidam as entradas correspondentes. O logger registra início, conclusão e falhas de cada operação, enriquecendo o log com o `correlationId` da requisição corrente.
