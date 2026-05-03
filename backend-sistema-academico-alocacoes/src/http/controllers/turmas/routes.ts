import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  turmaParamsSchema,
  createTurmaSchema,
  updateTurmaSchema,
  turmaQuerySchema,
  turmaResponseSchema,
  turmasListResponseSchema,
} from "@/schemas/turma";
import {
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { criarTurma } from "./criar-turma";
import { buscarTurma } from "./buscar-turma";
import { buscarTurmas } from "./buscar-turmas";
import { listarTodasTurmas } from "./listar-todas-turmas";
import { atualizarTurma } from "./atualizar-turma";
import { excluirTurma } from "./excluir-turma";
import { buscarGradeHorariosTurma } from "./buscar-grade-horarios-turma";

export const routesTurmas = async (app: FastifyTypedInstance) => {
  // POST /turmas - Criar turma
  app.post(
    "/turmas",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar uma nova turma",
        tags: ["Turmas 👥"],
        body: createTurmaSchema,
        response: {
          201: turmaResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarTurma,
  );

  // GET /turmas - Buscar turmas
  app.get(
    "/turmas",
    {
      schema: {
        description:
          "Essa rota serve para buscar turmas com filtros e paginação",
        tags: ["Turmas 👥"],
        querystring: turmaQuerySchema,
        response: {
          200: turmasListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    buscarTurmas,
  );

  // GET /turmas/todas - Listar todas as turmas sem paginação
  app.get(
    "/turmas/todas",
    {
      schema: {
        description: "Listar todas as turmas para dropdowns",
        tags: ["Turmas 👥"],
        response: {
          200: z.object({
            turmas: z.array(
              z.object({
                id: z.string(),
                nome: z.string(),
                num_alunos: z.number().optional(),
                semestre: z.number().optional(),
                turno: z.string().optional(),
                id_curso: z.string(),
                ativa: z.boolean().optional(),
                curso: z
                  .object({
                    id: z.string(),
                    nome: z.string(),
                    codigo: z.string(),
                  })
                  .optional(),
              }),
            ),
          }),
        },
      },
    },
    listarTodasTurmas,
  );

  // GET /turmas/:id - Buscar turma por ID
  app.get(
    "/turmas/:id",
    {
      schema: {
        description: "Essa rota serve para buscar uma turma específica por ID",
        tags: ["Turmas 👥"],
        params: turmaParamsSchema,
        response: {
          200: turmaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarTurma,
  );

  // PUT /turmas/:id - Atualizar turma
  app.put(
    "/turmas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar uma turma",
        tags: ["Turmas 👥"],
        params: turmaParamsSchema,
        body: updateTurmaSchema,
        response: {
          200: turmaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarTurma,
  );

  // DELETE /turmas/:id - Excluir turma
  app.delete(
    "/turmas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir uma turma",
        tags: ["Turmas 👥"],
        params: turmaParamsSchema,
        response: {
          204: z.void().describe("Turma excluída com sucesso"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirTurma,
  );

  // GET /turmas/:id/grade-horarios - Buscar grade de horários da turma
  app.get(
    "/turmas/:id/grade-horarios",
    {
      //TODOonRequest: [verifyJWT],
      schema: {
        description:
          "Essa rota serve para buscar a grade de horários de uma turma",
        tags: ["Turmas 👥"],
        params: turmaParamsSchema,
        response: {
          200: z
            .object({
              turmaId: z.string().uuid(),
              grade: z.record(z.string(), z.any()),
              resumo: z.any(),
            })
            .describe("Grade de horários da turma"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorariosTurma,
  );
};
