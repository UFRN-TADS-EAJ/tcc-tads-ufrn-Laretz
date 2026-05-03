import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  salaParamsSchema,
  createSalaSchema,
  updateSalaSchema,
  salaQuerySchema,
  salaResponseSchema,
  salasListResponseSchema,
} from "@/schemas/sala";
import {
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { criarSala } from "./criar-sala";
import { buscarSalas } from "./buscar-salas";
import { buscarSala } from "./buscar-sala";
import { atualizarSala } from "./atualizar-sala";
import { excluirSala } from "./excluir-sala";
import { buscarGradeHorariosSala } from "./buscar-grade-horarios-sala";

export const routesSalas = async (app: FastifyTypedInstance) => {
  // POST /salas - Criar sala
  app.post(
    "/salas",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar uma nova sala",
        tags: ["Salas 🏢"],
        body: createSalaSchema,
        response: {
          201: salaResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarSala,
  );

  // GET /salas - Buscar todas as salas
  app.get(
    "/salas",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todas as salas",
        tags: ["Salas 🏢"],
        querystring: salaQuerySchema,
        response: {
          200: salasListResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarSalas,
  );

  // GET /salas/:id - Buscar sala por ID
  app.get(
    "/salas/:id",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar sala por ID",
        tags: ["Salas 🏢"],
        params: salaParamsSchema,
        response: {
          200: salaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarSala,
  );

  // PUT /salas/:id - Atualizar sala
  app.put(
    "/salas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar sala",
        tags: ["Salas 🏢"],
        params: salaParamsSchema,
        body: updateSalaSchema,
        response: {
          200: salaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarSala,
  );

  // DELETE /salas/:id - Excluir sala
  app.delete(
    "/salas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir sala",
        tags: ["Salas 🏢"],
        params: salaParamsSchema,
        response: {
          204: z.object({ message: z.string() }),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirSala,
  );

  // GET /salas/:id/grade-horarios - Buscar grade de horários da sala
  app.get(
    "/salas/:id/grade-horarios",
    {
      //onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar a grade de horários de uma sala",
        tags: ["Salas 🏢"],
        params: salaParamsSchema,
        response: {
          200: z.object({
            salaId: z.string().uuid(),
            grade: z.record(z.string(), z.any()), //TODO AJUSTAR E REMOVER ANY
            resumo: z.any(),
          }).describe("Grade de horários da sala"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorariosSala,
  );
};
