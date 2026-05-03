import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  cursoParamsSchema,
  criarCursoBodySchema,
  atualizarCursoBodySchema,
  buscarCursosQuerySchema,
  criarCursoResponseSchema,
  buscarCursoResponseSchema,
  atualizarCursoResponseSchema,
  buscarCursosResponseSchema,
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { criarCurso } from "./criar-curso";
import { buscarCurso } from "./buscar-curso";
import { buscarCursos } from "./buscar-cursos";
import { atualizarCurso } from "./atualizar-curso";
import { excluirCurso } from "./excluir-curso";
import { buscarDisciplinasCurso } from "./buscar-disciplinas-curso";
import { vincularDisciplinaCurso } from "./vincular-disciplina-curso";
import { desvincularDisciplinaCurso } from "./desvincular-disciplina-curso";
import { buscarDisciplinasCursoVinculos } from "./buscar-disciplinas-curso-vinculos";

export const routesCursos = async (app: FastifyTypedInstance) => {
  // POST /cursos - Criar curso
  app.post(
    "/cursos",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar um novo curso",
        tags: ["Cursos 🎓"],
        body: criarCursoBodySchema,
        response: {
          201: criarCursoResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarCurso
  );

  // GET /cursos - Buscar cursos
  app.get(
    "/cursos",
    {
      schema: {
        description: "Essa rota serve para buscar todos os cursos",
        tags: ["Cursos 🎓"],
        response: {
          200: buscarCursosResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarCursos
  );

  // GET /cursos/:id - Buscar curso por ID
  app.get(
    "/cursos/:id",
    {
      schema: {
        description: "Essa rota serve para buscar um curso específico por ID",
        tags: ["Cursos 🎓"],
        params: cursoParamsSchema,
        response: {
          200: buscarCursoResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarCurso
  );

  // GET /cursos/:id/disciplinas - Listar disciplinas do curso
  app.get(
    "/cursos/:id/disciplinas",
    {
      schema: {
        description: "Lista disciplinas vinculadas ao curso ordenadas por semestre",
        tags: ["Cursos 🎓"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({
            disciplinas: z.array(
              z.object({
                id: z.string().uuid(),
                nome: z.string(),
                semestre: z.number(),
                obrigatoria: z.boolean(),
                carga_horaria: z.number(),
                codigo: z.string().nullable().optional(),
                horario_consolidado: z.string().nullable().optional(),
              })
            ),
          }),
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplinasCurso
  );

  // GET /cursos/:id/disciplinas-vinculos - Listar vínculos CursoDisciplina (com IDs)
  app.get(
    "/cursos/:id/disciplinas-vinculos",
    {
      schema: {
        description: "Lista vínculos CursoDisciplina com IDs e dados da disciplina",
        tags: ["Cursos 🎓"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({
            vinculos: z.array(
              z.object({
                id: z.string().uuid(),
                id_curso: z.string().uuid(),
                id_disciplina: z.string().uuid(),
                disciplina: z.object({
                  id: z.string().uuid(),
                  nome: z.string(),
                  semestre: z.number(),
                  obrigatoria: z.boolean(),
                  carga_horaria: z.number(),
                  codigo: z.string().nullable().optional(),
                  horario_consolidado: z.string().nullable().optional(),
                }),
              })
            ),
          }),
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarDisciplinasCursoVinculos
  );

  // PUT /cursos/:id - Atualizar curso
  app.put(
    "/cursos/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar um curso",
        tags: ["Cursos 🎓"],
        params: cursoParamsSchema,
        body: atualizarCursoBodySchema,
        response: {
          200: atualizarCursoResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarCurso
  );

  // POST /cursos/:id/disciplinas - Vincular disciplina a curso
  app.post(
    "/cursos/:id/disciplinas",
    {
      onRequest: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Vincula uma disciplina existente a um curso",
        tags: ["Cursos 🎓"],
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ idDisciplina: z.string().uuid() }),
        response: {
          201: z.object({
            message: z.string(),
            vinculo: z.object({ id: z.string().uuid(), id_curso: z.string().uuid(), id_disciplina: z.string().uuid() }),
          }),
          400: validationErrorResponseSchema,
          409: z.object({ message: z.string() }),
          500: internalServerErrorResponseSchema,
        },
      },
    },
    vincularDisciplinaCurso
  );

  // DELETE /cursos/:id/disciplinas/:idDisciplina - Desvincular disciplina de curso
  app.delete(
    "/cursos/:id/disciplinas/:idDisciplina",
    {
      onRequest: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Remove o vínculo da disciplina com o curso",
        tags: ["Cursos 🎓"],
        params: z.object({ id: z.string().uuid(), idDisciplina: z.string().uuid() }),
        response: {
          204: z.void().describe("Vínculo removido"),
          404: z.object({ message: z.string() }),
          500: internalServerErrorResponseSchema,
        },
      },
    },
    desvincularDisciplinaCurso
  );

  // DELETE /cursos/:id - Excluir curso
  app.delete(
    "/cursos/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir um curso",
        tags: ["Cursos 🎓"],
        params: cursoParamsSchema,
        response: {
          204: z.void().describe("Curso excluído com sucesso"),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirCurso
  );
};