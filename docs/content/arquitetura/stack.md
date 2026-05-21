# Stack Tecnológica

## Objetivo

Documentar as tecnologias adotadas no projeto MonitoreSeuTreino, suas justificativas de escolha e a relação com os padrões de projeto GoF implementados.

## Tecnologias adotadas

### Backend

| Categoria      | Tecnologia       | Versão | Justificativa                                                                                                   |
|----------------|------------------|--------|-----------------------------------------------------------------------------------------------------------------|
| Linguagem      | TypeScript       | 5+     | Tipagem estática que viabiliza value objects, interfaces e contratos de domínio sem overhead de runtime         |
| Framework      | NestJS           | 10+    | Container IoC nativo (providers, modules) que complementa a Clean Architecture sem ditar as regras de domínio   |
| ORM            | TypeORM          | 0.3+   | Mapeamento objeto-relacional com suporte a entidades separadas das entidades de domínio                         |
| Banco de dados | PostgreSQL       | 16     | Banco relacional robusto com suporte a transações ACID, essencial para a consistência dos dados de perfil       |
| Testes         | Jest + Supertest | —      | Jest para testes unitários de domínio (sem infraestrutura); Supertest para testes de integração dos controllers |
| Gerenciador    | npm              | 10+    | Padrão do ecossistema NestJS                                                                                    |

### Frontend

| Categoria         | Tecnologia      | Versão | Justificativa                                                                                       |
|-------------------|-----------------|--------|-----------------------------------------------------------------------------------------------------|
| Linguagem         | TypeScript      | 5+     | Tipagem nos contratos de API, rotas e stores                                                        |
| Framework         | React           | 18+    | Componentes declarativos com hooks; ecossistema amplo e suporte a lazy loading de rotas             |
| Bundler           | Vite            | 5+     | Build rápido em dev (HMR) e otimizado em produção; compatível com Docker via `server.host: 0.0.0.0` |
| Roteamento        | React Router v6 | 6+     | Layout routes com `<Outlet />` permitem AuthGuard como rota pai sem wrapper manual por página       |
| Estado global     | Zustand         | 4+     | Store leve com persistência em localStorage; sem boilerplate de reducers                            |
| Dados assíncronos | TanStack Query  | 5+     | Cache de queries, invalidação automática e estados de loading/error declarativos                    |
| HTTP client       | Axios           | 1+     | Interceptors para injeção de Bearer token e redirecionamento em 401 (exceto endpoints de auth)      |
| Gerenciador       | pnpm            | 10+    | Eficiente em monorepos; workspace nativo para `frontend/apps/web`                                   |

### Infraestrutura

| Categoria       | Tecnologia      | Versão | Justificativa                                                                            |
|-----------------|-----------------|--------|------------------------------------------------------------------------------------------|
| Containerização | Docker          | 24+    | Paridade entre ambientes dev e prod; cada serviço isolado em container próprio           |
| Orquestração    | Docker Compose  | v2.20+ | Orquestra db, api, web e docs com healthchecks e dependências explícitas                 |
| Automação       | Make            | 4+     | Interface unificada para comandos do projeto (`make up`, `make test`, `make db-migrate`) |
| CI/CD           | GitHub Actions  | —      | Pipeline por serviço (backend, frontend, docs, docker) com check agregado `CI passed`    |
| Documentação    | MkDocs Material | —      | Suporte nativo a Mermaid via `pymdownx.superfences`; tema Material com navegação lateral |

## Relação da stack com os padrões GoF

| Padrão GoF          | Como a stack viabiliza a implementação                                                                                     |
|---------------------|----------------------------------------------------------------------------------------------------------------------------|
| **Singleton**       | TypeScript permite construtor `private` e campo estático `private static instance` sem dependência de framework            |
| **Bridge**          | Interfaces TypeScript + classes abstratas definem contrato independente de implementação; injeção manual no use case       |
| **Facade**          | NestJS providers + `@Injectable()` permitem injetar o facade no controller sem expor os use cases individuais ao container |
| **Memento**         | Value Objects imutáveis (TypeScript `readonly`) garantem que o memento não seja mutado após a captura                      |
| **Template Method** | Classes abstratas TypeScript com métodos `protected` implementam os hooks sem precisar de framework adicional              |
| **Multiton**        | `Map<string, T>` estático em TypeScript; construtor `private` por instância de pool; sem dependência de framework           |
| **Proxy**           | NestJS `useFactory` injeta `HistoryServiceProxy` no token `HISTORY_SERVICE`; interface TypeScript compartilhada com o real |
| **Observer**        | Subject/Observer em classes `@Injectable()`; inscrição em `OnModuleInit` do `HistoryModule`                                |

## Histórico de versões

| Versão | Data       | Descrição                                                       | Autor                      |
|--------|------------|-----------------------------------------------------------------|----------------------------|
| 1.0    | 19/05/2026 | Documentação da stack com relação aos padrões GoF implementados | Lucas Antunes              |
| 1.1    | 20/05/2026 | Relação da stack com Multiton, Proxy e Observer (histórico)     | Giovanni Dornelas Ferreira |
