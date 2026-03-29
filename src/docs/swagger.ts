import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "FinanceAI API",
    version: "1.0.0",
    description: "Documentação da API de controle financeiro"
  },
  servers: [
    {
      url: "/",
      description: "Servidor atual"
    },
    {
      url: "https://financecontrol-production-bb45.up.railway.app",
      description: "Servidor railway (produção)"
    }
  ],
  tags: [
    { name: "Auth", description: "Autenticacao e usuarios" },
    { name: "Gastos", description: "Gestão de gastos" },
    { name: "Orçamentos", description: "Gestão de orçamentos mensais" },
    { name: "Admin", description: "Operações administrativas" },
    { name: "Health", description: "Status da API" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Mensagem de erro" }
        }
      },
      UserRegisterInput: {
        type: "object",
        required: ["nome", "email", "password", "salario"],
        properties: {
          nome: { type: "string", example: "Maria" },
          email: { type: "string", format: "email", example: "maria@email.com" },
          password: { type: "string", minLength: 6, example: "senha123" },
          salario: { type: "number", example: 5500 }
        }
      },
      UserLoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "maria@email.com" },
          password: { type: "string", example: "senha123" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login realizado com sucesso." },
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "65fcf61e80c0d5f89b7af0e4" },
              nome: { type: "string", example: "Maria" },
              email: { type: "string", format: "email", example: "maria@email.com" },
              role: { type: "string", example: "user" }
            }
          }
        }
      },
      GastoInput: {
        type: "object",
        required: ["descricao", "valor", "categoria", "data"],
        properties: {
          descricao: { type: "string", example: "Supermercado" },
          valor: { type: "number", example: 350.5 },
          categoria: { type: "string", example: "Alimentacao" },
          data: { type: "string", format: "date", example: "2026-03-20" }
        }
      },
      OrcamentoInput: {
        type: "object",
        required: ["mes", "ano", "valor"],
        properties: {
          mes: { type: "integer", minimum: 1, maximum: 12, example: 3 },
          ano: { type: "integer", minimum: 1900, example: 2026 },
          valor: { type: "number", example: 3000 },
          limiteGastos: { type: "number", nullable: true, example: 2500 }
        }
      },
      AdminCleanupInput: {
        type: "object",
        properties: {
          clearUsers: { type: "boolean", example: false },
          clearGastos: { type: "boolean", example: true },
          clearOrcamentos: { type: "boolean", example: true }
        }
      }
    }
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Health check da API",
        responses: {
          "200": {
            description: "Servidor ativo",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Server is running!" }
              }
            }
          }
        }
      }
    },
    "/user/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar novo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegisterInput" }
            }
          }
        },
        responses: {
          "201": {
            description: "Usuario criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          "400": { description: "Dados invalidos" }
        }
      }
    },
    "/user/login": {
      post: {
        tags: ["Auth"],
        summary: "Login de usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLoginInput" }
            }
          }
        },
        responses: {
          "200": {
            description: "Login realizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          "401": { description: "Credenciais invalidas" }
        }
      }
    },
    "/user": {
      get: {
        tags: ["Auth"],
        summary: "Obter usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dados do usuario" },
          "401": { description: "Nao autenticado" }
        }
      }
    },
    "/gastos": {
      get: {
        tags: ["Gastos"],
        summary: "Listar gastos do usuario",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de gastos" },
          "401": { description: "Nao autenticado" }
        }
      },
      post: {
        tags: ["Gastos"],
        summary: "Criar gasto",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GastoInput" }
            }
          }
        },
        responses: {
          "201": { description: "Gasto criado" },
          "400": { description: "Dados invalidos" }
        }
      }
    },
    "/gastos/{id}": {
      get: {
        tags: ["Gastos"],
        summary: "Obter gasto por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Gasto encontrado" },
          "404": { description: "Gasto nao encontrado" }
        }
      },
      put: {
        tags: ["Gastos"],
        summary: "Atualizar gasto",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GastoInput" }
            }
          }
        },
        responses: {
          "200": { description: "Gasto atualizado" },
          "404": { description: "Gasto nao encontrado" }
        }
      },
      delete: {
        tags: ["Gastos"],
        summary: "Excluir gasto",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Gasto excluido" },
          "404": { description: "Gasto nao encontrado" }
        }
      }
    },
    "/gastos/resumo": {
      get: {
        tags: ["Gastos"],
        summary: "Resumo mensal de gastos do usuario autenticado",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "mes",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12 }
          },
          {
            name: "ano",
            in: "query",
            schema: { type: "integer", minimum: 1900 }
          }
        ],
        responses: {
          "200": { description: "Resumo calculado" }
        }
      }
    },
    "/orcamentos": {
      get: {
        tags: ["Orçamentos"],
        summary: "Obter orçamento mensal",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "mes",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12 }
          },
          {
            name: "ano",
            in: "query",
            schema: { type: "integer", minimum: 1900 }
          }
        ],
        responses: {
          "200": { description: "Orçamento retornado" }
        }
      },
      post: {
        tags: ["Orçamentos"],
        summary: "Criar orçamento mensal",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrcamentoInput" }
            }
          }
        },
        responses: {
          "201": { description: "Orçamento criado" }
        }
      }
    },
    "/orcamentos/status": {
      get: {
        tags: ["Orçamentos"],
        summary: "Status de consumo do orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "mes",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12 }
          },
          {
            name: "ano",
            in: "query",
            schema: { type: "integer", minimum: 1900 }
          }
        ],
        responses: {
          "200": { description: "Status calculado" }
        }
      }
    },
    "/orcamentos/{id}": {
      put: {
        tags: ["Orçamentos"],
        summary: "Atualizar orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrcamentoInput" }
            }
          }
        },
        responses: {
          "200": { description: "Orçamento atualizado" }
        }
      },
      delete: {
        tags: ["Orçamentos"],
        summary: "Remover orçamento ",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Orçamento removido" }
        }
      }
    },
    "/admin/full": {
      get: {
        tags: ["Admin"],
        summary: "Carregar dados administrativos",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dados administrativos" },
          "403": { description: "Acesso negado" }
        }
      }
    },
    "/admin/cleanup": {
      delete: {
        tags: ["Admin"],
        summary: "Limpeza de dados administrativos",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminCleanupInput" }
            }
          }
        },
        responses: {
          "200": { description: "Limpeza concluida" },
          "403": { description: "Acesso negado" }
        }
      }
    }
  }
};

const swaggerSpec = swaggerDefinition;

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
