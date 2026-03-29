# FinanceControl

## Como o projeto funciona

1. O usuário realiza cadastro ou login.
2. A API retorna um token JWT.
3. O frontend envia o token no header `Authorization: Bearer <token>` para acessar rotas protegidas.
4. O usuário cadastra gastos e define o orçamento mensal.
5. O dashboard exibe salário, total de gastos, saldo e status do orçamento.
6. Usuários com role `admin` têm acesso ao painel de administração.

## How it works

1. The user registers or logs in.
2. The API returns a JWT token.
3. The frontend sends the token via `Authorization: Bearer <token>` header to access protected routes.
4. The user registers expenses and sets a monthly budget.
5. The dashboard displays total expenses, balance, and budget status.
6. Admin users have access to the administration panel.

## Architecture

- **Backend:** Node.js + Express + TypeScript + MongoDB
- **Frontend:** React + Vite + TypeScript
- **Auth:** JWT
- **Validation:** Zod

## Routes
[![Swagger UI](https://img.shields.io/badge/Swagger-UI-85EA2D?logo=swagger&logoColor=000)](https://financecontrol-production-bb45.up.railway.app/api-docs)
[![OpenAPI JSON](https://img.shields.io/badge/OpenAPI-JSON-6BA539)](https://financecontrol-production-bb45.up.railway.app/api-docs.json)

## Access rules

- Protected routes require a JWT token.
- `/admin/*` routes require a user with the `admin` role.
- The frontend also protects private and admin routes.

## License

MIT
