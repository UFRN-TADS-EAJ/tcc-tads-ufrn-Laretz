import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import {
  createFeedbackBodySchema,
  createFeedbackResponseSchema,
  listFeedbacksQuerySchema,
  listFeedbacksResponseSchema,
  feedbackMetricsSchema,
  validationErrorResponseSchema,
  internalServerErrorResponseSchema,
  metricsQuerySchema,
} from "@/schemas/feedback";

// Importar handlers dos controllers
import { criarFeedback } from "./criar-feedback";
import { buscarFeedbacks } from "./buscar-feedbacks";
import { buscarMetricasFeedback } from "./buscar-metricas-feedback";

export async function routesFeedback(app: FastifyTypedInstance) {
  // POST /feedback - Criar novo feedback (usuário autenticado)
  app.post(
    "/feedback",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Registrar um novo feedback do usuário autenticado",
        tags: ["Feedback"],
        security: [{ bearerAuth: [] }],
        body: createFeedbackBodySchema,
        response: {
          201: createFeedbackResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarFeedback
  );

  // GET /feedback - Listar feedbacks recentes (apenas ADMIN)
  app.get(
    "/feedback",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Listar feedbacks recentes (ADMIN)",
        tags: ["Feedback"],
        security: [{ bearerAuth: [] }],
        querystring: listFeedbacksQuerySchema,
        response: {
          200: listFeedbacksResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarFeedbacks
  );

  // GET /feedback/metrics - Métricas agregadas de feedback (apenas ADMIN)
  app.get(
    "/feedback/metrics",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Obter métricas agregadas de feedbacks (ADMIN)",
        tags: ["Feedback"],
        security: [{ bearerAuth: [] }],
        querystring: metricsQuerySchema,
        response: {
          200: feedbackMetricsSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarMetricasFeedback
  );
}