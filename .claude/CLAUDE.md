# minha-loja-api

API REST de uma loja, desenvolvida nas aulas de Web (FATEC, 2º semestre de 2026). O projeto evolui aula a aula; textos, logs e comentários são em português.

## Stack

- Node.js com ES Modules (`import`/`export`). O `package.json` não tem `"type": "module"`; o Node detecta ESM pela sintaxe (gera um warning `MODULE_TYPELESS_PACKAGE_JSON` inofensivo).
- Express 5, cors
- Mongoose 9 + MongoDB 8 (via Docker)
- jsonwebtoken (JWT) e bcryptjs (hash de senha)
- nodemon + env-cmd em desenvolvimento

## Como rodar

1. Subir o MongoDB: `docker compose up -d` (container `minha-loja-mongo`, porta 27017).
2. `.env` na raiz com `PORT`, `MONGODB_URI`, `MONGODB_NAME`, `JWT_SECRET` e `JWT_EXPIRES_IN` (opcional, padrão `1d`). Sem `JWT_SECRET` o servidor não sobe.
3. `npm run dev` (roda `env-cmd -f .env nodemon server.js`).

`.env` e `docker-compose.yml` estão no `.gitignore` (contêm senhas). Não versionar nem copiar esses valores.

Não há testes automatizados: `npm test` é só o placeholder padrão. Para testar, subir o servidor e usar curl/Insomnia/Postman.

## Estrutura

```
server.js                        # app Express, rotas, middlewares de erro, conexão e listen
config/database.js               # connectToDatabase() com mongoose.connect
model/user.model.js              # UserModel (password e securityAnswer com select: false)
model/log.model.js               # ActionLogModel (collection de logs de ações)
routes/auth.route.js             # /auth: register, login, forgot-password, reset-password, me
routes/user.route.js             # /users (tudo exige login)
routes/log.route.js              # /logs (ações do usuário logado)
services/user.service.js         # CRUD de usuários, hash, validação de data de nascimento
services/auth.service.js         # login (JWT), pergunta de segurança, reset de senha
services/log.service.js          # salvar e listar logs de ações
middlewares/error.middleware.js  # notFoundHandler e errorHandler (erro compartilhado)
middlewares/auth.middleware.js   # authenticate (req.user) e ensureOwnUser
middlewares/log.middleware.js    # logAction(action, resource)
utils/app-error.js               # classe AppError(message, statusCode)
```

Fluxo em camadas: `route → service → model`.
- Rotas só leem `req` (params/body), chamam o service e respondem com JSON.
- Services fazem a lógica e as chamadas ao Mongoose.
- Nomes de arquivo: `<recurso>.route.js`, `<recurso>.service.js`, `<recurso>.model.js`, `<nome>.middleware.js`.
- Exports nomeados (`export const`/`export function`), async/await.

### Tratamento de erros
- Rotas e services **não usam try/catch**. O Express 5 envia erros de handlers async direto para o `errorHandler`.
- Erro de regra de negócio: `throw new AppError("mensagem", status)`.
- O `errorHandler` converte também: validação do Mongoose → 400, `CastError` → 400, e-mail duplicado (11000) → 409, JWT inválido → 401, JSON mal formatado → 400, resto → 500.
- Formato da resposta de erro sempre `{ error: "mensagem" }`.

### Autenticação
- `authenticate` lê `Authorization: Bearer <token>`, valida o JWT (`sub` = id do usuário) e coloca o usuário em `req.user`.
- `ensureOwnUser` devolve 403 se `req.params.id` não for o usuário logado (só altera/exclui a própria conta).
- Reset de senha simplificado por pergunta de segurança cadastrada pelo usuário: a resposta é normalizada (`trim().toLowerCase()`) e salva com hash. É uma simplificação didática: fraca para produção e sem limite de tentativas.

### Log de ações
- `logAction("recurso.acao", "recurso")` entra na rota antes do handler; quando a resposta termina com status < 400, salva no Mongo (`Logs`) e imprime `[LOG] ...` no console.
- Usuário vem de `req.user`; em rotas sem login (register, login, reset) o handler preenche `res.locals.userId` (e opcionalmente `res.locals.resourceId`).
- Falha ao salvar log nunca derruba a requisição.

Para um novo recurso (ex.: produtos): criar model, service e route, proteger com `authenticate` se preciso, usar `logAction` nas escritas e registrar o router em `server.js` **antes** de `notFoundHandler`/`errorHandler`.

## Endpoints

| Método | Rota                    | Auth | Descrição |
|--------|-------------------------|------|-----------|
| GET    | `/`                     | não  | health check |
| POST   | `/auth/register`        | não  | cadastro (inclui `securityQuestion` e `securityAnswer`) → 201 |
| POST   | `/auth/login`           | não  | `{ email, password }` → `{ token, user }` |
| POST   | `/auth/forgot-password` | não  | `{ email }` → `{ securityQuestion }` |
| POST   | `/auth/reset-password`  | não  | `{ email, securityAnswer, newPassword }` |
| GET    | `/auth/me`              | sim  | usuário logado |
| GET    | `/users`                | sim  | lista usuários |
| PUT    | `/users/:id`            | sim  | atualiza a própria conta (devolve o doc atualizado) |
| DELETE | `/users/:id`            | sim  | exclui a própria conta |
| GET    | `/logs`                 | sim  | últimas 100 ações do usuário logado |

User: `name` (obrigatório), `email` (obrigatório, único, minúsculo), `password` (hash, obrigatório), `dateOfBirth` (válida e não futura), `lgpd`, `documents: [{ label, value }]`, `securityQuestion`, `securityAnswer` (hash), `createdAt`/`updatedAt`. `password` e `securityAnswer` nunca voltam nas respostas.

## Observações

- Usuários criados antes da autenticação têm senha em texto puro e não têm pergunta de segurança: não conseguem logar. Recadastrar pelo `/auth/register`.
