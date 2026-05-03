import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  idUserParamsSchema,
  idDisciplinaParamsSchema,
  vincularProfessorDisciplinaSchema,
  desvincularProfessorDisciplinaSchema,
  professorDisciplinaResponseSchema,
  disciplinasProfessorResponseSchema,
  professoresDisciplinaResponseSchema,
  successResponseSchema,
  professorDisciplinaBootstrapResponseSchema,
} from "@/schemas/professor-disciplina";
import {
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { vincularProfessorDisciplina } from "./vincular-professor-disciplina";
import { desvincularProfessorDisciplina } from "./desvincular-professor-disciplina";
import { buscarDisciplinasProfessor } from "./buscar-disciplinas-professor";
import { buscarProfessoresDisciplina } from "./buscar-professores-disciplina";
import { buscarProfessorDisciplinaBootstrap } from "./buscar-professor-disciplina-bootstrap";

export const routesProfessorDisciplina = async (app: FastifyTypedInstance) => {
  app.get(
    "/professor-disciplina/bootstrap",
    {
      onRequest: [verifyJWT],
      schema: {
        description:
          "Carrega dados base (professores, disciplinas e cursos) para a tela de vinculação",
        tags: ["Professor-Disciplina 🔗"],
        response: {
          200: professorDisciplinaBootstrapResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarProfessorDisciplinaBootstrap,
  );

  // POST /professor-disciplina/vincular - Vincular professor a disciplina
  app.post(
    "/professor-disciplina/vincular",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para vincular um professor a uma disciplina",
        tags: ["Professor-Disciplina 🔗"],
        body: vincularProfessorDisciplinaSchema,
        response: {
          201: professorDisciplinaResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    vincularProfessorDisciplina
  );

  // DELETE /professor-disciplina/desvincular - Desvincular professor de disciplina
  app.delete(
    "/professor-disciplina/desvincular",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para desvincular um professor de uma disciplina",
        tags: ["Professor-Disciplina 🔗"],
        body: desvincularProfessorDisciplinaSchema,
        response: {
          200: successResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    desvincularProfessorDisciplina
  );

  // GET /professores/:id_user/disciplinas - Buscar disciplinas de um professor
  app.get(
    "/professores/:id_user/disciplinas",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todas as disciplinas de um professor",
        tags: ["Professor-Disciplina 🔗"],
        params: idUserParamsSchema,
        response: {
          200: disciplinasProfessorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplinasProfessor
  );

  // GET /disciplinas/:id_disciplina/professores - Buscar professores de uma disciplina
  app.get(
    "/disciplinas/:id_disciplina/professores",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todos os professores de uma disciplina",
        tags: ["Professor-Disciplina 🔗"],
        params: idDisciplinaParamsSchema,
        response: {
          200: professoresDisciplinaResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarProfessoresDisciplina
  );
};
