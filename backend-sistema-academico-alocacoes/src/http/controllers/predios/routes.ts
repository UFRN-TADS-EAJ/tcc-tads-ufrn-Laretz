import { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import {
  createPredioSchema,
  updatePredioSchema,
  predioParamsSchema,
  predioQuerySchema,
  predioResponseSchema,
  prediosListResponseSchema,
} from "@/schemas/predio";
import {
  errorResponseSchema,
  validationErrorResponseSchema,
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
} from "@/schemas/curso";
import {
  criarPredio,
  buscarPredios,
  buscarPredio,
  atualizarPredio,
  excluirPredio,
} from "./index";

export async function prediosRoutes(app: FastifyInstance) {
  // POST /predios - Criar prédio
  app.post(
    "/predios",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar um novo prédio no sistema",
        tags: ["Prédios 🏢"],
        body: createPredioSchema,
        response: {
          201: predioResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarPredio
  );

  // GET /predios - Listar prédios
  app.get(
    "/predios",
    {
      onRequest: [verifyJWT],
      schema: {
        description:
          "Essa rota serve para buscar prédios com filtros e paginação",
        tags: ["Prédios 🏢"],
        querystring: predioQuerySchema,
        response: {
          200: prediosListResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarPredios
  );

  // GET /predios/:id - Buscar prédio por ID
  app.get(
    "/predios/:id",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar um prédio específico pelo ID",
        tags: ["Prédios 🏢"],
        params: predioParamsSchema,
        response: {
          200: predioResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarPredio
  );

  // PUT /predios/:id - Atualizar prédio
  app.put(
    "/predios/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description:
          "Essa rota serve para atualizar os dados de um prédio existente",
        tags: ["Prédios 🏢"],
        params: predioParamsSchema,
        body: updatePredioSchema,
        response: {
          200: predioResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarPredio
  );

  // DELETE /predios/:id - Deletar prédio
  app.delete(
    "/predios/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para remover um prédio do sistema",
        tags: ["Prédios 🏢"],
        params: predioParamsSchema,
        response: {
          204: z.void().describe("Prédio deletado com sucesso"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirPredio
  );
}
