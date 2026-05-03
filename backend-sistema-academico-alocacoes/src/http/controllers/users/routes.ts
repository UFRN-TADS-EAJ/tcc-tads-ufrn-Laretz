import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { z } from "zod";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import {
  userParamsSchema,
  registerUserSchema,
  authenticateUserSchema,
  updateUserSchema,
  userQuerySchema,
  refreshTokenSchema,
  authResponseSchema,
  refreshResponseSchema,
  userResponseSchema,
  usersListResponseSchema,
  profileResponseSchema,
  verifyTokenResponseSchema,
  gradeHorariosProfessorBootstrapResponseSchema,
  invalidCredentialsErrorSchema,
  userAlreadyExistsErrorSchema,
  userNotFoundErrorSchema,
  invalidTokenErrorSchema,
} from "@/schemas/user";
import {
  validationErrorResponseSchema,
  internalServerErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { register } from "./register";
import { autenticar } from "./autenticar";
import { refresh } from "./refresh";
import { verifyToken } from "./verify-token";
import { profile } from "./profile";
import { buscarUsuarios } from "./buscar-usuarios";
import { buscarUsuario } from "./buscar-usuario";
import { buscarGradeHorariosProfessorBootstrap } from "./buscar-grade-horarios-professor-bootstrap";
import { atualizarUsuario } from "./atualizar-usuario";
import { excluirUsuario } from "./excluir-usuario";

export async function routesUsers(app: FastifyTypedInstance) {
  // POST /register - Registrar usuário
  app.post(
    "/register",
    {
      schema: {
        description: "Essa rota serve para registrar um novo usuário",
        tags: ["Usuários 👤"],
        body: registerUserSchema,
        response: {
          201: userResponseSchema,
          409: userAlreadyExistsErrorSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    register,
  );

  // POST /session - Autenticar usuário
  app.post(
    "/session",
    {
      schema: {
        description: "Essa rota serve para autenticar um usuário",
        tags: ["Usuários 👤"],
        body: authenticateUserSchema,
        response: {
          200: authResponseSchema,
          401: invalidCredentialsErrorSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    autenticar,
  );

  // PATCH /token/refresh - Renovar token
  app.patch(
    "/token/refresh",
    {
      schema: {
        description: "Essa rota serve para renovar o token de acesso",
        tags: ["Usuários 👤"],
        response: {
          200: refreshResponseSchema,
          401: invalidTokenErrorSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    refresh,
  );

  // GET /verify-token - Verificar token
  app.get(
    "/verify-token",
    {
      schema: {
        description: "Essa rota serve para verificar se o token é válido",
        tags: ["Usuários 👤"],
        response: {
          200: verifyTokenResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    verifyToken,
  );

  // ===== ROTAS AUTENTICADAS =====

  // GET /me - Obter perfil do usuário
  app.get(
    "/me",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para obter o perfil do usuário autenticado",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        response: {
          200: profileResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    profile,
  );

  // GET /users - Listar usuários (autenticado)
  app.get(
    "/users",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para listar todos os usuários do sistema",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        querystring: userQuerySchema,
        response: {
          200: usersListResponseSchema,
          401: invalidTokenErrorSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarUsuarios,
  );

  // ===== ROTAS ADMINISTRATIVAS (ADMIN) =====

  // GET /users/:id - Buscar usuário por ID
  app.get(
    "/users/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para buscar um usuário específico por ID",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        response: {
          200: userResponseSchema,
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: userNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarUsuario,
  );

  // GET /users/:id/grade-horarios/bootstrap - Buscar contexto completo da grade do professor
  app.get(
    "/users/:id/grade-horarios/bootstrap",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description:
          "Retorna professor, alocações, cursos, disciplinas e gradeConfig para reduzir chamadas do front",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        response: {
          200: gradeHorariosProfessorBootstrapResponseSchema,
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: userNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorariosProfessorBootstrap,
  );

  // PUT /users/:id - Atualizar usuário
  app.put(
    "/users/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar informações de um usuário",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        body: updateUserSchema,
        response: {
          200: userResponseSchema,
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: userNotFoundErrorSchema,
          409: userAlreadyExistsErrorSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarUsuario,
  );

  // DELETE /users/:id - Excluir usuário
  app.delete(
    "/users/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir um usuário do sistema",
        tags: ["Usuários 👤"],
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        response: {
          204: z.void().describe("Usuário excluído com sucesso"),
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: userNotFoundErrorSchema,
          409: errorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirUsuario,
  );
}
