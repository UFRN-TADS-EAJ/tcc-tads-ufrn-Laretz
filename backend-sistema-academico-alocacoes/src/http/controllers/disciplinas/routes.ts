import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  disciplinaParamsSchema,
  criarDisciplinaBodySchema,
  atualizarDisciplinaBodySchema,
  buscarDisciplinasQuerySchema,
  buscarDisciplinasComProgressoQuerySchema,
  criarDisciplinaResponseSchema,
  buscarDisciplinaResponseSchema,
  atualizarDisciplinaResponseSchema,
  buscarDisciplinasResponseSchema,
  buscarDisciplinasComProgressoResponseSchema,
} from "@/schemas/disciplina";
import {notFoundResponseSchema, internalServerErrorResponseSchema, validationErrorResponseSchema,} from "@/schemas/curso";

// Importar controllers
import { criarDisciplina } from "./criar-disciplina";
import { buscarDisciplina } from "./buscar-disciplina";
import { buscarDisciplinas } from "./buscar-disciplinas";
import { buscarDisciplinasComProgresso } from "./buscar-disciplinas-com-progresso";
import { atualizarDisciplina } from "./atualizar-disciplina";
import { atualizarProgressoDisciplinas } from "./atualizar-progresso-disciplinas";
import { excluirDisciplina } from "./excluir-disciplina";

export const routesDisciplinas = async (app: FastifyTypedInstance) => {
  // POST /disciplinas - Criar disciplina
  app.post(
    "/disciplinas",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar uma nova disciplina",
        tags: ["Disciplinas 📚"],
        body: criarDisciplinaBodySchema,
        response: {
          201: criarDisciplinaResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarDisciplina
  );

  // GET /disciplinas - Buscar disciplinas
  app.get(
    "/disciplinas",
    {
      schema: {
        description: "Essa rota serve para buscar disciplinas com filtros e paginação",
        tags: ["Disciplinas 📚"],
        querystring: buscarDisciplinasQuerySchema,
        response: {
          200: buscarDisciplinasResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplinas
  );

  // GET /disciplinas/com-progresso - Buscar disciplinas com progresso
  app.get(
    "/disciplinas/com-progresso",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar disciplinas com informações de progresso",
        tags: ["Disciplinas 📚"],
        querystring: buscarDisciplinasComProgressoQuerySchema,
        response: {
          200: buscarDisciplinasComProgressoResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplinasComProgresso
  );

  // GET /disciplinas/:id - Buscar disciplina por ID
  app.get(
    "/disciplinas/:id",
    {
      schema: {
        description: "Essa rota serve para buscar uma disciplina específica por ID",
        tags: ["Disciplinas 📚"],
        params: disciplinaParamsSchema,
        response: {
          200: buscarDisciplinaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplina
  );

  // PUT /disciplinas/:id - Atualizar disciplina
  app.put(
    "/disciplinas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar uma disciplina",
        tags: ["Disciplinas 📚"],
        params: disciplinaParamsSchema,
        body: atualizarDisciplinaBodySchema,
        response: {
          200: atualizarDisciplinaResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarDisciplina
  );

  // PUT /disciplinas/atualizar-progresso - Atualizar progresso das disciplinas
  app.put(
    "/disciplinas/atualizar-progresso",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para atualizar o progresso das disciplinas",
        tags: ["Disciplinas 📚"],
        querystring: z.object({
          disciplinaId: z.string().uuid().optional(),
          turmaId: z.string().uuid().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            disciplinasAtualizadas: z.number(),
          }),
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarProgressoDisciplinas
  );

  // DELETE /disciplinas/:id - Excluir disciplina
  app.delete(
    "/disciplinas/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir uma disciplina",
        tags: ["Disciplinas 📚"],
        params: disciplinaParamsSchema,
        response: {
          204: z.void().describe("Disciplina excluída com sucesso"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirDisciplina
  );
};