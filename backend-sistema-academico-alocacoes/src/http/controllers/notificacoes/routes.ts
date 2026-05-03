import type { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { criarNotificacao } from "./criar-notificacao";
import { listarNotificacoes } from "./listar-notificacoes";
import { marcarLida } from "./marcar-lida";
import { responderNotificacao } from "./responder-notificacao";
import {
  criarNotificacaoBodySchema,
  criarNotificacaoResponseSchema,
  listarNotificacoesQuerySchema,
  listarNotificacoesResponseSchema,
  marcarNotificacaoLidaParamsSchema,
  responderNotificacaoParamsSchema,
  responderNotificacaoBodySchema,
  responderNotificacaoResponseSchema,
} from "@/schemas/notificacao";
import {
  validationErrorResponseSchema,
  internalServerErrorResponseSchema,
  notFoundResponseSchema,
} from "@/schemas/curso";

export async function routesNotificacoes(app: FastifyTypedInstance) {
  // Coordenador cria solicitação de troca de sala (ou outras notificações)
  app.post(
    "/",
    {
      preHandler: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Coordenador cria uma notificação para um usuário",
        tags: ["Notificações 🔔"],
        security: [{ bearerAuth: [] }],
        body: criarNotificacaoBodySchema,
        response: {
          201: criarNotificacaoResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarNotificacao,
  );

  // Professor lista suas notificações
  app.get(
    "/",
    {
      preHandler: [verifyJWT],
      schema: {
        description: "Lista notificações do usuário autenticado",
        tags: ["Notificações 🔔"],
        security: [{ bearerAuth: [] }],
        querystring: listarNotificacoesQuerySchema,
        response: {
          200: listarNotificacoesResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    listarNotificacoes
  );

  // Professor marca notificação como lida
  app.patch(
    "/:id/read",
    {
      preHandler: [verifyJWT],
      schema: {
        description: "Marca uma notificação como lida",
        tags: ["Notificações 🔔"],
        security: [{ bearerAuth: [] }],
        params: marcarNotificacaoLidaParamsSchema,
        response: {
          200: criarNotificacaoResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    marcarLida,
  );

  // Professor responde a notificação (aceite com mensagem)
  app.post(
    "/:id/respond",
    {
      preHandler: [verifyJWT],
      schema: {
        description: "Responde a uma notificação com mensagem",
        tags: ["Notificações 🔔"],
        security: [{ bearerAuth: [] }],
        params: responderNotificacaoParamsSchema,
        body: responderNotificacaoBodySchema,
        response: {
          200: responderNotificacaoResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    responderNotificacao,
  );
}